// types/profile.ts

export interface WorkExperience {
  id: string;
  title: string;
  company: string;
  employmentType: 'Full-time' | 'Part-time' | 'Internship' | 'Contract' | 'Freelance';
  location?: string;
  locationType?: 'On-site' | 'Hybrid' | 'Remote';
  startDate: string; // e.g., "Jun 2026"
  endDate?: string;   // e.g., "Present" or "Nov 2026"
  isCurrent: boolean;
  description?: string;
  skills?: string[];
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string; // e.g., "Sep 2022"
  endDate: string;   // e.g., "May 2025"
  grade?: string;
  description?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuingOrganization: string;
  issueDate: string; // e.g., "Mar 2026"
  expirationDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

export interface Skill {
  id: string;
  name: string;
  proficiency: 'Beginner' | 'Comfortable' | 'Advanced' | 'Expert';
}
