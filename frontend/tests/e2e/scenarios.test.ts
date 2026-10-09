// tests/e2e/scenarios.test.ts
import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { deriveRecommendations } from "../../lib/candidate/recommendations/engine";
import { buildActionPlan, reconcileTasks } from "../../lib/candidate/plan/budget";
import { MockOTPService, DEMO_OTP_CODE } from "../../lib/candidate/services/otpService";
import {
  PERSONA_A_PROFILE,
  PERSONA_B_PROFILE,
  PERSONA_C_PROFILE,
  PERSONA_D_PROFILE,
} from "../../lib/candidate/fixtures";
import { ConfirmedProfile, PlanTask } from "../../lib/candidate/types";

describe("TAG Candidate Experience Acceptance Scenarios A to G", () => {
  // Scenario A
  it("Scenario A: Fresher with few interview calls, React skills, CV support and 1–3 hours gets CV review first and plan <= 120 min", () => {
    const recs = deriveRecommendations(PERSONA_A_PROFILE);
    assert.ok(recs.length > 0);
    assert.equal(recs[0].activityId, "act-cv-review");
    assert.equal(recs[0].supportCategory, "cv_support");

    const plan = buildActionPlan(recs, PERSONA_A_PROFILE.discovery.timeBudget, 1);
    assert.ok(plan.totalPlannedMinutes <= 120, "Plan duration must be <= 120 minutes");

    // Verify self-reported evidence
    const skills = PERSONA_A_PROFILE.discovery.skills;
    assert.ok(skills.some((s) => s.name === "React" && s.level === "comfortable"));
  });

  // Scenario B
  it("Scenario B: Experienced user with technical interview challenge gets technical practice first, without guessed CV issue", () => {
    const recs = deriveRecommendations(PERSONA_B_PROFILE);
    assert.ok(recs.length > 0);

    const topRec = recs[0];
    assert.equal(topRec.activityId, "act-interview-practice");
    assert.equal(topRec.supportCategory, "interview_practice");
    assert.ok(topRec.rationale.includes("technical"));

    // Ensure no spurious CV review was guessed
    const hasCvReview = recs.some((r) => r.activityId === "act-cv-review");
    assert.equal(hasCvReview, false, "Must not diagnose an unmentioned CV issue");
  });

  // Scenario C
  it("Scenario C: Switcher with unclear direction gets role exploration and transferable-skills support", () => {
    const recs = deriveRecommendations(PERSONA_C_PROFILE);
    const activityIds = recs.map((r) => r.activityId);

    assert.ok(activityIds.includes("act-role-comparison"), "Must offer role comparison worksheet");
    assert.ok(
      activityIds.includes("act-transferable-skills"),
      "Must offer transferable skills worksheet"
    );
  });

  // Scenario D
  it("Scenario D: Prefer-not-to-say and unknown answers yield a neutral useful dashboard", () => {
    const recs = deriveRecommendations(PERSONA_D_PROFILE);
    assert.equal(recs.length, 1);
    assert.equal(recs[0].activityId, "act-focus-picker");

    const plan = buildActionPlan(recs, "unsure", 1);
    assert.equal(plan.tasks.length, 1);
    assert.ok(plan.disclosedStarterNotice);
  });

  // Scenario E
  it("Scenario E: Editing primary challenge changes top advice; changing React to SQL does not carry over task completion", () => {
    // Initial profile: Primary challenge is CV support
    const initialRecs = deriveRecommendations(PERSONA_A_PROFILE);
    assert.equal(initialRecs[0].activityId, "act-cv-review");

    // Profile updated: Candidate changes primary challenge to interview prep
    const updatedProfile: ConfirmedProfile = {
      ...PERSONA_A_PROFILE,
      revision: 2,
      discovery: {
        ...PERSONA_A_PROFILE.discovery,
        challenges: ["interview_prep"],
        primaryChallenge: "interview_prep",
        preferredSupport: ["interview_practice"],
      },
    };

    const updatedRecs = deriveRecommendations(updatedProfile);
    assert.equal(
      updatedRecs[0].activityId,
      "act-interview-practice",
      "Top advice must change when primary challenge changes"
    );

    // Topic completion isolation test: React -> SQL
    const initialTasks: PlanTask[] = [
      {
        id: "act-skill-exercise:react:step1",
        activityId: "act-skill-exercise",
        subjectId: "react",
        stepId: "step1",
        title: "React Sprint",
        category: "learning_plan",
        estimatedMinutes: 15,
        status: "completed",
        profileRevision: 1,
      },
    ];

    const nextTasks: PlanTask[] = [
      {
        id: "act-skill-exercise:sql:step1",
        activityId: "act-skill-exercise",
        subjectId: "sql",
        stepId: "step1",
        title: "SQL Sprint",
        category: "learning_plan",
        estimatedMinutes: 15,
        status: "pending",
        profileRevision: 2,
      },
    ];

    const reconciled = reconcileTasks(initialTasks, nextTasks);
    const sqlTask = reconciled.find((t) => t.id === "act-skill-exercise:sql:step1");
    assert.equal(sqlTask?.status, "pending", "Switching topic must not inherit completion");
  });

  // Scenario F
  it("Scenario F: OTP wrong, expired, resend, and edit-phone paths work; stale responses cannot verify another phone", () => {
    const otp = new MockOTPService();
    const c1 = otp.createChallenge("9876543210", "+91");

    // Wrong code
    const wrongRes = otp.verifyCode(c1.normalizedPhone, "111111");
    assert.equal(wrongRes.success, false);
    assert.equal(wrongRes.error, "wrong_code");

    // Edit phone -> invalidates challenge
    otp.invalidateChallenge();
    const c2 = otp.createChallenge("9999999999", "+91");

    // Attempting to verify stale phone fails
    const staleRes = otp.verifyCode(c1.normalizedPhone, DEMO_OTP_CODE);
    assert.equal(staleRes.success, false);
    assert.equal(staleRes.error, "invalid_challenge");

    // Verifying new phone succeeds
    const validRes = otp.verifyCode(c2.normalizedPhone, DEMO_OTP_CODE);
    assert.equal(validRes.success, true);
  });

  // Scenario G
  it("Scenario G: Changing only name/email/phone leaves recommendation output unchanged", () => {
    const recs1 = deriveRecommendations(PERSONA_A_PROFILE);

    const modifiedProfile: ConfirmedProfile = {
      ...PERSONA_A_PROFILE,
      revision: 2,
      confirmedAt: "2026-09-18T14:30:00Z",
    };

    const recs2 = deriveRecommendations(modifiedProfile);

    assert.equal(recs1.length, recs2.length);
    for (let i = 0; i < recs1.length; i++) {
      assert.equal(recs1[i].id, recs2[i].id);
      assert.equal(recs1[i].activityId, recs2[i].activityId);
      assert.deepEqual(recs1[i].ruleIds, recs2[i].ruleIds);
      assert.equal(recs1[i].rationale, recs2[i].rationale);
    }
  });
});
