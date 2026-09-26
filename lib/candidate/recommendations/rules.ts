// lib/candidate/recommendations/rules.ts

import {
  ConfirmedProfile,
  Recommendation,
  SupportType,
} from "../types";
import { ACTIVITIES_CATALOGUE } from "../activities/catalogue";

export interface EvaluationContext {
  profile: ConfirmedProfile;
  primaryChallenge?: string;
  primaryGoal?: string;
  careerStage?: string;
  learningSkillSubject?: string;
}

export interface RuleDefinition {
  id: string; // e.g. "R01"
  name: string;
  applies: (ctx: EvaluationContext) => boolean;
  generate: (ctx: EvaluationContext) => Recommendation | null;
}

export function extractEvaluationContext(profile: ConfirmedProfile): EvaluationContext {
  const { discovery } = profile;
  const primaryChallenge =
    discovery.primaryChallenge || (discovery.challenges && discovery.challenges.length > 0 ? discovery.challenges[0] : undefined);
  const primaryGoal = discovery.primaryGoal;
  const careerStage = discovery.careerStage;

  let learningSkillSubject = "your target skill";
  if (
    discovery.challengeFollowUp &&
    discovery.challengeFollowUp.challenge === "skills_to_develop" &&
    discovery.challengeFollowUp.targetSkill
  ) {
    learningSkillSubject = discovery.challengeFollowUp.targetSkill.trim();
  } else if (discovery.skills && discovery.skills.length > 0) {
    const focusSkill = discovery.skills.find(
      (s) => s.level === "learning" || s.level === "new"
    ) || discovery.skills[0];
    if (focusSkill) {
      learningSkillSubject = focusSkill.name.trim();
    }
  }

  return {
    profile,
    primaryChallenge,
    primaryGoal,
    careerStage,
    learningSkillSubject,
  };
}

export const RECOMMENDATION_RULES: RuleDefinition[] = [
  // R01: Direction unclear or goal is career exploration
  {
    id: "R01",
    name: "Unclear Direction / Career Exploration",
    applies: (ctx) =>
      ctx.primaryChallenge === "unclear_direction" ||
      ctx.primaryGoal === "explore_careers",
    generate: (ctx) => {
      const activity = ACTIVITIES_CATALOGUE["act-role-comparison"];
      if (!activity) return null;

      const sources: string[] = [];
      if (ctx.primaryChallenge === "unclear_direction") sources.push("Q04:unclear_direction");
      if (ctx.primaryGoal === "explore_careers") sources.push("Q02:explore_careers");

      return {
        id: "rec-role-comparison",
        ruleIds: ["R01"],
        activityId: activity.id,
        supportCategory: "career_exploration",
        title: "Compare Two Target Career Paths",
        benefit: "Clarify which technical stack and daily responsibilities match your interests before committing deep study.",
        rationale:
          "You shared that your direction is unclear or that exploring careers is your primary focus. Comparing two possible paths side-by-side provides immediate clarity.",
        sourceAnswerIds: sources,
        estimatedDurationMinutes: activity.totalMinutes,
        inputRevision: ctx.profile.revision,
      };
    },
  },

  // R02: Few interview calls with CV or unsure follow-up
  {
    id: "R02",
    name: "Few Interview Calls — CV Review",
    applies: (ctx) => {
      if (ctx.primaryChallenge !== "few_interview_calls") return false;
      const followUp = ctx.profile.discovery.challengeFollowUp;
      if (!followUp || followUp.challenge !== "few_interview_calls") return true;
      return followUp.supportPreference === "cv" || followUp.supportPreference === "unsure";
    },
    generate: (ctx) => {
      const activity = ACTIVITIES_CATALOGUE["act-cv-review"];
      if (!activity) return null;

      const sources = ["Q04:few_interview_calls"];
      const followUp = ctx.profile.discovery.challengeFollowUp;
      if (followUp && followUp.challenge === "few_interview_calls") {
        sources.push(`Q06:${followUp.supportPreference}`);
      }

      return {
        id: "rec-cv-review",
        ruleIds: ["R02"],
        activityId: activity.id,
        supportCategory: "cv_support",
        title: "Review CV Presentation & Impact",
        benefit: "Ensure your projects and technical skills are structured with measurable outcomes, without rewriting your actual experience.",
        rationale:
          "You noted receiving few interview invitations and indicated CV support would be helpful. This checklist ensures your proof of work is presented with maximum clarity.",
        sourceAnswerIds: sources,
        estimatedDurationMinutes: activity.totalMinutes,
        inputRevision: ctx.profile.revision,
      };
    },
  },

  // R03: Few interview calls with targeting follow-up
  {
    id: "R03",
    name: "Few Interview Calls — Role Targeting",
    applies: (ctx) => {
      if (ctx.primaryChallenge !== "few_interview_calls") return false;
      const followUp = ctx.profile.discovery.challengeFollowUp;
      return Boolean(followUp && followUp.challenge === "few_interview_calls" && followUp.supportPreference === "targeting");
    },
    generate: (ctx) => {
      const activity = ACTIVITIES_CATALOGUE["act-role-mapping"];
      if (!activity) return null;

      return {
        id: "rec-role-mapping",
        ruleIds: ["R03"],
        activityId: activity.id,
        supportCategory: "cv_support",
        title: "Role-to-Experience Alignment Worksheet",
        benefit: "Audit how well your coursework and projects directly demonstrate the requirements of roles you are targeting.",
        rationale:
          "You highlighted receiving few interview calls and chose role targeting as your immediate focus. Mapping your projects to active job criteria reveals exact alignment.",
        sourceAnswerIds: ["Q04:few_interview_calls", "Q06:targeting"],
        estimatedDurationMinutes: activity.totalMinutes,
        inputRevision: ctx.profile.revision,
      };
    },
  },

  // R04: Interview challenge
  {
    id: "R04",
    name: "Interview Preparation",
    applies: (ctx) =>
      ctx.primaryChallenge === "interview_prep" ||
      ctx.primaryGoal === "interview_prep",
    generate: (ctx) => {
      const activity = ACTIVITIES_CATALOGUE["act-interview-practice"];
      if (!activity) return null;

      const sources: string[] = [];
      if (ctx.primaryChallenge === "interview_prep") sources.push("Q04:interview_prep");
      if (ctx.primaryGoal === "interview_prep") sources.push("Q02:interview_prep");

      let stageDetail = "";
      const followUp = ctx.profile.discovery.challengeFollowUp;
      if (followUp && followUp.challenge === "interview_prep") {
        sources.push(`Q06:${followUp.interviewStage}`);
        stageDetail = ` specifically for ${followUp.interviewStage.replace(/_/g, " ")}`;
      }

      return {
        id: "rec-interview-practice",
        ruleIds: ["R04"],
        activityId: activity.id,
        supportCategory: "interview_practice",
        title: "Structured Interview Practice & Reflection",
        benefit: "Draft and refine structured responses using the STAR method so you communicate technical depth with confidence.",
        rationale: `You noted that interview preparation${stageDetail} is a priority. Practicing key question scenarios strengthens your ability to articulate technical decisions.`,
        sourceAnswerIds: sources,
        estimatedDurationMinutes: activity.totalMinutes,
        inputRevision: ctx.profile.revision,
      };
    },
  },

  // R05: Candidate names a learning target
  {
    id: "R05",
    name: "Targeted Skill Sprint",
    applies: (ctx) =>
      ctx.primaryChallenge === "skills_to_develop" ||
      ctx.primaryGoal === "build_skills",
    generate: (ctx) => {
      const activity = ACTIVITIES_CATALOGUE["act-skill-exercise"];
      if (!activity) return null;

      const skill = ctx.learningSkillSubject || "your focus technology";
      const sources: string[] = [];
      if (ctx.primaryChallenge === "skills_to_develop") sources.push("Q04:skills_to_develop");
      if (ctx.primaryGoal === "build_skills") sources.push("Q02:build_skills");

      return {
        id: `rec-skill-${skill.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
        ruleIds: ["R05"],
        activityId: activity.id,
        subjectId: skill.toLowerCase(),
        supportCategory: "learning_plan",
        title: `Targeted ${skill} Sprint & Practice`,
        benefit: `Reinforce hands-on mental models and solve runnable exercises in ${skill}.`,
        rationale: `You identified ${skill} as a key skill you want to develop. This guided sprint provides structured exercises directly tied to that objective.`,
        sourceAnswerIds: sources,
        estimatedDurationMinutes: activity.totalMinutes,
        inputRevision: ctx.profile.revision,
      };
    },
  },

  // R06: Project experience challenge and no example
  {
    id: "R06",
    name: "Build Proof-of-Work Project",
    applies: (ctx) => {
      if (ctx.primaryChallenge !== "limited_projects") return false;
      const followUp = ctx.profile.discovery.challengeFollowUp;
      if (followUp && followUp.challenge === "limited_projects") {
        return followUp.hasExistingProject === "no" || followUp.hasExistingProject === "unsure";
      }
      return !ctx.profile.discovery.example;
    },
    generate: (ctx) => {
      const activity = ACTIVITIES_CATALOGUE["act-project-brief"];
      if (!activity) return null;

      return {
        id: "rec-project-brief",
        ruleIds: ["R06"],
        activityId: activity.id,
        supportCategory: "project_ideas",
        title: "End-to-End Project Brief & Milestones",
        benefit: "Build a demonstrable portfolio feature that shows engineering teams you can build beyond basic tutorial code.",
        rationale:
          "You noted having limited project experience and want to build a tangible project. This brief guides you from scope to verifiable milestone commits.",
        sourceAnswerIds: ["Q04:limited_projects"],
        estimatedDurationMinutes: activity.totalMinutes,
        inputRevision: ctx.profile.revision,
      };
    },
  },

  // R07: Project experience challenge and existing example
  {
    id: "R07",
    name: "Project Documentation & Polish",
    applies: (ctx) => {
      if (ctx.primaryChallenge !== "limited_projects") return false;
      const followUp = ctx.profile.discovery.challengeFollowUp;
      if (followUp && followUp.challenge === "limited_projects") {
        return followUp.hasExistingProject === "yes";
      }
      return Boolean(ctx.profile.discovery.example);
    },
    generate: (ctx) => {
      const activity = ACTIVITIES_CATALOGUE["act-project-docs"];
      if (!activity) return null;

      return {
        id: "rec-project-docs",
        ruleIds: ["R07"],
        activityId: activity.id,
        supportCategory: "project_ideas",
        title: "Project Documentation & Narrative Checklist",
        benefit: "Transform existing code into a compelling case study with architecture notes, trade-offs, and clear setup steps.",
        rationale:
          "You mentioned having existing projects and want to make them easier to explain. A clear README and architecture narrative make your work stand out immediately.",
        sourceAnswerIds: ["Q04:limited_projects"],
        estimatedDurationMinutes: activity.totalMinutes,
        inputRevision: ctx.profile.revision,
      };
    },
  },

  // R08: Career transition challenge or switcher goal
  {
    id: "R08",
    name: "Transferable Skills Translation",
    applies: (ctx) =>
      ctx.primaryChallenge === "career_transition" ||
      ctx.primaryGoal === "return_to_work" ||
      ctx.careerStage === "switcher",
    generate: (ctx) => {
      const activity = ACTIVITIES_CATALOGUE["act-transferable-skills"];
      if (!activity) return null;

      const sources: string[] = [];
      if (ctx.primaryChallenge === "career_transition") sources.push("Q04:career_transition");
      if (ctx.careerStage === "switcher") sources.push("Q01:switcher");
      if (ctx.primaryGoal === "return_to_work") sources.push("Q02:return_to_work");

      return {
        id: "rec-transferable-skills",
        ruleIds: ["R08"],
        activityId: activity.id,
        supportCategory: "career_exploration",
        title: "Transferable Skills Translation Worksheet",
        benefit: "Frame prior non-technical or domain accomplishments into software engineering capabilities that hiring managers value.",
        rationale:
          "You are navigating a career transition into tech. This worksheet helps translate your previous achievements into relevant problem-solving and collaboration signals.",
        sourceAnswerIds: sources,
        estimatedDurationMinutes: activity.totalMinutes,
        inputRevision: ctx.profile.revision,
      };
    },
  },

  // R09: Difficulty finding suitable openings
  {
    id: "R09",
    name: "Search Preferences & Filter Checklist",
    applies: (ctx) => ctx.primaryChallenge === "suitable_openings",
    generate: (ctx) => {
      const activity = ACTIVITIES_CATALOGUE["act-search-preferences"];
      if (!activity) return null;

      return {
        id: "rec-search-preferences",
        ruleIds: ["R09"],
        activityId: activity.id,
        supportCategory: "opportunity_search",
        title: "Job Search Criteria & Screening Checklist",
        benefit: "Focus your energy on verified openings that genuinely match your tech stack and location preferences.",
        rationale:
          "You shared that finding suitable openings is your primary difficulty. Setting strict screening criteria and targeting high-signal job boards avoids wasted effort.",
        sourceAnswerIds: ["Q04:suitable_openings"],
        estimatedDurationMinutes: activity.totalMinutes,
        inputRevision: ctx.profile.revision,
      };
    },
  },

  // R10: Explicit support preference with no matching challenge rule
  {
    id: "R10",
    name: "Explicit Support Match",
    applies: (ctx) => {
      const prefs = ctx.profile.discovery.preferredSupport || [];
      return prefs.some((p) => p !== "no_preference");
    },
    generate: (ctx) => {
      const prefs = ctx.profile.discovery.preferredSupport || [];
      const validPref = prefs.find((p) => p !== "no_preference");
      if (!validPref) return null;

      let targetActivityId = "act-cv-review";
      if (validPref === "career_exploration") targetActivityId = "act-role-comparison";
      else if (validPref === "cv_support") targetActivityId = "act-cv-review";
      else if (validPref === "project_ideas") targetActivityId = "act-project-brief";
      else if (validPref === "learning_plan") targetActivityId = "act-skill-exercise";
      else if (validPref === "interview_practice") targetActivityId = "act-interview-practice";
      else if (validPref === "opportunity_search") targetActivityId = "act-search-preferences";

      const activity = ACTIVITIES_CATALOGUE[targetActivityId];
      if (!activity) return null;

      return {
        id: `rec-support-${activity.id}`,
        ruleIds: ["R10"],
        activityId: activity.id,
        supportCategory: validPref,
        title: activity.title,
        benefit: activity.description,
        rationale: `You explicitly selected ${validPref.replace(/_/g, " ")} as a preferred format of support.`,
        sourceAnswerIds: [`Q10:${validPref}`],
        estimatedDurationMinutes: activity.totalMinutes,
        inputRevision: ctx.profile.revision,
      };
    },
  },

  // R11: Neutral focus picker fallback
  {
    id: "R11",
    name: "Neutral Focus Picker Fallback",
    applies: () => true, // Fallback always valid
    generate: (ctx) => {
      const activity = ACTIVITIES_CATALOGUE["act-focus-picker"];
      if (!activity) return null;

      return {
        id: "rec-focus-picker",
        ruleIds: ["R11"],
        activityId: activity.id,
        supportCategory: "career_exploration",
        title: "Select Your Career Exploration Focus",
        benefit: "Pick a single low-stakes topic to investigate at your own pace without pressure.",
        rationale:
          "You are exploring or prefer not to specify constraints right now. This neutral focus picker lets you choose a manageable starting area.",
        sourceAnswerIds: ["Q11:sparse_data"],
        estimatedDurationMinutes: activity.totalMinutes,
        inputRevision: ctx.profile.revision,
      };
    },
  },
];
