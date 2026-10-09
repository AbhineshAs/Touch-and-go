export interface OrganizationProfile {
  id: string;
  name: string;
  legalEntityName: string;
  isVerified: boolean;
  industry: string;
  companySize?: string; // e.g., "150–250 employees"
  logoUrl: string | null;
  tagline: string;
  about: string;
  headquarters: string;
  website: string;
  contactEmail: string;
  contactPhone: string;
  linkedinUrl?: string;
  twitterUrl?: string;
}
