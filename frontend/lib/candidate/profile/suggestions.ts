// lib/candidate/profile/suggestions.ts

import { CandidateRecord, ProfileSuggestion } from "../types";

/**
 * Derives up to 3 contextual, high-priority profile improvement suggestions.
 * Each suggestion deep-links to the exact profile editor section.
 * Suggestions are resolved and removed immediately once the corresponding section is added.
 */
export function deriveProfileSuggestions(
  candidate: CandidateRecord
): ProfileSuggestion[] {
  const suggestions: ProfileSuggestion[] = [];

  const stage = candidate.discovery?.careerStage;
  const education = candidate.profile?.education || [];
  const experience = candidate.profile?.experience || [];
  const projects = candidate.profile?.projects || [];
  const skills = candidate.profile?.skills || candidate.discovery?.skills || [];
  const supportPrefs = candidate.discovery?.preferredSupport || [];
  const prefs = candidate.profile?.jobPreferences;
  const discPrefs = candidate.discovery?.workPreferences;

  // 1. Fresher / Student with no education or projects
  if (
    (stage === "student" || stage === "fresher") &&
    education.length === 0 &&
    projects.length === 0
  ) {
    suggestions.push({
      id: "sug_fresher_background",
      title: "Add your education or coursework project",
      description:
        "Freshers and graduates benefit from listing their degree, diploma, or key academic project.",
      actionLabel: "Add Education / Project",
      targetHref: "/candidate/profile",
    });
  }

  // 2. Experienced candidate with no work experience listed
  if (stage === "experienced" && experience.length === 0) {
    suggestions.push({
      id: "sug_experienced_history",
      title: "Add your recent work history",
      description:
        "Listing your previous roles and key outcomes helps calibrate seniority for engineering opportunities.",
      actionLabel: "Add Experience",
      targetHref: "/candidate/profile",
    });
  }

  // 3. Switcher with no projects showcasing new target direction
  if (stage === "switcher" && projects.length === 0) {
    suggestions.push({
      id: "sug_switcher_project",
      title: "Add a transition project",
      description:
        "A practical project demonstrates your hands-on ability in your new target technology stack.",
      actionLabel: "Add Project",
      targetHref: "/candidate/profile",
    });
  }

  // 4. Skills selected without an example or project evidence
  if (
    skills.length > 0 &&
    projects.length === 0 &&
    !candidate.discovery?.example?.text &&
    suggestions.length < 3
  ) {
    const topSkill = skills[0].name;
    suggestions.push({
      id: "sug_skill_project_evidence",
      title: `Add a project demonstrating ${topSkill}`,
      description:
        "Listing a repo or live project gives recruiters tangible proof of your reported skills.",
      actionLabel: "Add Project",
      targetHref: "/candidate/profile",
    });
  }

  // 5. Missing availability / notice period
  const hasAvailability =
    Boolean(prefs?.availability) || Boolean(discPrefs?.availability);
  if (!hasAvailability && suggestions.length < 3) {
    suggestions.push({
      id: "sug_missing_availability",
      title: "Specify your availability timeline",
      description:
        "Employers search candidates by immediate, 30-day, or exploratory availability.",
      actionLabel: "Update Preferences",
      targetHref: "/candidate/profile",
    });
  }

  // 6. CV support preference requested during discovery
  if (supportPrefs.includes("cv_support") && suggestions.length < 3) {
    suggestions.push({
      id: "sug_resume_builder",
      title: "Open your structured resume builder",
      description:
        "You requested CV guidance. Use the built-in printable resume builder to structure your experience cleanly.",
      actionLabel: "Open Resume",
      targetHref: "/candidate/resume",
    });
  }

  // 7. Missing summary
  if (!candidate.profile?.summary?.trim() && suggestions.length < 3) {
    suggestions.push({
      id: "sug_missing_summary",
      title: "Add a professional summary",
      description:
        "A concise 2–3 line summary frames your background and direction for hiring teams.",
      actionLabel: "Add Summary",
      targetHref: "/candidate/profile",
    });
  }

  // Cap at exactly 3 suggestions
  return suggestions.slice(0, 3);
}
