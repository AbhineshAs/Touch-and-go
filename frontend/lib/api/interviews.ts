import { Interview, InterviewScorecard } from "@/types";
import { BACKEND_URL } from "./auth";

const INTERVIEWS_STORAGE_KEY = "tag_interviews_storage";

let interviewsState: Interview[] = [];

function loadStoredInterviews(): Interview[] {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(INTERVIEWS_STORAGE_KEY);
      if (stored) {
        const parsed: Interview[] = JSON.parse(stored);
        // Exclude legacy mock interviews
        interviewsState = Array.isArray(parsed)
          ? parsed.filter(
              (i) =>
                !i.id.startsWith("int_0") &&
                !i.jobId.startsWith("job_0") &&
                !i.jobId.startsWith("job_sample_")
            )
          : [];
        return interviewsState;
      } else {
        interviewsState = [];
        return [];
      }
    } catch (e) {
      console.warn("Failed to read interviews from localStorage:", e);
    }
  }
  return interviewsState;
}

export function clearInterviewsState(): void {
  interviewsState = [];
  if (typeof window !== "undefined") {
    localStorage.removeItem(INTERVIEWS_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent("tag_interviews_updated"));
    window.dispatchEvent(new Event("storage"));
  }
}

function persistInterviews(items: Interview[]) {
  interviewsState = items;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(INTERVIEWS_STORAGE_KEY, JSON.stringify(items));
      window.dispatchEvent(new CustomEvent("tag_interviews_updated"));
      window.dispatchEvent(new Event("storage"));
    } catch (e) {
      console.warn("Failed to persist interviews to localStorage:", e);
    }
  }
}

export async function getInterviews(filters?: {
  applicationId?: string;
  candidateId?: string;
  candidateEmail?: string;
  jobId?: string;
  status?: string;
  search?: string;
}): Promise<Interview[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.applicationId) params.append("applicationId", filters.applicationId);
    if (filters?.candidateId) params.append("candidateId", filters.candidateId);
    if (filters?.candidateEmail) params.append("candidateEmail", filters.candidateEmail);
    if (filters?.jobId) params.append("jobId", filters.jobId);
    if (filters?.status && filters.status !== "All") params.append("status", filters.status);
    if (filters?.search) params.append("search", filters.search);

    const queryStr = params.toString() ? `?${params.toString()}` : "";
    const res = await fetch(`${BACKEND_URL}/api/v1/interviews/${queryStr}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      const data: Interview[] = await res.json();
      if (Array.isArray(data)) {
        // Backend database is single source of truth; sync to local storage cache
        persistInterviews(data);
        return data;
      }
    }
  } catch {
    // Backend offline / network fallback
  }

  // Fallback to local storage
  let list = loadStoredInterviews();
  if (filters?.applicationId) {
    list = list.filter((i) => i.applicationId === filters.applicationId);
  }
  if (filters?.candidateId) {
    list = list.filter((i) => i.candidateId === filters.candidateId);
  }
  if (filters?.candidateEmail) {
    list = list.filter(
      (i) => i.candidateEmail?.toLowerCase() === filters.candidateEmail?.toLowerCase()
    );
  }
  if (filters?.jobId) {
    list = list.filter((i) => i.jobId === filters.jobId);
  }
  if (filters?.status && filters.status !== "All") {
    list = list.filter((i) => i.status.toLowerCase() === filters.status?.toLowerCase());
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(
      (i) =>
        i.candidateName.toLowerCase().includes(q) ||
        i.jobTitle.toLowerCase().includes(q) ||
        i.interviewerName.toLowerCase().includes(q)
    );
  }
  return list;
}

export async function getInterviewById(interviewId: string): Promise<Interview | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/interviews/${interviewId}/`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (res.ok) {
      const data: Interview = await res.json();
      return data;
    }
  } catch {
    // Fallback to local
  }

  const all = loadStoredInterviews();
  return all.find((i) => i.id === interviewId) || null;
}

export async function getInterviewsForApplication(applicationId: string): Promise<Interview[]> {
  return getInterviews({ applicationId });
}

export async function scheduleInterview(payload: {
  id?: string;
  applicationId: string;
  candidateId: string;
  candidateName: string;
  candidateEmail?: string;
  jobId: string;
  jobTitle: string;
  roundName?: string;
  scheduledAt: string;
  durationMinutes: number;
  interviewerName: string;
  interviewerRole: string;
  interviewerEmail: string;
  meetingLink: string;
  meetingPlatform?: string;
  candidateNote?: string;
}): Promise<Interview> {
  const localId =
    payload.id || `int_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const requestBody = {
    id: localId,
    applicationId: payload.applicationId,
    candidateId: payload.candidateId,
    candidateName: payload.candidateName,
    candidateEmail: payload.candidateEmail || "",
    jobId: payload.jobId,
    jobTitle: payload.jobTitle,
    roundName: payload.roundName || "Round 1 - Technical Interview",
    scheduledAt: payload.scheduledAt,
    durationMinutes: payload.durationMinutes || 45,
    interviewerName: payload.interviewerName,
    interviewerRole: payload.interviewerRole || "Hiring Manager",
    interviewerEmail: payload.interviewerEmail || "recruiting@company.com",
    meetingLink: payload.meetingLink,
    meetingPlatform: payload.meetingPlatform || "Google Meet",
    candidateNote: payload.candidateNote || "",
    status: "Scheduled",
  };

  let backendInterview: Interview | null = null;
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/interviews/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });
    if (res.ok) {
      backendInterview = await res.json();
    }
  } catch {
    // Fallback
  }

  const newInterview: Interview = backendInterview || {
    ...requestBody,
    status: "Scheduled",
  };

  const current = loadStoredInterviews().filter((i) => i.id !== newInterview.id);
  const updated = [newInterview, ...current];
  persistInterviews(updated);
  return newInterview;
}

export async function updateInterview(
  interviewId: string,
  updates: Partial<Interview>
): Promise<Interview> {
  let backendInterview: Interview | null = null;
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/interviews/${interviewId}/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      backendInterview = await res.json();
    }
  } catch {
    // Fallback
  }

  const current = loadStoredInterviews();
  const index = current.findIndex((i) => i.id === interviewId);
  if (index === -1 && !backendInterview) {
    throw new Error("Interview not found");
  }

  const nextInterview: Interview = backendInterview || {
    ...current[index],
    ...updates,
    status:
      updates.status ||
      (updates.scheduledAt && current[index].scheduledAt !== updates.scheduledAt
        ? "Rescheduled"
        : current[index].status),
    updatedAt: new Date().toISOString(),
  };

  if (index !== -1) {
    current[index] = nextInterview;
  } else {
    current.unshift(nextInterview);
  }
  persistInterviews([...current]);
  return nextInterview;
}

export async function cancelInterview(
  interviewId: string,
  cancellationReason: string = "Cancelled by interviewer/employer."
): Promise<Interview> {
  let backendInterview: Interview | null = null;
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/interviews/${interviewId}/cancel/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cancellationReason }),
    });
    if (res.ok) {
      backendInterview = await res.json();
    }
  } catch {
    // Fallback
  }

  const current = loadStoredInterviews();
  const index = current.findIndex((i) => i.id === interviewId);
  if (index === -1 && !backendInterview) {
    throw new Error("Interview not found");
  }

  const nextInterview: Interview = backendInterview || {
    ...current[index],
    status: "Cancelled",
    cancellationReason,
    cancelledAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (index !== -1) {
    current[index] = nextInterview;
  } else {
    current.unshift(nextInterview);
  }
  persistInterviews([...current]);
  return nextInterview;
}

export async function submitScorecard(
  interviewId: string,
  scorecard: InterviewScorecard
): Promise<Interview> {
  let backendInterview: Interview | null = null;
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/interviews/${interviewId}/scorecard/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(scorecard),
    });
    if (res.ok) {
      backendInterview = await res.json();
    }
  } catch {
    // Fallback
  }

  const current = loadStoredInterviews();
  const index = current.findIndex((i) => i.id === interviewId);
  if (index === -1 && !backendInterview) {
    throw new Error("Interview not found");
  }

  const nextInterview: Interview = backendInterview || {
    ...current[index],
    status: "Completed",
    scorecard,
    updatedAt: new Date().toISOString(),
  };

  if (index !== -1) {
    current[index] = nextInterview;
  } else {
    current.unshift(nextInterview);
  }
  persistInterviews([...current]);
  return nextInterview;
}

export async function deleteInterview(interviewId: string): Promise<boolean> {
  try {
    await fetch(`${BACKEND_URL}/api/v1/interviews/${interviewId}/`, {
      method: "DELETE",
    });
  } catch {
    // Fallback
  }

  const current = loadStoredInterviews();
  const filtered = current.filter((i) => i.id !== interviewId);
  persistInterviews(filtered);
  return true;
}
