import { CandidateProfile } from "@/types";
import { MOCK_CANDIDATE_PROFILE } from "@/lib/mocks/data";

let candidateProfileState: CandidateProfile = { ...MOCK_CANDIDATE_PROFILE };
let savedJobsState: string[] = ["job_01", "job_06"];

export async function getCandidateProfile(): Promise<CandidateProfile> {
  await new Promise((r) => setTimeout(r, 200));
  return { ...candidateProfileState };
}

export async function updateCandidateProfile(
  updates: Partial<CandidateProfile>
): Promise<CandidateProfile> {
  await new Promise((r) => setTimeout(r, 350));
  candidateProfileState = {
    ...candidateProfileState,
    ...updates,
  };
  return { ...candidateProfileState };
}

export async function getSavedJobIds(): Promise<string[]> {
  await new Promise((r) => setTimeout(r, 150));
  return [...savedJobsState];
}

export async function toggleSaveJob(jobId: string): Promise<{ saved: boolean; savedIds: string[] }> {
  await new Promise((r) => setTimeout(r, 200));
  if (savedJobsState.includes(jobId)) {
    savedJobsState = savedJobsState.filter((id) => id !== jobId);
    return { saved: false, savedIds: [...savedJobsState] };
  } else {
    savedJobsState = [...savedJobsState, jobId];
    return { saved: true, savedIds: [...savedJobsState] };
  }
}

export interface ExtractedResumePayload {
  fullName: string;
  email: string;
  phone: string;
  headline: string;
  summary: string;
  location: string;
  skills: { name: string; category: "Technical" | "Soft" | "Tool" | "Domain"; yearsOfExperience?: number }[];
  experiences: {
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    description: string;
    skillsUsed: string[];
  }[];
  education: {
    degree: string;
    fieldOfStudy: string;
    institution: string;
    startYear: number;
    endYear: number;
    grade?: string;
  }[];
  certifications: {
    name: string;
    issuingOrganization: string;
    issueDate: string;
  }[];
}

export async function parseResumeFile(
  fileName: string,
  onStageChange?: (stage: "Uploading" | "Scanning" | "Extracting" | "Structuring" | "Ready for review") => void
): Promise<ExtractedResumePayload> {
  // Simulates the 5 processing stages with realistic asynchronous delays
  onStageChange?.("Uploading");
  await new Promise((r) => setTimeout(r, 600));

  onStageChange?.("Scanning");
  await new Promise((r) => setTimeout(r, 700));

  onStageChange?.("Extracting");
  await new Promise((r) => setTimeout(r, 900));

  onStageChange?.("Structuring");
  await new Promise((r) => setTimeout(r, 700));

  onStageChange?.("Ready for review");
  await new Promise((r) => setTimeout(r, 400));

  return {
    fullName: "Ananya Sharma",
    email: "ananya.sharma@example.com",
    phone: "+91 98450 12894",
    headline: "Senior Frontend Engineer | React 19, Next.js, TypeScript & Design Systems",
    summary:
      "Product-focused Frontend Engineer with 4.5+ years of experience engineering high-performance web applications, accessible design systems, and real-time interfaces.",
    location: "Bengaluru, Karnataka",
    skills: [
      { name: "React", category: "Technical", yearsOfExperience: 4.5 },
      { name: "Next.js", category: "Technical", yearsOfExperience: 3.5 },
      { name: "TypeScript", category: "Technical", yearsOfExperience: 4 },
      { name: "Tailwind CSS", category: "Technical", yearsOfExperience: 4 },
      { name: "TanStack Query", category: "Tool", yearsOfExperience: 3 },
      { name: "Design Systems", category: "Domain", yearsOfExperience: 3 },
      { name: "Web Vitals Optimization", category: "Technical", yearsOfExperience: 3 },
    ],
    experiences: [
      {
        title: "Senior Software Engineer (Frontend)",
        company: "KiteFlow Tech",
        location: "Bengaluru, India",
        startDate: "2023-04-01",
        current: true,
        description:
          "Architected core merchant dashboard serving 40,000+ daily active businesses. Reduced LCP from 3.2s to 1.1s through granular code-splitting and server component boundaries.",
        skillsUsed: ["React", "Next.js", "TypeScript", "Tailwind CSS", "TanStack Query"],
      },
      {
        title: "Frontend Engineer",
        company: "ZetaPay Solutions",
        location: "Bengaluru, India",
        startDate: "2021-07-01",
        endDate: "2023-03-31",
        current: false,
        description:
          "Developed consumer checkout flow and responsive payment widget SDK embedded across 500+ Indian merchant storefronts.",
        skillsUsed: ["React", "TypeScript", "CSS Modules", "Redux Toolkit"],
      },
    ],
    education: [
      {
        degree: "B.Tech in Computer Science and Engineering",
        fieldOfStudy: "Computer Science",
        institution: "National Institute of Technology Karnataka (NITK), Surathkal",
        startYear: 2017,
        endYear: 2021,
        grade: "8.84 CGPA",
      },
    ],
    certifications: [
      {
        name: "Meta Certified Front-End Developer",
        issuingOrganization: "Meta",
        issueDate: "2022-08-10",
      },
    ],
  };
}
