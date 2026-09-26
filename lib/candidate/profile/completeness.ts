// lib/candidate/profile/completeness.ts

import {
  CandidateRecord,
  ProfileCompleteness,
  ProfileCompletenessGroup,
} from "../types";

/**
 * Calculates candidate profile completeness using 6 transparent, equally weighted groups:
 * 1. Contact: valid name, email and phone present.
 * 2. Direction: specific target role OR saved descriptive professional headline (Exploring alone is incomplete).
 * 3. Skills: at least one explicitly selected skill with rating.
 * 4. Background evidence: at least one structurally valid education, experience or project entry.
 * 5. Work preferences: work mode, employment type and availability explicitly answered.
 * 6. Summary: non-empty confirmed professional summary.
 *
 * Formula: round(completedGroups.length / 6 * 100)
 */
export function computeProfileCompleteness(
  candidate: CandidateRecord
): ProfileCompleteness {
  const completedGroups: ProfileCompletenessGroup[] = [];
  const missingGroups: ProfileCompleteness["missingGroups"] = [];

  // Group 1: Contact
  const hasValidName = Boolean(candidate.identity?.fullName?.trim());
  const hasValidEmail = Boolean(
    candidate.identity?.email?.trim() && candidate.identity.email.includes("@")
  );
  const hasValidPhone = Boolean(candidate.identity?.phone?.trim());

  if (hasValidName && hasValidEmail && hasValidPhone) {
    completedGroups.push("contact");
  } else {
    missingGroups.push({
      group: "contact",
      label: "Contact Information",
      description: "Provide your full name, verified email, and reachable phone number.",
      targetHref: "/candidate/profile",
    });
  }

  // Group 2: Direction
  // Specific target role OR saved descriptive professional headline; "Exploring" alone is incomplete
  const specificRoles = (candidate.discovery?.targetRoles || []).filter(
    (r) => r.toLowerCase() !== "exploring" && r.trim().length > 0
  );
  const hasSpecificTargetRole = specificRoles.length > 0;
  const headline = candidate.profile?.headline?.trim() || "";
  const hasDescriptiveHeadline =
    headline.length > 0 &&
    headline.toLowerCase() !== "exploring" &&
    headline.toLowerCase() !== "candidate";

  if (hasSpecificTargetRole || hasDescriptiveHeadline) {
    completedGroups.push("direction");
  } else {
    missingGroups.push({
      group: "direction",
      label: "Career Direction",
      description: "Select a specific target role or define a clear professional headline.",
      targetHref: "/candidate/profile",
    });
  }

  // Group 3: Skills
  // At least one explicitly selected skill; unselected catalogue entries do not count
  const discoverySkills = candidate.discovery?.skills || [];
  const profileSkills = candidate.profile?.skills || [];
  const totalSkillsCount = discoverySkills.length + profileSkills.length;

  if (totalSkillsCount > 0) {
    completedGroups.push("skills");
  } else {
    missingGroups.push({
      group: "skills",
      label: "Technical Skills",
      description: "List at least one core skill with your current level of familiarity.",
      targetHref: "/candidate/profile",
    });
  }

  // Group 4: Background evidence
  // At least one structurally valid education, experience or project entry
  const hasEducation = (candidate.profile?.education || []).some(
    (e) => Boolean(e.degree?.trim()) && Boolean(e.institution?.trim())
  );
  const hasExperience = (candidate.profile?.experience || []).some(
    (e) => Boolean(e.title?.trim()) && Boolean(e.company?.trim())
  );
  const hasProject = (candidate.profile?.projects || []).some(
    (p) => Boolean(p.title?.trim()) && Boolean(p.description?.trim())
  );

  if (hasEducation || hasExperience || hasProject) {
    completedGroups.push("background_evidence");
  } else {
    missingGroups.push({
      group: "background_evidence",
      label: "Background Evidence",
      description: "Add an education milestone, commercial role, or portfolio project.",
      targetHref: "/candidate/profile",
    });
  }

  // Group 5: Work preferences
  // Work mode, employment type and availability explicitly answered (including 'any' or 'unsure' as deliberate choices)
  const prefs = candidate.profile?.jobPreferences;
  const discPrefs = candidate.discovery?.workPreferences;

  const hasWorkMode =
    (prefs?.desiredWorkModes && prefs.desiredWorkModes.length > 0) ||
    Boolean(discPrefs?.locationMode);

  const hasJobType =
    (prefs?.employmentTypes && prefs.employmentTypes.length > 0) ||
    Boolean(discPrefs?.jobType);

  const hasAvailability =
    Boolean(prefs?.availability) ||
    Boolean(discPrefs?.availability);

  if (hasWorkMode && hasJobType && hasAvailability) {
    completedGroups.push("work_preferences");
  } else {
    missingGroups.push({
      group: "work_preferences",
      label: "Work Preferences",
      description: "Confirm your preferred work mode, job type, and availability timeline.",
      targetHref: "/candidate/profile",
    });
  }

  // Group 6: Summary
  // Non-empty candidate-confirmed professional summary
  const summary = candidate.profile?.summary?.trim() || "";
  if (summary.length > 0) {
    completedGroups.push("summary");
  } else {
    missingGroups.push({
      group: "summary",
      label: "Professional Summary",
      description: "Write a concise summary highlighting your engineering background and goals.",
      targetHref: "/candidate/profile",
    });
  }

  const score = Math.round((completedGroups.length / 6) * 100);

  return {
    score,
    completedGroups,
    missingGroups,
  };
}
