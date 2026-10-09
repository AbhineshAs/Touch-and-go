// tests/unit/plan.test.ts
import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { deriveRecommendations } from "../../lib/candidate/recommendations/engine";
import { buildActionPlan, reconcileTasks } from "../../lib/candidate/plan/budget";
import { PERSONA_A_PROFILE, PERSONA_D_PROFILE } from "../../lib/candidate/fixtures";
import { PlanTask } from "../../lib/candidate/types";

describe("7-Day Action Plan & Task Reconciliation Unit Tests", () => {
  it("Budget limit: under_1_hour caps plan at maximum 45 minutes", () => {
    const recs = deriveRecommendations(PERSONA_A_PROFILE);
    const plan = buildActionPlan(recs, "under_1_hour", 1);

    assert.ok(
      plan.totalPlannedMinutes <= 45,
      `Total planned minutes (${plan.totalPlannedMinutes}) must not exceed 45 minutes`
    );
    assert.equal(plan.weeklyBudgetMinutes, 45);
  });

  it("Budget limit: 1_to_3_hours caps plan at maximum 120 minutes", () => {
    const recs = deriveRecommendations(PERSONA_A_PROFILE);
    const plan = buildActionPlan(recs, "1_to_3_hours", 1);

    assert.ok(
      plan.totalPlannedMinutes <= 120,
      `Total planned minutes (${plan.totalPlannedMinutes}) must not exceed 120 minutes`
    );
    assert.equal(plan.weeklyBudgetMinutes, 120);
  });

  it("Budget limit: 3_to_5_hours caps plan at maximum 180 minutes", () => {
    const recs = deriveRecommendations(PERSONA_A_PROFILE);
    const plan = buildActionPlan(recs, "3_to_5_hours", 1);

    assert.ok(
      plan.totalPlannedMinutes <= 180,
      `Total planned minutes (${plan.totalPlannedMinutes}) must not exceed 180 minutes`
    );
    assert.equal(plan.weeklyBudgetMinutes, 180);
  });

  it("Budget limit: over_5_hours caps plan at maximum 240 minutes", () => {
    const recs = deriveRecommendations(PERSONA_A_PROFILE);
    const plan = buildActionPlan(recs, "over_5_hours", 1);

    assert.ok(
      plan.totalPlannedMinutes <= 240,
      `Total planned minutes (${plan.totalPlannedMinutes}) must not exceed 240 minutes`
    );
    assert.equal(plan.weeklyBudgetMinutes, 240);
  });

  it("Budget limit: unsure budget provides exactly one 15-minute disclosed starter", () => {
    const recs = deriveRecommendations(PERSONA_D_PROFILE);
    const plan = buildActionPlan(recs, "unsure", 1);

    assert.equal(plan.tasks.length, 1, "Should contain exactly one starter task");
    assert.equal(plan.totalPlannedMinutes, 5); // step 1 of focus-picker is 5 mins (<= 15)
    assert.ok(plan.disclosedStarterNotice, "Must disclose starter notice");
  });

  it("Task reconciliation: Preserves completion on matching task identity", () => {
    const recs = deriveRecommendations(PERSONA_A_PROFILE);
    const plan = buildActionPlan(recs, "1_to_3_hours", 1);

    const firstTask = plan.tasks[0];
    assert.ok(firstTask, "Should have tasks");

    // Simulate completing the first task
    const completedTasks: PlanTask[] = [
      {
        ...firstTask,
        status: "completed",
        completedAt: "2026-09-18T11:00:00Z",
      },
    ];

    // Reconcile with a fresh plan generation
    const nextPlan = buildActionPlan(recs, "1_to_3_hours", 2);
    const reconciled = reconcileTasks(completedTasks, nextPlan.tasks);

    const reconciledFirst = reconciled.find((t) => t.id === firstTask.id);
    assert.ok(reconciledFirst);
    assert.equal(reconciledFirst.status, "completed", "Completed status must be preserved");
    assert.equal(reconciledFirst.completedAt, "2026-09-18T11:00:00Z");
  });

  it("Topic isolation: Switching learning skill from React to SQL does NOT carry over completion", () => {
    // Previous task completed for React learning
    const previousTasks: PlanTask[] = [
      {
        id: "act-skill-exercise:react:step1",
        activityId: "act-skill-exercise",
        subjectId: "react",
        stepId: "step1",
        title: "Targeted React Sprint: Review mental models",
        category: "learning_plan",
        estimatedMinutes: 15,
        status: "completed",
        profileRevision: 1,
        completedAt: "2026-09-18T11:00:00Z",
      },
    ];

    // Newly generated tasks for SQL learning
    const newTasks: PlanTask[] = [
      {
        id: "act-skill-exercise:sql:step1",
        activityId: "act-skill-exercise",
        subjectId: "sql",
        stepId: "step1",
        title: "Targeted SQL Sprint: Review mental models",
        category: "learning_plan",
        estimatedMinutes: 15,
        status: "pending",
        profileRevision: 2,
      },
    ];

    const reconciled = reconcileTasks(previousTasks, newTasks);

    // The SQL task must be pending!
    const sqlTask = reconciled.find((t) => t.id === "act-skill-exercise:sql:step1");
    assert.ok(sqlTask);
    assert.equal(sqlTask.status, "pending", "SQL task must NOT inherit completion from React task");

    // The previous React task must be archived
    const reactTask = reconciled.find((t) => t.id === "act-skill-exercise:react:step1");
    assert.ok(reactTask);
    assert.equal(reactTask.status, "archived", "Previous topic task should be archived");
  });
});
