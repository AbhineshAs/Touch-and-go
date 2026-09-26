// lib/candidate/discovery/reducer.ts

import { DiscoveryDraft } from "../types";

export interface DiscoveryState {
  currentStepIndex: number; // 1 to 12
  history: number[]; // breadcrumb history of step indices
  draft: DiscoveryDraft;
  errors: Record<string, string>;
}

export type DiscoveryAction =
  | { type: "UPDATE_DRAFT"; payload: Partial<DiscoveryDraft> }
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "SKIP_STEP" }
  | { type: "GO_TO_STEP"; stepIndex: number }
  | { type: "RESET"; initialDraft?: DiscoveryDraft }
  | { type: "SET_ERROR"; key: string; message: string }
  | { type: "CLEAR_ERRORS" };

export const initialDiscoveryDraft: DiscoveryDraft = {
  targetRoles: [],
  challenges: [],
  skills: [],
  strengths: [],
  preferredSupport: [],
  workPreferences: {
    locationMode: "any",
    jobType: "any",
    availability: "immediate",
    freeOnlyResources: false,
  },
};


export const initialDiscoveryState: DiscoveryState = {
  currentStepIndex: 1,
  history: [1],
  draft: initialDiscoveryDraft,
  errors: {},
};

export function shouldSkipStep5(draft: DiscoveryDraft): boolean {
  const challenges = draft.challenges || [];
  if (challenges.length <= 1) return true;
  if (challenges.includes("nothing_specific") || challenges.includes("prefer_not_to_say")) {
    return true;
  }
  return false;
}

export function shouldSkipStep6(draft: DiscoveryDraft): boolean {
  const primary = getEffectivePrimaryChallenge(draft);
  if (!primary || primary === "nothing_specific" || primary === "prefer_not_to_say") {
    return true;
  }
  return false;
}

export function getEffectivePrimaryChallenge(draft: DiscoveryDraft) {
  if (draft.primaryChallenge) return draft.primaryChallenge;
  if (draft.challenges && draft.challenges.length > 0) return draft.challenges[0];
  return undefined;
}

export function validateStep(stepIndex: number, draft: DiscoveryDraft): Record<string, string> {
  const errors: Record<string, string> = {};

  switch (stepIndex) {
    case 1:
      if (!draft.careerStage) {
        errors.careerStage = "Please select where you are in your career.";
      }
      break;

    case 2:
      if (!draft.primaryGoal) {
        errors.primaryGoal = "Please select your primary career goal.";
      }
      break;

    case 3:
      if (!draft.targetRoles || draft.targetRoles.length === 0) {
        errors.targetRoles = "Please select at least one role, or choose 'Exploring'.";
      }
      break;

    case 4:
      if (!draft.challenges || draft.challenges.length === 0) {
        errors.challenges = "Please select at least one challenge, or choose 'Nothing specific' / 'Prefer not to say'.";
      }
      break;

    case 5:
      // Conditional: choose primary challenge
      if (!shouldSkipStep5(draft) && !draft.primaryChallenge) {
        errors.primaryChallenge = "Please select which challenge to tackle first.";
      }
      break;

    case 6:
      // Optional follow up - text length check if provided
      if (draft.challengeFollowUp?.additionalContext && draft.challengeFollowUp.additionalContext.length > 500) {
        errors.additionalContext = "Context must be 500 characters or fewer.";
      }
      break;

    case 7:
      // Skills: at least one skill or isExploringSkills
      if ((!draft.skills || draft.skills.length === 0) && !draft.isExploringSkills) {
        errors.skills = "Please add at least one skill with familiarity, or select 'Still exploring'.";
      }
      break;

    case 8:
      // Optional strengths
      break;

    case 9:
      // Optional example
      if (draft.example?.text && draft.example.text.length > 500) {
        errors.example = "Example must be 500 characters or fewer.";
      }
      break;

    case 10:
      if (!draft.preferredSupport || draft.preferredSupport.length === 0) {
        errors.preferredSupport = "Please select up to two support formats, or choose 'No preference'.";
      }
      break;

    case 11:
      if (!draft.timeBudget) {
        errors.timeBudget = "Please select your weekly time availability.";
      }
      break;

    case 12:
      // Optional work preferences
      break;
  }

  return errors;
}

export function getNextStepIndex(currentIndex: number, draft: DiscoveryDraft): number {
  let next = currentIndex + 1;

  if (next === 5 && shouldSkipStep5(draft)) {
    next = 6;
  }

  if (next === 6 && shouldSkipStep6(draft)) {
    next = 7;
  }

  return Math.min(next, 13); // 13 represents the review summary step
}

export function discoveryReducer(state: DiscoveryState, action: DiscoveryAction): DiscoveryState {
  switch (action.type) {
    case "UPDATE_DRAFT": {
      const updatedDraft = {
        ...state.draft,
        ...action.payload,
      };

      // Auto-set primary challenge if exactly 1 challenge is selected
      if (updatedDraft.challenges && updatedDraft.challenges.length === 1) {
        updatedDraft.primaryChallenge = updatedDraft.challenges[0];
      }

      return {
        ...state,
        draft: updatedDraft,
        errors: {},
      };
    }

    case "NEXT_STEP": {
      const validationErrors = validateStep(state.currentStepIndex, state.draft);
      if (Object.keys(validationErrors).length > 0) {
        return {
          ...state,
          errors: validationErrors,
        };
      }

      const nextIndex = getNextStepIndex(state.currentStepIndex, state.draft);
      return {
        ...state,
        currentStepIndex: nextIndex,
        history: [...state.history, nextIndex],
        errors: {},
      };
    }

    case "PREV_STEP": {
      if (state.history.length <= 1) {
        return state;
      }
      const newHistory = state.history.slice(0, -1);
      const prevIndex = newHistory[newHistory.length - 1];
      return {
        ...state,
        currentStepIndex: prevIndex,
        history: newHistory,
        errors: {},
      };
    }

    case "SKIP_STEP": {
      // Allowed for optional steps
      const nextIndex = getNextStepIndex(state.currentStepIndex, state.draft);
      return {
        ...state,
        currentStepIndex: nextIndex,
        history: [...state.history, nextIndex],
        errors: {},
      };
    }

    case "GO_TO_STEP": {
      return {
        ...state,
        currentStepIndex: action.stepIndex,
        history: [...state.history, action.stepIndex],
        errors: {},
      };
    }

    case "RESET": {
      return {
        currentStepIndex: 1,
        history: [1],
        draft: action.initialDraft ? { ...action.initialDraft } : { ...initialDiscoveryDraft },
        errors: {},
      };
    }

    case "SET_ERROR": {
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.key]: action.message,
        },
      };
    }

    case "CLEAR_ERRORS": {
      return {
        ...state,
        errors: {},
      };
    }

    default:
      return state;
  }
}
