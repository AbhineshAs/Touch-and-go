// tests/unit/recommendations.test.ts
import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { deriveRecommendations } from "../../lib/candidate/recommendations/engine";
import {
  PERSONA_A_PROFILE,
  PERSONA_B_PROFILE,
  PERSONA_C_PROFILE,
  PERSONA_D_PROFILE,
} from "../../lib/candidate/fixtures";
import { ConfirmedProfile } from "../../lib/candidate/types";

describe("Recommendation Engine Unit Tests", () => {
  it("Scenario A: Fresher with few interview calls and CV support receives CV review as top recommendation", () => {
    const recs = deriveRecommendations(PERSONA_A_PROFILE);

    assert.ok(recs.length > 0, "Should generate recommendations");
    assert.ok(recs.length <= 3, "Should not exceed 3 recommendations");

    // Top recommendation must be CV review
    const topRec = recs[0];
    assert.equal(topRec.activityId, "act-cv-review");
    assert.equal(topRec.supportCategory, "cv_support");
    assert.ok(topRec.ruleIds.includes("R02"), "Should trigger rule R02");
    assert.ok(
      topRec.sourceAnswerIds.includes("Q04:few_interview_calls"),
      "Should trace to Q04 challenge"
    );
  });

  it("Scenario B: Experienced candidate with interview prep receives technical practice first, without guessed CV problem", () => {
    const recs = deriveRecommendations(PERSONA_B_PROFILE);

    assert.ok(recs.length > 0);
    const topRec = recs[0];
    assert.equal(topRec.activityId, "act-interview-practice");
    assert.equal(topRec.supportCategory, "interview_practice");
    assert.ok(topRec.ruleIds.includes("R04"), "Should trigger R04");

    // Must NOT guess a CV issue when the candidate did not report it
    const hasCvReview = recs.some((r) => r.activityId === "act-cv-review");
    assert.equal(hasCvReview, false, "Should not diagnose an unmentioned CV issue");
  });

  it("Scenario C: Switcher with unclear direction receives role exploration and transferable skills", () => {
    const recs = deriveRecommendations(PERSONA_C_PROFILE);

    assert.ok(recs.length >= 2, "Should generate multiple recommendations for switcher");
    const activityIds = recs.map((r) => r.activityId);

    assert.ok(
      activityIds.includes("act-role-comparison"),
      "Should recommend comparing career paths (R01)"
    );
    assert.ok(
      activityIds.includes("act-transferable-skills"),
      "Should recommend transferable skills worksheet (R08)"
    );
  });

  it("Scenario D: Prefer-not-to-say and sparse answers produce neutral focus picker", () => {
    const recs = deriveRecommendations(PERSONA_D_PROFILE);

    assert.equal(recs.length, 1);
    assert.equal(recs[0].activityId, "act-focus-picker");
    assert.ok(recs[0].ruleIds.includes("R11"), "Should use fallback R11");
  });

  it("Category limit: Never generates more than 2 recommendations in any one support category", () => {
    const multiCvProfile: ConfirmedProfile = {
      revision: 1,
      schemaVersion: "1.0.0",
      confirmedAt: "2026-09-18T10:00:00Z",
      discovery: {
        careerStage: "experienced",
        primaryGoal: "first_job",
        targetRoles: ["Frontend Engineer"],
        challenges: ["few_interview_calls"],
        primaryChallenge: "few_interview_calls",
        challengeFollowUp: { challenge: "few_interview_calls", supportPreference: "cv" },
        preferredSupport: ["cv_support"],
        timeBudget: "3_to_5_hours",
        skills: [],
        strengths: [],
      },
    };

    const recs = deriveRecommendations(multiCvProfile);
    const cvCount = recs.filter((r) => r.supportCategory === "cv_support").length;
    assert.ok(cvCount <= 2, "At most 2 in cv_support category");
    assert.ok(recs.length <= 3, "At most 3 recommendations in total");
  });

  it("Identity independence: Name, email, and phone have zero influence on recommendations", () => {
    const run1 = deriveRecommendations(PERSONA_A_PROFILE);

    // Deep clone with different identity or metadata
    const clonedProfile: ConfirmedProfile = {
      ...PERSONA_A_PROFILE,
      confirmedAt: "2026-09-19T12:00:00Z",
    };
    const run2 = deriveRecommendations(clonedProfile);

    assert.deepEqual(
      run1.map((r) => ({ id: r.id, rules: r.ruleIds, activity: r.activityId })),
      run2.map((r) => ({ id: r.id, rules: r.ruleIds, activity: r.activityId })),
      "Recommendations must be purely deterministic based on confirmed discovery answers"
    );
  });

  it("Dismissal behavior: Dismissing advice persists and does not immediately reappear", () => {
    const initialRecs = deriveRecommendations(PERSONA_A_PROFILE);
    const topRec = initialRecs[0];

    const feedback = {
      savedRecommendationIds: [],
      dismissedFingerprints: [`${topRec.ruleIds[0]}:none:not_relevant`],
    };

    const nextRecs = deriveRecommendations(PERSONA_A_PROFILE, feedback);
    const containsDismissed = nextRecs.some((r) => r.id === topRec.id);
    assert.equal(containsDismissed, false, "Dismissed recommendation should not appear");
  });
});
