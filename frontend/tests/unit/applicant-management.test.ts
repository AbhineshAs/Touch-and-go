import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  submitApplication,
  getAllApplications,
  getApplications,
  getApplication,
  getApplicantsForJob,
  updateApplicationStage,
} from "../../lib/api/applications";
import {
  resolveCandidateProfileByEmailOrId,
} from "../../lib/api/candidate";

describe("Applicant Management Unit Tests", () => {
  const mockStorage: Record<string, string> = ((globalThis as any).__sharedMockStorage =
    (globalThis as any).__sharedMockStorage || {});

  beforeEach(() => {
    delete mockStorage["tag_applications_storage"];
    delete mockStorage["tag_candidate_record"];

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
      },
    };

    (globalThis as any).window = {
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => true,
      localStorage: (globalThis as any).localStorage,
    };
  });

  it("1. View applicants: retrieves all applications across jobs for employer console", async () => {
    // Seed 2 applications for 2 different jobs
    const app1 = await submitApplication("job_react_19", {
      jobSlug: "senior-frontend-engineer-react-19",
      jobTitle: "Senior Frontend Engineer (React 19)",
      organizationId: "org_whitetrack",
      organizationName: "White track Technology",
      organizationLogo: "",
      location: "Bengaluru, Karnataka",
      workMode: "Hybrid",
      candidateId: "usr_alen",
      candidateName: "alenwilliam212",
      candidateHeadline: "Aspiring Backend Engineer",
      candidateEmail: "alenwilliam212@gmail.com",
      candidateAvatar: "",
      resumeFileName: "alenwilliam212_Resume.pdf",
      screeningAnswers: [
        { questionId: "q1", question: "Years of experience?", answer: "3 years" },
      ],
      overallAlignment: 78,
    });

    const app2 = await submitApplication("job_backend_py", {
      jobSlug: "lead-backend-engineer",
      jobTitle: "Lead Backend Engineer (Python)",
      organizationId: "org_whitetrack",
      organizationName: "White track Technology",
      organizationLogo: "",
      location: "Remote",
      workMode: "Remote",
      candidateId: "usr_priya",
      candidateName: "Priya Sharma",
      candidateHeadline: "Senior Python & Distributed Systems Architect",
      candidateEmail: "priya.sharma@example.com",
      candidateAvatar: "",
      resumeFileName: "Priya_Sharma_Resume.pdf",
      screeningAnswers: [],
      overallAlignment: 92,
    });

    const allApplicants = await getAllApplications();
    assert.equal(allApplicants.length, 2);
    assert.ok(allApplicants.some((a) => a.id === app1.id));
    assert.ok(allApplicants.some((a) => a.id === app2.id));

    // Also check job-specific filtering
    const reactApplicants = await getApplicantsForJob("job_react_19");
    assert.equal(reactApplicants.length, 1);
    assert.equal(reactApplicants[0].candidateName, "alenwilliam212");
  });

  it("2. View candidate profile: resolves full candidate background including experience, education, skills, and certifications", async () => {
    // Populate candidate record in storage
    const candidateRecord = {
      id: "rec_alen",
      identity: {
        fullName: "alenwilliam212",
        email: "alenwilliam212@gmail.com",
        phone: "+91 98450 12894",
      },
      profile: {
        headline: "Aspiring Backend Engineer",
        summary: "Specialized in scalable backend architectures and API microservices.",
        location: "Bengaluru, Karnataka",
        experience: [
          {
            id: "exp_1",
            title: "Junior Backend Developer",
            company: "Apex Innovations",
            location: "Bengaluru",
            startDate: "2023-01-01",
            current: true,
            description: "Developed Node.js and PostgreSQL endpoints.",
            skillsUsed: ["Node.js", "PostgreSQL", "Docker"],
          },
        ],
        education: [
          {
            id: "edu_1",
            degree: "B.Tech",
            fieldOfStudy: "Information Science",
            institution: "PES University",
            startYear: 2019,
            endYear: 2023,
            grade: "8.7 CGPA",
          },
        ],
        skills: [{ id: "sk_1", name: "Node.js", yearsOfExperience: 2 }],
        certifications: [
          {
            id: "cert_1",
            name: "AWS Certified Developer",
            issuingOrganization: "Amazon Web Services",
            issueDate: "2024-02-01",
          },
        ],
      },
    };
    mockStorage["tag_candidate_record_alenwilliam212@gmail.com"] = JSON.stringify(candidateRecord);

    const profile = resolveCandidateProfileByEmailOrId("alenwilliam212@gmail.com");

    assert.equal(profile.fullName, "alenwilliam212");
    assert.equal(profile.email, "alenwilliam212@gmail.com");
    assert.equal(profile.experiences.length, 1);
    assert.equal(profile.experiences[0].title, "Junior Backend Developer");
    assert.equal(profile.education.length, 1);
    assert.equal(profile.education[0].institution, "PES University");
    assert.equal(profile.skills.length, 1);
    assert.equal(profile.skills[0].name, "Node.js");
    assert.equal(profile.certifications.length, 1);
    assert.equal(profile.certifications[0].name, "AWS Certified Developer");
  });

  it("3. View resume: retrieves parsed resume metadata and filename for ATS modal preview", async () => {
    mockStorage["tag_candidate_resume_alenwilliam212@gmail.com"] = JSON.stringify({
      id: "res_alen_01",
      fileName: "alenwilliam212_Backend_Resume.pdf",
      fileSize: 1048576,
      fileType: "application/pdf",
      uploadedAt: "2026-10-12T10:00:00Z",
      atsScore: 85,
    });

    const profile = resolveCandidateProfileByEmailOrId("alenwilliam212@gmail.com");

    assert.equal(profile.resumeFileName, "alenwilliam212_Backend_Resume.pdf");
    assert.ok(profile.resumeParsedAt);
  });

  it("4. View application: retrieves full application details, timeline, and screening answers", async () => {
    const createdApp = await submitApplication("job_react_19", {
      jobSlug: "senior-frontend-engineer-react-19",
      jobTitle: "Senior Frontend Engineer (React 19)",
      organizationId: "org_whitetrack",
      organizationName: "White track Technology",
      organizationLogo: "",
      location: "Bengaluru, Karnataka",
      workMode: "Hybrid",
      candidateId: "usr_alen",
      candidateName: "alenwilliam212",
      candidateHeadline: "Aspiring Backend Engineer",
      candidateEmail: "alenwilliam212@gmail.com",
      candidateAvatar: "",
      resumeFileName: "alenwilliam212_Resume.pdf",
      screeningAnswers: [
        {
          questionId: "q_notice",
          question: "What is your official notice period?",
          answer: "15 days",
        },
      ],
      overallAlignment: 78,
    });

    const loadedApp = await getApplication(createdApp.id);
    assert.ok(loadedApp);
    assert.equal(loadedApp.id, createdApp.id);
    assert.equal(loadedApp.jobTitle, "Senior Frontend Engineer (React 19)");
    assert.equal(loadedApp.stage, "Applied");
    assert.equal(loadedApp.screeningAnswers.length, 1);
    assert.equal(loadedApp.screeningAnswers[0].answer, "15 days");
    assert.ok(loadedApp.timeline.length >= 1);
    assert.equal(loadedApp.timeline[0].stage, "Applied");
  });

  it("5. Shortlist candidate: updates application stage to Shortlisted and appends timeline note", async () => {
    const createdApp = await submitApplication("job_react_19", {
      jobSlug: "senior-frontend-engineer-react-19",
      jobTitle: "Senior Frontend Engineer (React 19)",
      organizationId: "org_whitetrack",
      organizationName: "White track Technology",
      organizationLogo: "",
      location: "Bengaluru, Karnataka",
      workMode: "Hybrid",
      candidateId: "usr_alen",
      candidateName: "alenwilliam212",
      candidateHeadline: "Aspiring Backend Engineer",
      candidateEmail: "alenwilliam212@gmail.com",
      candidateAvatar: "",
      resumeFileName: "alenwilliam212_Resume.pdf",
      screeningAnswers: [],
    });

    const updated = await updateApplicationStage(
      createdApp.id,
      "Shortlisted",
      "Shortlisted candidate for technical screening interview."
    );

    assert.equal(updated.stage, "Shortlisted");
    const lastTimelineEvent = updated.timeline[updated.timeline.length - 1];
    assert.equal(lastTimelineEvent.stage, "Shortlisted");
    assert.ok(lastTimelineEvent.description.includes("Shortlisted"));
  });

  it("6. Reject candidate: updates application stage to Closed and records reason", async () => {
    const createdApp = await submitApplication("job_react_19", {
      jobSlug: "senior-frontend-engineer-react-19",
      jobTitle: "Senior Frontend Engineer (React 19)",
      organizationId: "org_whitetrack",
      organizationName: "White track Technology",
      organizationLogo: "",
      location: "Bengaluru, Karnataka",
      workMode: "Hybrid",
      candidateId: "usr_alen",
      candidateName: "alenwilliam212",
      candidateHeadline: "Aspiring Backend Engineer",
      candidateEmail: "alenwilliam212@gmail.com",
      candidateAvatar: "",
      resumeFileName: "alenwilliam212_Resume.pdf",
      screeningAnswers: [],
    });

    const updated = await updateApplicationStage(
      createdApp.id,
      "Closed",
      "Candidate not advancing based on current team criteria."
    );

    assert.equal(updated.stage, "Closed");
    const lastTimeline = updated.timeline[updated.timeline.length - 1];
    assert.equal(lastTimeline.stage, "Closed");
  });

  it("7. Change application status: supports advancing application across any pipeline stage", async () => {
    const createdApp = await submitApplication("job_react_19", {
      jobSlug: "senior-frontend-engineer-react-19",
      jobTitle: "Senior Frontend Engineer (React 19)",
      organizationId: "org_whitetrack",
      organizationName: "White track Technology",
      organizationLogo: "",
      location: "Bengaluru, Karnataka",
      workMode: "Hybrid",
      candidateId: "usr_alen",
      candidateName: "alenwilliam212",
      candidateHeadline: "Aspiring Backend Engineer",
      candidateEmail: "alenwilliam212@gmail.com",
      candidateAvatar: "",
      resumeFileName: "alenwilliam212_Resume.pdf",
      screeningAnswers: [],
    });

    const stages = ["Screening", "Shortlisted", "Interview", "Decision", "Closed"] as const;

    for (const stage of stages) {
      const advanced = await updateApplicationStage(createdApp.id, stage, `Moved to ${stage}`);
      assert.equal(advanced.stage, stage);
    }
  });
});
