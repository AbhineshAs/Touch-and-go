export type UserRole = "candidate" | "employer" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  organizationId?: string;
  createdAt: string;
}

export type WorkMode = "Remote" | "Hybrid" | "On-site";
export type EmploymentType = "Full-time" | "Contract" | "Part-time" | "Internship";
export type ExperienceLevel = "Entry (0-2 yrs)" | "Mid (3-5 yrs)" | "Senior (6-8 yrs)" | "Lead (8+ yrs)";

export interface SkillItem {
  id: string;
  name: string;
  category: "Technical" | "Soft" | "Tool" | "Domain";
  yearsOfExperience?: number;
  verified?: boolean;
}

export interface CandidateExperience {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
  skillsUsed: string[];
}

export interface CandidateEducation {
  id: string;
  degree: string;
  fieldOfStudy: string;
  institution: string;
  startYear: number;
  endYear: number;
  grade?: string;
}

export interface CandidateProject {
  id: string;
  title: string;
  description: string;
  role: string;
  technologies: string[];
  url?: string;
}

export interface CandidateCertification {
  id: string;
  name: string;
  issuingOrganization: string;
  issueDate: string;
  credentialId?: string;
  credentialUrl?: string;
}

export interface CandidatePreferences {
  desiredRoles: string[];
  preferredLocations: string[];
  desiredWorkModes: WorkMode[];
  minimumSalaryINR: number;
  availableFrom: string;
  noticePeriodDays: number;
}

export interface CandidateProfile {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  headline: string;
  summary: string;
  location: string;
  avatarUrl: string;
  experiences: CandidateExperience[];
  education: CandidateEducation[];
  skills: SkillItem[];
  projects: CandidateProject[];
  certifications: CandidateCertification[];
  preferences: CandidatePreferences;
  resumeFileName?: string;
  resumeFileUrl?: string;
  resumeParsedAt?: string;
  visibility: "public" | "verified_employers_only" | "private";
  completionPercentage: number;
  missingItems: string[];
}

export type VerificationStatus =
  | "Incomplete"
  | "Submitted"
  | "Under Review"
  | "Action Required"
  | "Verified"
  | "Rejected"
  | "Suspended";

export interface EmployerVerification {
  status: VerificationStatus;
  domain: string;
  businessRegistrationNumber: string;
  registeredEntityName: string;
  panNumber?: string;
  gstNumber?: string;
  documentsSubmitted: {
    id: string;
    type: "Incorporation Certificate" | "GST Certificate" | "Domain Ownership Letter";
    fileName: string;
    uploadedAt: string;
    verified: boolean;
  }[];
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
  riskLevel: "Low" | "Moderate" | "High";
}

export interface OrganizationMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: "Employer Administrator" | "Recruiter" | "Hiring Manager";
  status: "Active" | "Invited" | "Inactive";
  joinedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  domain: string;
  logo: string;
  coverImage?: string;
  tagline: string;
  about: string;
  industry: string;
  companySize: string;
  headquarters: string;
  offices: string[];
  website: string;
  linkedInUrl?: string;
  verification: EmployerVerification;
  members: OrganizationMember[];
}

export type JobStatus = "Draft" | "Pending Review" | "Published" | "Paused" | "Closed" | "Archived";

export interface ScreeningQuestion {
  id: string;
  question: string;
  type: "text" | "yes_no" | "multiple_choice";
  options?: string[];
  required: boolean;
}

export interface Job {
  id: string;
  slug: string;
  organizationId: string;
  organizationName: string;
  organizationLogo: string;
  organizationDomain: string;
  organizationVerified: boolean;
  title: string;
  department: string;
  location: string;
  workMode: WorkMode;
  employmentType: EmploymentType;
  experienceLevel: ExperienceLevel;
  minSalaryINR?: number;
  maxSalaryINR?: number;
  salaryPeriod: "year" | "month";
  summary: string;
  responsibilities: string[];
  mustHaveSkills: string[];
  preferredSkills: string[];
  educationRequirement?: string;
  benefits: string[];
  screeningQuestions: ScreeningQuestion[];
  status: JobStatus;
  publishedAt: string;
  updatedAt: string;
  applicantsCount: number;
  shortlistedCount: number;
  interviewsCount: number;
  matchScore?: number;
}

export interface MatchEvidenceItem {
  criterion: string;
  category: "Skills" | "Experience" | "Education" | "Role Alignment" | "Location";
  evidenceText: string;
  status: "matched" | "missing" | "unknown";
}

export interface MatchBreakdownScore {
  name: string;
  earned: number;
  max: number;
}

export interface MatchResult {
  candidateId: string;
  jobId: string;
  overallAlignment: number; // e.g. 86 (percentage)
  breakdown: {
    skills: MatchBreakdownScore;
    relevantExperience: MatchBreakdownScore;
    roleAlignment: MatchBreakdownScore;
    location: MatchBreakdownScore;
    semanticRelevance: MatchBreakdownScore;
    education: MatchBreakdownScore;
  };
  matched: MatchEvidenceItem[];
  missing: MatchEvidenceItem[];
  unknown: MatchEvidenceItem[];
  feedbackRelevant?: boolean;
}

export type ApplicationStage = "Applied" | "Screening" | "Shortlisted" | "Interview" | "Decision" | "Closed";

export interface ApplicationTimelineEvent {
  id: string;
  stage: ApplicationStage;
  title: string;
  description: string;
  date: string;
  completed: boolean;
  active?: boolean;
}

export interface Application {
  id: string;
  jobId: string;
  jobSlug: string;
  jobTitle: string;
  organizationId: string;
  organizationName: string;
  organizationLogo: string;
  location: string;
  workMode: WorkMode;
  candidateId: string;
  candidateName: string;
  candidateHeadline: string;
  candidateEmail: string;
  candidateAvatar: string;
  appliedAt: string;
  stage: ApplicationStage;
  overallAlignment: number;
  resumeFileName: string;
  screeningAnswers: {
    questionId: string;
    question: string;
    answer: string;
  }[];
  timeline: ApplicationTimelineEvent[];
  recruiterNotes?: {
    id: string;
    authorName: string;
    content: string;
    createdAt: string;
  }[];
  assignedReviewerId?: string;
  assignedReviewerName?: string;
  interviewScheduled?: boolean;
}

export interface InterviewScorecard {
  interviewerId: string;
  interviewerName: string;
  technicalRating: number; // 1-5
  communicationRating: number; // 1-5
  domainKnowledgeRating: number; // 1-5
  cultureAddRating: number; // 1-5
  overallDecision: "Strong Yes" | "Yes" | "Mixed" | "No";
  summary: string;
  submittedAt: string;
}

export interface Interview {
  id: string;
  applicationId: string;
  candidateId: string;
  candidateName: string;
  jobId: string;
  jobTitle: string;
  scheduledAt: string;
  durationMinutes: number;
  interviewerName: string;
  interviewerRole: string;
  interviewerEmail: string;
  meetingLink: string;
  candidateNote?: string;
  status: "Scheduled" | "Completed" | "Cancelled" | "Rescheduled";
  scorecard?: InterviewScorecard;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "application" | "interview" | "match" | "verification" | "system";
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actorName: string;
  actorEmail: string;
  actorRole: "Admin" | "Employer" | "Candidate" | "System";
  action: string;
  resource: string;
  details: string;
  ipAddress: string;
  riskLevel: "Low" | "Medium" | "High";
}

export interface TaxonomyItem {
  id: string;
  type: "Skill" | "Job Title" | "Industry" | "Location";
  name: string;
  slug: string;
  category?: string;
  aliases: string[];
  status: "Active" | "Deprecated";
  usageCount: number;
  updatedAt: string;
}

export interface ModerationReport {
  id: string;
  type: "Job Listing" | "User Profile" | "Organization" | "Appeal";
  targetId: string;
  targetTitle: string;
  reportedBy: string;
  reportedByEmail: string;
  reason: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  status: "Pending" | "Reviewed" | "Resolved" | "Dismissed";
  createdAt: string;
  notes?: string;
}

export * from "./profile";
