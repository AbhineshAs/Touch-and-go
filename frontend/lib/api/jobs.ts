import { Job, JobStatus, WorkMode, EmploymentType, ExperienceLevel } from "@/types";
import { getOrganizationProfile } from "@/lib/organization/profileService";

const STORAGE_KEY = "tag_jobs_storage";
const MOCK_JOB_IDS = new Set([
  "job_01",
  "job_02",
  "job_03",
  "job_04",
  "job_05",
  "job_06",
  "job_sample_07",
  "job_sample_08",
]);

let memoryJobs: Job[] = [];

function loadStoredJobs(): Job[] {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: Job[] = JSON.parse(stored);
        const cleaned = parsed.filter(
          (j) => !MOCK_JOB_IDS.has(j.id) && !j.id.startsWith("job_sample_")
        );
        const orgProfile = getOrganizationProfile();
        let changed = cleaned.length !== parsed.length;

        const synced = cleaned.map((j) => {
          const isPlaceholder =
            !j.organizationLogo ||
            j.organizationLogo === "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80";

          if (isPlaceholder || (orgProfile.logoUrl && j.organizationLogo !== orgProfile.logoUrl)) {
            changed = true;
            return {
              ...j,
              organizationLogo: orgProfile.logoUrl || j.organizationLogo,
              organizationName: orgProfile.name || j.organizationName,
            };
          }
          return j;
        });

        if (changed) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(synced));
        }
        memoryJobs = synced;
        return memoryJobs;
      }
    } catch (e) {
      console.warn("Failed to read jobs from localStorage:", e);
    }
  }
  return memoryJobs;
}

function persistJobs(jobs: Job[]) {
  const cleaned = jobs.filter(
    (j) => !MOCK_JOB_IDS.has(j.id) && !j.id.startsWith("job_sample_")
  );
  memoryJobs = cleaned;
  jobsState = cleaned;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new CustomEvent("tag_jobs_updated", { detail: cleaned }));
    } catch (e) {
      console.warn("Failed to persist jobs to localStorage:", e);
    }
  }
}

export function getLiveJobs(): Job[] {
  return loadStoredJobs();
}

let jobsState: Job[] = loadStoredJobs();

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
  await new Promise((r) => setTimeout(r, 100));
  jobsState = loadStoredJobs();
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
  await new Promise((r) => setTimeout(r, 100));
  jobsState = loadStoredJobs();
  const job = jobsState.find((j) => j.slug === slug || j.id === slug);
  return job ? { ...job } : null;
}

export async function getJobById(id: string): Promise<Job | null> {
  await new Promise((r) => setTimeout(r, 100));
  jobsState = loadStoredJobs();
  const job = jobsState.find((j) => j.id === id || j.slug === id);
  return job ? { ...job } : null;
}

export async function getRecommendedJobs(): Promise<Job[]> {
  await new Promise((r) => setTimeout(r, 150));
  jobsState = loadStoredJobs();
  return jobsState
    .filter((j) => j.status === "Published" && (j.matchScore || 0) >= 60)
    .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
}

export async function getEmployerJobs(organizationId: string = "org_razorwave"): Promise<Job[]> {
  await new Promise((r) => setTimeout(r, 100));
  jobsState = loadStoredJobs();
  return jobsState.filter(
    (j) => j.organizationId === organizationId || organizationId === "org_razorwave" || organizationId === "org_whitetrack"
  );
}

export async function createJob(
  jobData: Partial<Job>
): Promise<Job> {
  await new Promise((r) => setTimeout(r, 200));
  jobsState = loadStoredJobs();
  const id = `job_${Date.now()}`;
  const slug = (jobData.title || "new-job")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") + `-${Date.now().toString().slice(-4)}`;

  const orgProfile = getOrganizationProfile(jobData.organizationId || "org_razorwave");
  const orgName = jobData.organizationName || orgProfile.name || "WhiteTrack Technologies";
  const orgLogo =
    jobData.organizationLogo !== undefined
      ? jobData.organizationLogo
      : (orgProfile.logoUrl || "");

  const newJob: Job = {
    id,
    slug,
    organizationId: jobData.organizationId || orgProfile.id || "org_razorwave",
    organizationName: orgName,
    organizationLogo: orgLogo,
    organizationDomain: orgProfile.website ? orgProfile.website.replace(/^https?:\/\//, "") : "whitetracktech.com",
    organizationVerified: orgProfile.isVerified ?? true,
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
    deadline: jobData.deadline,
    publishedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    applicantsCount: 0,
    shortlistedCount: 0,
    interviewsCount: 0,
    matchScore: 80,
  };

  const updated = [newJob, ...jobsState];
  persistJobs(updated);
  return newJob;
}

export async function updateJob(
  jobId: string,
  updates: Partial<Job>
): Promise<Job> {
  await new Promise((r) => setTimeout(r, 200));
  jobsState = loadStoredJobs();
  const index = jobsState.findIndex((j) => j.id === jobId || j.slug === jobId);
  if (index === -1) throw new Error("Job not found");

  const current = jobsState[index];
  const updatedJob: Job = {
    ...current,
    ...updates,
    id: current.id, // keep immutable id
    slug: current.slug,
    updatedAt: new Date().toISOString(),
  };

  const updated = [...jobsState];
  updated[index] = updatedJob;
  persistJobs(updated);
  return updatedJob;
}

export async function deleteJob(jobId: string): Promise<boolean> {
  await new Promise((r) => setTimeout(r, 200));
  jobsState = loadStoredJobs();
  const filtered = jobsState.filter((j) => j.id !== jobId && j.slug !== jobId);
  if (filtered.length === jobsState.length) return false;
  persistJobs(filtered);
  return true;
}

export async function updateJobStatus(jobId: string, status: JobStatus): Promise<Job> {
  return updateJob(jobId, { status });
}

