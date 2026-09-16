import { MatchResult } from "@/types";
import { MOCK_MATCH_RESULTS } from "@/lib/mocks/data";

export async function getMatchEvidence(candidateId: string, jobId: string): Promise<MatchResult> {
  await new Promise((r) => setTimeout(r, 220));

  if (MOCK_MATCH_RESULTS[jobId]) {
    return { ...MOCK_MATCH_RESULTS[jobId] };
  }

  // Realistic fallback for other jobs
  return {
    candidateId,
    jobId,
    overallAlignment: 78,
    breakdown: {
      skills: { name: "Skills Alignment", earned: 27, max: 35 },
      relevantExperience: { name: "Relevant Commercial Experience", earned: 19, max: 25 },
      roleAlignment: { name: "Role Scope & Seniority", earned: 12, max: 15 },
      location: { name: "Location & Work Mode", earned: 10, max: 10 },
      semanticRelevance: { name: "Semantic Domain Fit", earned: 7, max: 10 },
      education: { name: "Education & Credentials", earned: 3, max: 5 },
    },
    matched: [
      {
        criterion: "Core Modern JavaScript / TypeScript",
        category: "Skills",
        evidenceText: "4+ years confirmed experience across production web applications",
        status: "matched",
      },
      {
        criterion: "Frontend Architecture & Reusability",
        category: "Role Alignment",
        evidenceText: "Proven track record maintaining scalable design libraries",
        status: "matched",
      },
      {
        criterion: "Location Preference",
        category: "Location",
        evidenceText: "Open to hybrid or remote roles in Bengaluru and tier-1 Indian tech hubs",
        status: "matched",
      },
    ],
    missing: [
      {
        criterion: "Domain Specific Cloud Certification",
        category: "Education",
        evidenceText: "Role lists official cloud architect certification as preferred",
        status: "missing",
      },
    ],
    unknown: [
      {
        criterion: "High-scale real-time telemetry pipelines",
        category: "Skills",
        evidenceText: "We don't have enough confirmed information in your structured profile to determine this.",
        status: "unknown",
      },
    ],
  };
}

export async function submitMatchFeedback(
  candidateId: string,
  jobId: string,
  relevant: boolean,
  reason?: string
): Promise<{ success: boolean; message: string }> {
  await new Promise((r) => setTimeout(r, 300));
  return {
    success: true,
    message: relevant
      ? "Thank you for calibrating your recommendations."
      : `Feedback recorded: ${reason || "Reported as not relevant"}. We will adjust future criteria alignment.`,
  };
}
