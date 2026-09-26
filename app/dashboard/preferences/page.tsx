"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useCandidate } from "@/lib/candidate/context/CandidateContext";
import {
  CAREER_STAGE_OPTIONS,
  PRIMARY_GOAL_OPTIONS,
  CHALLENGE_OPTIONS,
  SUPPORT_TYPE_OPTIONS,
  TIME_BUDGET_OPTIONS,
} from "@/lib/candidate/discovery/config";
import {
  PrimaryGoal,
  ChallengeId,
  SupportType,
  TimeBudget,
  CareerStage,
} from "@/lib/candidate/types";
import {
  ArrowLeft,
  CheckCircle2,
  Sliders,
  Sparkles,
  Info,
  Layers,
  Save,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardPreferencesPage() {
  const router = useRouter();
  const { confirmedProfile, updateDiscoveryDraft, confirmProfile } = useCandidate();

  const initialDiscovery = confirmedProfile?.discovery || {
    careerStage: "student",
    primaryGoal: "explore_careers",
    targetRoles: ["Frontend Engineer"],
    challenges: ["few_interview_calls"],
    primaryChallenge: "few_interview_calls",
    skills: [{ name: "React", level: "comfortable" }],
    strengths: ["problem_solving"],
    preferredSupport: ["cv_support"],
    timeBudget: "1_to_3_hours",
  };

  const [careerStage, setCareerStage] = useState<CareerStage>(initialDiscovery.careerStage || "student");
  const [primaryGoal, setPrimaryGoal] = useState<PrimaryGoal>(initialDiscovery.primaryGoal || "explore_careers");
  const [challenges, setChallenges] = useState<ChallengeId[]>(initialDiscovery.challenges || ["few_interview_calls"]);
  const [primaryChallenge, setPrimaryChallenge] = useState<ChallengeId>(
    initialDiscovery.primaryChallenge || challenges[0] || "few_interview_calls"
  );
  const [preferredSupport, setPreferredSupport] = useState<SupportType[]>(
    initialDiscovery.preferredSupport || ["cv_support"]
  );
  const [timeBudget, setTimeBudget] = useState<TimeBudget>(initialDiscovery.timeBudget || "1_to_3_hours");
  const [skillInput, setSkillInput] = useState(
    initialDiscovery.skills?.map((s) => s.name).join(", ") || "React, JavaScript"
  );

  const handleChallengeToggle = (id: ChallengeId) => {
    if (challenges.includes(id)) {
      const next = challenges.filter((c) => c !== id);
      setChallenges(next);
      if (primaryChallenge === id) {
        setPrimaryChallenge(next[0] || "unclear_direction");
      }
    } else {
      if (challenges.length >= 3) return;
      const next = [...challenges, id];
      setChallenges(next);
      if (next.length === 1) {
        setPrimaryChallenge(id);
      }
    }
  };

  const handleSupportToggle = (id: SupportType) => {
    if (preferredSupport.includes(id)) {
      setPreferredSupport(preferredSupport.filter((p) => p !== id));
    } else {
      if (preferredSupport.length >= 2) return;
      setPreferredSupport([...preferredSupport, id]);
    }
  };

  const handleSaveAndRecompute = () => {
    const parsedSkills = skillInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((name) => ({ name, level: "comfortable" as const }));

    updateDiscoveryDraft({
      careerStage,
      primaryGoal,
      challenges,
      primaryChallenge,
      preferredSupport,
      timeBudget,
      skills: parsedSkills,
    });

    confirmProfile();
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur-md border-b border-border px-4 py-3 sm:px-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <span className="text-xs font-semibold text-text-secondary">
            Edit Career Preferences
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:py-10 flex flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
            <Sliders className="w-3.5 h-3.5" />
            <span>Preferences & Discovery Settings</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary">
            Update your answers to regenerate recommendations
          </h1>
          <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
            Changing your answers will recalculate top recommendations and re-budget your 7-day action plan while preserving still-applicable completed tasks.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          {/* 1. Career Stage */}
          <Card className="p-5 bg-surface border-border shadow-xs flex flex-col gap-3">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">
              1. Career Stage
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CAREER_STAGE_OPTIONS.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setCareerStage(st.id)}
                  className={cn(
                    "p-2.5 rounded-xl border text-center text-xs font-semibold transition-all cursor-pointer",
                    careerStage === st.id
                      ? "bg-primary text-white border-primary"
                      : "bg-background text-text-secondary border-border hover:border-border-strong"
                  )}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </Card>

          {/* 2. Primary Goal */}
          <Card className="p-5 bg-surface border-border shadow-xs flex flex-col gap-3">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">
              2. Primary Goal
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRIMARY_GOAL_OPTIONS.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setPrimaryGoal(g.id)}
                  className={cn(
                    "p-3 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer",
                    primaryGoal === g.id
                      ? "bg-primary-soft/40 text-primary-dark border-primary font-bold"
                      : "bg-background text-text-secondary border-border hover:border-border-strong"
                  )}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </Card>

          {/* 3. Challenges & Primary Challenge */}
          <Card className="p-5 bg-surface border-border shadow-xs flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">
                3. Challenges (up to 3)
              </h3>
              <span className="text-[11px] text-primary font-semibold">
                {challenges.length} of 3 selected
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CHALLENGE_OPTIONS.map((ch) => {
                const isSelected = challenges.includes(ch.id);
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => handleChallengeToggle(ch.id)}
                    className={cn(
                      "p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer",
                      isSelected
                        ? "bg-primary-soft/30 text-primary-dark border-primary font-semibold"
                        : "bg-background text-text-secondary border-border hover:border-border-strong"
                    )}
                  >
                    {ch.label}
                  </button>
                );
              })}
            </div>

            {challenges.length > 1 && (
              <div className="pt-3 border-t border-border-subtle flex flex-col gap-2">
                <span className="text-xs font-bold text-text-primary">
                  Choose primary challenge to prioritize:
                </span>
                <div className="flex flex-wrap gap-2">
                  {challenges.map((chId) => (
                    <button
                      key={chId}
                      type="button"
                      onClick={() => setPrimaryChallenge(chId)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg border text-xs font-semibold capitalize cursor-pointer",
                        primaryChallenge === chId
                          ? "bg-primary text-white border-primary"
                          : "bg-background text-text-secondary border-border"
                      )}
                    >
                      {chId.replace(/_/g, " ")}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* 4. Skills Input */}
          <Card className="p-5 bg-surface border-border shadow-xs flex flex-col gap-2.5">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">
              4. Technical Skills (comma separated)
            </h3>
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              className="h-10 px-3 rounded-xl border border-border bg-background text-xs text-text-primary"
              placeholder="React, TypeScript, SQL..."
            />
            <span className="text-[11px] text-text-muted">
              Changing a learning topic creates a fresh task identity and will not inherit completion from another topic.
            </span>
          </Card>

          {/* 5. Preferred Support */}
          <Card className="p-5 bg-surface border-border shadow-xs flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">
                5. Preferred Support (up to 2)
              </h3>
              <span className="text-[11px] text-primary font-semibold">
                {preferredSupport.length} of 2 selected
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SUPPORT_TYPE_OPTIONS.map((sup) => {
                const isSelected = preferredSupport.includes(sup.id);
                return (
                  <button
                    key={sup.id}
                    type="button"
                    onClick={() => handleSupportToggle(sup.id)}
                    className={cn(
                      "p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer",
                      isSelected
                        ? "bg-primary-soft/30 text-primary-dark border-primary font-semibold"
                        : "bg-background text-text-secondary border-border hover:border-border-strong"
                    )}
                  >
                    {sup.label}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* 6. Weekly Time Budget */}
          <Card className="p-5 bg-surface border-border shadow-xs flex flex-col gap-3">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">
              6. Weekly Time Commitment
            </h3>
            <div className="flex flex-col gap-2">
              {TIME_BUDGET_OPTIONS.map((tb) => (
                <button
                  key={tb.id}
                  type="button"
                  onClick={() => setTimeBudget(tb.id)}
                  className={cn(
                    "p-3 rounded-xl border text-left flex items-center justify-between text-xs transition-all cursor-pointer",
                    timeBudget === tb.id
                      ? "bg-primary-soft/40 text-primary-dark border-primary font-semibold"
                      : "bg-background text-text-secondary border-border"
                  )}
                >
                  <span className="font-bold">{tb.label}</span>
                  <span className="text-[11px] text-text-muted">{tb.description}</span>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Bottom Save CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <Link href="/dashboard">
            <Button size="md" variant="outline">
              Cancel
            </Button>
          </Link>

          <Button
            size="lg"
            variant="primary"
            onClick={handleSaveAndRecompute}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Confirm & Rebuild Dashboard
          </Button>
        </div>
      </main>
    </div>
  );
}
