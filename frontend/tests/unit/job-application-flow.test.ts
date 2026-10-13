import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  getCandidateProfile,
  resolveLiveCandidateProfile,
} from "../../lib/api/candidate";
import {
  submitApplication,
  getApplications,
  getApplication,
  getApplicantsForJob,
  updateApplicationStage,
  withdrawApplication,
} from "../../lib/api/applications";
import { createJob } from "../../lib/api/jobs";

describe("Candidate Job Application & Dynamic Profile Flow Unit Tests", () => {
  const mockStorage: Record<string, string> = ((globalThis as any).__sharedMockStorage =
    (globalThis as any).__sharedMockStorage || {});

  beforeEach(() => {
    delete mockStorage["tag_applications_storage"];
    delete mockStorage["tag_auth_user"];
    delete mockStorage["tag_jobs_storage"];

    (globalThis as any).localStorage = {
      getItem: (key: string) => mockStorage[key] || null,
      setItem: (key: string, value: string) => {
        mockStorage[key] = value;
      },
      removeItem: (key: string) => {
        delete mockStorage[key];
      },
      clear: () => {
        delete mockStorage["tag_applications_storage"];
        delete mockStorage["tag_auth_user"];
      },
    };

    (globalThis as any).window = {
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => true,
      localStorage: (globalThis as any).localStorage,
    };
  });

  it("1. Dynamic candidate profile resolution: preserves logged-in user without defaulting to Ananya Sharma", async () => {
    // Simulate candidate logged in as alenwilliam212
    const authUser = {
      id: "usr_cand_alen",
      name: "alenwilliam212",
      email: "alenwilliam212@gmail.com",
      role: "candidate",
    };
    mockStorage["tag_auth_user"] = JSON.stringify(authUser);

    const profile = await getCandidateProfile();

    assert.equal(profile.fullName, "alenwilliam212");
    assert.equal(profile.email, "alenwilliam212@gmail.com");
    assert.notEqual(profile.fullName, "Ananya Sharma");
    assert.notEqual(profile.email, "ananya.sharma@example.com");
    assert.ok(
      profile.resumeFileName?.includes("alenwilliam212"),
      "Resume name should be personalized to candidate name"
    );
  });

  it("2. Candidate able to apply for any job and application is persisted", async () => {
    // Create a real employer job (like White track Technologies)
    const job = await createJob({
      title: "Senior Frontend Engineer (React 19)",
      organizationName: "White track Technologies",
      location: "Bengaluru, Karnataka",
      workMode: "Hybrid",
      status: "Published",
    });

    // Logged in candidate
    const authUser = {
      id: "usr_cand_alen",
      name: "alenwilliam212",
      email: "alenwilliam212@gmail.com",
      role: "candidate",
    };
    mockStorage["tag_auth_user"] = JSON.stringify(authUser);

    // Candidate submits application
    const application = await submitApplication(job.id, {
      jobSlug: job.slug,
      jobTitle: job.title,
      organizationId: job.organizationId,
      organizationName: job.organizationName,
      organizationLogo: job.organizationLogo,
      location: job.location,
      workMode: job.workMode,
      candidateId: authUser.id,
      candidateName: authUser.name,
      candidateHeadline: "Senior Frontend Engineer | React 19",
      candidateEmail: authUser.email,
      candidateAvatar: "",
      resumeFileName: "alenwilliam212_Resume.pdf",
      screeningAnswers: [
        {
          questionId: "sq_1",
          question: "Years of experience with React 19?",
          answer: "4 years",
        },
      ],
      overallAlignment: 82,
    });

    assert.ok(application.id, "Application ID must be generated");
    assert.equal(application.jobId, job.id);
    assert.equal(application.candidateName, "alenwilliam212");
    assert.equal(application.candidateEmail, "alenwilliam212@gmail.com");
    assert.equal(application.stage, "Applied");

    // Check persistence in tag_applications_storage
    assert.ok(mockStorage["tag_applications_storage"], "Must persist to tag_applications_storage");
    const storedList = JSON.parse(mockStorage["tag_applications_storage"]);
    assert.equal(storedList.length, 1);
    assert.equal(storedList[0].id, application.id);
  });

  it("3. Employer pipeline retrieves applicant for job, and candidate retrieves application", async () => {
    const job = await createJob({
      title: "UI Architecture Specialist",
      organizationName: "White track Technologies",
      location: "Bengaluru, Karnataka",
      workMode: "Remote",
    });

    const app = await submitApplication(job.id, {
      jobSlug: job.slug,
      jobTitle: job.title,
      organizationId: job.organizationId,
      organizationName: job.organizationName,
      organizationLogo: "",
      location: job.location,
      workMode: job.workMode,
      candidateId: "usr_cand_alen",
      candidateName: "alenwilliam212",
      candidateHeadline: "Senior Frontend Engineer",
      candidateEmail: "alenwilliam212@gmail.com",
      candidateAvatar: "",
      resumeFileName: "alenwilliam212_Resume.pdf",
      screeningAnswers: [],
    });

    // Employer views pipeline for this job
    const applicants = await getApplicantsForJob(job.id);
    assert.equal(applicants.length, 1);
    assert.equal(applicants[0].candidateName, "alenwilliam212");
    assert.equal(applicants[0].jobId, job.id);

    // Candidate views their applications
    const candidateApps = await getApplications("alenwilliam212@gmail.com");
    assert.equal(candidateApps.length, 1);
    assert.equal(candidateApps[0].id, app.id);

    // Retrieve specific application by ID
    const single = await getApplication(app.id);
    assert.ok(single);
    assert.equal(single?.id, app.id);
    assert.equal(single?.organizationName, "White track Technologies");
  });

  it("4. Employer advances application stage and updates reflect across portals", async () => {
    const job = await createJob({
      title: "Full Stack Engineer",
      organizationName: "White track Technologies",
    });

    const app = await submitApplication(job.id, {
      jobSlug: job.slug,
      jobTitle: job.title,
      organizationId: job.organizationId,
      organizationName: job.organizationName,
      organizationLogo: "",
      location: "Bengaluru",
      workMode: "Hybrid",
      candidateId: "usr_cand_alen",
      candidateName: "alenwilliam212",
      candidateHeadline: "Full Stack Engineer",
      candidateEmail: "alenwilliam212@gmail.com",
      candidateAvatar: "",
      resumeFileName: "alenwilliam212_Resume.pdf",
      screeningAnswers: [],
    });

    // Employer updates stage to Interview
    const updated = await updateApplicationStage(app.id, "Interview", "Candidate passed technical screening");
    assert.equal(updated.stage, "Interview");
    assert.equal(updated.recruiterNotes?.length, 1);

    // Verify stored application state
    const retrieved = await getApplication(app.id);
    assert.equal(retrieved?.stage, "Interview");
    assert.ok(retrieved?.timeline.some((t) => t.stage === "Interview"));
  });

  it("5. Candidate can withdraw application successfully", async () => {
    const job = await createJob({
      title: "Backend Engineer",
      organizationName: "White track Technologies",
    });

    const app = await submitApplication(job.id, {
      jobSlug: job.slug,
      jobTitle: job.title,
      organizationId: job.organizationId,
      organizationName: job.organizationName,
      organizationLogo: "",
      location: "Bengaluru",
      workMode: "Remote",
      candidateId: "usr_cand_alen",
      candidateName: "alenwilliam212",
      candidateHeadline: "Backend Engineer",
      candidateEmail: "alenwilliam212@gmail.com",
      candidateAvatar: "",
      resumeFileName: "alenwilliam212_Resume.pdf",
      screeningAnswers: [],
    });

    const success = await withdrawApplication(app.id);
    assert.equal(success, true);

    const reloaded = await getApplication(app.id);
    assert.equal(reloaded?.stage, "Closed");
    assert.ok(reloaded?.timeline.some((t) => t.stage === "Closed" && t.title === "Application Withdrawn"));
  });
});
