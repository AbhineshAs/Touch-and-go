import { Application, ApplicationStage } from "@/types";
import { MOCK_APPLICATIONS, MOCK_PIPELINE_APPLICANTS } from "@/lib/mocks/data";

let applicationsState: Application[] = [...MOCK_PIPELINE_APPLICANTS];

export async function getApplications(candidateId: string = "prof_cand_01"): Promise<Application[]> {
  await new Promise((r) => setTimeout(r, 200));
  return applicationsState.filter((a) => a.candidateId === candidateId);
}

export async function getApplication(id: string): Promise<Application | null> {
  await new Promise((r) => setTimeout(r, 180));
  const app = applicationsState.find((a) => a.id === id);
  return app ? { ...app } : null;
}

export async function submitApplication(
  jobId: string,
  candidateData: {
    jobSlug: string;
    jobTitle: string;
    organizationId: string;
    organizationName: string;
    organizationLogo: string;
    location: string;
    workMode: "Remote" | "Hybrid" | "On-site";
    candidateId: string;
    candidateName: string;
    candidateHeadline: string;
    candidateEmail: string;
    candidateAvatar: string;
    resumeFileName: string;
    screeningAnswers: { questionId: string; question: string; answer: string }[];
  }
): Promise<Application> {
  await new Promise((r) => setTimeout(r, 550));
  const newApp: Application = {
    id: `app_${Date.now()}`,
    jobId,
    jobSlug: candidateData.jobSlug,
    jobTitle: candidateData.jobTitle,
    organizationId: candidateData.organizationId,
    organizationName: candidateData.organizationName,
    organizationLogo: candidateData.organizationLogo,
    location: candidateData.location,
    workMode: candidateData.workMode,
    candidateId: candidateData.candidateId,
    candidateName: candidateData.candidateName,
    candidateHeadline: candidateData.candidateHeadline,
    candidateEmail: candidateData.candidateEmail,
    candidateAvatar: candidateData.candidateAvatar,
    appliedAt: new Date().toISOString(),
    stage: "Applied",
    overallAlignment: 84,
    resumeFileName: candidateData.resumeFileName,
    screeningAnswers: candidateData.screeningAnswers,
    timeline: [
      {
        id: `tl_${Date.now()}`,
        stage: "Applied",
        title: "Application Submitted",
        description: "Profile submitted with verified criteria alignment.",
        date: new Date().toISOString(),
        completed: true,
        active: true,
      },
      {
        id: `tl_${Date.now() + 1}`,
        stage: "Screening",
        title: "Recruiter Review",
        description: "Queued for recruiter review at hiring organization.",
        date: "Pending",
        completed: false,
      },
    ],
  };

  applicationsState = [newApp, ...applicationsState];
  return newApp;
}

export async function withdrawApplication(id: string): Promise<boolean> {
  await new Promise((r) => setTimeout(r, 300));
  const app = applicationsState.find((a) => a.id === id);
  if (!app) return false;
  app.stage = "Closed";
  app.timeline.push({
    id: `tl_closed_${Date.now()}`,
    stage: "Closed",
    title: "Application Withdrawn",
    description: "Application withdrawn by candidate.",
    date: new Date().toISOString(),
    completed: true,
    active: true,
  });
  return true;
}

export async function getApplicantsForJob(jobId: string): Promise<Application[]> {
  await new Promise((r) => setTimeout(r, 220));
  return applicationsState.filter((a) => a.jobId === jobId);
}

export async function updateApplicationStage(
  applicationId: string,
  stage: ApplicationStage,
  note?: string
): Promise<Application> {
  await new Promise((r) => setTimeout(r, 300));
  const appIndex = applicationsState.findIndex((a) => a.id === applicationId);
  if (appIndex === -1) throw new Error("Application not found");

  const app = applicationsState[appIndex];
  app.stage = stage;
  app.timeline = app.timeline.map((t) => ({ ...t, active: false }));
  app.timeline.push({
    id: `tl_${Date.now()}`,
    stage,
    title: `Moved to ${stage}`,
    description: note || `Application advanced to ${stage} stage.`,
    date: new Date().toISOString(),
    completed: true,
    active: true,
  });

  if (note) {
    if (!app.recruiterNotes) app.recruiterNotes = [];
    app.recruiterNotes.push({
      id: `rn_${Date.now()}`,
      authorName: "Hiring Team",
      content: note,
      createdAt: new Date().toISOString(),
    });
  }

  applicationsState[appIndex] = { ...app };
  return applicationsState[appIndex];
}

export async function addRecruiterNote(
  applicationId: string,
  content: string,
  authorName: string = "Vikramaditya Nair"
): Promise<Application> {
  await new Promise((r) => setTimeout(r, 250));
  const appIndex = applicationsState.findIndex((a) => a.id === applicationId);
  if (appIndex === -1) throw new Error("Application not found");

  const app = applicationsState[appIndex];
  if (!app.recruiterNotes) app.recruiterNotes = [];
  app.recruiterNotes.push({
    id: `rn_${Date.now()}`,
    authorName,
    content,
    createdAt: new Date().toISOString(),
  });

  applicationsState[appIndex] = { ...app };
  return applicationsState[appIndex];
}
