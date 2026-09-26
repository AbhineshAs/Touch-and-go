// lib/candidate/fixtures.ts

import { ConfirmedProfile, DiscoveryDraft, IdentityDraft } from "./types";

// Persona A: Fresher, few interview calls, React skills, CV support, 1-3 hours
export const PERSONA_A_DRAFT: DiscoveryDraft = {
  careerStage: "fresher",
  stageBackground: { type: "student", educationOrProject: "B.Tech CS graduate" },
  primaryGoal: "first_job",
  targetRoles: ["Frontend Engineer"],
  challenges: ["few_interview_calls"],
  primaryChallenge: "few_interview_calls",
  challengeFollowUp: {
    challenge: "few_interview_calls",
    supportPreference: "cv",
    additionalContext: "Sending 20+ applications per week but getting zero callbacks.",
  },
  skills: [
    { name: "React", level: "comfortable" },
    { name: "JavaScript", level: "confident" },
    { name: "HTML & CSS", level: "comfortable" },
  ],
  strengths: ["problem_solving", "attention_to_detail"],
  preferredSupport: ["cv_support"],
  timeBudget: "1_to_3_hours",
};

export const PERSONA_A_PROFILE: ConfirmedProfile = {
  revision: 1,
  schemaVersion: "1.0.0",
  confirmedAt: "2026-09-18T10:00:00Z",
  discovery: PERSONA_A_DRAFT,
};

// Persona B: Experienced candidate, technical interview challenge, technical follow-up
export const PERSONA_B_DRAFT: DiscoveryDraft = {
  careerStage: "experienced",
  stageBackground: { type: "experienced", experienceBand: "3-5", recentRole: "Software Engineer" },
  primaryGoal: "change_role",
  targetRoles: ["Backend Engineer"],
  challenges: ["interview_prep"],
  primaryChallenge: "interview_prep",
  challengeFollowUp: {
    challenge: "interview_prep",
    interviewStage: "technical",
    additionalContext: "Get nervous during live system design and coding whiteboard sessions.",
  },
  skills: [
    { name: "Python", level: "confident" },
    { name: "FastAPI", level: "comfortable" },
    { name: "PostgreSQL", level: "comfortable" },
  ],
  strengths: ["problem_solving", "independent_learning"],
  preferredSupport: ["interview_practice"],
  timeBudget: "3_to_5_hours",
};

export const PERSONA_B_PROFILE: ConfirmedProfile = {
  revision: 1,
  schemaVersion: "1.0.0",
  confirmedAt: "2026-09-18T10:00:00Z",
  discovery: PERSONA_B_DRAFT,
};

// Persona C: Career switcher, unclear direction, exploration support
export const PERSONA_C_DRAFT: DiscoveryDraft = {
  careerStage: "switcher",
  stageBackground: { type: "switcher", previousField: "Operations Manager", targetDirection: "Full Stack" },
  primaryGoal: "explore_careers",
  targetRoles: ["Exploring All Roles"],
  challenges: ["unclear_direction", "career_transition"],
  primaryChallenge: "unclear_direction",
  challengeFollowUp: {
    challenge: "unclear_direction",
    interestedFields: ["Frontend", "Data Analytics"],
  },
  skills: [{ name: "Python", level: "learning" }],
  strengths: ["organization", "communication"],
  preferredSupport: ["career_exploration"],
  timeBudget: "1_to_3_hours",
};

export const PERSONA_C_PROFILE: ConfirmedProfile = {
  revision: 1,
  schemaVersion: "1.0.0",
  confirmedAt: "2026-09-18T10:00:00Z",
  discovery: PERSONA_C_DRAFT,
};

// Persona D: Prefer not to say / sparse answers
export const PERSONA_D_DRAFT: DiscoveryDraft = {
  careerStage: "student",
  primaryGoal: undefined,
  targetRoles: ["Exploring All Roles"],
  challenges: ["prefer_not_to_say"],
  primaryChallenge: "prefer_not_to_say",
  skills: [],
  isExploringSkills: true,
  strengths: ["not_sure_yet"],
  preferredSupport: ["no_preference"],
  timeBudget: "unsure",
};

export const PERSONA_D_PROFILE: ConfirmedProfile = {
  revision: 1,
  schemaVersion: "1.0.0",
  confirmedAt: "2026-09-18T10:00:00Z",
  discovery: PERSONA_D_DRAFT,
};
