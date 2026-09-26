// lib/candidate/jobs/matcher.ts

import { CandidateRecord, JobMatchResult } from "../types";
import { MOCK_JOBS } from "@/lib/mocks/data";
import { Job } from "@/types";

// Explicit small skill alias normalization map
const SKILL_ALIASES: Record<string, string> = {
  "react.js": "react",
  reactjs: "react",
  ts: "typescript",
  js: "javascript",
  "next.js": "next.js",
  nextjs: "next.js",
  node: "node.js",
  nodejs: "node.js",
  golang: "go",
  "go (golang)": "go",
  py: "python",
  tailwindcss: "tailwind css",
  tailwind: "tailwind css",
  "design system": "design systems",
  "design systems": "design systems",
  figma: "figma",
  postgresql: "postgresql",
  postgres: "postgresql",
  k8s: "kubernetes",
  docker: "docker",
};

export function normalizeSkill(skill: string): string {
  const lower = skill.trim().toLowerCase();
  return SKILL_ALIASES[lower] || lower;
}

// Sample jobs catalogue extending existing mock jobs with junior/fresher roles for diverse testing
export const SAMPLE_JOBS_CATALOGUE: Job[] = [
  ...MOCK_JOBS,
  {
    id: "job_sample_07",
    slug: "associate-frontend-developer-fresher",
    organizationId: "org_razorwave",
    organizationName: "RazorWave Technologies",
    organizationLogo:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80",
    organizationDomain: "razorwave.tech",
    organizationVerified: true,
    title: "Junior Frontend Developer (Fresher / Graduate)",
    department: "Frontend Chapter",
    location: "Bengaluru, Karnataka",
    workMode: "Remote",
    employmentType: "Full-time",
    experienceLevel: "Entry (0-2 yrs)",
    minSalaryINR: 600000,

    maxSalaryINR: 900000,
    salaryPeriod: "year",
    summary:
      "Entry-level engineering role for motivated graduates and freshers. You will build user-facing components in React, learn production Next.js patterns, and collaborate with experienced mentors.",
    responsibilities: [
      "Develop accessible UI components with React and Tailwind CSS.",
      "Write unit tests with Jest and React Testing Library.",
      "Participate in weekly code reviews and sprint planning.",
    ],
    mustHaveSkills: ["React", "JavaScript", "HTML/CSS"],
    preferredSkills: ["TypeScript", "Git", "Next.js"],
    educationRequirement: "Degree, diploma, or demonstrated project portfolio in software development",
    benefits: [
      "Structured 6-month engineering mentorship program",
      "Work-from-home stipend and equipment setup",
      "Annual learning allowance",
    ],
    screeningQuestions: [],
    status: "Published",
    publishedAt: "2026-09-14T10:00:00Z",
    updatedAt: "2026-09-14T10:00:00Z",
    applicantsCount: 31,
    shortlistedCount: 8,
    interviewsCount: 4,
    matchScore: 92,
  },
  {
    id: "job_sample_08",
    slug: "frontend-engineering-intern",
    organizationId: "org_astracloud",
    organizationName: "AstraCloud India",
    organizationLogo:
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=120&auto=format&fit=crop&q=80",
    organizationDomain: "astracloud.io",
    organizationVerified: true,
    title: "Frontend Engineering Intern",
    department: "Cloud Console",
    location: "Hyderabad, Telangana",
    workMode: "Hybrid",
    employmentType: "Internship",
    experienceLevel: "Entry (0-2 yrs)",
    minSalaryINR: 35000,

    maxSalaryINR: 50000,
    salaryPeriod: "month",
    summary:
      "6-month paid frontend internship working on AstraCloud's developer telemetry console. Ideal for final-year students and fresh graduates.",
    responsibilities: [
      "Implement interactive dashboard widgets using React and TypeScript.",
      "Learn cloud monitoring visualization with TanStack Query.",
    ],
    mustHaveSkills: ["React", "HTML/CSS"],
    preferredSkills: ["TypeScript", "Tailwind CSS"],
    educationRequirement: "Pursuing or recently completed Bachelor's in CS or related degree",
    benefits: [
      "Competitive monthly internship stipend",
      "PPO (Pre-Placement Offer) potential for top performers",
    ],
    screeningQuestions: [],
    status: "Published",
    publishedAt: "2026-09-15T09:00:00Z",
    updatedAt: "2026-09-15T09:00:00Z",
    applicantsCount: 45,
    shortlistedCount: 10,
    interviewsCount: 5,
    matchScore: 88,
  },
];

/**
 * Pure function to match and rank sample jobs against a candidate's profile.
 * - Filters only explicit incompatibilities (unknown data does not equal rejection)
 * - Ranks deterministically by role relevance, career stage, required skill overlap, and work mode
 * - Generates clear, factual reasons
 */
export function matchSampleJobs(
  candidate: CandidateRecord,
  jobsCatalogue: Job[] = SAMPLE_JOBS_CATALOGUE
): JobMatchResult[] {
  // Collect candidate normalized skills
  const candidateSkillNames = new Set<string>();
  for (const s of candidate.discovery?.skills || []) {
    candidateSkillNames.add(normalizeSkill(s.name));
  }
  for (const s of candidate.profile?.skills || []) {
    candidateSkillNames.add(normalizeSkill(s.name));
  }

  // Candidate preferences
  const targetRoles = (candidate.discovery?.targetRoles || []).map((r) =>
    r.toLowerCase().trim()
  );
  const careerStage = candidate.discovery?.careerStage;

  const candidateWorkMode =
    candidate.discovery?.workPreferences?.locationMode?.toLowerCase() ||
    candidate.profile?.jobPreferences?.desiredWorkModes?.[0]?.toLowerCase();

  const candidateJobType =
    candidate.discovery?.workPreferences?.jobType?.toLowerCase() ||
    candidate.profile?.jobPreferences?.employmentTypes?.[0]?.toLowerCase();

  const results: JobMatchResult[] = [];

  for (const job of jobsCatalogue) {
    const jobWorkMode = job.workMode.toLowerCase();
    const jobEmpType = job.employmentType.toLowerCase().replace("-", "_");

    // 1. Incompatibility Filter: Work Mode
    // Only filter if candidate explicitly chose a strict mode that is not 'any' and contradicts job
    if (
      candidateWorkMode &&
      candidateWorkMode !== "any" &&
      candidateWorkMode !== "unsure"
    ) {
      if (candidateWorkMode === "remote" && jobWorkMode === "on-site") {
        continue;
      }
      if (candidateWorkMode === "onsite" && jobWorkMode === "remote") {
        // Not completely incompatible, but keep if user specified onsite
      }
    }

    // 2. Incompatibility Filter: Employment Type
    if (
      candidateJobType &&
      candidateJobType !== "any" &&
      candidateJobType !== "unsure"
    ) {
      if (candidateJobType === "internship" && jobEmpType === "full_time" && job.experienceLevel.includes("Senior")) {
        continue;
      }
    }

    // 3. Seniority conflict filter: Never recommend Senior roles (6+ yrs) to freshers/students
    const isJobSenior =
      job.title.toLowerCase().includes("senior") ||
      job.title.toLowerCase().includes("lead") ||
      job.experienceLevel.toLowerCase().includes("senior") ||
      job.experienceLevel.toLowerCase().includes("6-8");

    if ((careerStage === "student" || careerStage === "fresher") && isJobSenior) {
      // Avoid pushing senior jobs to freshers where requirements conflict
      continue;
    }

    // 4. Deterministic Scoring & Reasons
    let score = 0;
    const matchReasons: string[] = [];
    const unconfirmedSkills: string[] = [];

    // Target Role Relevance
    const jobTitleLower = job.title.toLowerCase();
    let roleMatched = false;
    const GENERIC_ROLE_WORDS = new Set(["engineer", "developer", "specialist", "architect", "lead", "junior", "senior", "intern", "associate", "analyst"]);

    for (const role of targetRoles) {
      if (role === "exploring") continue;
      if (jobTitleLower.includes(role)) {
        score += 100;
        roleMatched = true;
        matchReasons.push(`Matches your target direction in ${role}`);
        break;
      }
      // Check domain-specific words
      const domainWords = role.split(/\s+/).filter((w) => w.length > 2 && !GENERIC_ROLE_WORDS.has(w));
      if (domainWords.length > 0 && domainWords.some((w) => jobTitleLower.includes(w))) {
        score += 85;
        roleMatched = true;
        matchReasons.push(`Matches your target direction in ${role}`);
        break;
      }
    }


    // Career Stage compatibility
    if (careerStage === "fresher" || careerStage === "student") {
      if (
        job.experienceLevel.toLowerCase().includes("entry") ||
        job.employmentType.toLowerCase().includes("intern")
      ) {
        score += 50;
        matchReasons.push("Calibrated for freshers & entry-level engineering graduates");
      }
    } else if (careerStage === "experienced") {
      if (job.experienceLevel.toLowerCase().includes("mid") || isJobSenior) {
        score += 40;
      }
    }

    // Required Skills Overlap
    const sharedSkills: string[] = [];
    for (const requiredSkill of job.mustHaveSkills) {
      const norm = normalizeSkill(requiredSkill);
      if (candidateSkillNames.has(norm)) {
        sharedSkills.push(requiredSkill);
      } else {
        unconfirmedSkills.push(requiredSkill);
      }
    }

    if (sharedSkills.length > 0) {
      score += sharedSkills.length * 20;
      matchReasons.push(
        `You have listed: ${sharedSkills.slice(0, 3).join(", ")}${
          sharedSkills.length > 3 ? ` +${sharedSkills.length - 3} more` : ""
        }`
      );
    }

    // Work Mode Match
    if (
      candidateWorkMode &&
      (candidateWorkMode === jobWorkMode ||
        (candidateWorkMode === "remote" && jobWorkMode === "remote") ||
        (candidateWorkMode === "hybrid" && jobWorkMode === "hybrid"))
    ) {
      score += 25;
      matchReasons.push(`${job.workMode} matches your preferred work mode`);
    }

    // Baseline fallback reason if none yet
    if (matchReasons.length === 0) {
      matchReasons.push(`Relevant engineering opening in ${job.department || "Technology"}`);
    }

    results.push({
      job,
      matchReasons,
      unconfirmedSkills,
      isCompatible: true,
      score,
    });
  }

  // Deterministic sorting:
  // 1. Highest match score
  // 2. Stable job ID tiebreaker
  return results.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.job.id.localeCompare(b.job.id);
  });
}
