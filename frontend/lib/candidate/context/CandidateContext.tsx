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
  ProfileCompleteness,
  ProfileSuggestion,
  JobMatchResult,
} from "../types";
import { deriveRecommendations, getDismissalFingerprint } from "../recommendations/engine";
import { buildActionPlan, reconcileTasks } from "../plan/budget";
import { computeProfileCompleteness } from "../profile/completeness";
import { deriveProfileSuggestions } from "../profile/suggestions";
import { matchSampleJobs } from "../jobs/matcher";
import { MOCK_CANDIDATE_PROFILE, MOCK_APPLICATIONS, MOCK_INTERVIEWS } from "@/lib/mocks/data";
import {
  AUTH_TOKEN_KEY,
  AUTH_USER_KEY,
  AUTH_ROLE_KEY,
  notifyAuthChange,
} from "@/lib/api/auth";

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
  updateCandidateProfile: (partial: Partial<StructuredProfile>) => void;
  addEducation: (edu: Omit<CandidateEducation, "id">) => void;
  deleteEducation: (id: string) => void;
  addExperience: (exp: Omit<CandidateExperienceItem, "id">) => void;
  deleteExperience: (id: string) => void;
  addProject: (proj: Omit<CandidateProject, "id">) => void;
  deleteProject: (id: string) => void;
  addSkill: (skill: CandidateSkill) => void;
  deleteSkill: (skillName: string) => void;
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

  // Computed Selectors
  completeness: ProfileCompleteness;
  suggestions: ProfileSuggestion[];
  matchedJobs: JobMatchResult[];

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

export function CandidateProvider({ children }: { children: React.ReactNode }) {
  const [identity, setIdentityState] = useState<IdentityDraft | null>(null);
  const [phoneVerified, setPhoneVerifiedState] = useState<boolean>(false);
  const [discoveryDraft, setDiscoveryDraftState] = useState<DiscoveryDraft>({
    ...initialDiscoveryDraft,
  });

  // Canonical candidate record
  const [candidateRecord, setCandidateRecord] = useState<CandidateRecord | null>(null);
  const [feedback, setFeedbackState] = useState<Feedback>({ ...defaultFeedback });
  const [tasks, setTasksState] = useState<PlanTask[]>([]);
  const [lastUpdateNotice, setLastUpdateNoticeState] = useState<string | null>(null);

  // In-session candidate database to test switching or multiple accounts without cross-leakage
  const [sessionCandidates, setSessionCandidates] = useState<Record<string, CandidateRecord>>({});

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
    return matchSampleJobs(candidateRecord);
  }, [candidateRecord]);

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
    setSessionCandidates((prev) => ({ ...prev, [newRecord.identity.phone]: newRecord }));

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
    (partial: Partial<StructuredProfile>) => {
      setCandidateRecord((prev) => {
        if (!prev) return null;
        const nextRev = prev.profileRevision + 1;
        const updatedProfile: StructuredProfile = {
          ...prev.profile,
          ...partial,
        };
        const updated: CandidateRecord = {
          ...prev,
          profileRevision: nextRev,
          profile: updatedProfile,
        };
        setSessionCandidates((sc) => ({ ...sc, [updated.identity.phone]: updated }));
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

        const allMatched = matchSampleJobs(prev);
        const matchedItem = allMatched.find((m) => m.job.id === jobId);
        const job = matchedItem?.job;

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

        return {
          ...prev,
          applications: [newApp, ...prev.applications],
        };
      });
    },
    []
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
      const existing = Object.values(sessionCandidates).find(
        (c) => c.identity.email.trim().toLowerCase() === cleanEmail
      );
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

      if (
        candidateRecord &&
        candidateRecord.identity.email.trim().toLowerCase() === cleanEmail
      ) {
        syncAuthSession(candidateRecord);
        return {
          exists: true,
          onboardingComplete: candidateRecord.onboardingComplete,
        };
      }

      if (identity && identity.email.trim().toLowerCase() === cleanEmail) {
        setPhoneVerifiedState(true);
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
        applications: MOCK_APPLICATIONS.map((app) => ({
          id: app.id,
          jobId: app.jobId,
          jobTitle: app.jobTitle,
          organizationName: app.organizationName,
          organizationLogo: app.organizationLogo,
          location: app.location,
          workMode: app.workMode,
          appliedAt: app.appliedAt,
          stage: app.stage,
        })),
        savedJobIds: ["job_01", "job_06"],
        interviews: MOCK_INTERVIEWS.map((i) => ({
          id: i.id,
          applicationId: i.applicationId,
          jobTitle: i.jobTitle,
          organizationName: (i as any).organizationName || "RazorWave Technologies",
          interviewerName: i.interviewerName,
          interviewerRole: i.interviewerRole,
          scheduledAt: i.scheduledAt,
          durationMinutes: i.durationMinutes,
          meetingLink: i.meetingLink,
          status: i.status,
        })),

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

  const resetAll = useCallback(() => {
    setIdentityState(null);
    setPhoneVerifiedState(false);
    setDiscoveryDraftState({ ...initialDiscoveryDraft });
    setCandidateRecord(null);
    setFeedbackState({ ...defaultFeedback });
    setTasksState([]);
    setLastUpdateNoticeState(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("tag_auth_token");
      localStorage.removeItem("tag_auth_user");
      localStorage.removeItem("tag_active_role");
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
        deleteEducation,
        addExperience,
        deleteExperience,
        addProject,
        deleteProject,
        addSkill,
        deleteSkill,
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
        completeness,
        suggestions,
        matchedJobs,
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
