// lib/candidate/context/CandidateContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import {
  IdentityDraft,
  DiscoveryDraft,
  ConfirmedProfile,
  Recommendation,
  PlanTask,
  ActionPlan,
  Feedback,
  CandidateRecord,
  StructuredProfile,
  CandidateEducation,
  CandidateExperienceItem,
  CandidateProject,
  CandidateCertification,
  CandidateSkill,
  CandidateJobPreferences,
  CandidateApplication,
  CandidateInterview,
  ResumeDraft,
  UploadedResume,
  ProfileCompleteness,
  ProfileSuggestion,
  JobMatchResult,
} from "../types";
import { deriveRecommendations, getDismissalFingerprint } from "../recommendations/engine";
import { buildActionPlan, reconcileTasks } from "../plan/budget";
import { computeProfileCompleteness } from "../profile/completeness";
import { deriveProfileSuggestions } from "../profile/suggestions";
import { matchSampleJobs } from "../jobs/matcher";
import { Job } from "@/types";
import { getLiveJobs } from "@/lib/api/jobs";
import { MOCK_CANDIDATE_PROFILE, MOCK_APPLICATIONS, MOCK_INTERVIEWS } from "@/lib/mocks/data";
import {
  AUTH_TOKEN_KEY,
  AUTH_USER_KEY,
  AUTH_ROLE_KEY,
  notifyAuthChange,
  getStoredUser,
} from "@/lib/api/auth";
import {
  fetchResumeFromBackend,
  uploadResumeToBackend,
  replaceResumeInBackend,
  deleteResumeFromBackend,
} from "@/lib/api/resume";

export interface CandidateContextType {
  // Identity & Verification
  identity: IdentityDraft | null;
  setIdentity: (id: IdentityDraft) => void;
  phoneVerified: boolean;
  setPhoneVerified: (v: boolean) => void;

  // Discovery Draft
  discoveryDraft: DiscoveryDraft;
  updateDiscoveryDraft: (partial: Partial<DiscoveryDraft>) => void;
  resetDiscoveryDraft: () => void;

  // Confirmed Profile & Revisions
  confirmedProfile: ConfirmedProfile | null;
  candidateRecord: CandidateRecord | null;
  confirmProfile: () => ConfirmedProfile;

  // Profile Updates
  updateCandidateProfile: (partial: Partial<StructuredProfile> & { fullName?: string; phone?: string }) => void;
  addEducation: (edu: Omit<CandidateEducation, "id">) => void;
  updateEducation: (id: string, edu: Partial<CandidateEducation>) => void;
  deleteEducation: (id: string) => void;
  addExperience: (exp: Omit<CandidateExperienceItem, "id">) => void;
  updateExperience: (id: string, exp: Partial<CandidateExperienceItem>) => void;
  deleteExperience: (id: string) => void;
  addProject: (proj: Omit<CandidateProject, "id">) => void;
  deleteProject: (id: string) => void;
  addSkill: (skill: CandidateSkill) => void;
  updateSkill: (oldNameOrId: string, skill: CandidateSkill) => void;
  deleteSkill: (skillName: string) => void;
  addCertification: (cert: Omit<CandidateCertification, "id">) => void;
  updateCertification: (id: string, cert: Partial<CandidateCertification>) => void;
  deleteCertification: (id: string) => void;
  updatePreferences: (prefs: Partial<CandidateJobPreferences>) => void;

  // Job Interactions
  toggleSaveJob: (jobId: string) => void;
  applyToJob: (jobId: string, notes?: string) => void;
  savedJobIds: string[];
  applications: CandidateApplication[];
  interviews: CandidateInterview[];

  // Resume Draft & Sync
  resumeDraft: ResumeDraft | null;
  updateResumeDraft: (draft: Partial<ResumeDraft>) => void;
  syncResumeWithProfile: () => void;
  saveResumeToProfile: (fields: Partial<StructuredProfile>) => void;
  acknowledgeProfileChanges: () => void;

  // Uploaded Resume Document Lifecycle (Upload, View, Download, Replace, Delete)
  uploadedResume: UploadedResume | null;
  uploadResume: (resume: Omit<UploadedResume, "id" | "uploadedAt">) => void;
  replaceResume: (resume: Omit<UploadedResume, "id" | "uploadedAt">) => void;
  deleteResume: () => void;
  updateResumeScore: (score: number) => void;

  // Computed Selectors
  completeness: ProfileCompleteness;
  suggestions: ProfileSuggestion[];
  matchedJobs: JobMatchResult[];
  availableJobs: Job[];

  // Recommendations & Feedback
  recommendations: Recommendation[];
  feedback: Feedback;
  saveRecommendation: (recId: string) => void;
  dismissRecommendation: (rec: Recommendation, reason?: string) => void;
  undoDismissRecommendation: (fingerprint: string) => void;
  restoreAllDismissed: () => void;

  // Plan & Tasks
  plan: ActionPlan;
  markTaskComplete: (taskId: string) => void;
  undoTaskComplete: (taskId: string) => void;
  removeTask: (taskId: string) => void;
  restoreRemovedTasks: () => void;

  // System & Personas
  lastUpdateNotice: string | null;
  clearUpdateNotice: () => void;
  resetAll: () => void;
  loadDemoCandidate: (persona: "ananya") => void;
  loginCandidateByPhone: (phone: string) => { exists: boolean; onboardingComplete: boolean };
  loginCandidateByEmail: (email: string) => { exists: boolean; onboardingComplete: boolean };
}

const CandidateContext = createContext<CandidateContextType | undefined>(undefined);

const initialDiscoveryDraft: DiscoveryDraft = {
  targetRoles: [],
  challenges: [],
  skills: [],
  strengths: [],
  preferredSupport: [],
  workPreferences: {
    locationMode: "any",
    jobType: "any",
    availability: "immediate",
    freeOnlyResources: false,
  },
};

const defaultFeedback: Feedback = {
  savedRecommendationIds: [],
  dismissedFingerprints: [],
};

// Helper to construct a truthful default headline
function generateTruthfulHeadline(stage?: string, targetRoles: string[] = []): string {
  const primaryRole = targetRoles.find((r) => r.toLowerCase() !== "exploring") || "";
  if (!primaryRole) {
    if (stage === "student") return "Computer Science Student";
    if (stage === "fresher") return "Aspiring Software Engineer";
    if (stage === "switcher") return "Aspiring Technology Specialist";
    return "Candidate Exploring Opportunities";
  }

  if (stage === "student" || stage === "fresher") {
    return `Aspiring ${primaryRole}`;
  }
  if (stage === "switcher") {
    return `Transitioning to ${primaryRole}`;
  }
  return primaryRole;
}

// Helper to generate initial structured profile
function buildInitialStructuredProfile(
  identity: IdentityDraft | null,
  discovery: DiscoveryDraft
): StructuredProfile {
  const headline = generateTruthfulHeadline(discovery.careerStage, discovery.targetRoles);
  const stageDesc = discovery.careerStage ? discovery.careerStage.replace(/_/g, " ") : "technology candidate";
  const primaryGoalDesc = discovery.primaryGoal ? discovery.primaryGoal.replace(/_/g, " ") : "career opportunities";
  const targetRoleStr = discovery.targetRoles.filter((r) => r.toLowerCase() !== "exploring").join(", ");

  const summary = `Motivated ${stageDesc} focused on ${primaryGoalDesc}${
    targetRoleStr ? ` targeting roles in ${targetRoleStr}` : ""
  }. Eager to contribute verified skills and learn production engineering standards.`;

  return {
    headline,
    summary,
    location: identity?.countryCode === "+91" ? "India" : "Global",
    phone: identity?.phone || "",
    education: [],
    experience: [],
    projects: [],
    certifications: [],
    skills: [...(discovery.skills || [])],
    links: [],
    jobPreferences: {
      desiredRoles: [...discovery.targetRoles],
      preferredLocations: [],
      desiredWorkModes: discovery.workPreferences?.locationMode
        ? [discovery.workPreferences.locationMode]
        : ["any"],
      employmentTypes: discovery.workPreferences?.jobType
        ? [discovery.workPreferences.jobType]
        : ["any"],
      availability: discovery.workPreferences?.availability || "immediate",
      salaryCurrency: "INR",
      salaryPeriod: "year",
    },
  };
}

// Helper to construct initial resume draft from profile
function buildInitialResumeDraft(
  candidateRecord: CandidateRecord,
  revision: number
): ResumeDraft {
  const { identity, profile } = candidateRecord;
  const isFresher =
    candidateRecord.discovery?.careerStage === "student" ||
    candidateRecord.discovery?.careerStage === "fresher";

  return {
    sourceProfileRevision: revision,
    contact: {
      fullName: identity?.fullName || "Candidate",
      email: identity?.email || "",
      phone: identity?.phone || "",
      location: profile.location || "India",
    },
    headline: profile.headline,
    summary: profile.summary,
    skills: profile.skills.map((s) => s.name),
    education: [...profile.education],
    experience: [...profile.experience],
    projects: [...profile.projects],
    certifications: [...profile.certifications],
    links: [...profile.links],
    sectionOrder: isFresher
      ? ["summary", "projects", "education", "skills", "experience", "certifications", "links"]
      : ["summary", "experience", "skills", "projects", "education", "certifications", "links"],
    visibleSections: {
      summary: true,
      experience: true,
      projects: true,
      education: true,
      skills: true,
      certifications: true,
      links: true,
    },
    hasReviewedProfileChanges: true,
  };
}

// Sync user session to Auth storage so ProtectedRoute seamlessly authenticates candidate
function syncAuthSession(record: CandidateRecord) {
  if (typeof window === "undefined") return;
  const authUser = {
    id: record.id,
    name: record.identity.fullName || "Candidate",
    email: record.identity.email || "candidate@tagjobs.in",
    role: "candidate",
    createdAt: record.confirmedAt || new Date().toISOString(),
  };
  const token = `tag_jwt_${record.id}`;
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authUser));
  localStorage.setItem(AUTH_ROLE_KEY, "candidate");
  document.cookie = `${AUTH_TOKEN_KEY}=${token}; path=/; max-age=604800; SameSite=Lax`;
  document.cookie = `${AUTH_ROLE_KEY}=candidate; path=/; max-age=604800; SameSite=Lax`;
  notifyAuthChange();
}

const TAG_CANDIDATE_RECORD_KEY = "tag_candidate_record";
const TAG_CANDIDATE_DB_KEY = "tag_candidate_db";
const TAG_CANDIDATE_IDENTITY_KEY = "tag_candidate_identity";
const TAG_CANDIDATE_DISCOVERY_DRAFT_KEY = "tag_candidate_discovery_draft";
const TAG_CANDIDATE_UPLOADED_RESUME_KEY = "tag_candidate_uploaded_resume";

export function CandidateProvider({ children }: { children: React.ReactNode }) {
  const [identity, setIdentityState] = useState<IdentityDraft | null>(null);
  const [phoneVerified, setPhoneVerifiedState] = useState<boolean>(false);
  const [discoveryDraft, setDiscoveryDraftState] = useState<DiscoveryDraft>({
    ...initialDiscoveryDraft,
  });

  // Canonical candidate record
  const [candidateRecord, setCandidateRecord] = useState<CandidateRecord | null>(null);
  const [availableJobs, setAvailableJobs] = useState<Job[]>([]);
  const [uploadedResume, setUploadedResume] = useState<UploadedResume | null>(null);
  const [feedback, setFeedbackState] = useState<Feedback>({ ...defaultFeedback });
  const [tasks, setTasksState] = useState<PlanTask[]>([]);
  const [lastUpdateNotice, setLastUpdateNoticeState] = useState<string | null>(null);

  // Sync available employer jobs from storage
  useEffect(() => {
    const syncJobs = () => {
      setAvailableJobs(getLiveJobs());
    };
    syncJobs();
    if (typeof window !== "undefined") {
      window.addEventListener("storage", syncJobs);
      window.addEventListener("tag_jobs_updated", syncJobs);
      return () => {
        window.removeEventListener("storage", syncJobs);
        window.removeEventListener("tag_jobs_updated", syncJobs);
      };
    }
  }, []);

  // Sync candidate applications from storage in real time
  useEffect(() => {
    if (typeof window === "undefined") return;
    const syncApplications = () => {
      try {
        const rawAuth = localStorage.getItem(AUTH_USER_KEY);
        let authUser: any = null;
        if (rawAuth) {
          try {
            authUser = JSON.parse(rawAuth);
          } catch {}
        }
        const activeEmail = authUser?.email?.trim().toLowerCase();
        const storedAppsStr = localStorage.getItem("tag_applications_storage");
        if (storedAppsStr && activeEmail) {
          const storedApps = JSON.parse(storedAppsStr);
          const userApps: CandidateApplication[] = storedApps
            .filter((a: any) => a.candidateEmail?.toLowerCase() === activeEmail)
            .map((ua: any) => ({
              id: ua.id,
              jobId: ua.jobId,
              jobTitle: ua.jobTitle,
              organizationName: ua.organizationName,
              organizationLogo: ua.organizationLogo,
              location: ua.location,
              workMode: ua.workMode,
              appliedAt: ua.appliedAt,
              stage: ua.stage,
            }));

          setCandidateRecord((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              applications: userApps,
            };
          });
        }
      } catch (e) {
        console.warn("Error syncing applications to CandidateContext:", e);
      }
    };

    window.addEventListener("tag_applications_updated", syncApplications);
    window.addEventListener("tag_candidate_record_updated", syncApplications);
    return () => {
      window.removeEventListener("tag_applications_updated", syncApplications);
      window.removeEventListener("tag_candidate_record_updated", syncApplications);
    };
  }, []);

  // In-session candidate database to test switching or multiple accounts without cross-leakage
  const [sessionCandidates, setSessionCandidates] = useState<Record<string, CandidateRecord>>({});

  // Restore persisted state from storage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const storedDbStr = localStorage.getItem(TAG_CANDIDATE_DB_KEY);
      let parsedDb: Record<string, CandidateRecord> = {};
      if (storedDbStr) {
        try {
          parsedDb = JSON.parse(storedDbStr);
          setSessionCandidates(parsedDb);
        } catch {}
      }

      // Check current auth user
      const rawAuthUser = localStorage.getItem(AUTH_USER_KEY);
      let authUser: any = null;
      if (rawAuthUser) {
        try {
          authUser = JSON.parse(rawAuthUser);
        } catch {}
      }

      const activeEmail = authUser?.email?.trim().toLowerCase();
      const activePhone = authUser?.phone ? String(authUser.phone).replace(/\D/g, "") : "";

      // Check candidate record: specific to email, then specific to phone, then general
      let activeRecord: CandidateRecord | null = null;
      if (activeEmail && localStorage.getItem(`tag_candidate_record_${activeEmail}`)) {
        try {
          activeRecord = JSON.parse(localStorage.getItem(`tag_candidate_record_${activeEmail}`)!);
        } catch {}
      }
      if (!activeRecord && activeEmail && parsedDb[activeEmail]) {
        activeRecord = parsedDb[activeEmail];
      }
      if (!activeRecord && activePhone && parsedDb[activePhone]) {
        activeRecord = parsedDb[activePhone];
      }
      if (!activeRecord) {
        const rawGeneric = localStorage.getItem(TAG_CANDIDATE_RECORD_KEY);
        if (rawGeneric) {
          try {
            activeRecord = JSON.parse(rawGeneric);
          } catch {}
        }
      }

      if (activeRecord) {
        if (activeRecord.savedJobIds) {
          activeRecord.savedJobIds = activeRecord.savedJobIds.filter(
            (id) => !id.startsWith("job_0") && !id.startsWith("job_sample_")
          );
        }
        if (activeRecord.applications) {
          activeRecord.applications = activeRecord.applications.filter(
            (a) => !a.jobId.startsWith("job_0") && !a.jobId.startsWith("job_sample_") && !a.id.startsWith("app_0")
          );
        }
        if (activeRecord.interviews) {
          activeRecord.interviews = activeRecord.interviews.filter(
            (i) => !i.id.startsWith("int_0") && !i.applicationId.startsWith("app_0")
          );
        }

        // Merge applications from tag_applications_storage
        const storedAppsStr = localStorage.getItem("tag_applications_storage");
        if (storedAppsStr && activeEmail) {
          try {
            const storedApps = JSON.parse(storedAppsStr);
            const userApps = storedApps.filter(
              (a: any) => a.candidateEmail?.toLowerCase() === activeEmail
            );
            const existing = activeRecord.applications || [];
            const merged = [...existing];
            for (const ua of userApps) {
              if (!merged.some((m) => m.jobId === ua.jobId || m.id === ua.id)) {
                merged.unshift({
                  id: ua.id,
                  jobId: ua.jobId,
                  jobTitle: ua.jobTitle,
                  organizationName: ua.organizationName,
                  organizationLogo: ua.organizationLogo,
                  location: ua.location,
                  workMode: ua.workMode,
                  appliedAt: ua.appliedAt,
                  stage: ua.stage,
                });
              }
            }
            activeRecord.applications = merged;
          } catch {}
        }

        if (
          authUser?.name &&
          authUser.name.toLowerCase() !== activeRecord.identity.fullName.toLowerCase() &&
          activeRecord.identity.fullName.toLowerCase() === activeEmail?.split("@")[0]
        ) {
          activeRecord.identity.fullName = authUser.name;
        }
        setCandidateRecord(activeRecord);
        setIdentityState(activeRecord.identity);
        setPhoneVerifiedState(true);
        if (activeRecord.discovery) {
          setDiscoveryDraftState(activeRecord.discovery);
        }
        if (activeRecord.uploadedResume) {
          setUploadedResume(activeRecord.uploadedResume);
        }
      } else {
        // Try restoring draft discovery
        const rawDraft = localStorage.getItem(TAG_CANDIDATE_DISCOVERY_DRAFT_KEY);
        if (rawDraft) {
          try {
            setDiscoveryDraftState(JSON.parse(rawDraft));
          } catch {}
        }

        // Try restoring identity
        const rawIdentity = localStorage.getItem(TAG_CANDIDATE_IDENTITY_KEY);
        if (rawIdentity) {
          try {
            setIdentityState(JSON.parse(rawIdentity));
            setPhoneVerifiedState(true);
          } catch {}
        } else if (authUser && (authUser.role === "candidate" || !authUser.role)) {
          setIdentityState({
            fullName: authUser.name || "Candidate",
            email: authUser.email,
            phone: authUser.phone || "",
            countryCode: authUser.country_code || "+91",
            agreeToTerms: true,
          });
          setPhoneVerifiedState(true);
        }

        if (authUser && (authUser.role === "candidate" || !authUser.role)) {
          const userApps: CandidateApplication[] = [];
          const storedAppsStr = localStorage.getItem("tag_applications_storage");
          if (storedAppsStr && activeEmail) {
            try {
              const storedApps = JSON.parse(storedAppsStr);
              for (const ua of storedApps) {
                if (ua.candidateEmail?.toLowerCase() === activeEmail) {
                  userApps.push({
                    id: ua.id,
                    jobId: ua.jobId,
                    jobTitle: ua.jobTitle,
                    organizationName: ua.organizationName,
                    organizationLogo: ua.organizationLogo,
                    location: ua.location,
                    workMode: ua.workMode,
                    appliedAt: ua.appliedAt,
                    stage: ua.stage,
                  });
                }
              }
            } catch {}
          }

          const baseRecord: CandidateRecord = {
            id: authUser.id || `cand_${Date.now()}`,
            schemaVersion: "1.0.0",
            profileRevision: 1,
            onboardingComplete: false,
            confirmedAt: new Date().toISOString(),
            identity: {
              fullName: authUser.name || "Candidate",
              email: authUser.email,
              countryCode: authUser.country_code || "+91",
              phone: authUser.phone || "",
              agreeToTerms: true,
            },
            discovery: { ...initialDiscoveryDraft },
            profile: {
              headline: "Software Engineer",
              summary: "",
              location: "India",
              phone: authUser.phone || "",
              education: [],
              experience: [],
              projects: [],
              certifications: [],
              skills: [],
              links: [],
              jobPreferences: {
                desiredRoles: [],
                preferredLocations: ["Bengaluru", "Remote"],
                desiredWorkModes: ["hybrid", "remote"],
                employmentTypes: ["full_time"],
                availability: "immediate",
                salaryCurrency: "INR",
                salaryPeriod: "year",
              },
            },
            applications: userApps,
            savedJobIds: [],
            interviews: [],
          };
          activeRecord = baseRecord;
          setCandidateRecord(activeRecord);
        }
      }

      // Check for candidate uploaded resume
      let initialResume: UploadedResume | null = null;
      if (activeEmail && localStorage.getItem(`tag_candidate_resume_${activeEmail}`)) {
        try {
          initialResume = JSON.parse(localStorage.getItem(`tag_candidate_resume_${activeEmail}`)!);
        } catch {}
      }
      if (!initialResume && activeRecord?.uploadedResume) {
        initialResume = activeRecord.uploadedResume;
      }
      if (!initialResume) {
        const rawResume = localStorage.getItem(TAG_CANDIDATE_UPLOADED_RESUME_KEY);
        if (rawResume) {
          try {
            initialResume = JSON.parse(rawResume);
          } catch {}
        }
      }
      if (initialResume) {
        setUploadedResume(initialResume);
      }

      // Query Django backend for candidate's resume
      if (activeEmail) {
        fetchResumeFromBackend(activeEmail).then((backendResume) => {
          if (backendResume) {
            setUploadedResume(backendResume);
            setCandidateRecord((prev) => (prev ? { ...prev, uploadedResume: backendResume } : prev));
            try {
              localStorage.setItem(`tag_candidate_resume_${activeEmail}`, JSON.stringify(backendResume));
              localStorage.setItem(TAG_CANDIDATE_UPLOADED_RESUME_KEY, JSON.stringify(backendResume));
            } catch {}
          }
        }).catch((err) => {
          console.warn("Could not sync resume from Django backend:", err);
        });
      }
    } catch (err) {
      console.warn("Error restoring candidate state:", err);
    }
  }, []);

  // Sync candidate resume whenever auth session changes (login / switch user)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleAuthChange = () => {
      const raw = localStorage.getItem(AUTH_USER_KEY);
      if (!raw) return;
      try {
        const user = JSON.parse(raw);
        const email = user?.email?.trim().toLowerCase();
        if (email) {
          const cachedResume = localStorage.getItem(`tag_candidate_resume_${email}`);
          if (cachedResume) {
            try {
              setUploadedResume(JSON.parse(cachedResume));
            } catch {}
          }
          fetchResumeFromBackend(email).then((backendResume) => {
            if (backendResume) {
              setUploadedResume(backendResume);
              setCandidateRecord((prev) => (prev ? { ...prev, uploadedResume: backendResume } : prev));
              try {
                localStorage.setItem(`tag_candidate_resume_${email}`, JSON.stringify(backendResume));
                localStorage.setItem(TAG_CANDIDATE_UPLOADED_RESUME_KEY, JSON.stringify(backendResume));
              } catch {}
            }
          });
        }
      } catch {}
    };

    window.addEventListener("tag_auth_changed", handleAuthChange);
    return () => {
      window.removeEventListener("tag_auth_changed", handleAuthChange);
    };
  }, []);

  // Persist candidate record whenever updated
  useEffect(() => {
    if (typeof window === "undefined" || !candidateRecord) return;
    try {
      localStorage.setItem(TAG_CANDIDATE_RECORD_KEY, JSON.stringify(candidateRecord));
      if (candidateRecord.identity?.email) {
        localStorage.setItem(
          `tag_candidate_record_${candidateRecord.identity.email.trim().toLowerCase()}`,
          JSON.stringify(candidateRecord)
        );
      }
      setSessionCandidates((prev) => {
        const next = { ...prev };
        if (candidateRecord.identity?.phone) next[candidateRecord.identity.phone] = candidateRecord;
        if (candidateRecord.identity?.email) next[candidateRecord.identity.email.trim().toLowerCase()] = candidateRecord;
        try {
          localStorage.setItem(TAG_CANDIDATE_DB_KEY, JSON.stringify(next));
        } catch {}
        return next;
      });
    } catch (e) {
      console.warn("Failed to persist candidateRecord:", e);
    }
  }, [candidateRecord]);

  // Persist identity whenever updated
  useEffect(() => {
    if (typeof window === "undefined" || !identity) return;
    try {
      localStorage.setItem(TAG_CANDIDATE_IDENTITY_KEY, JSON.stringify(identity));
    } catch {}
  }, [identity]);

  // Persist discoveryDraft whenever updated
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(TAG_CANDIDATE_DISCOVERY_DRAFT_KEY, JSON.stringify(discoveryDraft));
    } catch {}
  }, [discoveryDraft]);

  const setIdentity = useCallback((id: IdentityDraft) => {
    setIdentityState(id);
  }, []);

  const setPhoneVerified = useCallback((v: boolean) => {
    setPhoneVerifiedState(v);
  }, []);

  const updateDiscoveryDraft = useCallback((partial: Partial<DiscoveryDraft>) => {
    setDiscoveryDraftState((prev) => ({
      ...prev,
      ...partial,
    }));
  }, []);

  const resetDiscoveryDraft = useCallback(() => {
    setDiscoveryDraftState({ ...initialDiscoveryDraft });
  }, []);

  // Confirmed Profile getter for backward compatibility
  const confirmedProfile: ConfirmedProfile | null = useMemo(() => {
    if (!candidateRecord || !candidateRecord.onboardingComplete) return null;
    return {
      revision: candidateRecord.profileRevision,
      schemaVersion: "1.0.0",
      confirmedAt: candidateRecord.confirmedAt || new Date().toISOString(),
      discovery: candidateRecord.discovery,
    };
  }, [candidateRecord]);

  // Recommendations
  const recommendations = useMemo(() => {
    if (!confirmedProfile) return [];
    return deriveRecommendations(confirmedProfile, feedback);
  }, [confirmedProfile, feedback]);

  // Action plan
  const plan = useMemo(() => {
    if (!confirmedProfile) {
      return {
        weeklyBudgetMinutes: 120,
        totalPlannedMinutes: 0,
        tasks: [],
      };
    }
    const rawPlan = buildActionPlan(
      recommendations,
      confirmedProfile.discovery.timeBudget || "1_to_3_hours",
      confirmedProfile.revision
    );
    const reconciled = reconcileTasks(tasks, rawPlan.tasks);
    return {
      ...rawPlan,
      tasks: reconciled,
    };
  }, [confirmedProfile, recommendations, tasks]);

  // Computed Selectors
  const completeness = useMemo(() => {
    if (!candidateRecord) {
      return { score: 0, completedGroups: [], missingGroups: [] };
    }
    return computeProfileCompleteness(candidateRecord);
  }, [candidateRecord]);

  const suggestions = useMemo(() => {
    if (!candidateRecord) return [];
    return deriveProfileSuggestions(candidateRecord);
  }, [candidateRecord]);

  const matchedJobs = useMemo(() => {
    if (!candidateRecord) return [];
    return matchSampleJobs(candidateRecord, availableJobs);
  }, [candidateRecord, availableJobs]);

  const savedJobIds = useMemo(() => {
    return candidateRecord?.savedJobIds || [];
  }, [candidateRecord]);

  const applications = useMemo(() => {
    return candidateRecord?.applications || [];
  }, [candidateRecord]);

  const interviews = useMemo(() => {
    return candidateRecord?.interviews || [];
  }, [candidateRecord]);

  const resumeDraft = useMemo(() => {
    return candidateRecord?.resumeDraft || null;
  }, [candidateRecord]);

  // Confirm Profile Action on Onboarding Review (Commit to canonical record)
  const confirmProfile = useCallback((): ConfirmedProfile => {
    const nextRevision = (candidateRecord?.profileRevision || 0) + 1;
    const isUpdate = Boolean(candidateRecord);
    const confirmedAt = new Date().toISOString();

    const candidateId =
      candidateRecord?.id ||
      `cand_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const effectiveIdentity: IdentityDraft = identity ||
      candidateRecord?.identity || {
        fullName: "New Candidate",
        email: "candidate@tagjobs.in",
        countryCode: "+91",
        phone: "9876543210",
        agreeToTerms: true,
      };

    // Preserve existing structured details if re-confirming, else initialize
    const effectiveProfile: StructuredProfile =
      candidateRecord?.profile ||
      buildInitialStructuredProfile(effectiveIdentity, discoveryDraft);

    // Merge latest skills into profile if not already present
    const existingSkillNames = new Set(effectiveProfile.skills.map((s) => s.name.toLowerCase()));
    for (const s of discoveryDraft.skills || []) {
      if (!existingSkillNames.has(s.name.toLowerCase())) {
        effectiveProfile.skills.push(s);
      }
    }

    const newRecord: CandidateRecord = {
      id: candidateId,
      schemaVersion: "1.0.0",
      profileRevision: nextRevision,
      onboardingComplete: true,
      confirmedAt,
      identity: effectiveIdentity,
      discovery: { ...discoveryDraft },
      profile: effectiveProfile,
      applications: candidateRecord?.applications || [],
      savedJobIds: candidateRecord?.savedJobIds || [],
      interviews: candidateRecord?.interviews || [],
    };

    // Build initial resume draft
    newRecord.resumeDraft =
      candidateRecord?.resumeDraft ||
      buildInitialResumeDraft(newRecord, nextRevision);

    setCandidateRecord(newRecord);
    setSessionCandidates((prev) => {
      const next = {
        ...prev,
        [newRecord.identity.phone]: newRecord,
        [newRecord.identity.email.trim().toLowerCase()]: newRecord,
      };
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(TAG_CANDIDATE_DB_KEY, JSON.stringify(next));
        } catch {}
      }
      return next;
    });

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(TAG_CANDIDATE_RECORD_KEY, JSON.stringify(newRecord));
        if (newRecord.identity?.email) {
          localStorage.setItem(
            `tag_candidate_record_${newRecord.identity.email.trim().toLowerCase()}`,
            JSON.stringify(newRecord)
          );
        }
      } catch {}
    }

    // Sync auth session so ProtectedRoute lets user into candidate routes
    syncAuthSession(newRecord);

    if (isUpdate) {
      setLastUpdateNoticeState(
        `Recommendations and plan updated based on your latest confirmed goals (Revision ${nextRevision}).`
      );
    }

    return {
      revision: nextRevision,
      schemaVersion: "1.0.0",
      confirmedAt,
      discovery: { ...discoveryDraft },
    };
  }, [candidateRecord, identity, discoveryDraft]);

  // Profile Mutations
  const updateCandidateProfile = useCallback(
    (partial: Partial<StructuredProfile> & { fullName?: string; phone?: string }) => {
      setCandidateRecord((prev) => {
        if (!prev) return null;
        const nextRev = prev.profileRevision + 1;
        const updatedProfile: StructuredProfile = {
          ...prev.profile,
          ...partial,
        };
        const updatedIdentity: IdentityDraft = {
          ...prev.identity,
          fullName: partial.fullName !== undefined && partial.fullName.trim() ? partial.fullName.trim() : prev.identity.fullName,
          phone: partial.phone !== undefined && partial.phone.trim() ? partial.phone.trim() : prev.identity.phone,
        };
        const updated: CandidateRecord = {
          ...prev,
          profileRevision: nextRev,
          identity: updatedIdentity,
          profile: updatedProfile,
        };
        setIdentityState(updatedIdentity);
        syncAuthSession(updated);
        setSessionCandidates((sc) => ({
          ...sc,
          [updated.identity.phone]: updated,
          [updated.identity.email.trim().toLowerCase()]: updated,
        }));
        return updated;
      });
    },
    []
  );

  const addEducation = useCallback(
    (edu: Omit<CandidateEducation, "id">) => {
      setCandidateRecord((prev) => {
        if (!prev) return null;
        const nextRev = prev.profileRevision + 1;
        const newEdu: CandidateEducation = {
          ...edu,
          id: `edu_${Date.now()}`,
        };
        const updated: CandidateRecord = {
          ...prev,
          profileRevision: nextRev,
          profile: {
            ...prev.profile,
            education: [newEdu, ...prev.profile.education],
          },
        };
        return updated;
      });
    },
    []
  );

  const updateEducation = useCallback(
    (id: string, updated: Partial<CandidateEducation>) => {
      setCandidateRecord((prev) => {
        if (!prev) return null;
        const nextRev = prev.profileRevision + 1;
        return {
          ...prev,
          profileRevision: nextRev,
          profile: {
            ...prev.profile,
            education: prev.profile.education.map((e) =>
              e.id === id ? { ...e, ...updated } : e
            ),
          },
        };
      });
    },
    []
  );

  const deleteEducation = useCallback((id: string) => {
    setCandidateRecord((prev) => {
      if (!prev) return null;
      const nextRev = prev.profileRevision + 1;
      return {
        ...prev,
        profileRevision: nextRev,
        profile: {
          ...prev.profile,
          education: prev.profile.education.filter((e) => e.id !== id),
        },
      };
    });
  }, []);

  const addExperience = useCallback(
    (exp: Omit<CandidateExperienceItem, "id">) => {
      setCandidateRecord((prev) => {
        if (!prev) return null;
        const nextRev = prev.profileRevision + 1;
        const newExp: CandidateExperienceItem = {
          ...exp,
          id: `exp_${Date.now()}`,
        };
        return {
          ...prev,
          profileRevision: nextRev,
          profile: {
            ...prev.profile,
            experience: [newExp, ...prev.profile.experience],
          },
        };
      });
    },
    []
  );

  const updateExperience = useCallback(
    (id: string, updated: Partial<CandidateExperienceItem>) => {
      setCandidateRecord((prev) => {
        if (!prev) return null;
        const nextRev = prev.profileRevision + 1;
        return {
          ...prev,
          profileRevision: nextRev,
          profile: {
            ...prev.profile,
            experience: prev.profile.experience.map((e) =>
              e.id === id ? { ...e, ...updated } : e
            ),
          },
        };
      });
    },
    []
  );

  const deleteExperience = useCallback((id: string) => {
    setCandidateRecord((prev) => {
      if (!prev) return null;
      const nextRev = prev.profileRevision + 1;
      return {
        ...prev,
        profileRevision: nextRev,
        profile: {
          ...prev.profile,
          experience: prev.profile.experience.filter((e) => e.id !== id),
        },
      };
    });
  }, []);

  const addProject = useCallback(
    (proj: Omit<CandidateProject, "id">) => {
      setCandidateRecord((prev) => {
        if (!prev) return null;
        const nextRev = prev.profileRevision + 1;
        const newProj: CandidateProject = {
          ...proj,
          id: `proj_${Date.now()}`,
        };
        return {
          ...prev,
          profileRevision: nextRev,
          profile: {
            ...prev.profile,
            projects: [newProj, ...prev.profile.projects],
          },
        };
      });
    },
    []
  );

  const deleteProject = useCallback((id: string) => {
    setCandidateRecord((prev) => {
      if (!prev) return null;
      const nextRev = prev.profileRevision + 1;
      return {
        ...prev,
        profileRevision: nextRev,
        profile: {
          ...prev.profile,
          projects: prev.profile.projects.filter((p) => p.id !== id),
        },
      };
    });
  }, []);

  const addSkill = useCallback(
    (skill: CandidateSkill) => {
      setCandidateRecord((prev) => {
        if (!prev) return null;
        const nextRev = prev.profileRevision + 1;
        const exists = prev.profile.skills.some(
          (s) => s.name.toLowerCase() === skill.name.toLowerCase()
        );
        const updatedSkills = exists
          ? prev.profile.skills.map((s) =>
              s.name.toLowerCase() === skill.name.toLowerCase() ? skill : s
            )
          : [...prev.profile.skills, skill];
        return {
          ...prev,
          profileRevision: nextRev,
          profile: {
            ...prev.profile,
            skills: updatedSkills,
          },
        };
      });
    },
    []
  );

  const updateSkill = useCallback(
    (oldNameOrId: string, updated: CandidateSkill) => {
      setCandidateRecord((prev) => {
        if (!prev) return null;
        const nextRev = prev.profileRevision + 1;
        return {
          ...prev,
          profileRevision: nextRev,
          profile: {
            ...prev.profile,
            skills: prev.profile.skills.map((s) => {
              if (s.id && s.id === oldNameOrId) return updated;
              if (s.name.toLowerCase() === oldNameOrId.toLowerCase()) return updated;
              return s;
            }),
          },
        };
      });
    },
    []
  );

  const deleteSkill = useCallback((skillName: string) => {
    setCandidateRecord((prev) => {
      if (!prev) return null;
      const nextRev = prev.profileRevision + 1;
      return {
        ...prev,
        profileRevision: nextRev,
        profile: {
          ...prev.profile,
          skills: prev.profile.skills.filter(
            (s) => s.name.toLowerCase() !== skillName.toLowerCase()
          ),
        },
      };
    });
  }, []);

  const addCertification = useCallback(
    (cert: Omit<CandidateCertification, "id">) => {
      setCandidateRecord((prev) => {
        if (!prev) return null;
        const nextRev = prev.profileRevision + 1;
        const newCert: CandidateCertification = {
          ...cert,
          id: `cert_${Date.now()}`,
        };
        return {
          ...prev,
          profileRevision: nextRev,
          profile: {
            ...prev.profile,
            certifications: [newCert, ...(prev.profile.certifications || [])],
          },
        };
      });
    },
    []
  );

  const updateCertification = useCallback(
    (id: string, updated: Partial<CandidateCertification>) => {
      setCandidateRecord((prev) => {
        if (!prev) return null;
        const nextRev = prev.profileRevision + 1;
        return {
          ...prev,
          profileRevision: nextRev,
          profile: {
            ...prev.profile,
            certifications: (prev.profile.certifications || []).map((c) =>
              c.id === id ? { ...c, ...updated } : c
            ),
          },
        };
      });
    },
    []
  );

  const deleteCertification = useCallback((id: string) => {
    setCandidateRecord((prev) => {
      if (!prev) return null;
      const nextRev = prev.profileRevision + 1;
      return {
        ...prev,
        profileRevision: nextRev,
        profile: {
          ...prev.profile,
          certifications: (prev.profile.certifications || []).filter((c) => c.id !== id),
        },
      };
    });
  }, []);

  const updatePreferences = useCallback(
    (partialPrefs: Partial<CandidateJobPreferences>) => {
      setCandidateRecord((prev) => {
        if (!prev) return null;
        const nextRev = prev.profileRevision + 1;
        return {
          ...prev,
          profileRevision: nextRev,
          profile: {
            ...prev.profile,
            jobPreferences: {
              ...prev.profile.jobPreferences,
              ...partialPrefs,
            },
          },
        };
      });
    },
    []
  );

  // Job Save / Unsave
  const toggleSaveJob = useCallback((jobId: string) => {
    setCandidateRecord((prev) => {
      if (!prev) return null;
      const isSaved = prev.savedJobIds.includes(jobId);
      const updatedSaved = isSaved
        ? prev.savedJobIds.filter((id) => id !== jobId)
        : [...prev.savedJobIds, jobId];
      return {
        ...prev,
        savedJobIds: updatedSaved,
      };
    });
  }, []);

  // Job Application Simulation
  const applyToJob = useCallback(
    (jobId: string, notes?: string) => {
      setCandidateRecord((prev) => {
        if (!prev) return null;
        if (prev.applications.some((a) => a.jobId === jobId)) return prev;

        const allMatched = matchSampleJobs(prev, availableJobs);
        const matchedItem = allMatched.find((m) => m.job.id === jobId);
        const job = availableJobs.find((j) => j.id === jobId || j.slug === jobId) || matchedItem?.job;

        const newApp: CandidateApplication = {
          id: `app_${Date.now()}`,
          jobId,
          jobTitle: job?.title || "Engineering Position",
          organizationName: job?.organizationName || "Technology Partner",
          organizationLogo: job?.organizationLogo,
          location: job?.location || "India",
          workMode: job?.workMode || "Remote",
          appliedAt: new Date().toISOString(),
          stage: "Applied",
          notes,
        };

        if (typeof window !== "undefined") {
          try {
            const storedAppsStr = localStorage.getItem("tag_applications_storage");
            let storedApps = storedAppsStr ? JSON.parse(storedAppsStr) : [];
            if (!storedApps.some((a: any) => a.id === newApp.id || a.jobId === newApp.jobId)) {
              storedApps.unshift({
                id: newApp.id,
                jobId: newApp.jobId,
                jobSlug: job?.slug || jobId,
                jobTitle: newApp.jobTitle,
                organizationId: job?.organizationId || "org_01",
                organizationName: newApp.organizationName,
                organizationLogo: newApp.organizationLogo || "",
                location: newApp.location,
                workMode: (newApp.workMode as any) || "Remote",
                candidateId: prev.id,
                candidateName: prev.identity.fullName,
                candidateHeadline: prev.profile?.headline || "Software Engineer",
                candidateEmail: prev.identity.email,
                candidateAvatar: prev.uploadedResume?.dataUrl || "",
                appliedAt: newApp.appliedAt,
                stage: "Applied",
                overallAlignment: 78,
                resumeFileName:
                  prev.uploadedResume?.fileName ||
                  `${prev.identity.fullName.replace(/\s+/g, "_")}_Resume.pdf`,
                timeline: [
                  {
                    id: `tl_${Date.now()}`,
                    stage: "Applied",
                    title: "Application Submitted",
                    description: `Profile submitted directly to ${newApp.organizationName}.`,
                    date: new Date().toISOString(),
                    completed: true,
                    active: true,
                  },
                ],
              });
              localStorage.setItem("tag_applications_storage", JSON.stringify(storedApps));
              window.dispatchEvent(new CustomEvent("tag_applications_updated"));
            }
          } catch {}
        }

        return {
          ...prev,
          applications: [newApp, ...prev.applications],
        };
      });
    },
    [availableJobs]
  );

  // Resume Draft Actions
  const updateResumeDraft = useCallback((draftUpdate: Partial<ResumeDraft>) => {
    setCandidateRecord((prev) => {
      if (!prev || !prev.resumeDraft) return prev;
      return {
        ...prev,
        resumeDraft: {
          ...prev.resumeDraft,
          ...draftUpdate,
        },
      };
    });
  }, []);

  const acknowledgeProfileChanges = useCallback(() => {
    setCandidateRecord((prev) => {
      if (!prev || !prev.resumeDraft) return prev;
      return {
        ...prev,
        resumeDraft: {
          ...prev.resumeDraft,
          sourceProfileRevision: prev.profileRevision,
          hasReviewedProfileChanges: true,
        },
      };
    });
  }, []);

  const syncResumeWithProfile = useCallback(() => {
    setCandidateRecord((prev) => {
      if (!prev) return prev;
      const freshDraft = buildInitialResumeDraft(prev, prev.profileRevision);
      return {
        ...prev,
        resumeDraft: freshDraft,
      };
    });
  }, []);

  const saveResumeToProfile = useCallback(
    (fieldsToPush: Partial<StructuredProfile>) => {
      setCandidateRecord((prev) => {
        if (!prev) return prev;
        const nextRev = prev.profileRevision + 1;
        const updatedProfile: StructuredProfile = {
          ...prev.profile,
          ...fieldsToPush,
        };
        const updatedDraft = prev.resumeDraft
          ? {
              ...prev.resumeDraft,
              sourceProfileRevision: nextRev,
              hasReviewedProfileChanges: true,
            }
          : undefined;

        return {
          ...prev,
          profileRevision: nextRev,
          profile: updatedProfile,
          resumeDraft: updatedDraft,
        };
      });
    },
    []
  );

  // Sign In Helper for candidate OTP login
  const loginCandidateByPhone = useCallback(
    (rawPhone: string) => {
      const cleanPhone = rawPhone.replace(/\D/g, "").slice(-10);
      const existing = sessionCandidates[cleanPhone] || sessionCandidates[rawPhone];
      if (existing) {
        setCandidateRecord(existing);
        setIdentityState(existing.identity);
        setPhoneVerifiedState(true);
        syncAuthSession(existing);
        return {
          exists: true,
          onboardingComplete: existing.onboardingComplete,
        };
      }

      // If phone matches current active record
      if (
        candidateRecord &&
        candidateRecord.identity.phone.replace(/\D/g, "").slice(-10) === cleanPhone
      ) {
        syncAuthSession(candidateRecord);
        return {
          exists: true,
          onboardingComplete: candidateRecord.onboardingComplete,
        };
      }

      // Brand new candidate with this phone
      const newIdentity: IdentityDraft = {
        fullName: "Candidate",
        email: `cand_${cleanPhone}@tagjobs.in`,
        countryCode: "+91",
        phone: cleanPhone,
        agreeToTerms: true,
      };
      setIdentityState(newIdentity);
      setPhoneVerifiedState(true);

      return {
        exists: false,
        onboardingComplete: false,
      };
    },
    [sessionCandidates, candidateRecord]
  );

  // Sign In Helper for candidate email & password login
  const loginCandidateByEmail = useCallback(
    (rawEmail: string) => {
      const cleanEmail = rawEmail.trim().toLowerCase();
      let existing = Object.values(sessionCandidates).find(
        (c) => c.identity?.email?.trim().toLowerCase() === cleanEmail
      );
      if (!existing && typeof window !== "undefined") {
        const stored =
          localStorage.getItem(`tag_candidate_record_${cleanEmail}`) ||
          localStorage.getItem(TAG_CANDIDATE_RECORD_KEY);
        if (stored) {
          try {
            const parsed = JSON.parse(stored) as CandidateRecord;
            if (parsed.identity?.email?.trim().toLowerCase() === cleanEmail) {
              existing = parsed;
            }
          } catch {}
        }
      }

      if (existing) {
        setCandidateRecord(existing);
        setIdentityState(existing.identity);
        setPhoneVerifiedState(true);
        syncAuthSession(existing);

        if (existing.uploadedResume) {
          setUploadedResume(existing.uploadedResume);
        } else {
          const cachedResume = localStorage.getItem(`tag_candidate_resume_${cleanEmail}`);
          if (cachedResume) {
            try {
              setUploadedResume(JSON.parse(cachedResume));
            } catch {}
          }
        }

        fetchResumeFromBackend(cleanEmail).then((res) => {
          if (res) {
            setUploadedResume(res);
            setCandidateRecord((prev) => (prev ? { ...prev, uploadedResume: res } : prev));
            try {
              localStorage.setItem(`tag_candidate_resume_${cleanEmail}`, JSON.stringify(res));
              localStorage.setItem(TAG_CANDIDATE_UPLOADED_RESUME_KEY, JSON.stringify(res));
            } catch {}
          }
        });

        return {
          exists: true,
          onboardingComplete: existing.onboardingComplete,
        };
      }

      if (
        candidateRecord &&
        candidateRecord.identity.email.trim().toLowerCase() === cleanEmail
      ) {
        syncAuthSession(candidateRecord);
        fetchResumeFromBackend(cleanEmail).then((res) => {
          if (res) {
            setUploadedResume(res);
            setCandidateRecord((prev) => (prev ? { ...prev, uploadedResume: res } : prev));
          }
        });
        return {
          exists: true,
          onboardingComplete: candidateRecord.onboardingComplete,
        };
      }

      if (identity && identity.email.trim().toLowerCase() === cleanEmail) {
        setPhoneVerifiedState(true);
        fetchResumeFromBackend(cleanEmail).then((res) => {
          if (res) {
            setUploadedResume(res);
            setCandidateRecord((prev) => (prev ? { ...prev, uploadedResume: res } : prev));
          }
        });
        return {
          exists: true,
          onboardingComplete: false,
        };
      }

      const newIdentity: IdentityDraft = {
        fullName: cleanEmail.split("@")[0] || "Candidate",
        email: cleanEmail,
        countryCode: "+91",
        phone: "9876543210",
        agreeToTerms: true,
      };
      setIdentityState(newIdentity);
      setPhoneVerifiedState(true);

      fetchResumeFromBackend(cleanEmail).then((res) => {
        if (res) {
          setUploadedResume(res);
          setCandidateRecord((prev) => (prev ? { ...prev, uploadedResume: res } : prev));
        }
      });

      return {
        exists: false,
        onboardingComplete: false,
      };
    },
    [sessionCandidates, candidateRecord, identity]
  );

  // Load Demonstration Candidate (Ananya) explicitly when requested
  const loadDemoCandidate = useCallback((persona: "ananya") => {
    if (persona === "ananya") {
      const demoRecord: CandidateRecord = {
        id: "prof_cand_01",
        schemaVersion: "1.0.0",
        profileRevision: 4,
        onboardingComplete: true,
        confirmedAt: "2026-09-12T10:00:00Z",
        identity: {
          fullName: MOCK_CANDIDATE_PROFILE.fullName,
          email: MOCK_CANDIDATE_PROFILE.email,
          countryCode: "+91",
          phone: MOCK_CANDIDATE_PROFILE.phone,
          agreeToTerms: true,
        },
        discovery: {
          careerStage: "experienced",
          primaryGoal: "change_role",
          targetRoles: ["Senior Frontend Engineer", "UI Architect"],
          challenges: ["few_interview_calls"],
          primaryChallenge: "few_interview_calls",
          skills: [
            { name: "React", level: "confident" },
            { name: "TypeScript", level: "confident" },
            { name: "Next.js", level: "comfortable" },
          ],
          strengths: ["problem_solving", "attention_to_detail"],
          preferredSupport: ["opportunity_search", "cv_support"],
          timeBudget: "3_to_5_hours",
          workPreferences: {
            locationMode: "hybrid",
            jobType: "full_time",
            availability: "1_month",
            freeOnlyResources: false,
          },
        },
        profile: {
          headline: MOCK_CANDIDATE_PROFILE.headline,
          summary: MOCK_CANDIDATE_PROFILE.summary,
          location: MOCK_CANDIDATE_PROFILE.location,
          phone: MOCK_CANDIDATE_PROFILE.phone,
          education: MOCK_CANDIDATE_PROFILE.education.map((e) => ({
            id: e.id,
            degree: e.degree,
            institution: e.institution,
            fieldOfStudy: "Computer Science",
            startYear: String(e.startYear),
            endYear: String(e.endYear),
            grade: e.grade,
          })),
          experience: MOCK_CANDIDATE_PROFILE.experiences.map((exp) => ({
            id: exp.id,
            title: exp.title,
            company: exp.company,
            location: exp.location,
            startDate: exp.startDate,
            endDate: exp.endDate,
            current: exp.current,
            description: exp.description,
            skillsUsed: exp.skillsUsed,
          })),
          projects: [
            {
              id: "proj_01",
              title: "Merchant Settlement Dashboard",
              description: "Designed high-speed reconciliation analytics with Next.js and TanStack Table.",
              technologies: ["React", "TypeScript", "Next.js"],
              url: "https://github.com/ananya/settlement-portal",
            },
          ],
          certifications: MOCK_CANDIDATE_PROFILE.certifications.map((c) => ({
            id: c.id,
            name: c.name,
            issuer: c.issuingOrganization,
            issueDate: c.issueDate,
          })),
          skills: MOCK_CANDIDATE_PROFILE.skills.map((s) => ({
            name: s.name,
            level: "confident",
          })),
          links: [
            { id: "lnk_1", label: "GitHub", url: "https://github.com/ananya" },
            { id: "lnk_2", label: "LinkedIn", url: "https://linkedin.com/in/ananya" },
          ],
          jobPreferences: {
            desiredRoles: ["Senior Frontend Engineer", "UI Architect"],
            preferredLocations: MOCK_CANDIDATE_PROFILE.preferences.preferredLocations,
            desiredWorkModes: ["hybrid", "remote"],
            employmentTypes: ["full_time"],
            availability: "1_month",
            noticePeriodDays: MOCK_CANDIDATE_PROFILE.preferences.noticePeriodDays,
            minimumSalaryINR: MOCK_CANDIDATE_PROFILE.preferences.minimumSalaryINR,
            salaryCurrency: "INR",
            salaryPeriod: "year",
          },
        },
        applications: [],
        savedJobIds: [],
        interviews: [],

      };

      demoRecord.resumeDraft = buildInitialResumeDraft(demoRecord, 4);

      setCandidateRecord(demoRecord);
      setIdentityState(demoRecord.identity);
      setPhoneVerifiedState(true);
      setDiscoveryDraftState(demoRecord.discovery);
      syncAuthSession(demoRecord);
    }
  }, []);

  // Recommendation feedback
  const saveRecommendation = useCallback((recId: string) => {
    setFeedbackState((prev) => {
      const isSaved = prev.savedRecommendationIds.includes(recId);
      return {
        ...prev,
        savedRecommendationIds: isSaved
          ? prev.savedRecommendationIds.filter((id) => id !== recId)
          : [...prev.savedRecommendationIds, recId],
      };
    });
  }, []);

  const dismissRecommendation = useCallback(
    (rec: Recommendation, reason: string = "not_relevant") => {
      const fingerprint = getDismissalFingerprint(
        rec.ruleIds[0] || "unknown",
        rec.subjectId,
        reason
      );
      setFeedbackState((prev) => ({
        ...prev,
        dismissedFingerprints: Array.from(
          new Set([...prev.dismissedFingerprints, fingerprint])
        ),
      }));
    },
    []
  );

  const undoDismissRecommendation = useCallback((fingerprint: string) => {
    setFeedbackState((prev) => ({
      ...prev,
      dismissedFingerprints: prev.dismissedFingerprints.filter((fp) => fp !== fingerprint),
    }));
  }, []);

  const restoreAllDismissed = useCallback(() => {
    setFeedbackState((prev) => ({
      ...prev,
      dismissedFingerprints: [],
    }));
  }, []);

  // Tasks
  const markTaskComplete = useCallback(
    (taskId: string) => {
      setTasksState((prev) => {
        const existing = prev.find((t) => t.id === taskId);
        if (existing) {
          return prev.map((t) =>
            t.id === taskId
              ? { ...t, status: "completed", completedAt: new Date().toISOString() }
              : t
          );
        }
        return [
          ...prev,
          {
            id: taskId,
            activityId: taskId.split(":")[0] || "activity",
            subjectId: taskId.split(":")[1] || "default",
            stepId: taskId.split(":")[2] || "step",
            title: "Completed Task",
            category: "career_exploration",
            estimatedMinutes: 15,
            status: "completed",
            profileRevision: candidateRecord?.profileRevision || 1,
            completedAt: new Date().toISOString(),
          },
        ];
      });
    },
    [candidateRecord]
  );

  const undoTaskComplete = useCallback((taskId: string) => {
    setTasksState((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, status: "pending", completedAt: undefined } : t
      )
    );
  }, []);

  const removeTask = useCallback((taskId: string) => {
    setTasksState((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: "removed" } : t))
    );
  }, []);

  const restoreRemovedTasks = useCallback(() => {
    setTasksState((prev) =>
      prev.map((t) =>
        t.id.endsWith("removed") || t.status === "removed" ? { ...t, status: "pending" } : t
      )
    );
  }, []);

  const clearUpdateNotice = useCallback(() => {
    setLastUpdateNoticeState(null);
  }, []);

  const uploadResume = useCallback(
    async (resumeData: Omit<UploadedResume, "id" | "uploadedAt">) => {
      const activeEmail =
        candidateRecord?.identity?.email ||
        getStoredUser()?.email ||
        (typeof window !== "undefined"
          ? JSON.parse(localStorage.getItem(AUTH_USER_KEY) || "{}")?.email
          : undefined);

      const newResume: UploadedResume = {
        id: `res_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        ...resumeData,
        uploadedAt: new Date().toISOString(),
      };
      setUploadedResume(newResume);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(TAG_CANDIDATE_UPLOADED_RESUME_KEY, JSON.stringify(newResume));
          if (activeEmail) {
            localStorage.setItem(
              `tag_candidate_resume_${activeEmail.trim().toLowerCase()}`,
              JSON.stringify(newResume)
            );
          }
        } catch (e) {
          console.warn("Could not save resume to localStorage:", e);
        }
      }
      setCandidateRecord((prev) => (prev ? { ...prev, uploadedResume: newResume } : prev));
      setLastUpdateNoticeState(`Uploaded resume: ${newResume.fileName}`);

      // Persist to Django database
      try {
        const backendResume = await uploadResumeToBackend(resumeData, activeEmail);
        if (backendResume) {
          setUploadedResume(backendResume);
          setCandidateRecord((prev) =>
            prev ? { ...prev, uploadedResume: backendResume } : prev
          );
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem(
                TAG_CANDIDATE_UPLOADED_RESUME_KEY,
                JSON.stringify(backendResume)
              );
              if (activeEmail) {
                localStorage.setItem(
                  `tag_candidate_resume_${activeEmail.trim().toLowerCase()}`,
                  JSON.stringify(backendResume)
                );
              }
            } catch {}
          }
        }
      } catch (err) {
        console.warn("Failed to persist resume to Django backend:", err);
      }
    },
    [candidateRecord]
  );

  const replaceResume = useCallback(
    async (resumeData: Omit<UploadedResume, "id" | "uploadedAt">) => {
      const activeEmail =
        candidateRecord?.identity?.email ||
        getStoredUser()?.email ||
        (typeof window !== "undefined"
          ? JSON.parse(localStorage.getItem(AUTH_USER_KEY) || "{}")?.email
          : undefined);

      const newResume: UploadedResume = {
        id: `res_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        ...resumeData,
        uploadedAt: new Date().toISOString(),
      };
      setUploadedResume(newResume);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(TAG_CANDIDATE_UPLOADED_RESUME_KEY, JSON.stringify(newResume));
          if (activeEmail) {
            localStorage.setItem(
              `tag_candidate_resume_${activeEmail.trim().toLowerCase()}`,
              JSON.stringify(newResume)
            );
          }
        } catch (e) {
          console.warn("Could not save resume to localStorage:", e);
        }
      }
      setCandidateRecord((prev) => (prev ? { ...prev, uploadedResume: newResume } : prev));
      setLastUpdateNoticeState(`Replaced resume: ${newResume.fileName}`);

      // Persist replacement to Django database
      try {
        const backendResume = await replaceResumeInBackend(resumeData, activeEmail);
        if (backendResume) {
          setUploadedResume(backendResume);
          setCandidateRecord((prev) =>
            prev ? { ...prev, uploadedResume: backendResume } : prev
          );
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem(
                TAG_CANDIDATE_UPLOADED_RESUME_KEY,
                JSON.stringify(backendResume)
              );
              if (activeEmail) {
                localStorage.setItem(
                  `tag_candidate_resume_${activeEmail.trim().toLowerCase()}`,
                  JSON.stringify(backendResume)
                );
              }
            } catch {}
          }
        }
      } catch (err) {
        console.warn("Failed to replace resume in Django backend:", err);
      }
    },
    [candidateRecord]
  );

  const deleteResume = useCallback(async () => {
    const activeEmail =
      candidateRecord?.identity?.email ||
      getStoredUser()?.email ||
      (typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem(AUTH_USER_KEY) || "{}")?.email
        : undefined);

    setUploadedResume(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(TAG_CANDIDATE_UPLOADED_RESUME_KEY);
      if (activeEmail) {
        localStorage.removeItem(
          `tag_candidate_resume_${activeEmail.trim().toLowerCase()}`
        );
      }
    }
    setCandidateRecord((prev) => (prev ? { ...prev, uploadedResume: undefined } : prev));
    setLastUpdateNoticeState("Resume deleted successfully");

    // Delete from Django database
    try {
      await deleteResumeFromBackend(activeEmail);
    } catch (err) {
      console.warn("Failed to delete resume from Django backend:", err);
    }
  }, [candidateRecord]);

  const updateResumeScore = useCallback((score: number) => {
    setUploadedResume((prev) => {
      if (!prev) return null;
      const updated = { ...prev, atsScore: score };
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(TAG_CANDIDATE_UPLOADED_RESUME_KEY, JSON.stringify(updated));
        } catch {}
      }
      return updated;
    });
  }, []);

  const resetAll = useCallback(() => {
    setIdentityState(null);
    setPhoneVerifiedState(false);
    setDiscoveryDraftState({ ...initialDiscoveryDraft });
    setCandidateRecord(null);
    setUploadedResume(null);
    setFeedbackState({ ...defaultFeedback });
    setTasksState([]);
    setLastUpdateNoticeState(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
      localStorage.removeItem(AUTH_ROLE_KEY);
      localStorage.removeItem(TAG_CANDIDATE_RECORD_KEY);
      localStorage.removeItem(TAG_CANDIDATE_IDENTITY_KEY);
      localStorage.removeItem(TAG_CANDIDATE_DISCOVERY_DRAFT_KEY);
      localStorage.removeItem(TAG_CANDIDATE_UPLOADED_RESUME_KEY);
      localStorage.removeItem("tag_candidate_avatar");
      // Note: We deliberately do not delete user-scoped account records
      // tag_candidate_record_${email} or tag_candidate_resume_${email} so that
      // upon next login, the user's saved account profile and resume are restored!
      window.dispatchEvent(new Event("storage"));
    }
  }, []);

  return (
    <CandidateContext.Provider
      value={{
        identity,
        setIdentity,
        phoneVerified,
        setPhoneVerified,
        discoveryDraft,
        updateDiscoveryDraft,
        resetDiscoveryDraft,
        confirmedProfile,
        candidateRecord,
        confirmProfile,
        updateCandidateProfile,
        addEducation,
        updateEducation,
        deleteEducation,
        addExperience,
        updateExperience,
        deleteExperience,
        addProject,
        deleteProject,
        addSkill,
        updateSkill,
        deleteSkill,
        addCertification,
        updateCertification,
        deleteCertification,
        updatePreferences,
        toggleSaveJob,
        applyToJob,
        savedJobIds,
        applications,
        interviews,
        resumeDraft,
        updateResumeDraft,
        syncResumeWithProfile,
        saveResumeToProfile,
        acknowledgeProfileChanges,
        uploadedResume,
        uploadResume,
        replaceResume,
        deleteResume,
        updateResumeScore,
        completeness,
        suggestions,
        matchedJobs,
        availableJobs,
        recommendations,
        feedback,
        saveRecommendation,
        dismissRecommendation,
        undoDismissRecommendation,
        restoreAllDismissed,
        plan,
        markTaskComplete,
        undoTaskComplete,
        removeTask,
        restoreRemovedTasks,
        lastUpdateNotice,
        clearUpdateNotice,
        resetAll,
        loadDemoCandidate,
        loginCandidateByPhone,
        loginCandidateByEmail,
      }}
    >
      {children}
    </CandidateContext.Provider>
  );
}

export function useCandidate(): CandidateContextType {
  const context = useContext(CandidateContext);
  if (!context) {
    throw new Error("useCandidate must be used within a CandidateProvider");
  }
  return context;
}
