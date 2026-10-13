import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  createJob,
  getJobById,
  getJobBySlug,
  getEmployerJobs,
  updateJob,
  deleteJob,
  updateJobStatus,
  getJobs,
  getLiveJobs,
} from "../../lib/api/jobs";
import { matchSampleJobs } from "../../lib/candidate/jobs/matcher";
import { Job } from "../../types";

describe("Employer Job Management Full CRUD Tests", () => {
  const sampleJobData: Partial<Job> = {
    title: "Staff Cloud Infrastructure Engineer",
    department: "Cloud Platform",
    employmentType: "Full-time",
    location: "Bengaluru, Karnataka",
    workMode: "Hybrid",
    experienceLevel: "Senior (6-8 yrs)",
    minSalaryINR: 3200000,
    maxSalaryINR: 4500000,
    deadline: "2026-12-15",
    status: "Published",
    summary: "Lead enterprise Kubernetes clusters, high-scale microservices, and disaster recovery.",
    responsibilities: [
      "Manage AWS EKS multitenant clusters across 3 regions",
      "Lead Terraform automation and zero-downtime blue/green deployments",
    ],
    mustHaveSkills: ["Kubernetes", "AWS", "Terraform", "Go"],
    preferredSkills: ["Docker", "Prometheus", "Kafka"],
  };

  it("1. Create Job: successfully creates job with all 9 fields and defaults", async () => {
    const created = await createJob(sampleJobData);

    assert.ok(created.id, "Job ID should be generated");
    assert.ok(created.slug, "Job slug should be generated");
    assert.equal(created.title, sampleJobData.title);
    assert.equal(created.summary, sampleJobData.summary);
    assert.deepEqual(created.mustHaveSkills, sampleJobData.mustHaveSkills);
    assert.equal(created.experienceLevel, sampleJobData.experienceLevel);
    assert.equal(created.minSalaryINR, sampleJobData.minSalaryINR);
    assert.equal(created.maxSalaryINR, sampleJobData.maxSalaryINR);
    assert.equal(created.location, sampleJobData.location);
    assert.equal(created.employmentType, sampleJobData.employmentType);
    assert.equal(created.deadline, sampleJobData.deadline);
    assert.equal(created.status, "Published");
    assert.equal(created.applicantsCount, 0);
  });

  it("2. View Job: retrieves created job by id and slug with complete data", async () => {
    const created = await createJob({
      ...sampleJobData,
      title: "Senior Next.js Architect",
    });

    const byId = await getJobById(created.id);
    assert.ok(byId, "Job must be retrievable by ID");
    assert.equal(byId?.id, created.id);
    assert.equal(byId?.title, "Senior Next.js Architect");
    assert.equal(byId?.deadline, "2026-12-15");

    const bySlug = await getJobBySlug(created.slug);
    assert.ok(bySlug, "Job must be retrievable by Slug");
    assert.equal(bySlug?.id, created.id);
  });

  it("3. Edit Job: updates job fields while preserving unchanged properties", async () => {
    const created = await createJob(sampleJobData);

    const updated = await updateJob(created.id, {
      title: "Principal Cloud Architect",
      minSalaryINR: 3800000,
      maxSalaryINR: 5200000,
      deadline: "2026-12-31",
      status: "Paused",
      mustHaveSkills: ["Kubernetes", "AWS", "Terraform", "Go", "Helm"],
    });

    assert.equal(updated.id, created.id);
    assert.equal(updated.title, "Principal Cloud Architect");
    assert.equal(updated.minSalaryINR, 3800000);
    assert.equal(updated.maxSalaryINR, 5200000);
    assert.equal(updated.deadline, "2026-12-31");
    assert.equal(updated.status, "Paused");
    assert.equal(updated.mustHaveSkills.length, 5);

    // Verify retrieval after edit
    const reloaded = await getJobById(created.id);
    assert.equal(reloaded?.title, "Principal Cloud Architect");
    assert.equal(reloaded?.status, "Paused");
  });

  it("4. Status Management: updateJobStatus properly switches statuses", async () => {
    const created = await createJob(sampleJobData);

    const paused = await updateJobStatus(created.id, "Paused");
    assert.equal(paused.status, "Paused");

    const closed = await updateJobStatus(created.id, "Closed");
    assert.equal(closed.status, "Closed");

    const published = await updateJobStatus(created.id, "Published");
    assert.equal(published.status, "Published");
  });

  it("5. Delete Job: removes job from listing and storage", async () => {
    const created = await createJob({
      ...sampleJobData,
      title: "Temporary Devops Role to Delete",
    });

    const beforeDelete = await getJobById(created.id);
    assert.ok(beforeDelete, "Job exists before delete");

    const success = await deleteJob(created.id);
    assert.equal(success, true, "deleteJob returns true on success");

    const afterDelete = await getJobById(created.id);
    assert.equal(afterDelete, null, "Job should be null after deletion");
  });

  it("6. Mock Data Purge: No mock jobs (job_01-06, job_sample_07-08) exist in live feeds", async () => {
    const liveJobs = getLiveJobs();
    const mockIds = ["job_01", "job_02", "job_03", "job_04", "job_05", "job_06", "job_sample_07", "job_sample_08"];
    for (const mockId of mockIds) {
      assert.equal(
        liveJobs.some((j) => j.id === mockId),
        false,
        `Mock job ${mockId} must not be present in live job feed`
      );
    }
  });

  it("7. Company to Candidate Portal Sync: Added employer job is viewable and matches candidate profile", async () => {
    const employerJob = await createJob({
      title: "Senior React & TypeScript Developer",
      summary: "Build high performance user interfaces using React and TypeScript.",
      mustHaveSkills: ["React", "TypeScript", "Tailwind CSS"],
      experienceLevel: "Mid (3-5 yrs)",
      minSalaryINR: 2000000,
      maxSalaryINR: 3000000,
      location: "Bengaluru, Karnataka",
      workMode: "Hybrid",
      employmentType: "Full-time",
      deadline: "2026-12-31",
      status: "Published",
    });

    const liveJobs = await getJobs();
    const foundInFeed = liveJobs.find((j) => j.id === employerJob.id);
    assert.ok(foundInFeed, "Employer-created job must appear in public/candidate job feed");
    assert.equal(foundInFeed?.title, "Senior React & TypeScript Developer");

    // Test candidate matching on the live employer job
    const candidate: any = {
      id: "cand_test_sync",
      discovery: {
        targetRoles: ["Frontend Developer", "React Developer"],
        skills: [{ name: "React" }, { name: "TypeScript" }],
        careerStage: "mid",
        workPreferences: {
          locationMode: "hybrid",
          jobType: "full_time",
        },
      },
      profile: {
        skills: [{ name: "React" }, { name: "TypeScript" }],
      },
    };

    const matches = matchSampleJobs(candidate, liveJobs);
    const matchedCreated = matches.find((m) => m.job.id === employerJob.id);
    assert.ok(matchedCreated, "Employer job should match candidate profile in candidate portal");
    assert.ok(matchedCreated!.score > 0, "Match score should be positive");
    assert.ok(
      matchedCreated!.matchReasons.length > 0,
      "Match reasons should explain alignment"
    );

    // Clean up
    await deleteJob(employerJob.id);
    const afterDelete = await getJobs();
    assert.equal(
      afterDelete.some((j) => j.id === employerJob.id),
      false,
      "Deleted employer job must immediately disappear from candidate feed"
    );
  });
});
