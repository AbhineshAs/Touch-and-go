"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useCandidate } from "@/lib/candidate/context/CandidateContext";
import { useAuth } from "@/lib/auth/AuthContext";
import {
  CheckCircle2,
  Edit2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  User,
  AlertTriangle,
  Award,
  Calendar,
  Layers,
} from "lucide-react";

export default function OnboardingReviewPage() {
  const router = useRouter();
  const { discoveryDraft, confirmProfile } = useCandidate();
  const { refreshAuth } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateDashboard = () => {
    setIsSubmitting(true);
    confirmProfile();
    refreshAuth();
    router.push("/candidate/dashboard");
  };


  const careerStageLabel = discoveryDraft.careerStage
    ? discoveryDraft.careerStage.replace(/_/g, " ")
    : "Not specified";

  const goalLabel = discoveryDraft.primaryGoal
    ? discoveryDraft.primaryGoal.replace(/_/g, " ")
    : "Career Exploration";

  const primaryChallenge =
    discoveryDraft.primaryChallenge ||
    (discoveryDraft.challenges && discoveryDraft.challenges.length > 0
      ? discoveryDraft.challenges[0]
      : "general exploration");

  const timeLabel = discoveryDraft.timeBudget
    ? discoveryDraft.timeBudget.replace(/_/g, " ")
    : "1 to 3 hours / week";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur-md border-b border-border px-4 py-3 sm:px-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-black text-base shadow-xs">
              T
            </div>
            <span className="font-bold text-lg text-text-primary">TAG</span>
          </Link>
          <span className="text-xs font-semibold text-text-muted">
            Step 13 of 13 • Understanding Summary
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:py-12">
        <div className="flex flex-col gap-8">
          {/* Header Banner */}
          <div className="flex flex-col gap-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Have we understood you correctly?</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
              Review your career profile before we personalize your dashboard
            </h1>
            <p className="text-xs sm:text-sm text-text-muted max-w-2xl leading-relaxed">
              We translate confirmed answers into tailored recommendations and a rolling 7-day action plan. You can edit any section below.
            </p>
          </div>

          {/* Plain Language Synthesis Card */}
          <div className="p-5 sm:p-6 rounded-2xl bg-primary-soft/40 border border-primary/20 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-primary-dark font-bold text-xs">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>In summary:</span>
            </div>
            <p className="text-xs sm:text-sm text-text-primary leading-relaxed">
              You are currently approaching your journey as a{" "}
              <strong className="text-primary-dark font-bold capitalize">{careerStageLabel}</strong>{" "}
              with the primary goal to{" "}
              <strong className="text-primary-dark font-bold">{goalLabel}</strong>.{" "}
              You identified{" "}
              <strong className="text-primary-dark font-bold capitalize">
                {primaryChallenge.replace(/_/g, " ")}
              </strong>{" "}
              as the biggest obstacle to focus on right now. You have shared{" "}
              <strong>
                {discoveryDraft.skills?.length || 0} skill(s)
              </strong>
              , and you can dedicate around{" "}
              <strong className="text-primary-dark font-bold">{timeLabel}</strong> to your growth.
            </p>
          </div>

          {/* Grouped Editable Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Section 1: About You */}
            <Card className="p-5 bg-surface border-border shadow-xs flex flex-col justify-between gap-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-bold text-text-primary">About You</h3>
                  </div>
                  <Link
                    href="/onboarding"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-semibold"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit</span>
                  </Link>
                </div>

                <div className="flex flex-col gap-2 text-xs">
                  <div>
                    <span className="text-text-muted">Stage:</span>{" "}
                    <span className="font-semibold text-text-primary capitalize">{careerStageLabel}</span>
                  </div>
                  <div>
                    <span className="text-text-muted">Primary Goal:</span>{" "}
                    <span className="font-semibold text-text-primary capitalize">{goalLabel}</span>
                  </div>
                  <div>
                    <span className="text-text-muted">Target Roles:</span>{" "}
                    <span className="font-semibold text-text-primary">
                      {discoveryDraft.targetRoles?.join(", ") || "Exploring"}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Section 2: Your Challenges */}
            <Card className="p-5 bg-surface border-border shadow-xs flex flex-col justify-between gap-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-warning" />
                    <h3 className="text-sm font-bold text-text-primary">Your Challenges</h3>
                  </div>
                  <Link
                    href="/onboarding"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-semibold"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit</span>
                  </Link>
                </div>

                <div className="flex flex-col gap-2 text-xs">
                  <div>
                    <span className="text-text-muted">Primary Focus:</span>{" "}
                    <span className="font-semibold text-text-primary capitalize">
                      {primaryChallenge.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-muted">All Challenges:</span>{" "}
                    <span className="font-semibold text-text-primary">
                      {discoveryDraft.challenges?.map((c) => c.replace(/_/g, " ")).join(", ") || "None"}
                    </span>
                  </div>
                  {discoveryDraft.challengeFollowUp?.additionalContext && (
                    <div className="p-2 rounded bg-background text-[11px] text-text-secondary italic">
                      &ldquo;{discoveryDraft.challengeFollowUp.additionalContext}&rdquo;
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Section 3: Your Strengths & Skills */}
            <Card className="p-5 bg-surface border-border shadow-xs flex flex-col justify-between gap-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-bold text-text-primary">Strengths & Skills</h3>
                  </div>
                  <Link
                    href="/onboarding"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-semibold"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit</span>
                  </Link>
                </div>

                <div className="flex flex-col gap-2.5 text-xs">
                  <div>
                    <span className="text-text-muted">Reported Skills:</span>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {discoveryDraft.skills && discoveryDraft.skills.length > 0 ? (
                        discoveryDraft.skills.map((s) => (
                          <span
                            key={s.name}
                            className="px-2 py-0.5 rounded bg-border-subtle text-text-primary text-[11px] font-medium"
                          >
                            {s.name} ({s.level})
                          </span>
                        ))
                      ) : (
                        <span className="text-text-muted italic">Still exploring</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-text-muted">Core Strengths:</span>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {discoveryDraft.strengths && discoveryDraft.strengths.length > 0 ? (
                        discoveryDraft.strengths.map((st) => (
                          <span
                            key={st}
                            className="px-2 py-0.5 rounded bg-primary-soft/40 text-primary-dark text-[11px] font-medium"
                          >
                            {st.replace(/_/g, " ")}
                          </span>
                        ))
                      ) : (
                        <span className="text-text-muted italic">Not shared yet</span>
                      )}
                    </div>
                  </div>

                  {discoveryDraft.example?.text && (
                    <div>
                      <span className="text-text-muted">Supporting Example:</span>
                      <p className="p-2 rounded bg-background text-[11px] text-text-secondary mt-1">
                        {discoveryDraft.example.text}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Section 4: Your Plan & Preferences */}
            <Card className="p-5 bg-surface border-border shadow-xs flex flex-col justify-between gap-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-bold text-text-primary">Plan & Preferences</h3>
                  </div>
                  <Link
                    href="/onboarding"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-semibold"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit</span>
                  </Link>
                </div>

                <div className="flex flex-col gap-2 text-xs">
                  <div>
                    <span className="text-text-muted">Preferred Support:</span>{" "}
                    <span className="font-semibold text-text-primary capitalize">
                      {discoveryDraft.preferredSupport
                        ?.map((s) => s.replace(/_/g, " "))
                        .join(", ") || "No preference"}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-muted">Weekly Time Commitment:</span>{" "}
                    <span className="font-semibold text-text-primary capitalize">{timeLabel}</span>
                  </div>
                  <div>
                    <span className="text-text-muted">Work Mode:</span>{" "}
                    <span className="font-semibold text-text-primary capitalize">
                      {discoveryDraft.workPreferences?.locationMode || "Any"}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-muted">Resource Budget:</span>{" "}
                    <span className="font-semibold text-text-primary">
                      {discoveryDraft.workPreferences?.freeOnlyResources ? "Free & Open Source Only" : "Any"}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Transparent Principles Callout */}
          <div className="p-4 rounded-xl bg-surface border border-border flex items-start gap-3 text-xs text-text-secondary">
            <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="font-bold text-text-primary">Transparent by design</span>
              <span className="leading-relaxed">
                TAG never scores your employability, guesses hidden traits, or ranks you for employers. Your answers are used solely to propose actionable next steps and local learning exercises.
              </span>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border">
            <Link href="/onboarding">
              <Button size="md" variant="outline">
                Back to Questions
              </Button>
            </Link>

            <Button
              type="button"
              size="lg"
              variant="primary"
              onClick={handleCreateDashboard}
              isLoading={isSubmitting}
              disabled={isSubmitting}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Confirm
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
