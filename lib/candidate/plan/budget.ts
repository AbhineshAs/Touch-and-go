// lib/candidate/plan/budget.ts

import {
  Recommendation,
  PlanTask,
  ActionPlan,
  TimeBudget,
} from "../types";
import { ACTIVITIES_CATALOGUE } from "../activities/catalogue";

export const BUDGET_CAPS_MINUTES: Record<TimeBudget, number> = {
  under_1_hour: 45,
  "1_to_3_hours": 120,
  "3_to_5_hours": 180,
  over_5_hours: 240,
  unsure: 15,
};

export function getWeeklyBudgetMinutes(timeBudget?: TimeBudget): number {
  if (!timeBudget) return BUDGET_CAPS_MINUTES.unsure;
  return BUDGET_CAPS_MINUTES[timeBudget] || 120;
}

export function buildActionPlan(
  recommendations: Recommendation[],
  timeBudget: TimeBudget = "1_to_3_hours",
  profileRevision: number = 1
): ActionPlan {
  const budgetCap = getWeeklyBudgetMinutes(timeBudget);
  const isUnsure = timeBudget === "unsure";
  const tasks: PlanTask[] = [];
  let currentTotalMinutes = 0;

  let disclosedNotice: string | undefined;
  if (isUnsure) {
    disclosedNotice =
      "Because you're unsure of your weekly time right now, we've planned one disclosed 15-minute starter task.";
  }

  for (const rec of recommendations) {
    if (currentTotalMinutes >= budgetCap) break;

    const activity = ACTIVITIES_CATALOGUE[rec.activityId];
    if (!activity) continue;

    const subjectId = rec.subjectId || "default";

    // For "unsure", take only the first step (or up to 15 mins) and stop
    if (isUnsure) {
      const firstStep = activity.steps[0];
      if (firstStep) {
        tasks.push({
          id: `${activity.id}:${subjectId}:${firstStep.id}`,
          activityId: activity.id,
          subjectId,
          stepId: firstStep.id,
          title: `${rec.title}: ${firstStep.title}`,
          category: activity.category,
          estimatedMinutes: Math.min(firstStep.estimatedMinutes, 15),
          status: "pending",
          profileRevision,
        });
        currentTotalMinutes += Math.min(firstStep.estimatedMinutes, 15);
      }
      break;
    }

    // Check if the entire activity fits
    if (currentTotalMinutes + activity.totalMinutes <= budgetCap) {
      for (const step of activity.steps) {
        tasks.push({
          id: `${activity.id}:${subjectId}:${step.id}`,
          activityId: activity.id,
          subjectId,
          stepId: step.id,
          title: `${rec.title}: ${step.title}`,
          category: activity.category,
          estimatedMinutes: step.estimatedMinutes,
          status: "pending",
          profileRevision,
        });
      }
      currentTotalMinutes += activity.totalMinutes;
    } else {
      // Activity exceeds remaining capacity. Try adding individual shorter steps that fit.
      for (const step of activity.steps) {
        if (currentTotalMinutes + step.estimatedMinutes <= budgetCap) {
          tasks.push({
            id: `${activity.id}:${subjectId}:${step.id}`,
            activityId: activity.id,
            subjectId,
            stepId: step.id,
            title: `${rec.title}: ${step.title}`,
            category: activity.category,
            estimatedMinutes: step.estimatedMinutes,
            status: "pending",
            profileRevision,
          });
          currentTotalMinutes += step.estimatedMinutes;
        } else {
          // Cannot fit this step without exceeding budget; stop adding steps for this activity
          break;
        }
      }
    }
  }

  return {
    weeklyBudgetMinutes: budgetCap,
    totalPlannedMinutes: currentTotalMinutes,
    tasks,
    disclosedStarterNotice: disclosedNotice,
  };
}

export function reconcileTasks(
  previousTasks: PlanTask[],
  newTasks: PlanTask[]
): PlanTask[] {
  const prevTaskMap = new Map<string, PlanTask>();
  for (const t of previousTasks) {
    prevTaskMap.set(t.id, t);
  }

  const reconciledNewTasks: PlanTask[] = newTasks.map((newTask) => {
    const existing = prevTaskMap.get(newTask.id);
    if (existing && existing.status === "completed") {
      return {
        ...newTask,
        status: "completed",
        completedAt: existing.completedAt,
      };
    }
    if (existing && existing.status === "removed") {
      return {
        ...newTask,
        status: "removed",
      };
    }
    return newTask;
  });

  // Archive tasks from previous plan that are not in the new plan
  const newIds = new Set(newTasks.map((t) => t.id));
  const archivedTasks: PlanTask[] = previousTasks
    .filter((t) => !newIds.has(t.id) && t.status !== "archived")
    .map((t) => ({ ...t, status: "archived" }));

  return [...reconciledNewTasks, ...archivedTasks];
}
