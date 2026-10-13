import { OrganizationProfile } from "@/types/organization";

export const DEFAULT_ORGANIZATION_PROFILE: OrganizationProfile = {
  id: "org_razorwave",
  name: "RazorWave Technologies",
  legalEntityName: "RazorWave Technologies Private Limited",
  isVerified: true,
  industry: "Enterprise Cloud & Software",
  companySize: "150–250 employees",
  logoUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=120&auto=format&fit=crop&q=80",
  tagline: "Enterprise Cloud, Full-Stack Architecture & High-Performance Distributed Systems.",
  about:
    "RazorWave Technologies is an enterprise cloud and software architecture leader building robust infrastructure, microservices, and AI-enabled platforms for global business operations.",
  headquarters: "Bengaluru, Karnataka, India",
  website: "https://www.razorwave.com",
  contactEmail: "recruitment@razorwave.com",
  contactPhone: "+91 80 4123 4567",
  linkedinUrl: "https://www.linkedin.com/company/razorwave-tech",
  twitterUrl: "https://twitter.com/razorwavetech",
};

export const ORGANIZATION_INDUSTRIES = [
  "Enterprise Cloud & Software",
  "Artificial Intelligence & ML",
  "Fintech & Payments",
  "E-commerce & Retail Tech",
  "Healthcare & Life Sciences",
  "EdTech & Future of Work",
  "Cybersecurity & Data Privacy",
  "Digital Media & Entertainment",
  "Logistics & Supply Chain Tech",
  "Other / Diversified Tech",
];

export const COMPANY_SIZE_OPTIONS = [
  "1–10 employees",
  "11–50 employees",
  "51–150 employees",
  "150–250 employees",
  "250–500 employees",
  "500–1000 employees",
  "1000+ employees",
];

export const ORG_PROFILE_UPDATED_EVENT = "tag_org_profile_updated";

const STORAGE_PREFIX = "tag_org_profile_";

/**
 * In-memory fallback cache for SSR or test environments without localStorage
 */
let memoryCache: Record<string, OrganizationProfile> = {
  [DEFAULT_ORGANIZATION_PROFILE.id]: { ...DEFAULT_ORGANIZATION_PROFILE },
};

export function getOrganizationProfile(orgId: string = "org_razorwave"): OrganizationProfile {
  if (typeof window !== "undefined") {
    try {
      let stored = localStorage.getItem(`${STORAGE_PREFIX}${orgId}`);
      if (!stored) {
        stored =
          localStorage.getItem(`${STORAGE_PREFIX}org_razorwave`) ||
          localStorage.getItem(`${STORAGE_PREFIX}org_whitetrack`);
      }
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...DEFAULT_ORGANIZATION_PROFILE,
          ...parsed,
        };
      }
    } catch (e) {
      console.warn("Failed to load organization profile from localStorage:", e);
    }
  }

  const cached =
    memoryCache[orgId] || memoryCache["org_razorwave"] || memoryCache["org_whitetrack"];
  return cached ? { ...cached } : { ...DEFAULT_ORGANIZATION_PROFILE, id: orgId };
}

export function saveOrganizationProfile(profile: OrganizationProfile): OrganizationProfile {
  const updated = { ...profile };
  memoryCache[profile.id] = { ...updated };
  memoryCache["org_razorwave"] = { ...updated };
  memoryCache["org_whitetrack"] = { ...updated };

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${profile.id}`, JSON.stringify(updated));
      localStorage.setItem(`${STORAGE_PREFIX}org_razorwave`, JSON.stringify(updated));
      localStorage.setItem(`${STORAGE_PREFIX}org_whitetrack`, JSON.stringify(updated));
      localStorage.setItem("tag_org_profile", JSON.stringify(updated));

      // Sync jobs with new organization branding
      const rawJobs = localStorage.getItem("tag_jobs_storage");
      if (rawJobs) {
        try {
          const parsedJobs = JSON.parse(rawJobs);
          const updatedJobs = parsedJobs.map((j: any) => ({
            ...j,
            organizationLogo: updated.logoUrl !== undefined ? updated.logoUrl : j.organizationLogo,
            organizationName: updated.name || j.organizationName,
          }));
          localStorage.setItem("tag_jobs_storage", JSON.stringify(updatedJobs));
          window.dispatchEvent(new CustomEvent("tag_jobs_updated", { detail: updatedJobs }));
        } catch {}
      }
    } catch (e) {
      console.warn("Failed to save organization profile to localStorage:", e);
    }
    window.dispatchEvent(
      new CustomEvent(ORG_PROFILE_UPDATED_EVENT, { detail: updated })
    );
    window.dispatchEvent(
      new CustomEvent("tag_org_update", {
        detail: { logoUrl: updated.logoUrl, name: updated.name },
      })
    );
    window.dispatchEvent(new Event("storage"));
  }

  return updated;
}

export function updateOrganizationLogo(orgId: string, logoUrl: string | null): OrganizationProfile {
  const current = getOrganizationProfile(orgId);
  const updated: OrganizationProfile = {
    ...current,
    logoUrl,
  };
  return saveOrganizationProfile(updated);
}

