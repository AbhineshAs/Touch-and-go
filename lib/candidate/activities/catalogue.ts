// lib/candidate/activities/catalogue.ts

import { Activity } from "../types";

export const ACTIVITIES_CATALOGUE: Record<string, Activity> = {
  "act-role-comparison": {
    id: "act-role-comparison",
    title: "Compare Two Target Career Paths",
    category: "career_exploration",
    description:
      "A structured worksheet to evaluate day-to-day responsibilities, required technical skills, and trade-offs between two roles before committing deep focus.",
    totalMinutes: 30,
    interactiveType: "role_comparison",
    steps: [
      {
        id: "step1",
        title: "Define core comparison criteria",
        description: "Select two roles you are considering and note what attracts you to each.",
        estimatedMinutes: 10,
      },
      {
        id: "step2",
        title: "Compare day-to-day work & stacks",
        description: "Contrast the primary frameworks, team interactions, and typical tickets.",
        estimatedMinutes: 10,
      },
      {
        id: "step3",
        title: "Synthesize immediate priority",
        description: "Decide which path to prioritize for the next 30 days based on current strengths.",
        estimatedMinutes: 10,
      },
    ],
  },

  "act-cv-review": {
    id: "act-cv-review",
    title: "Review CV Presentation & Impact",
    category: "cv_support",
    description:
      "A systematic checklist to ensure your CV communicates measurable outcomes, clean typography, and relevant technical capabilities without generic fluff.",
    totalMinutes: 35,
    interactiveType: "cv_checklist",
    steps: [
      {
        id: "step1",
        title: "Audit action verbs & impact metrics",
        description: "Check that each experience bullet uses strong verbs and measurable context (e.g. reduced load time by 20%).",
        estimatedMinutes: 15,
      },
      {
        id: "step2",
        title: "Verify technical skills grouping",
        description: "Organize languages, frameworks, and developer tools into logical, honest clusters.",
        estimatedMinutes: 10,
      },
      {
        id: "step3",
        title: "Scan formatting & layout clarity",
        description: "Ensure single-column or clean two-column readability, consistent dates, and zero typos.",
        estimatedMinutes: 10,
      },
    ],
  },

  "act-role-mapping": {
    id: "act-role-mapping",
    title: "Role-to-Experience Alignment Worksheet",
    category: "cv_support",
    description:
      "Map your existing skills, academic projects, or past work directly against the requirements of roles you are actively targeting.",
    totalMinutes: 30,
    interactiveType: "role_mapping",
    steps: [
      {
        id: "step1",
        title: "Extract key job requirements",
        description: "List 3–5 recurring expectations from recent job specifications in your target area.",
        estimatedMinutes: 10,
      },
      {
        id: "step2",
        title: "Match current proof of work",
        description: "Identify which personal projects or coursework directly demonstrate each requirement.",
        estimatedMinutes: 10,
      },
      {
        id: "step3",
        title: "Formulate bridging actions",
        description: "Pinpoint any single missing element you can build or document this week.",
        estimatedMinutes: 10,
      },
    ],
  },

  "act-interview-practice": {
    id: "act-interview-practice",
    title: "Structured Interview Practice & Reflection",
    category: "interview_practice",
    description:
      "Interactive prompts calibrated to your selected interview stage (technical, introductory, or behavioral) using the STAR storytelling framework.",
    totalMinutes: 40,
    interactiveType: "interview_prompts",
    steps: [
      {
        id: "step1",
        title: "Formulate your narrative",
        description: "Outline concise responses to common questions for your specific interview stage.",
        estimatedMinutes: 15,
      },
      {
        id: "step2",
        title: "Apply the STAR framework",
        description: "Draft Situation, Task, Action, and Result for your proudest technical challenge.",
        estimatedMinutes: 15,
      },
      {
        id: "step3",
        title: "Self-review against rubric",
        description: "Verify clarity, technical depth, and concise pacing using our self-evaluation rubric.",
        estimatedMinutes: 10,
      },
    ],
  },

  "act-skill-exercise": {
    id: "act-skill-exercise",
    title: "Targeted Skill Sprint & Practice",
    category: "learning_plan",
    description:
      "A level-appropriate local exercise focused on your declared learning target, breaking down fundamentals into runnable mini-challenges.",
    totalMinutes: 45,
    interactiveType: "skill_exercise",
    steps: [
      {
        id: "step1",
        title: "Review core mental models",
        description: "Consolidate the essential patterns and idioms for your target technical topic.",
        estimatedMinutes: 15,
      },
      {
        id: "step2",
        title: "Complete hands-on exercise",
        description: "Write code to solve a focused exercise targeting edge cases and data flow.",
        estimatedMinutes: 20,
      },
      {
        id: "step3",
        title: "Document key learnings",
        description: "Note what tripped you up and write down a concise one-line summary for revision.",
        estimatedMinutes: 10,
      },
    ],
  },

  "act-project-brief": {
    id: "act-project-brief",
    title: "End-to-End Project Brief & Milestones",
    category: "project_ideas",
    description:
      "A complete milestone blueprint to build a portfolio project that proves real-world capability to prospective engineering teams.",
    totalMinutes: 45,
    interactiveType: "project_brief",
    steps: [
      {
        id: "step1",
        title: "Scope the minimal viable feature",
        description: "Define user stories and API contracts for a realistic, non-trivial workflow.",
        estimatedMinutes: 15,
      },
      {
        id: "step2",
        title: "Establish architectural milestones",
        description: "Break the implementation into verifiable commits with error handling and tests.",
        estimatedMinutes: 20,
      },
      {
        id: "step3",
        title: "Plan deployment & live demo",
        description: "Prepare automated hosting, seed data, and a clear demo walkthrough.",
        estimatedMinutes: 10,
      },
    ],
  },

  "act-project-docs": {
    id: "act-project-docs",
    title: "Project Documentation & Narrative Checklist",
    category: "project_ideas",
    description:
      "Transform an existing project into an impressive proof of competence with a high-signal README, architecture diagrams, and trade-off notes.",
    totalMinutes: 30,
    interactiveType: "project_docs",
    steps: [
      {
        id: "step1",
        title: "Structure the GitHub README",
        description: "Add architecture overview, tech stack justification, and local setup instructions.",
        estimatedMinutes: 10,
      },
      {
        id: "step2",
        title: "Explain engineering trade-offs",
        description: "Document why specific libraries or database models were chosen over alternatives.",
        estimatedMinutes: 10,
      },
      {
        id: "step3",
        title: "Record a 60-second video demo link",
        description: "Outline a crisp script demonstrating the user journey and edge-case handling.",
        estimatedMinutes: 10,
      },
    ],
  },

  "act-transferable-skills": {
    id: "act-transferable-skills",
    title: "Transferable Skills Translation Worksheet",
    category: "career_exploration",
    description:
      "Translate your previous career, academic, or non-tech accomplishments into the language of software engineering, teamwork, and problem solving.",
    totalMinutes: 30,
    interactiveType: "transferable_skills",
    steps: [
      {
        id: "step1",
        title: "Inventory previous domain achievements",
        description: "Catalog complex projects, stakeholder coordination, and data handling from your past role.",
        estimatedMinutes: 10,
      },
      {
        id: "step2",
        title: "Translate into engineering equivalents",
        description: "Bridge process optimization to system design, and customer empathy to product quality.",
        estimatedMinutes: 10,
      },
      {
        id: "step3",
        title: "Craft your transition narrative",
        description: "Draft a 2-minute pitch connecting your origin story directly to your tech ambitions.",
        estimatedMinutes: 10,
      },
    ],
  },

  "act-search-preferences": {
    id: "act-search-preferences",
    title: "Job Search Criteria & Screening Checklist",
    category: "opportunity_search",
    description:
      "Clarify your non-negotiable search criteria, target company profiles, and daily application rhythm without wasting hours on mismatched postings.",
    totalMinutes: 25,
    interactiveType: "search_preferences",
    steps: [
      {
        id: "step1",
        title: "Define core search filters",
        description: "Establish firm boundaries for remote flexibility, company stage, and tech stack.",
        estimatedMinutes: 10,
      },
      {
        id: "step2",
        title: "Identify high-signal channels",
        description: "Select 2–3 niche job boards or developer communities with verified postings.",
        estimatedMinutes: 8,
      },
      {
        id: "step3",
        title: "Set up weekly application tracker",
        description: "Create a simple log to monitor outreach, recruiter contacts, and feedback loops.",
        estimatedMinutes: 7,
      },
    ],
  },

  "act-focus-picker": {
    id: "act-focus-picker",
    title: "Select Your Career Exploration Focus",
    category: "career_exploration",
    description:
      "A neutral, low-pressure guide to help you choose a single manageable priority when you are exploring or prefer not to specify constraints.",
    totalMinutes: 15,
    interactiveType: "focus_picker",
    steps: [
      {
        id: "step1",
        title: "Review available exploration paths",
        description: "Browse curated paths across frontend, backend, data, and design.",
        estimatedMinutes: 5,
      },
      {
        id: "step2",
        title: "Pick one lightweight starting task",
        description: "Select one 15-minute introductory exercise that sparks your curiosity.",
        estimatedMinutes: 5,
      },
      {
        id: "step3",
        title: "Set a low-stakes milestone",
        description: "Commit to testing out the topic for one week before making broader decisions.",
        estimatedMinutes: 5,
      },
    ],
  },
};
