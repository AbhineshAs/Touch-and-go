// lib/candidate/types.ts

export type CareerStage = "student" | "fresher" | "experienced" | "switcher";

export type StageBackground =
  | {
      type: "student" | "fresher";
      educationOrProject?: string;
    }
  | {
      type: "experienced";
      experienceBand?: "1-2" | "3-5" | "5-8" | "8+";
      recentRole?: string;
    }
  | {
      type: "switcher";
      previousField?: string;
      targetDirection?: string;
    }
  | {
      type: "general";
    };

export type PrimaryGoal =
  | "explore_careers"
  | "first_job"
  | "change_role"
  | "interview_prep"
  | "build_skills"
  | "return_to_work"
  | "other";

export type ChallengeId =
  | "unclear_direction"
  | "few_interview_calls"
  | "interview_prep"
  | "skills_to_develop"
  | "limited_projects"
  | "career_transition"
  | "suitable_openings"
  | "other"
  | "nothing_specific"
  | "prefer_not_to_say";

export type ChallengeFollowUp =
  | {
      challenge: "unclear_direction";
      interestedFields: string[];
      additionalContext?: string;
    }
  | {
      challenge: "few_interview_calls";
      supportPreference: "cv" | "targeting" | "application_organization" | "unsure";
      additionalContext?: string;
    }
  | {
      challenge: "interview_prep";
      interviewStage: "introducing_yourself" | "technical" | "explaining_experience" | "unsure";
      additionalContext?: string;
    }
  | {
      challenge: "skills_to_develop";
      targetSkill: string;
      additionalContext?: string;
    }
  | {
      challenge: "limited_projects";
      hasExistingProject: "yes" | "no" | "unsure";
      additionalContext?: string;
    }
  | {
      challenge: "career_transition";
      previousExperienceCarryOver?: string;
      additionalContext?: string;
    }
  | {
      challenge: "suitable_openings";
      constraintPreferences?: string[];
      additionalContext?: string;
    }
  | {
      challenge: "other";
      relatedCategory?: SupportType;
      additionalContext?: string;
    };

export type SkillLevel = "new" | "learning" | "comfortable" | "confident" | "exploring" | "expert";

export interface CandidateSkill {
  id?: string;
  name: string;
  level: SkillLevel;
  proficiency?: 'Beginner' | 'Comfortable' | 'Advanced' | 'Expert';
}

export type StrengthId =
  | "problem_solving"
  | "communication"
  | "teamwork"
  | "organization"
  | "creativity"
  | "independent_learning"
  | "attention_to_detail"
  | "other"
  | "not_sure_yet";

export interface CandidateStrength {
  id: StrengthId;
  label: string;
}

export interface CandidateExample {
  linkedItemType: "strength" | "skill";
  linkedItemId: string;
  linkedItemLabel: string;
  text: string; // max 500 chars
}

export type SupportType =
  | "career_exploration"
  | "cv_support"
  | "project_ideas"
  | "learning_plan"
  | "interview_practice"
  | "opportunity_search"
  | "no_preference";

export type TimeBudget =
  | "under_1_hour"
  | "1_to_3_hours"
  | "3_to_5_hours"
  | "over_5_hours"
  | "unsure";

export interface WorkPreferences {
  locationMode?: "remote" | "hybrid" | "onsite" | "any";
  jobType?: "full_time" | "internship" | "contract" | "any";
  availability?: "immediate" | "1_month" | "3_months" | "exploring";
  learningFormat?: "interactive" | "reading" | "project_based" | "any";
  freeOnlyResources?: boolean;
}

export interface IdentityDraft {
  fullName: string;
  email: string;
  countryCode: string;
  phone: string;
  password?: string;
  agreeToTerms: boolean;
}

export interface DiscoveryDraft {
  careerStage?: CareerStage;
  stageBackground?: StageBackground;
  primaryGoal?: PrimaryGoal;
  goalOtherText?: string;
  targetRoles: string[]; // up to 3, can include "Exploring", "Other"
  targetRolesOtherText?: string;
  challenges: ChallengeId[]; // up to 3, or mutually exclusive "nothing_specific" / "prefer_not_to_say"
  challengesOtherText?: string;
  primaryChallenge?: ChallengeId; // if multiple
  challengeFollowUp?: ChallengeFollowUp;
  skills: CandidateSkill[]; // up to 10
  isExploringSkills?: boolean;
  strengths: StrengthId[]; // up to 3, or "not_sure_yet"
  strengthsOtherText?: string;
  example?: CandidateExample; // optional max 500 chars
  preferredSupport: SupportType[]; // up to 2, or "no_preference"
  timeBudget?: TimeBudget;
  workPreferences?: WorkPreferences;
}

export interface ConfirmedProfile {
  revision: number;
  schemaVersion: "1.0.0";
  confirmedAt: string; // ISO string
  discovery: DiscoveryDraft;
}

export interface Recommendation {
  id: string; // stable identifier
  ruleIds: string[]; // e.g. ["R02"]
  activityId: string; // e.g. "act-cv-review"
  subjectId?: string; // e.g. "react" or generic
  supportCategory: SupportType;
  title: string;
  benefit: string;
  rationale: string;
  sourceAnswerIds: string[]; // e.g. ["Q04:few_interview_calls", "Q06:cv"]
  estimatedDurationMinutes: number;
  inputRevision: number;
}

export interface ActivityStep {
  id: string;
  title: string;
  description: string;
  estimatedMinutes: number;
}

export interface Activity {
  id: string;
  title: string;
  category: SupportType;
  description: string;
  totalMinutes: number;
  steps: ActivityStep[];
  interactiveType:
    | "role_comparison"
    | "cv_checklist"
    | "role_mapping"
    | "interview_prompts"
    | "skill_exercise"
    | "project_brief"
    | "project_docs"
    | "transferable_skills"
    | "search_preferences"
    | "focus_picker";
}

export type TaskStatus = "pending" | "completed" | "archived" | "removed";

export interface PlanTask {
  id: string; // format: `${activityId}:${subjectId || 'default'}:${stepId}`
  activityId: string;
  subjectId: string;
  stepId: string;
  title: string;
  category: SupportType;
  estimatedMinutes: number;
  status: TaskStatus;
  profileRevision: number;
  completedAt?: string;
}

export interface ActionPlan {
  weeklyBudgetMinutes: number;
  totalPlannedMinutes: number;
  tasks: PlanTask[];
  disclosedStarterNotice?: string;
}

export interface Feedback {
  savedRecommendationIds: string[];
  dismissedFingerprints: string[]; // format: `${ruleId}:${subjectId || 'none'}:${reason || 'not_relevant'}`
  customReasons?: Record<string, string>;
}

export interface OTPChallenge {
  phone: string;
  countryCode: string;
  normalizedPhone: string;
  code: string;
  createdAt: number;
  expiresAt: number;
  attempts: number;
  maxAttempts: number;
  cooldownUntil: number;
  isThrottled: boolean;
  status: "pending" | "verified" | "expired" | "throttled" | "error";
}

// Structured Profile Additions
export interface CandidateEducation {
  id: string;
  degree: string;
  institution: string;
  school?: string;
  fieldOfStudy: string;
  startYear: string;
  endYear: string;
  startDate?: string;
  endDate?: string;
  grade?: string;
  description?: string;
}

export interface CandidateExperienceItem {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  isCurrent?: boolean;
  description: string;
  skillsUsed: string[];
  skills?: string[];
  employmentType?: 'Full-time' | 'Part-time' | 'Internship' | 'Contract' | 'Freelance';
  locationType?: 'On-site' | 'Hybrid' | 'Remote';
}

export interface CandidateProject {
  id: string;
  title: string;
  description: string;
  contribution?: string;
  technologies: string[];
  url?: string;
}

export interface CandidateCertification {
  id: string;
  name: string;
  issuer: string;
  issuingOrganization?: string;
  issueDate: string;
  expiryDate?: string;
  expirationDate?: string;
  credentialUrl?: string;
  credentialId?: string;
}

export interface CandidateProfileLink {
  id: string;
  label: string;
  url: string;
}

export interface CandidateJobPreferences {
  desiredRoles: string[];
  preferredLocations: string[];
  desiredWorkModes: ("remote" | "hybrid" | "onsite" | "any")[];
  employmentTypes: ("full_time" | "internship" | "contract" | "any")[];
  availability: "immediate" | "1_month" | "3_months" | "exploring" | "unsure";
  noticePeriodDays?: number;
  minimumSalaryINR?: number;
  salaryCurrency: string;
  salaryPeriod: "year" | "month";
}

export interface StructuredProfile {
  headline: string;
  summary: string;
  location: string;
  phone: string;
  education: CandidateEducation[];
  experience: CandidateExperienceItem[];
  projects: CandidateProject[];
  certifications: CandidateCertification[];
  skills: CandidateSkill[];
  links: CandidateProfileLink[];
  jobPreferences: CandidateJobPreferences;
}

export interface CandidateApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  organizationName: string;
  organizationLogo?: string;
  location: string;
  workMode: string;
  appliedAt: string;
  stage: "Applied" | "Screening" | "Interview" | "Decision" | "Closed" | "Shortlisted";
  notes?: string;
}

export interface CandidateInterview {
  id: string;
  applicationId: string;
  jobTitle: string;
  organizationName: string;
  interviewerName: string;
  interviewerRole: string;
  scheduledAt: string; // ISO string
  durationMinutes: number;
  meetingLink: string;
  status: "Scheduled" | "Completed" | "Cancelled" | "Rescheduled";
}


export type ResumeSectionId =
  | "summary"
  | "experience"
  | "projects"
  | "education"
  | "skills"
  | "certifications"
  | "links";

export interface ResumeDraft {
  sourceProfileRevision: number;
  contact: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
  };
  headline: string;
  summary: string;
  skills: string[];
  education: CandidateEducation[];
  experience: CandidateExperienceItem[];
  projects: CandidateProject[];
  certifications: CandidateCertification[];
  links: CandidateProfileLink[];
  sectionOrder: ResumeSectionId[];
  visibleSections: Record<ResumeSectionId, boolean>;
  targetJobId?: string;
  customOverrides?: Record<string, any>;
  hasReviewedProfileChanges?: boolean;
}

export type ProfileCompletenessGroup =
  | "contact"
  | "direction"
  | "skills"
  | "background_evidence"
  | "work_preferences"
  | "summary";

export interface ProfileCompleteness {
  score: number; // 0 - 100
  completedGroups: ProfileCompletenessGroup[];
  missingGroups: {
    group: ProfileCompletenessGroup;
    label: string;
    description: string;
    targetHref: string;
  }[];
}

export interface ProfileSuggestion {
  id: string;
  title: string;
  description: string;
  actionLabel: string;
  targetHref: string;
}

export interface JobMatchResult {
  job: any; // Job from local catalogue
  matchReasons: string[];
  unconfirmedSkills: string[];
  isCompatible: boolean;
  score: number;
}

export interface CandidateRecord {
  id: string;
  schemaVersion: "1.0.0";
  profileRevision: number;
  onboardingComplete: boolean;
  confirmedAt?: string;
  identity: IdentityDraft;
  discovery: DiscoveryDraft;
  profile: StructuredProfile;
  applications: CandidateApplication[];
  savedJobIds: string[];
  interviews: CandidateInterview[];
  resumeDraft?: ResumeDraft;
}

