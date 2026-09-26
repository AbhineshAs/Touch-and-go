// lib/candidate/recommendations/engine.ts

import {
  ConfirmedProfile,
  Recommendation,
  Feedback,
  SupportType,
} from "../types";
import {
  RECOMMENDATION_RULES,
  extractEvaluationContext,
  EvaluationContext,
} from "./rules";

export function getDismissalFingerprint(
  ruleId: string,
  subjectId?: string,
  reason: string = "not_relevant"
): string {
  return `${ruleId}:${subjectId || "none"}:${reason}`;
}

export function isRecommendationDismissed(
  rec: Recommendation,
  feedback: Feedback
): boolean {
  if (!feedback.dismissedFingerprints || feedback.dismissedFingerprints.length === 0) {
    return false;
  }

  return rec.ruleIds.some((ruleId) => {
    const defaultFingerprint = getDismissalFingerprint(ruleId, rec.subjectId, "not_relevant");
    return feedback.dismissedFingerprints.includes(defaultFingerprint);
  });
}

export function deriveRecommendations(
  profile: ConfirmedProfile,
  feedback: Feedback = { savedRecommendationIds: [], dismissedFingerprints: [] }
): Recommendation[] {
  const ctx: EvaluationContext = extractEvaluationContext(profile);
  const rawCandidates: Recommendation[] = [];

  // 1. Generate candidates from the rule catalogue (excluding R11 initially)
  for (const rule of RECOMMENDATION_RULES) {
    if (rule.id === "R11") continue; // R11 is only used as a fallback
    if (rule.applies(ctx)) {
      const rec = rule.generate(ctx);
      if (rec) {
        rawCandidates.push(rec);
      }
    }
  }

  // 2. Filter out dismissed candidates based on rule:subject fingerprint
  const nonDismissed = rawCandidates.filter(
    (rec) => !isRecommendationDismissed(rec, feedback)
  );

  // 3. Deduplicate by activityId, merging ruleIds and sourceAnswerIds
  const deduplicatedMap = new Map<string, Recommendation>();
  for (const rec of nonDismissed) {
    if (deduplicatedMap.has(rec.activityId)) {
      const existing = deduplicatedMap.get(rec.activityId)!;
      const combinedRules = Array.from(new Set([...existing.ruleIds, ...rec.ruleIds]));
      const combinedSources = Array.from(new Set([...existing.sourceAnswerIds, ...rec.sourceAnswerIds]));
      deduplicatedMap.set(rec.activityId, {
        ...existing,
        ruleIds: combinedRules,
        sourceAnswerIds: combinedSources,
      });
    } else {
      deduplicatedMap.set(rec.activityId, rec);
    }
  }

  let candidates = Array.from(deduplicatedMap.values());

  // 4. Lexicographical sorting:
  // - Priority 1: Addresses primary challenge
  // - Priority 2: Matches preferred support
  // - Priority 3: Addresses primary goal
  // - Priority 4: Stable rule ID
  const primaryChallenge = ctx.primaryChallenge;
  const primaryGoal = ctx.primaryGoal;
  const preferredSupport = profile.discovery.preferredSupport || [];

  candidates.sort((a, b) => {
    // 1. Primary challenge match
    const aChallenge = a.sourceAnswerIds.some((s) => primaryChallenge && s.includes(primaryChallenge));
    const bChallenge = b.sourceAnswerIds.some((s) => primaryChallenge && s.includes(primaryChallenge));
    if (aChallenge && !bChallenge) return -1;
    if (!aChallenge && bChallenge) return 1;

    // 2. Preferred support match
    const aSupport = preferredSupport.includes(a.supportCategory);
    const bSupport = preferredSupport.includes(b.supportCategory);
    if (aSupport && !bSupport) return -1;
    if (!aSupport && bSupport) return 1;

    // 3. Primary goal match
    const aGoal = a.sourceAnswerIds.some((s) => primaryGoal && s.includes(primaryGoal));
    const bGoal = b.sourceAnswerIds.some((s) => primaryGoal && s.includes(primaryGoal));
    if (aGoal && !bGoal) return -1;
    if (!aGoal && bGoal) return 1;

    // 4. Stable rule ID
    const aMinRule = a.ruleIds.sort()[0] || "";
    const bMinRule = b.ruleIds.sort()[0] || "";
    return aMinRule.localeCompare(bMinRule);
  });

  // 5. Category limit: at most 2 in any one support category, up to 3 total
  const selected: Recommendation[] = [];
  const categoryCounts: Partial<Record<SupportType, number>> = {};

  for (const rec of candidates) {
    if (selected.length >= 3) break;

    const currentCount = categoryCounts[rec.supportCategory] || 0;
    if (currentCount < 2) {
      selected.push(rec);
      categoryCounts[rec.supportCategory] = currentCount + 1;
    }
  }

  // 6. Fallback rule R11 if no candidates remain and not all applicable were explicitly dismissed
  if (selected.length === 0) {
    // If rawCandidates existed but all were dismissed by the user, return empty list!
    // PRD rule: "If the candidate dismissed all applicable cards, show 'You're up to date' with Restore suggestions and Edit goals, rather than repeating dismissed advice."
    if (rawCandidates.length > 0) {
      return [];
    }

    // Sparse data / no applicable rule: generate R11
    const r11Rule = RECOMMENDATION_RULES.find((r) => r.id === "R11");
    if (r11Rule) {
      const fallbackRec = r11Rule.generate(ctx);
      if (fallbackRec && !isRecommendationDismissed(fallbackRec, feedback)) {
        selected.push(fallbackRec);
      }
    }
  }

  return selected;
}
