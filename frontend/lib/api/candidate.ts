import { CandidateProfile } from "@/types";

const SAVED_JOBS_KEY = "tag_candidate_saved_jobs";
let savedJobsState: string[] = [];

export function resolveLiveCandidateProfile(): CandidateProfile {
  if (typeof window !== "undefined") {
    try {
      const rawAuth = localStorage.getItem("tag_auth_user");
      let authUser: any = null;
      if (rawAuth) {
        try {
          authUser = JSON.parse(rawAuth);
        } catch {}
      }

      const activeEmail = authUser?.email?.trim().toLowerCase();
      let rec: any = null;
      if (activeEmail && localStorage.getItem(`tag_candidate_record_${activeEmail}`)) {
        try {
          rec = JSON.parse(localStorage.getItem(`tag_candidate_record_${activeEmail}`)!);
        } catch {}
      }
      if (!rec) {
        const rawGen = localStorage.getItem("tag_candidate_record");
        if (rawGen) {
          try {
            rec = JSON.parse(rawGen);
          } catch {}
        }
      }
      if (!rec && activeEmail) {
        const rawDb = localStorage.getItem("tag_candidate_db");
        if (rawDb) {
          try {
            const db = JSON.parse(rawDb);
            if (db[activeEmail]) rec = db[activeEmail];
          } catch {}
        }
      }

      // Check uploaded resume
      let uploadedResume: any = null;
      if (activeEmail && localStorage.getItem(`tag_candidate_resume_${activeEmail}`)) {
        try {
          uploadedResume = JSON.parse(localStorage.getItem(`tag_candidate_resume_${activeEmail}`)!);
        } catch {}
      }
      if (!uploadedResume && localStorage.getItem("tag_candidate_uploaded_resume")) {
        try {
          uploadedResume = JSON.parse(localStorage.getItem("tag_candidate_uploaded_resume")!);
        } catch {}
      }

      // Check stored avatar
      let storedAvatar = "";
      if (activeEmail && localStorage.getItem(`tag_candidate_avatar_${activeEmail}`)) {
        storedAvatar = localStorage.getItem(`tag_candidate_avatar_${activeEmail}`) || "";
      }
      if (!storedAvatar && localStorage.getItem("tag_candidate_avatar")) {
        storedAvatar = localStorage.getItem("tag_candidate_avatar") || "";
      }
      if (!storedAvatar && authUser?.avatarUrl) {
        storedAvatar = authUser.avatarUrl;
      }

      const name =
        rec?.identity?.fullName ||
        authUser?.name ||
        (activeEmail ? activeEmail.split("@")[0] : "Candidate");
      const email = rec?.identity?.email || authUser?.email || "";
      const phone = rec?.identity?.phone || authUser?.phone || "";
      const headline =
        rec?.profile?.headline ||
        rec?.resumeDraft?.headline ||
        (rec?.discovery?.targetRoles?.[0]
          ? `${rec.discovery.targetRoles[0]} Specialist`
          : "Software Engineer");
      const summary =
        rec?.profile?.summary ||
        rec?.resumeDraft?.summary ||
        "Product-focused professional with verified criteria and background credentials.";
      const location = rec?.profile?.location || "Bengaluru, Karnataka";

      const cleanFileName = name.replace(/[^a-zA-Z0-9]/g, "_");
      const resumeName =
        uploadedResume?.fileName ||
        rec?.uploadedResume?.fileName ||
        `${cleanFileName}_Resume.pdf`;

      if (authUser || rec) {
        return {
          id: rec?.id || authUser?.id || "cand_usr",
          userId: authUser?.id || rec?.id || "cand_usr",
          fullName: name,
          email,
          phone,
          headline,
          summary,
          location,
          avatarUrl: storedAvatar,
          resumeFileName: resumeName,
          resumeFileUrl: uploadedResume?.dataUrl || "",
          resumeParsedAt: uploadedResume?.uploadedAt || new Date().toISOString(),
          visibility: "verified_employers_only",
          completionPercentage: 86,
          missingItems: [],
          experiences: (rec?.profile?.experience || []).map((exp: any, i: number) => ({
            id: exp.id || `exp_${i}`,
            title: exp.title || "Software Engineer",
            company: exp.company || "Technology Co",
            location: exp.location || "Bengaluru",
            startDate: exp.startDate || "2023-01-01",
            endDate: exp.endDate,
            current: exp.current ?? true,
            description: exp.description || "",
            skillsUsed: exp.skillsUsed || [],
          })),
          education: (rec?.profile?.education || []).map((edu: any, i: number) => ({
            id: edu.id || `edu_${i}`,
            degree: edu.degree || "B.Tech",
            fieldOfStudy: edu.fieldOfStudy || "Computer Science",
            institution: edu.institution || "University",
            startYear: Number(edu.startYear) || 2018,
            endYear: Number(edu.endYear) || 2022,
            grade: edu.grade,
          })),
          skills: (rec?.profile?.skills || []).map((s: any, i: number) => ({
            id: s.id || `sk_${i}`,
            name: s.name,
            category: "Technical",
            yearsOfExperience: 3,
            verified: true,
          })),
          projects: (rec?.profile?.projects || []).map((p: any, i: number) => ({
            id: p.id || `proj_${i}`,
            title: p.title,
            description: p.description,
            role: "Developer",
            technologies: p.technologies || [],
            url: p.url,
          })),
          certifications: (rec?.profile?.certifications || []).map((c: any, i: number) => ({
            id: c.id || `cert_${i}`,
            name: c.name,
            issuingOrganization: c.issuer || c.issuingOrganization || "Credential Issuer",
            issueDate: c.issueDate || "2024-01-01",
          })),
          preferences: {
            desiredRoles: rec?.discovery?.targetRoles || ["Software Engineer"],
            preferredLocations: ["Bengaluru", "Remote"],
            desiredWorkModes: ["Hybrid", "Remote"],
            minimumSalaryINR: 1800000,
            availableFrom: "Immediately",
            noticePeriodDays: 30,
          },
        };
      }
    } catch (e) {
      console.warn("Failed resolving live candidate profile:", e);
    }
  }

  return {
    id: "cand_guest",
    userId: "usr_guest",
    fullName: "Candidate",
    email: "",
    phone: "",
    headline: "Software Engineer",
    summary: "Candidate profile on Touch and Go.",
    location: "India",
    avatarUrl: "",
    resumeFileName: "Candidate_Resume.pdf",
    visibility: "verified_employers_only",
    completionPercentage: 60,
    missingItems: [],
    experiences: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    preferences: {
      desiredRoles: ["Software Engineer"],
      preferredLocations: ["Bengaluru", "Remote"],
      desiredWorkModes: ["Hybrid", "Remote"],
      minimumSalaryINR: 1500000,
      availableFrom: "Immediately",
      noticePeriodDays: 30,
    },
  };
}

export function resolveCandidateProfileByEmailOrId(email?: string, id?: string): CandidateProfile {
  if (typeof window !== "undefined") {
    try {
      const activeEmail = email?.trim().toLowerCase();
      let rec: any = null;
      if (activeEmail && localStorage.getItem(`tag_candidate_record_${activeEmail}`)) {
        try {
          rec = JSON.parse(localStorage.getItem(`tag_candidate_record_${activeEmail}`)!);
        } catch {}
      }
      if (!rec && activeEmail) {
        const rawDb = localStorage.getItem("tag_candidate_db");
        if (rawDb) {
          try {
            const db = JSON.parse(rawDb);
            if (db[activeEmail]) rec = db[activeEmail];
          } catch {}
        }
      }
      if (!rec) {
        const rawGen = localStorage.getItem("tag_candidate_record");
        if (rawGen) {
          try {
            rec = JSON.parse(rawGen);
          } catch {}
        }
      }

      // Check uploaded resume
      let uploadedResume: any = null;
      if (activeEmail && localStorage.getItem(`tag_candidate_resume_${activeEmail}`)) {
        try {
          uploadedResume = JSON.parse(localStorage.getItem(`tag_candidate_resume_${activeEmail}`)!);
        } catch {}
      }
      if (!uploadedResume && rec?.uploadedResume) {
        uploadedResume = rec.uploadedResume;
      }
      if (!uploadedResume && localStorage.getItem("tag_candidate_uploaded_resume")) {
        try {
          uploadedResume = JSON.parse(localStorage.getItem("tag_candidate_uploaded_resume")!);
        } catch {}
      }

      // Check stored avatar
      let storedAvatar = "";
      if (activeEmail && localStorage.getItem(`tag_candidate_avatar_${activeEmail}`)) {
        storedAvatar = localStorage.getItem(`tag_candidate_avatar_${activeEmail}`) || "";
      }
      if (!storedAvatar && localStorage.getItem("tag_candidate_avatar")) {
        storedAvatar = localStorage.getItem("tag_candidate_avatar") || "";
      }

      const name = rec?.identity?.fullName || (activeEmail ? activeEmail.split("@")[0] : "Candidate");
      const candEmail = rec?.identity?.email || activeEmail || "";
      const phone = rec?.identity?.phone || "+91 98765 43210";
      const headline = rec?.profile?.headline || rec?.resumeDraft?.headline || "Software Engineer";
      const summary = rec?.profile?.summary || rec?.resumeDraft?.summary || "Passionate and results-driven software engineer focused on building robust, scalable digital applications.";
      const location = rec?.profile?.location || "Bengaluru, Karnataka";

      const experiences = (rec?.profile?.experience && rec.profile.experience.length > 0)
        ? rec.profile.experience.map((exp: any, i: number) => ({
            id: exp.id || `exp_${i}`,
            title: exp.title || "Software Engineer",
            company: exp.company || "Tech Innovations Ltd",
            location: exp.location || "Bengaluru, India",
            startDate: exp.startDate || "2023-01-01",
            endDate: exp.endDate,
            current: exp.current ?? true,
            description: exp.description || "Developed, maintained, and optimized key feature sets and backend systems.",
            skillsUsed: exp.skillsUsed || ["TypeScript", "React", "Node.js"],
          }))
        : [
            {
              id: "exp_default_1",
              title: "Software Engineer",
              company: "Tech Innovations Ltd",
              location: "Bengaluru, India",
              startDate: "2023-06-01",
              current: true,
              description: "Architected high-throughput service APIs, reduced response times by 35%, and led sprint implementations.",
              skillsUsed: ["TypeScript", "React", "Node.js", "PostgreSQL"],
            },
            {
              id: "exp_default_2",
              title: "Associate Developer",
              company: "Nexus Labs",
              location: "Remote",
              startDate: "2022-01-01",
              endDate: "2023-05-31",
              current: false,
              description: "Built responsive frontend UI and collaborated on database schema migrations and unit tests.",
              skillsUsed: ["JavaScript", "HTML/CSS", "Git", "REST APIs"],
            },
          ];

      const education = (rec?.profile?.education && rec.profile.education.length > 0)
        ? rec.profile.education.map((edu: any, i: number) => ({
            id: edu.id || `edu_${i}`,
            degree: edu.degree || "Bachelor of Technology",
            fieldOfStudy: edu.fieldOfStudy || "Computer Science & Engineering",
            institution: edu.institution || "National Institute of Technology",
            startYear: Number(edu.startYear) || 2018,
            endYear: Number(edu.endYear) || 2022,
            grade: edu.grade || "8.6 CGPA",
          }))
        : [
            {
              id: "edu_default_1",
              degree: "Bachelor of Technology (B.Tech)",
              fieldOfStudy: "Computer Science & Engineering",
              institution: "National Institute of Technology",
              startYear: 2018,
              endYear: 2022,
              grade: "8.6 CGPA",
            },
          ];

      const skills = (rec?.profile?.skills && rec.profile.skills.length > 0)
        ? rec.profile.skills.map((s: any, i: number) => ({
            id: s.id || `sk_${i}`,
            name: typeof s === "string" ? s : s.name,
            category: "Technical" as const,
            yearsOfExperience: s.yearsOfExperience || 3,
            verified: true,
          }))
        : [
            { id: "sk_1", name: "JavaScript", category: "Technical" as const, yearsOfExperience: 3, verified: true },
            { id: "sk_2", name: "TypeScript", category: "Technical" as const, yearsOfExperience: 2.5, verified: true },
            { id: "sk_3", name: "React", category: "Technical" as const, yearsOfExperience: 3, verified: true },
            { id: "sk_4", name: "Node.js", category: "Technical" as const, yearsOfExperience: 2, verified: true },
            { id: "sk_5", name: "SQL", category: "Technical" as const, yearsOfExperience: 2, verified: true },
          ];

      const certifications = (rec?.profile?.certifications && rec.profile.certifications.length > 0)
        ? rec.profile.certifications.map((c: any, i: number) => ({
            id: c.id || `cert_${i}`,
            name: c.name,
            issuingOrganization: c.issuer || c.issuingOrganization || "Industry Authority",
            issueDate: c.issueDate || "2023-05-15",
            credentialUrl: c.credentialUrl,
          }))
        : [
            {
              id: "cert_default_1",
              name: "Certified Cloud Practitioner",
              issuingOrganization: "Amazon Web Services (AWS)",
              issueDate: "2023-04-10",
            },
          ];

      return {
        id: id || rec?.id || "cand_lookup",
        userId: id || rec?.id || "cand_lookup",
        fullName: name,
        email: candEmail,
        phone,
        headline,
        summary,
        location,
        avatarUrl: storedAvatar,
        resumeFileName: uploadedResume?.fileName || `${name.replace(/[^a-zA-Z0-9]/g, "_")}_Resume.pdf`,
        resumeFileUrl: uploadedResume?.dataUrl || "",
        resumeParsedAt: uploadedResume?.uploadedAt || new Date().toISOString(),
        visibility: "verified_employers_only",
        completionPercentage: 92,
        missingItems: [],
        experiences,
        education,
        skills,
        projects: rec?.profile?.projects || [],
        certifications,
        preferences: {
          desiredRoles: rec?.discovery?.targetRoles || ["Software Engineer"],
          preferredLocations: ["Bengaluru", "Remote"],
          desiredWorkModes: ["Hybrid", "Remote"],
          minimumSalaryINR: 1500000,
          availableFrom: "Immediately",
          noticePeriodDays: 30,
        },
      };
    } catch (e) {
      console.warn("Failed resolving candidate profile by email/id:", e);
    }
  }
  return resolveLiveCandidateProfile();
}

export async function getCandidateProfile(): Promise<CandidateProfile> {
  await new Promise((r) => setTimeout(r, 120));
  return resolveLiveCandidateProfile();
}

export async function updateCandidateProfile(
  updates: Partial<CandidateProfile>
): Promise<CandidateProfile> {
  await new Promise((r) => setTimeout(r, 200));
  const current = resolveLiveCandidateProfile();
  const updated: CandidateProfile = {
    ...current,
    ...updates,
  };

  if (typeof window !== "undefined") {
    try {
      const email = updated.email?.trim().toLowerCase();
      const rawRec = email
        ? localStorage.getItem(`tag_candidate_record_${email}`)
        : localStorage.getItem("tag_candidate_record");

      if (rawRec) {
        const rec = JSON.parse(rawRec);
        if (updates.fullName) rec.identity.fullName = updates.fullName;
        if (updates.headline) {
          if (!rec.profile) rec.profile = {};
          rec.profile.headline = updates.headline;
        }
        if (updates.summary) {
          if (!rec.profile) rec.profile = {};
          rec.profile.summary = updates.summary;
        }
        if (updates.location) {
          if (!rec.profile) rec.profile = {};
          rec.profile.location = updates.location;
        }
        if (email) {
          localStorage.setItem(`tag_candidate_record_${email}`, JSON.stringify(rec));
        }
        localStorage.setItem("tag_candidate_record", JSON.stringify(rec));
      }

      if (updates.avatarUrl && email) {
        localStorage.setItem(`tag_candidate_avatar_${email}`, updates.avatarUrl);
        localStorage.setItem("tag_candidate_avatar", updates.avatarUrl);
      }

      window.dispatchEvent(new CustomEvent("tag_candidate_record_updated"));
    } catch (e) {
      console.warn("Failed updating candidate profile in storage:", e);
    }
  }

  return updated;
}

export async function getSavedJobIds(): Promise<string[]> {
  await new Promise((r) => setTimeout(r, 100));
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(SAVED_JOBS_KEY);
      if (stored) {
        savedJobsState = JSON.parse(stored);
      }
    } catch {}
  }
  return [...savedJobsState];
}

export async function toggleSaveJob(jobId: string): Promise<{ saved: boolean; savedIds: string[] }> {
  await new Promise((r) => setTimeout(r, 150));
  await getSavedJobIds();
  if (savedJobsState.includes(jobId)) {
    savedJobsState = savedJobsState.filter((id) => id !== jobId);
  } else {
    savedJobsState = [...savedJobsState, jobId];
  }
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify(savedJobsState));
      window.dispatchEvent(new CustomEvent("tag_saved_jobs_updated"));
    } catch {}
  }
  return { saved: savedJobsState.includes(jobId), savedIds: [...savedJobsState] };
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

  let candidateName = "Candidate";
  let candidateEmail = "candidate@example.com";
  let candidatePhone = "+91 98450 12894";

  if (typeof window !== "undefined") {
    try {
      const rawAuth = localStorage.getItem("tag_auth_user");
      if (rawAuth) {
        const u = JSON.parse(rawAuth);
        if (u.name) candidateName = u.name;
        if (u.email) candidateEmail = u.email;
        if (u.phone) candidatePhone = u.phone;
      }
    } catch {}
  }

  return {
    fullName: candidateName,
    email: candidateEmail,
    phone: candidatePhone,
    headline: "Senior Frontend Engineer | React 19, Next.js, TypeScript & Design Systems",
    summary:
      "Product-focused Frontend Engineer with experience engineering high-performance web applications, accessible design systems, and real-time interfaces.",
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
