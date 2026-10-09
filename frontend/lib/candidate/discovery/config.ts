// lib/candidate/discovery/config.ts

import {
  CareerStage,
  PrimaryGoal,
  ChallengeId,
  StrengthId,
  SupportType,
  TimeBudget,
} from "../types";

export interface OptionItem<T extends string = string> {
  id: T;
  label: string;
  description?: string;
}

export const CAREER_STAGE_OPTIONS: OptionItem<CareerStage>[] = [
  {
    id: "student",
    label: "Student",
    description: "Currently enrolled in high school, college, or university.",
  },
  {
    id: "fresher",
    label: "Fresher / Recent Graduate",
    description: "Graduated recently and stepping into the technology workforce.",
  },
  {
    id: "experienced",
    label: "Experienced Professional",
    description: "Currently or recently working in tech and looking for the next step.",
  },
  {
    id: "switcher",
    label: "Career Switcher",
    description: "Transitioning into technology from another industry or functional domain.",
  },
];

export const PRIMARY_GOAL_OPTIONS: OptionItem<PrimaryGoal>[] = [
  { id: "explore_careers", label: "Explore career paths", description: "Discover which tech paths align with my interests" },
  { id: "first_job", label: "Land my first tech role", description: "Secure an entry-level position or internship" },
  { id: "change_role", label: "Change role or level up", description: "Move to a senior position, different tech stack, or new specialty" },
  { id: "interview_prep", label: "Prepare for upcoming interviews", description: "Practice technical and behavioral interview formats" },
  { id: "build_skills", label: "Build targeted skills", description: "Focus on developing concrete tools, frameworks, and techniques" },
  { id: "return_to_work", label: "Return to the workforce", description: "Re-enter the industry after a career break" },
  { id: "other", label: "Other goal", description: "A specific personal career objective" },
];

export const COMMON_TECH_ROLES: string[] = [
  "Frontend Engineer",
  "Backend Engineer",
  "Full Stack Engineer",
  "Data Engineer",
  "Data Scientist / AI Specialist",
  "DevOps / Cloud Engineer",
  "Mobile Engineer (iOS/Android)",
  "QA / Automation Engineer",
  "Product Designer (UI/UX)",
  "Engineering Manager",
];

export const CHALLENGE_OPTIONS: OptionItem<ChallengeId>[] = [
  { id: "unclear_direction", label: "Unclear direction", description: "Not sure which role, domain, or specialty to pursue" },
  { id: "few_interview_calls", label: "Few interview calls", description: "Submitting applications but not getting invited to interviews" },
  { id: "interview_prep", label: "Interview preparation", description: "Anxious or uncertain about technical or behavioral stages" },
  { id: "skills_to_develop", label: "Skills I want to develop", description: "Need to bridge specific technical knowledge gaps" },
  { id: "limited_projects", label: "Limited project experience", description: "Lack demonstrable proof-of-work or portfolio projects" },
  { id: "career_transition", label: "Career transition", description: "Hard to communicate previous non-tech experience effectively" },
  { id: "suitable_openings", label: "Finding suitable openings", description: "Struggling to find roles matching my location, stack, or level" },
  { id: "other", label: "Other challenge", description: "A different roadblock in my journey" },
  { id: "nothing_specific", label: "Nothing specific right now", description: "Things are moving along without major blockers" },
  { id: "prefer_not_to_say", label: "Prefer not to say", description: "Keep challenges private" },
];

export const COMMON_SKILLS: string[] = [
  "JavaScript",
  "TypeScript",
  "React",
  "Node.js",
  "Python",
  "SQL",
  "Git & GitHub",
  "HTML & CSS",
  "Next.js",
  "Docker",
  "REST APIs",
  "Java",
  "Tailwind CSS",
  "PostgreSQL",
  "AWS",
  "GraphQL",
];

export const STRENGTH_OPTIONS: OptionItem<StrengthId>[] = [
  { id: "problem_solving", label: "Problem Solving", description: "Breaking down ambiguous challenges methodically" },
  { id: "communication", label: "Clear Communication", description: "Explaining technical concepts and ideas effectively" },
  { id: "teamwork", label: "Collaboration & Teamwork", description: "Working smoothly across diverse peer groups" },
  { id: "organization", label: "Organization & Planning", description: "Managing time, milestones, and project structure" },
  { id: "creativity", label: "Creative Thinking", description: "Finding novel, pragmatic solutions to difficult issues" },
  { id: "independent_learning", label: "Independent Learning", description: "Picking up new frameworks and stacks autonomously" },
  { id: "attention_to_detail", label: "Attention to Detail", description: "Writing clean, tested code and verifying edge cases" },
  { id: "other", label: "Other strength", description: "A unique personal quality" },
  { id: "not_sure_yet", label: "Not sure yet", description: "Still discovering my core strengths" },
];

export const SUPPORT_TYPE_OPTIONS: OptionItem<SupportType>[] = [
  { id: "career_exploration", label: "Career exploration", description: "Compare trajectories, expectations, and role criteria" },
  { id: "cv_support", label: "CV & resume review", description: "Strengthen how experience and skills are structured" },
  { id: "project_ideas", label: "Project ideas & briefs", description: "Step-by-step guides to build portfolio-grade projects" },
  { id: "learning_plan", label: "Learning roadmap", description: "Structured exercises for high-priority technical tools" },
  { id: "interview_practice", label: "Interview practice", description: "Interactive prompts and self-evaluation rubrics" },
  { id: "opportunity_search", label: "Search & filtering guidance", description: "Strategies to identify verified openings that fit" },
  { id: "no_preference", label: "No preference", description: "Open to any helpful recommendation" },
];

export const TIME_BUDGET_OPTIONS: OptionItem<TimeBudget>[] = [
  { id: "under_1_hour", label: "Under 1 hour / week", description: "Quick, focused micro-tasks (capped at 45 mins total)" },
  { id: "1_to_3_hours", label: "1 to 3 hours / week", description: "A steady pace of weekly exercises (capped at 120 mins)" },
  { id: "3_to_5_hours", label: "3 to 5 hours / week", description: "Dedicated progress on projects and study (capped at 180 mins)" },
  { id: "over_5_hours", label: "Over 5 hours / week", description: "Intensive preparation and development (capped at 240 mins)" },
  { id: "unsure", label: "Unsure right now", description: "We'll suggest one lightweight 15-minute starter activity" },
];

export interface DiscoveryStepMeta {
  index: number;
  id: string;
  title: string;
  subtitle: string;
  isOptional: boolean;
  section: "About you" | "Your challenges" | "Your strengths" | "Your plan";
}

export const DISCOVERY_STEPS: DiscoveryStepMeta[] = [
  {
    index: 1,
    id: "career_stage",
    title: "Where are you in your career?",
    subtitle: "This helps calibrate our guidance to your current background.",
    isOptional: false,
    section: "About you",
  },
  {
    index: 2,
    id: "primary_goal",
    title: "What would you like to achieve next?",
    subtitle: "Select the primary milestone you want to focus on.",
    isOptional: false,
    section: "About you",
  },
  {
    index: 3,
    id: "target_roles",
    title: "Which roles interest you?",
    subtitle: "Choose up to three roles you are targeting or curious about.",
    isOptional: false,
    section: "About you",
  },
  {
    index: 4,
    id: "challenges",
    title: "What is making that difficult right now?",
    subtitle: "Select up to three challenges, or choose 'Nothing specific' / 'Prefer not to say'.",
    isOptional: false,
    section: "Your challenges",
  },
  {
    index: 5,
    id: "primary_challenge",
    title: "Which would you like to work on first?",
    subtitle: "Choose the single challenge that feels most urgent to address.",
    isOptional: false,
    section: "Your challenges",
  },
  {
    index: 6,
    id: "challenge_followup",
    title: "Tell us a little more about that",
    subtitle: "Optional follow-up to narrow down the most useful starting activity.",
    isOptional: true,
    section: "Your challenges",
  },
  {
    index: 7,
    id: "skills",
    title: "Which skills do you feel comfortable using?",
    subtitle: "Add up to 10 skills with your honest self-assessed familiarity, or select 'Still exploring'.",
    isOptional: false,
    section: "Your strengths",
  },
  {
    index: 8,
    id: "strengths",
    title: "What do you consider your strengths?",
    subtitle: "Choose up to 3 areas where you naturally excel, or 'Not sure yet'.",
    isOptional: true,
    section: "Your strengths",
  },
  {
    index: 9,
    id: "example",
    title: "Can you share a brief example?",
    subtitle: "Optional: share a project, task, or coursework moment demonstrating a skill or strength.",
    isOptional: true,
    section: "Your strengths",
  },
  {
    index: 10,
    id: "preferred_support",
    title: "What support would be most useful?",
    subtitle: "Choose up to two formats you'd prefer to engage with.",
    isOptional: false,
    section: "Your plan",
  },
  {
    index: 11,
    id: "time_budget",
    title: "What time can you realistically spend each week?",
    subtitle: "We'll build a 7-day action plan that fits strictly inside this budget.",
    isOptional: false,
    section: "Your plan",
  },
  {
    index: 12,
    id: "work_preferences",
    title: "What should recommendations fit around?",
    subtitle: "Optional preferences for work mode, availability, and learning style.",
    isOptional: true,
    section: "Your plan",
  },
];
