import { Application, ApplicationStage } from "@/types";
import { CandidateApplication } from "@/lib/candidate/types";

const APPLICATIONS_STORAGE_KEY = "tag_applications_storage";

let applicationsState: Application[] = [];

function loadStoredApplications(): Application[] {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(APPLICATIONS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        applicationsState = Array.isArray(parsed)
          ? parsed.filter(
              (a: Application) =>
                !a.id.startsWith("app_0") &&
                !a.jobId.startsWith("job_0") &&
                !a.jobId.startsWith("job_sample_")
            )
          : [];
        return applicationsState;
      } else {
        applicationsState = [];
        return applicationsState;
      }
    } catch (e) {
      console.warn("Failed to read applications from localStorage:", e);
    }
  }
  return applicationsState;
}

function persistApplications(apps: Application[]) {
  applicationsState = apps;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify(apps));
      window.dispatchEvent(new CustomEvent("tag_applications_updated"));
      window.dispatchEvent(new Event("storage"));
    } catch (e) {
      console.warn("Failed to persist applications to localStorage:", e);
    }
  }
}

export async function getAllApplications(organizationId?: string): Promise<Application[]> {
  await new Promise((r) => setTimeout(r, 100));
  const apps = loadStoredApplications();
  if (organizationId) {
    return apps.filter((a) => a.organizationId === organizationId);
  }
  return [...apps];
}

export async function getApplications(candidateIdOrEmail?: string): Promise<Application[]> {
  await new Promise((r) => setTimeout(r, 120));
  const apps = loadStoredApplications();

  if (!candidateIdOrEmail) {
    if (typeof window !== "undefined") {
      try {
        const rawUser = localStorage.getItem("tag_auth_user");
        if (rawUser) {
          const u = JSON.parse(rawUser);
          if (u.role === "candidate") {
            const email = u.email?.trim().toLowerCase();
            const userId = u.id;
            return apps.filter(
              (a) =>
                (email && a.candidateEmail?.trim().toLowerCase() === email) ||
                (userId && a.candidateId === userId)
            );
          }
        }
      } catch {}
    }
    return apps;
  }

  const query = candidateIdOrEmail.trim().toLowerCase();
  return apps.filter(
    (a) =>
      a.candidateId === candidateIdOrEmail ||
      a.candidateEmail?.trim().toLowerCase() === query
  );
}

export async function getApplication(id: string): Promise<Application | null> {
  await new Promise((r) => setTimeout(r, 120));
  const apps = loadStoredApplications();
  const app = apps.find((a) => a.id === id);
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
    overallAlignment?: number;
  }
): Promise<Application> {
  await new Promise((r) => setTimeout(r, 350));
  const current = loadStoredApplications();

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
    overallAlignment: candidateData.overallAlignment || 78,
    resumeFileName: candidateData.resumeFileName,
    screeningAnswers: candidateData.screeningAnswers,
    timeline: [
      {
        id: `tl_${Date.now()}`,
        stage: "Applied",
        title: "Application Submitted",
        description: `Profile submitted directly to ${candidateData.organizationName} with verified credentials.`,
        date: new Date().toISOString(),
        completed: true,
        active: true,
      },
      {
        id: `tl_${Date.now() + 1}`,
        stage: "Screening",
        title: "Recruiter Review",
        description: `Queued for hiring team review at ${candidateData.organizationName}.`,
        date: "Pending",
        completed: false,
      },
    ],
  };

  const updatedApps = [newApp, ...current];
  persistApplications(updatedApps);

  // Sync to candidate record in localStorage so candidate workspace displays it immediately
  if (typeof window !== "undefined") {
    try {
      const email = candidateData.candidateEmail?.trim().toLowerCase();
      const userKey = email ? `tag_candidate_record_${email}` : null;
      const genericKey = "tag_candidate_record";

      const candidateApp: CandidateApplication = {
        id: newApp.id,
        jobId: newApp.jobId,
        jobTitle: newApp.jobTitle,
        organizationName: newApp.organizationName,
        organizationLogo: newApp.organizationLogo,
        location: newApp.location,
        workMode: newApp.workMode,
        appliedAt: newApp.appliedAt,
        stage: "Applied",
      };

      const updateRecordApplications = (recordStr: string | null) => {
        if (!recordStr) return null;
        try {
          const rec = JSON.parse(recordStr);
          const existingApps: CandidateApplication[] = Array.isArray(rec.applications)
            ? rec.applications
            : [];
          if (!existingApps.some((a) => a.jobId === newApp.jobId || a.id === newApp.id)) {
            rec.applications = [candidateApp, ...existingApps];
          }
          return rec;
        } catch {
          return null;
        }
      };

      if (userKey) {
        const updated = updateRecordApplications(localStorage.getItem(userKey));
        if (updated) {
          localStorage.setItem(userKey, JSON.stringify(updated));
        }
      }
      const updatedGeneric = updateRecordApplications(localStorage.getItem(genericKey));
      if (updatedGeneric) {
        localStorage.setItem(genericKey, JSON.stringify(updatedGeneric));
      }

      // Also update tag_candidate_db
      const dbStr = localStorage.getItem("tag_candidate_db");
      if (dbStr && email) {
        try {
          const db = JSON.parse(dbStr);
          if (db[email]) {
            const updated = updateRecordApplications(JSON.stringify(db[email]));
            if (updated) {
              db[email] = updated;
              localStorage.setItem("tag_candidate_db", JSON.stringify(db));
            }
          }
        } catch {}
      }

      window.dispatchEvent(new CustomEvent("tag_candidate_record_updated"));
    } catch (e) {
      console.warn("Failed to sync application to candidate record:", e);
    }
  }

  return newApp;
}

export async function withdrawApplication(id: string): Promise<boolean> {
  await new Promise((r) => setTimeout(r, 200));
  const apps = loadStoredApplications();
  const app = apps.find((a) => a.id === id);
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
  persistApplications([...apps]);

  // Sync to candidate record
  if (typeof window !== "undefined") {
    try {
      const email = app.candidateEmail?.trim().toLowerCase();
      const syncClosed = (recordStr: string | null) => {
        if (!recordStr) return null;
        try {
          const rec = JSON.parse(recordStr);
          if (Array.isArray(rec.applications)) {
            rec.applications = rec.applications.map((ca: any) =>
              ca.id === id || ca.jobId === app.jobId ? { ...ca, stage: "Closed" } : ca
            );
          }
          return rec;
        } catch {
          return null;
        }
      };
      if (email) {
        const u = syncClosed(localStorage.getItem(`tag_candidate_record_${email}`));
        if (u) localStorage.setItem(`tag_candidate_record_${email}`, JSON.stringify(u));
      }
      const g = syncClosed(localStorage.getItem("tag_candidate_record"));
      if (g) localStorage.setItem("tag_candidate_record", JSON.stringify(g));
      window.dispatchEvent(new CustomEvent("tag_candidate_record_updated"));
    } catch {}
  }

  return true;
}

export async function getApplicantsForJob(jobId: string): Promise<Application[]> {
  await new Promise((r) => setTimeout(r, 150));
  const apps = loadStoredApplications();
  return apps.filter((a) => a.jobId === jobId || a.jobSlug === jobId);
}

export async function updateApplicationStage(
  applicationId: string,
  stage: ApplicationStage,
  note?: string
): Promise<Application> {
  await new Promise((r) => setTimeout(r, 200));
  const apps = loadStoredApplications();
  const appIndex = apps.findIndex((a) => a.id === applicationId);
  if (appIndex === -1) throw new Error("Application not found");

  const app = apps[appIndex];
  app.stage = stage;
  const now = new Date().toISOString();

  const stageDescriptions: Record<ApplicationStage, { title: string; desc: string }> = {
    Applied: {
      title: "Application Submitted",
      desc: "Profile submitted with verified credentials.",
    },
    Screening: {
      title: "Recruiter Review",
      desc: "Profile actively under review by talent acquisition.",
    },
    Shortlisted: {
      title: "Profile Shortlisted",
      desc: "Candidate shortlisted by hiring manager for evaluation.",
    },
    Interview: {
      title: "Interview Scheduled",
      desc: note || "Candidate advanced to interview and assessment rounds.",
    },
    Decision: {
      title: "Decision & Offer",
      desc: note || "Final decision and offer discussion stage.",
    },
    Closed: {
      title: "Application Concluded",
      desc: note || "Application process concluded.",
    },
  };

  const stageInfo = stageDescriptions[stage] || {
    title: `${stage} Stage`,
    desc: note || `Application advanced to ${stage} stage.`,
  };

  // Clean out any repetitive legacy "Moved to ..." entries or duplicate stage entries
  const existingTimeline = (app.timeline || []).filter(
    (t) => t.stage !== stage && !t.title.startsWith("Moved to ")
  );

  app.timeline = [
    ...existingTimeline.map((t) => ({ ...t, active: false })),
    {
      id: `tl_${Date.now()}`,
      stage,
      title: stageInfo.title,
      description: note || stageInfo.desc,
      date: now,
      completed: stage !== "Closed",
      active: true,
    },
  ];

  if (note) {
    if (!app.recruiterNotes) app.recruiterNotes = [];
    app.recruiterNotes.push({
      id: `rn_${Date.now()}`,
      authorName: "Hiring Team",
      content: note,
      createdAt: new Date().toISOString(),
    });
  }

  apps[appIndex] = { ...app };
  persistApplications([...apps]);

  // Sync stage to candidate record
  if (typeof window !== "undefined") {
    try {
      const email = app.candidateEmail?.trim().toLowerCase();
      const syncStage = (recordStr: string | null) => {
        if (!recordStr) return null;
        try {
          const rec = JSON.parse(recordStr);
          if (Array.isArray(rec.applications)) {
            rec.applications = rec.applications.map((ca: any) =>
              ca.id === applicationId || ca.jobId === app.jobId ? { ...ca, stage } : ca
            );
          }
          return rec;
        } catch {
          return null;
        }
      };
      if (email) {
        const u = syncStage(localStorage.getItem(`tag_candidate_record_${email}`));
        if (u) localStorage.setItem(`tag_candidate_record_${email}`, JSON.stringify(u));
      }
      const g = syncStage(localStorage.getItem("tag_candidate_record"));
      if (g) localStorage.setItem("tag_candidate_record", JSON.stringify(g));
      window.dispatchEvent(new CustomEvent("tag_candidate_record_updated"));
    } catch {}
  }

  return apps[appIndex];
}

export async function addRecruiterNote(
  applicationId: string,
  content: string,
  authorName: string = "Hiring Team"
): Promise<Application> {
  await new Promise((r) => setTimeout(r, 150));
  const apps = loadStoredApplications();
  const appIndex = apps.findIndex((a) => a.id === applicationId);
  if (appIndex === -1) throw new Error("Application not found");

  const app = apps[appIndex];
  if (!app.recruiterNotes) app.recruiterNotes = [];
  app.recruiterNotes.push({
    id: `rn_${Date.now()}`,
    authorName,
    content,
    createdAt: new Date().toISOString(),
  });

  apps[appIndex] = { ...app };
  persistApplications([...apps]);
  return apps[appIndex];
}
