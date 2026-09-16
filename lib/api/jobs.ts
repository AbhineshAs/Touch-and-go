import { Job, JobStatus, WorkMode, EmploymentType, ExperienceLevel } from "@/types";
import { MOCK_JOBS } from "@/lib/mocks/data";

let jobsState: Job[] = [...MOCK_JOBS];

export interface JobFilterParams {
  keyword?: string;
  location?: string;
  workModes?: WorkMode[];
  employmentTypes?: EmploymentType[];
  experienceLevels?: ExperienceLevel[];
  minSalary?: number;
  skills?: string[];
  sortBy?: "relevant" | "newest" | "match";
}

export async function getJobs(filters?: JobFilterParams): Promise<Job[]> {
  await new Promise((r) => setTimeout(r, 220));
  let results = [...jobsState].filter((j) => j.status === "Published");

  if (!filters) return results;

  if (filters.keyword && filters.keyword.trim() !== "") {
    const q = filters.keyword.toLowerCase().trim();
    results = results.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        j.summary.toLowerCase().includes(q) ||
        j.organizationName.toLowerCase().includes(q) ||
        j.mustHaveSkills.some((s) => s.toLowerCase().includes(q))
    );
  }

  if (filters.location && filters.location.trim() !== "") {
    const loc = filters.location.toLowerCase().trim();
    results = results.filter((j) => j.location.toLowerCase().includes(loc));
  }

  if (filters.workModes && filters.workModes.length > 0) {
    results = results.filter((j) => filters.workModes!.includes(j.workMode));
  }

  if (filters.employmentTypes && filters.employmentTypes.length > 0) {
    results = results.filter((j) => filters.employmentTypes!.includes(j.employmentType));
  }

  if (filters.experienceLevels && filters.experienceLevels.length > 0) {
    results = results.filter((j) => filters.experienceLevels!.includes(j.experienceLevel));
  }

  if (filters.minSalary) {
    results = results.filter((j) => !j.maxSalaryINR || j.maxSalaryINR >= filters.minSalary!);
  }

  if (filters.sortBy === "newest") {
    results.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  } else if (filters.sortBy === "match") {
    results.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  }

  return results;
}

export async function getJobBySlug(slug: string): Promise<Job | null> {
  await new Promise((r) => setTimeout(r, 180));
  const job = jobsState.find((j) => j.slug === slug || j.id === slug);
  return job ? { ...job } : null;
}

export async function getRecommendedJobs(): Promise<Job[]> {
  await new Promise((r) => setTimeout(r, 250));
  return jobsState
    .filter((j) => j.status === "Published" && (j.matchScore || 0) >= 60)
    .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
}

export async function getEmployerJobs(organizationId: string = "org_razorwave"): Promise<Job[]> {
  await new Promise((r) => setTimeout(r, 200));
  return jobsState.filter((j) => j.organizationId === organizationId);
}

export async function createJob(
  jobData: Partial<Job>
): Promise<Job> {
  await new Promise((r) => setTimeout(r, 450));
  const id = `job_${Date.now()}`;
  const slug = (jobData.title || "new-job")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") + `-${Date.now().toString().slice(-4)}`;

  const newJob: Job = {
    id,
    slug,
    organizationId: jobData.organizationId || "org_razorwave",
    organizationName: jobData.organizationName || "RazorWave Technologies",
    organizationLogo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80",
    organizationDomain: "razorwave.tech",
    organizationVerified: true,
    title: jobData.title || "Untitled Role",
    department: jobData.department || "Engineering",
    location: jobData.location || "Bengaluru, Karnataka",
    workMode: jobData.workMode || "Hybrid",
    employmentType: jobData.employmentType || "Full-time",
    experienceLevel: jobData.experienceLevel || "Mid (3-5 yrs)",
    minSalaryINR: jobData.minSalaryINR,
    maxSalaryINR: jobData.maxSalaryINR,
    salaryPeriod: jobData.salaryPeriod || "year",
    summary: jobData.summary || "",
    responsibilities: jobData.responsibilities || [],
    mustHaveSkills: jobData.mustHaveSkills || [],
    preferredSkills: jobData.preferredSkills || [],
    educationRequirement: jobData.educationRequirement || "Bachelor's degree in engineering or relevant discipline",
    benefits: jobData.benefits || [],
    screeningQuestions: jobData.screeningQuestions || [],
    status: jobData.status || "Published",
    publishedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    applicantsCount: 0,
    shortlistedCount: 0,
    interviewsCount: 0,
    matchScore: 80,
  };

  jobsState = [newJob, ...jobsState];
  return newJob;
}

export async function updateJobStatus(jobId: string, status: JobStatus): Promise<Job> {
  await new Promise((r) => setTimeout(r, 250));
  const index = jobsState.findIndex((j) => j.id === jobId);
  if (index === -1) throw new Error("Job not found");
  jobsState[index] = {
    ...jobsState[index],
    status,
    updatedAt: new Date().toISOString(),
  };
  return jobsState[index];
}
