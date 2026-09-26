"use client";

import React, { useReducer, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  DISCOVERY_STEPS,
  CAREER_STAGE_OPTIONS,
  PRIMARY_GOAL_OPTIONS,
  COMMON_TECH_ROLES,
  CHALLENGE_OPTIONS,
  COMMON_SKILLS,
  STRENGTH_OPTIONS,
  SUPPORT_TYPE_OPTIONS,
  TIME_BUDGET_OPTIONS,
} from "@/lib/candidate/discovery/config";
import {
  discoveryReducer,
  initialDiscoveryState,
  getEffectivePrimaryChallenge,
  shouldSkipStep5,
  shouldSkipStep6,
} from "@/lib/candidate/discovery/reducer";
import { useCandidate } from "@/lib/candidate/context/CandidateContext";
import {
  CareerStage,
  PrimaryGoal,
  ChallengeId,
  StrengthId,
  SupportType,
  TimeBudget,
  SkillLevel,
} from "@/lib/candidate/types";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info,
  Layers,
  Clock,
  Target,
  FileText,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function OnboardingDiscoveryPage() {
  const router = useRouter();
  const { discoveryDraft, updateDiscoveryDraft } = useCandidate();

  const [state, dispatch] = useReducer(discoveryReducer, {
    ...initialDiscoveryState,
    draft: {
      ...initialDiscoveryState.draft,
      ...discoveryDraft,
    },
  });

  const [isMobileSummaryOpen, setIsMobileSummaryOpen] = useState(false);
  const [customRoleInput, setCustomRoleInput] = useState("");
  const [customSkillInput, setCustomSkillInput] = useState("");

  const currentStep = DISCOVERY_STEPS.find((s) => s.index === state.currentStepIndex) || DISCOVERY_STEPS[0];
  const totalSteps = 12;

  // Sync state draft back to CandidateContext
  const handleDraftChange = (partial: Parameters<typeof updateDiscoveryDraft>[0]) => {
    dispatch({ type: "UPDATE_DRAFT", payload: partial });
    updateDiscoveryDraft(partial);
  };

  const handleNext = () => {
    if (state.currentStepIndex >= 12) {
      router.push("/onboarding/review");
      return;
    }
    dispatch({ type: "NEXT_STEP" });
  };

  const handlePrev = () => {
    dispatch({ type: "PREV_STEP" });
  };

  const handleSkip = () => {
    if (state.currentStepIndex >= 12) {
      router.push("/onboarding/review");
      return;
    }
    dispatch({ type: "SKIP_STEP" });
  };

  // --- Step 1: Career Stage Helpers ---
  const handleStageSelect = (stage: CareerStage) => {
    handleDraftChange({
      careerStage: stage,
      stageBackground: { type: stage === "experienced" ? "experienced" : stage === "switcher" ? "switcher" : "student" },
    });
  };

  // --- Step 3: Target Roles Helpers ---
  const handleRoleToggle = (role: string) => {
    const current = state.draft.targetRoles || [];
    if (current.includes(role)) {
      handleDraftChange({ targetRoles: current.filter((r) => r !== role) });
    } else {
      if (current.length >= 3) return;
      handleDraftChange({ targetRoles: [...current, role] });
    }
  };

  const handleAddCustomRole = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customRoleInput.trim();
    if (!clean) return;
    const current = state.draft.targetRoles || [];
    if (current.length < 3 && !current.includes(clean)) {
      handleDraftChange({ targetRoles: [...current, clean] });
      setCustomRoleInput("");
    }
  };

  // --- Step 4: Challenges Helpers ---
  const handleChallengeToggle = (id: ChallengeId) => {
    const current = state.draft.challenges || [];

    if (id === "nothing_specific" || id === "prefer_not_to_say") {
      handleDraftChange({
        challenges: [id],
        primaryChallenge: id,
      });
      return;
    }

    const filtered = current.filter((c) => c !== "nothing_specific" && c !== "prefer_not_to_say");
    if (filtered.includes(id)) {
      const nextChallenges = filtered.filter((c) => c !== id);
      handleDraftChange({
        challenges: nextChallenges,
        primaryChallenge: nextChallenges.length === 1 ? nextChallenges[0] : undefined,
      });
    } else {
      if (filtered.length >= 3) return;
      const nextChallenges = [...filtered, id];
      handleDraftChange({
        challenges: nextChallenges,
        primaryChallenge: nextChallenges.length === 1 ? nextChallenges[0] : state.draft.primaryChallenge,
      });
    }
  };

  // --- Step 7: Skills Helpers ---
  const handleSkillLevelChange = (skillName: string, level: SkillLevel) => {
    const current = state.draft.skills || [];
    const exists = current.find((s) => s.name.toLowerCase() === skillName.toLowerCase());

    if (exists) {
      handleDraftChange({
        skills: current.map((s) =>
          s.name.toLowerCase() === skillName.toLowerCase() ? { ...s, level } : s
        ),
        isExploringSkills: false,
      });
    } else {
      if (current.length >= 10) return;
      handleDraftChange({
        skills: [...current, { name: skillName, level }],
        isExploringSkills: false,
      });
    }
  };

  const handleRemoveSkill = (skillName: string) => {
    const current = state.draft.skills || [];
    handleDraftChange({
      skills: current.filter((s) => s.name.toLowerCase() !== skillName.toLowerCase()),
    });
  };

  const handleAddCustomSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customSkillInput.trim();
    if (!clean) return;
    const current = state.draft.skills || [];
    if (current.length < 10 && !current.some((s) => s.name.toLowerCase() === clean.toLowerCase())) {
      handleDraftChange({
        skills: [...current, { name: clean, level: "comfortable" }],
        isExploringSkills: false,
      });
      setCustomSkillInput("");
    }
  };

  // --- Step 8: Strengths Helpers ---
  const handleStrengthToggle = (id: StrengthId) => {
    const current = state.draft.strengths || [];
    if (id === "not_sure_yet") {
      handleDraftChange({ strengths: ["not_sure_yet"] });
      return;
    }

    const filtered = current.filter((s) => s !== "not_sure_yet");
    if (filtered.includes(id)) {
      handleDraftChange({ strengths: filtered.filter((s) => s !== id) });
    } else {
      if (filtered.length >= 3) return;
      handleDraftChange({ strengths: [...filtered, id] });
    }
  };

  // --- Step 10: Preferred Support Helpers ---
  const handleSupportToggle = (id: SupportType) => {
    const current = state.draft.preferredSupport || [];
    if (id === "no_preference") {
      handleDraftChange({ preferredSupport: ["no_preference"] });
      return;
    }

    const filtered = current.filter((p) => p !== "no_preference");
    if (filtered.includes(id)) {
      handleDraftChange({ preferredSupport: filtered.filter((p) => p !== id) });
    } else {
      if (filtered.length >= 2) return;
      handleDraftChange({ preferredSupport: [...filtered, id] });
    }
  };

  // Render Question Form by Step
  const renderCurrentQuestion = () => {
    switch (state.currentStepIndex) {
      // Q1: Career Stage
      case 1:
        return (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CAREER_STAGE_OPTIONS.map((opt) => {
                const isSelected = state.draft.careerStage === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleStageSelect(opt.id)}
                    className={cn(
                      "p-4 rounded-xl border text-left flex flex-col justify-between gap-2 transition-all cursor-pointer",
                      isSelected
                        ? "border-primary bg-primary-soft/30 shadow-xs"
                        : "border-border bg-surface hover:border-border-strong hover:bg-background"
                    )}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-sm text-text-primary">{opt.label}</span>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-text-secondary">{opt.description}</p>
                  </button>
                );
              })}
            </div>

            {/* Stage-Specific Background Follow-up */}
            {state.draft.careerStage && (
              <div className="mt-4 p-4 rounded-xl bg-background border border-border-subtle flex flex-col gap-3">
                <span className="text-xs font-bold text-text-primary">
                  {state.draft.careerStage === "experienced"
                    ? "Optional: Tell us about your background"
                    : state.draft.careerStage === "switcher"
                    ? "Optional: Your career transition context"
                    : "Optional: Education or current projects"}
                </span>

                {state.draft.careerStage === "experienced" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-medium text-text-muted">Years of tech experience</label>
                      <select
                        value={(state.draft.stageBackground?.type === "experienced" && state.draft.stageBackground.experienceBand) || ""}
                        onChange={(e) =>
                          handleDraftChange({
                            stageBackground: {
                              type: "experienced",
                              experienceBand: e.target.value as any,
                              recentRole: (state.draft.stageBackground?.type === "experienced" && state.draft.stageBackground.recentRole) || "",
                            },
                          })
                        }
                        className="h-9 px-2.5 rounded-lg border border-border bg-surface text-xs text-text-primary"
                      >
                        <option value="">Select experience band...</option>
                        <option value="1-2">1 to 2 years</option>
                        <option value="3-5">3 to 5 years</option>
                        <option value="5-8">5 to 8 years</option>
                        <option value="8+">8+ years</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-medium text-text-muted">Most recent role or title</label>
                      <input
                        type="text"
                        placeholder="e.g. Junior Backend Engineer"
                        value={(state.draft.stageBackground?.type === "experienced" && state.draft.stageBackground.recentRole) || ""}
                        onChange={(e) =>
                          handleDraftChange({
                            stageBackground: {
                              type: "experienced",
                              experienceBand: (state.draft.stageBackground?.type === "experienced" && state.draft.stageBackground.experienceBand) || "1-2",
                              recentRole: e.target.value,
                            },
                          })
                        }
                        className="h-9 px-3 rounded-lg border border-border bg-surface text-xs text-text-primary"
                      />
                    </div>
                  </div>
                )}

                {state.draft.careerStage === "switcher" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-medium text-text-muted">Previous field or industry</label>
                      <input
                        type="text"
                        placeholder="e.g. Mechanical Engineering, Sales, Finance"
                        value={(state.draft.stageBackground?.type === "switcher" && state.draft.stageBackground.previousField) || ""}
                        onChange={(e) =>
                          handleDraftChange({
                            stageBackground: {
                              type: "switcher",
                              previousField: e.target.value,
                              targetDirection: (state.draft.stageBackground?.type === "switcher" && state.draft.stageBackground.targetDirection) || "",
                            },
                          })
                        }
                        className="h-9 px-3 rounded-lg border border-border bg-surface text-xs text-text-primary"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-medium text-text-muted">Intended tech specialty</label>
                      <input
                        type="text"
                        placeholder="e.g. Full Stack Development"
                        value={(state.draft.stageBackground?.type === "switcher" && state.draft.stageBackground.targetDirection) || ""}
                        onChange={(e) =>
                          handleDraftChange({
                            stageBackground: {
                              type: "switcher",
                              previousField: (state.draft.stageBackground?.type === "switcher" && state.draft.stageBackground.previousField) || "",
                              targetDirection: e.target.value,
                            },
                          })
                        }
                        className="h-9 px-3 rounded-lg border border-border bg-surface text-xs text-text-primary"
                      />
                    </div>
                  </div>
                )}

                {(state.draft.careerStage === "student" || state.draft.careerStage === "fresher") && (
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-medium text-text-muted">Degree, major, or key project</label>
                    <input
                      type="text"
                      placeholder="e.g. B.Tech Computer Science / Final year capstone in React"
                      value={(state.draft.stageBackground?.type === "student" || state.draft.stageBackground?.type === "fresher") ? state.draft.stageBackground.educationOrProject || "" : ""}
                      onChange={(e) =>
                        handleDraftChange({
                          stageBackground: {
                            type: state.draft.careerStage as "student" | "fresher",
                            educationOrProject: e.target.value,
                          },
                        })
                      }
                      className="h-9 px-3 rounded-lg border border-border bg-surface text-xs text-text-primary"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        );

      // Q2: Primary Goal
      case 2:
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PRIMARY_GOAL_OPTIONS.map((goal) => {
              const isSelected = state.draft.primaryGoal === goal.id;
              return (
                <button
                  key={goal.id}
                  type="button"
                  onClick={() => handleDraftChange({ primaryGoal: goal.id })}
                  className={cn(
                    "p-4 rounded-xl border text-left flex flex-col justify-between gap-2 transition-all cursor-pointer",
                    isSelected
                      ? "border-primary bg-primary-soft/30 shadow-xs"
                      : "border-border bg-surface hover:border-border-strong hover:bg-background"
                  )}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-sm text-text-primary">{goal.label}</span>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-text-secondary">{goal.description}</p>
                </button>
              );
            })}
          </div>
        );

      // Q3: Target Roles (up to 3)
      case 3:
        return (
          <div className="flex flex-col gap-5">
            <div className="flex justify-between items-center text-xs text-text-secondary">
              <span>Select up to 3 roles:</span>
              <span className="font-semibold text-primary">
                {state.draft.targetRoles.length} of 3 selected
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleRoleToggle("Exploring All Roles")}
                className={cn(
                  "px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer",
                  state.draft.targetRoles.includes("Exploring All Roles")
                    ? "bg-primary text-white border-primary"
                    : "bg-surface text-text-primary border-border hover:border-primary"
                )}
              >
                🔍 Exploring All Roles
              </button>

              {COMMON_TECH_ROLES.map((role) => {
                const isSelected = state.draft.targetRoles.includes(role);
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleRoleToggle(role)}
                    className={cn(
                      "px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer",
                      isSelected
                        ? "bg-primary text-white border-primary"
                        : "bg-surface text-text-primary border-border hover:border-primary"
                    )}
                  >
                    {role}
                  </button>
                );
              })}
            </div>

            {/* Custom Role Input */}
            <form onSubmit={handleAddCustomRole} className="flex gap-2 items-center pt-2">
              <input
                type="text"
                placeholder="Add other role (e.g. SRE, Security Engineer)..."
                value={customRoleInput}
                onChange={(e) => setCustomRoleInput(e.target.value)}
                disabled={state.draft.targetRoles.length >= 3}
                className="flex-1 h-9 px-3 rounded-lg border border-border bg-surface text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary disabled:opacity-50"
              />
              <Button
                type="submit"
                size="sm"
                variant="outline"
                disabled={!customRoleInput.trim() || state.draft.targetRoles.length >= 3}
              >
                Add Role
              </Button>
            </form>
          </div>
        );

      // Q4: Challenges (up to 3)
      case 4:
        return (
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center text-xs text-text-secondary">
              <span>Select up to 3 challenges:</span>
              <span className="font-semibold text-primary">
                {state.draft.challenges.length} of 3 selected
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CHALLENGE_OPTIONS.map((ch) => {
                const isSelected = state.draft.challenges.includes(ch.id);
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => handleChallengeToggle(ch.id)}
                    className={cn(
                      "p-3.5 rounded-xl border text-left flex flex-col justify-between gap-1.5 transition-all cursor-pointer",
                      isSelected
                        ? "border-primary bg-primary-soft/30 shadow-xs"
                        : "border-border bg-surface hover:border-border-strong hover:bg-background"
                    )}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-xs sm:text-sm text-text-primary">{ch.label}</span>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>
                    {ch.description && <p className="text-[11px] text-text-secondary">{ch.description}</p>}
                  </button>
                );
              })}
            </div>
          </div>
        );

      // Q5: Primary Challenge (conditional)
      case 5:
        return (
          <div className="flex flex-col gap-4">
            <p className="text-xs text-text-secondary">
              You selected multiple challenges. Which one would you like your initial recommendations to focus on first?
            </p>
            <div className="flex flex-col gap-2.5">
              {state.draft.challenges.map((chId) => {
                const ch = CHALLENGE_OPTIONS.find((c) => c.id === chId);
                const isSelected = state.draft.primaryChallenge === chId;
                return (
                  <button
                    key={chId}
                    type="button"
                    onClick={() => handleDraftChange({ primaryChallenge: chId })}
                    className={cn(
                      "p-3.5 rounded-xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer",
                      isSelected
                        ? "border-primary bg-primary-soft/30 shadow-xs"
                        : "border-border bg-surface hover:border-border-strong hover:bg-background"
                    )}
                  >
                    <span className="font-bold text-xs sm:text-sm text-text-primary">{ch?.label || chId}</span>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );

      // Q6: Relevant Follow-up
      case 6: {
        const primary = getEffectivePrimaryChallenge(state.draft);
        return (
          <div className="flex flex-col gap-5">
            {primary === "few_interview_calls" && (
              <div className="flex flex-col gap-3">
                <label className="text-xs font-bold text-text-primary">
                  Where would you prefer to focus your review?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { id: "cv", label: "Review CV presentation & impact metrics" },
                    { id: "targeting", label: "Audit role-targeting against my skills" },
                    { id: "application_organization", label: "Organize applications & outreach routine" },
                    { id: "unsure", label: "Not sure — general review" },
                  ].map((item) => {
                    const isSelected =
                      state.draft.challengeFollowUp?.challenge === "few_interview_calls" &&
                      state.draft.challengeFollowUp.supportPreference === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() =>
                          handleDraftChange({
                            challengeFollowUp: {
                              challenge: "few_interview_calls",
                              supportPreference: item.id as any,
                              additionalContext: state.draft.challengeFollowUp?.additionalContext,
                            },
                          })
                        }
                        className={cn(
                          "p-3 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer",
                          isSelected
                            ? "border-primary bg-primary-soft/30 text-primary"
                            : "border-border bg-surface text-text-primary hover:border-border-strong"
                        )}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {primary === "interview_prep" && (
              <div className="flex flex-col gap-3">
                <label className="text-xs font-bold text-text-primary">
                  Which interview stage feels most challenging?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { id: "introducing_yourself", label: "Introducing myself & background summary" },
                    { id: "technical", label: "Technical problem-solving & live coding" },
                    { id: "explaining_experience", label: "Explaining past projects & STAR stories" },
                    { id: "unsure", label: "Unsure — practice all stages" },
                  ].map((item) => {
                    const isSelected =
                      state.draft.challengeFollowUp?.challenge === "interview_prep" &&
                      state.draft.challengeFollowUp.interviewStage === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() =>
                          handleDraftChange({
                            challengeFollowUp: {
                              challenge: "interview_prep",
                              interviewStage: item.id as any,
                              additionalContext: state.draft.challengeFollowUp?.additionalContext,
                            },
                          })
                        }
                        className={cn(
                          "p-3 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer",
                          isSelected
                            ? "border-primary bg-primary-soft/30 text-primary"
                            : "border-border bg-surface text-text-primary hover:border-border-strong"
                        )}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {primary === "skills_to_develop" && (
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-text-primary">
                  Which specific skill or framework do you want to tackle first?
                </label>
                <input
                  type="text"
                  placeholder="e.g. React, SQL, Docker, Python..."
                  value={
                    state.draft.challengeFollowUp?.challenge === "skills_to_develop"
                      ? state.draft.challengeFollowUp.targetSkill
                      : ""
                  }
                  onChange={(e) =>
                    handleDraftChange({
                      challengeFollowUp: {
                        challenge: "skills_to_develop",
                        targetSkill: e.target.value,
                        additionalContext: state.draft.challengeFollowUp?.additionalContext,
                      },
                    })
                  }
                  className="h-10 px-3 rounded-xl border border-border bg-surface text-xs text-text-primary"
                />
              </div>
            )}

            {primary === "limited_projects" && (
              <div className="flex flex-col gap-3">
                <label className="text-xs font-bold text-text-primary">
                  Have you built a working application or coursework project already?
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: "yes", label: "Yes, I have an existing project" },
                    { id: "no", label: "No, starting from scratch" },
                    { id: "unsure", label: "Unsure / in progress" },
                  ].map((item) => {
                    const isSelected =
                      state.draft.challengeFollowUp?.challenge === "limited_projects" &&
                      state.draft.challengeFollowUp.hasExistingProject === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() =>
                          handleDraftChange({
                            challengeFollowUp: {
                              challenge: "limited_projects",
                              hasExistingProject: item.id as any,
                              additionalContext: state.draft.challengeFollowUp?.additionalContext,
                            },
                          })
                        }
                        className={cn(
                          "p-3 rounded-xl border text-center text-xs font-semibold transition-all cursor-pointer",
                          isSelected
                            ? "border-primary bg-primary-soft/30 text-primary"
                            : "border-border bg-surface text-text-primary hover:border-border-strong"
                        )}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Optional Additional Context (max 500 chars) */}
            <div className="flex flex-col gap-1.5 pt-2">
              <div className="flex justify-between items-center text-[11px] text-text-muted">
                <span>Optional short context (for your reference only)</span>
                <span>{state.draft.challengeFollowUp?.additionalContext?.length || 0}/500</span>
              </div>
              <textarea
                rows={3}
                maxLength={500}
                placeholder="Add any specific context or notes you'd like to remember..."
                value={state.draft.challengeFollowUp?.additionalContext || ""}
                onChange={(e) => {
                  const currentFollowUp = state.draft.challengeFollowUp || {
                    challenge: (primary as any) || "other",
                  };
                  handleDraftChange({
                    challengeFollowUp: {
                      ...currentFollowUp,
                      additionalContext: e.target.value,
                    } as any,
                  });
                }}
                className="p-3 rounded-xl border border-border bg-surface text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary resize-none"
              />
              <span className="text-[10px] text-text-muted">
                Note: Free-text is preserved as context for your eyes only; it is not parsed by AI models.
              </span>
            </div>
          </div>
        );
      }

      // Q7: Skills
      case 7:
        return (
          <div className="flex flex-col gap-5">
            <div className="flex justify-between items-center">
              <span className="text-xs text-text-secondary">Self-reported skill familiarity:</span>
              <button
                type="button"
                onClick={() => handleDraftChange({ isExploringSkills: true, skills: [] })}
                className={cn(
                  "text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors cursor-pointer",
                  state.draft.isExploringSkills
                    ? "bg-primary text-white border-primary"
                    : "bg-surface text-text-secondary border-border hover:border-primary"
                )}
              >
                🌱 Still exploring tech skills
              </button>
            </div>

            {/* Skills List with Ratings */}
            <div className="flex flex-col gap-2.5">
              {COMMON_SKILLS.slice(0, 10).map((skill) => {
                const current = state.draft.skills.find(
                  (s) => s.name.toLowerCase() === skill.toLowerCase()
                );
                return (
                  <div
                    key={skill}
                    className="p-2.5 sm:p-3 rounded-xl border border-border bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <span className="text-xs font-bold text-text-primary">{skill}</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {(["new", "learning", "comfortable", "confident"] as SkillLevel[]).map(
                        (level) => {
                          const isActive = current?.level === level;
                          return (
                            <button
                              key={level}
                              type="button"
                              onClick={() => handleSkillLevelChange(skill, level)}
                              className={cn(
                                "px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer capitalize",
                                isActive
                                  ? "bg-primary text-white border-primary"
                                  : "bg-background text-text-secondary border-border hover:border-border-strong"
                              )}
                            >
                              {level === "new" ? "New to this" : level}
                            </button>
                          );
                        }
                      )}
                      {current && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="px-2 py-1 text-[11px] text-danger hover:underline cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Custom Skill Input */}
            <form onSubmit={handleAddCustomSkill} className="flex gap-2 items-center pt-2">
              <input
                type="text"
                placeholder="Add custom skill (e.g. Next.js, Go, Rust)..."
                value={customSkillInput}
                onChange={(e) => setCustomSkillInput(e.target.value)}
                disabled={state.draft.skills.length >= 10}
                className="flex-1 h-9 px-3 rounded-lg border border-border bg-surface text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary disabled:opacity-50"
              />
              <Button
                type="submit"
                size="sm"
                variant="outline"
                disabled={!customSkillInput.trim() || state.draft.skills.length >= 10}
              >
                Add Skill
              </Button>
            </form>
          </div>
        );

      // Q8: Strengths (up to 3)
      case 8:
        return (
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center text-xs text-text-secondary">
              <span>Select up to 3 strengths (optional):</span>
              <span className="font-semibold text-primary">
                {state.draft.strengths.length} of 3 selected
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {STRENGTH_OPTIONS.map((st) => {
                const isSelected = state.draft.strengths.includes(st.id);
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => handleStrengthToggle(st.id)}
                    className={cn(
                      "p-3.5 rounded-xl border text-left flex flex-col justify-between gap-1.5 transition-all cursor-pointer",
                      isSelected
                        ? "border-primary bg-primary-soft/30 shadow-xs"
                        : "border-border bg-surface hover:border-border-strong hover:bg-background"
                    )}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-xs sm:text-sm text-text-primary">{st.label}</span>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>
                    {st.description && <p className="text-[11px] text-text-secondary">{st.description}</p>}
                  </button>
                );
              })}
            </div>
          </div>
        );

      // Q9: Optional Example (max 500 chars)
      case 9:
        return (
          <div className="flex flex-col gap-4">
            <p className="text-xs text-text-secondary">
              Sharing a concrete example provides supporting context on your dashboard. This is never required.
            </p>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-text-primary">
                  Link example to a skill or strength:
                </label>
                <select
                  value={state.draft.example?.linkedItemId || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!val) {
                      handleDraftChange({ example: undefined });
                      return;
                    }
                    handleDraftChange({
                      example: {
                        linkedItemType: "skill",
                        linkedItemId: val,
                        linkedItemLabel: val,
                        text: state.draft.example?.text || "",
                      },
                    });
                  }}
                  className="h-10 px-3 rounded-xl border border-border bg-surface text-xs text-text-primary"
                >
                  <option value="">Select a skill or strength to link...</option>
                  <optgroup label="Your Selected Skills">
                    {state.draft.skills.map((s) => (
                      <option key={s.name} value={s.name}>
                        {s.name} ({s.level})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Your Strengths">
                    {state.draft.strengths.map((st) => (
                      <option key={st} value={st}>
                        {st.replace(/_/g, " ")}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-[11px] text-text-muted">
                  <span>Describe what you did and the outcome</span>
                  <span>{state.draft.example?.text?.length || 0}/500</span>
                </div>
                <textarea
                  rows={4}
                  maxLength={500}
                  placeholder="e.g. Built a real-time chat demo using Next.js and WebSockets; optimized state updates to handle 50 messages/sec without layout shift."
                  value={state.draft.example?.text || ""}
                  onChange={(e) =>
                    handleDraftChange({
                      example: {
                        linkedItemType: state.draft.example?.linkedItemType || "skill",
                        linkedItemId: state.draft.example?.linkedItemId || "general",
                        linkedItemLabel: state.draft.example?.linkedItemLabel || "General",
                        text: e.target.value,
                      },
                    })
                  }
                  className="p-3 rounded-xl border border-border bg-surface text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary resize-none"
                />
              </div>
            </div>
          </div>
        );

      // Q10: Preferred Support (up to 2)
      case 10:
        return (
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center text-xs text-text-secondary">
              <span>Select up to 2 preferred support types:</span>
              <span className="font-semibold text-primary">
                {state.draft.preferredSupport.length} of 2 selected
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SUPPORT_TYPE_OPTIONS.map((sup) => {
                const isSelected = state.draft.preferredSupport.includes(sup.id);
                return (
                  <button
                    key={sup.id}
                    type="button"
                    onClick={() => handleSupportToggle(sup.id)}
                    className={cn(
                      "p-3.5 rounded-xl border text-left flex flex-col justify-between gap-1.5 transition-all cursor-pointer",
                      isSelected
                        ? "border-primary bg-primary-soft/30 shadow-xs"
                        : "border-border bg-surface hover:border-border-strong hover:bg-background"
                    )}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-xs sm:text-sm text-text-primary">{sup.label}</span>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>
                    {sup.description && <p className="text-[11px] text-text-secondary">{sup.description}</p>}
                  </button>
                );
              })}
            </div>
          </div>
        );

      // Q11: Time Budget
      case 11:
        return (
          <div className="flex flex-col gap-4">
            <p className="text-xs text-text-secondary">
              Your weekly 7-day action plan will be strictly capped inside this duration so you never feel overbooked.
            </p>

            <div className="flex flex-col gap-2.5">
              {TIME_BUDGET_OPTIONS.map((tb) => {
                const isSelected = state.draft.timeBudget === tb.id;
                return (
                  <button
                    key={tb.id}
                    type="button"
                    onClick={() => handleDraftChange({ timeBudget: tb.id })}
                    className={cn(
                      "p-3.5 rounded-xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer",
                      isSelected
                        ? "border-primary bg-primary-soft/30 shadow-xs"
                        : "border-border bg-surface hover:border-border-strong hover:bg-background"
                    )}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-xs sm:text-sm text-text-primary">{tb.label}</span>
                      <span className="text-[11px] text-text-muted">{tb.description}</span>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );

      // Q12: Work & Learning Preferences (optional)
      case 12:
        return (
          <div className="flex flex-col gap-4">
            <p className="text-xs text-text-secondary">
              Optional constraints to tailor dashboard recommendations around your lifestyle.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-text-primary">Preferred Work Mode</label>
                <select
                  value={state.draft.workPreferences?.locationMode || "any"}
                  onChange={(e) =>
                    handleDraftChange({
                      workPreferences: {
                        ...state.draft.workPreferences,
                        locationMode: e.target.value as any,
                      },
                    })
                  }
                  className="h-10 px-3 rounded-xl border border-border bg-surface text-xs text-text-primary"
                >
                  <option value="any">Any location mode</option>
                  <option value="remote">Remote only</option>
                  <option value="hybrid">Hybrid (office + home)</option>
                  <option value="onsite">On-site office</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-text-primary">Employment Type</label>
                <select
                  value={state.draft.workPreferences?.jobType || "any"}
                  onChange={(e) =>
                    handleDraftChange({
                      workPreferences: {
                        ...state.draft.workPreferences,
                        jobType: e.target.value as any,
                      },
                    })
                  }
                  className="h-10 px-3 rounded-xl border border-border bg-surface text-xs text-text-primary"
                >
                  <option value="any">Any job type</option>
                  <option value="full_time">Full-time</option>
                  <option value="internship">Internship / Co-op</option>
                  <option value="contract">Contract / Freelance</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-text-primary">Learning Format</label>
                <select
                  value={state.draft.workPreferences?.learningFormat || "any"}
                  onChange={(e) =>
                    handleDraftChange({
                      workPreferences: {
                        ...state.draft.workPreferences,
                        learningFormat: e.target.value as any,
                      },
                    })
                  }
                  className="h-10 px-3 rounded-xl border border-border bg-surface text-xs text-text-primary"
                >
                  <option value="any">Flexible mix</option>
                  <option value="project_based">Project-based hands-on</option>
                  <option value="interactive">Interactive code walkthroughs</option>
                  <option value="reading">Documentation & reading</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-5">
                <input
                  type="checkbox"
                  id="freeOnly"
                  checked={Boolean(state.draft.workPreferences?.freeOnlyResources)}
                  onChange={(e) =>
                    handleDraftChange({
                      workPreferences: {
                        ...state.draft.workPreferences,
                        freeOnlyResources: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 rounded text-primary border-border focus:ring-primary cursor-pointer"
                />
                <label htmlFor="freeOnly" className="text-xs text-text-primary font-medium cursor-pointer">
                  Prioritize free & open-source tools only
                </label>
              </div>

            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur-md border-b border-border px-4 py-3 sm:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-black text-base shadow-xs">
                T
              </div>
              <span className="font-bold text-lg text-text-primary">TAG</span>
            </Link>
            <span className="text-border">/</span>
            <span className="text-xs font-semibold text-text-secondary hidden sm:inline">
              Your Career Conversation
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Step Progress Pill */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary-soft/50 border border-primary/20 text-xs font-semibold text-primary">
              <span>{currentStep.section}</span>
              <span className="text-primary/40">•</span>
              <span>
                Step {state.currentStepIndex} of {totalSteps}
              </span>
            </div>

            {/* Mobile Summary Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileSummaryOpen(!isMobileSummaryOpen)}
              className="lg:hidden p-1.5 rounded-lg border border-border bg-surface text-text-secondary text-xs flex items-center gap-1 cursor-pointer"
            >
              <span>Summary</span>
              {isMobileSummaryOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Two-Column Layout */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 sm:py-8 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Current Question Group (7 cols on desktop) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                  {currentStep.section}
                </span>
                {currentStep.isOptional && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-border-subtle text-text-muted font-medium">
                    Optional
                  </span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary">
                {currentStep.title}
              </h1>
              <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                {currentStep.subtitle}
              </p>
            </div>

            {/* Error Banner if any */}
            {Object.keys(state.errors).length > 0 && (
              <div className="p-3 rounded-xl bg-danger-soft border border-danger/20 flex items-start gap-2.5 text-xs text-danger">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  {Object.values(state.errors).map((err, i) => (
                    <span key={i} className="font-medium">
                      {err}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Render Question Form */}
            <div className="p-5 sm:p-6 rounded-2xl bg-surface border border-border shadow-xs">
              {renderCurrentQuestion()}
            </div>

            {/* Step Navigation Controls */}
            <div className="flex items-center justify-between pt-2">
              <Button
                type="button"
                size="md"
                variant="outline"
                onClick={handlePrev}
                disabled={state.history.length <= 1}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Back
              </Button>

              <div className="flex items-center gap-3">
                {currentStep.isOptional && (
                  <Button type="button" size="md" variant="ghost" onClick={handleSkip}>
                    Skip
                  </Button>
                )}

                <Button
                  type="button"
                  size="md"
                  variant="primary"
                  onClick={handleNext}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  {state.currentStepIndex >= 12 ? "Review Summary" : "Continue"}
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column: Live 'What You've Shared' Summary (5 cols on desktop) */}
          <div
            className={cn(
              "lg:col-span-5 flex flex-col gap-4",
              isMobileSummaryOpen ? "block" : "hidden lg:flex"
            )}
          >
            <Card className="p-5 sm:p-6 bg-surface border-border shadow-xs flex flex-col gap-5 sticky top-20">
              <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-bold text-text-primary">What you&apos;ve shared</h3>
                </div>
                <span className="text-[11px] text-text-muted">Live summary</span>
              </div>

              {/* Summary Items */}
              <div className="flex flex-col gap-4 text-xs">
                {/* 1. Career Stage */}
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
                    Career Stage
                  </span>
                  <p className="text-text-primary font-medium capitalize">
                    {state.draft.careerStage
                      ? state.draft.careerStage.replace(/_/g, " ")
                      : "Not yet selected"}
                  </p>
                </div>

                {/* 2. Primary Goal */}
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
                    Primary Goal
                  </span>
                  <p className="text-text-primary font-medium capitalize">
                    {state.draft.primaryGoal
                      ? state.draft.primaryGoal.replace(/_/g, " ")
                      : "Not yet selected"}
                  </p>
                </div>

                {/* 3. Target Roles */}
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
                    Target Roles
                  </span>
                  {state.draft.targetRoles.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {state.draft.targetRoles.map((r) => (
                        <span
                          key={r}
                          className="px-2 py-0.5 rounded-md bg-border-subtle text-text-primary text-[11px] font-medium"
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-text-muted italic">None selected yet</p>
                  )}
                </div>

                {/* 4. Primary Challenge */}
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
                    Main Challenge
                  </span>
                  <p className="text-text-primary font-medium capitalize">
                    {state.draft.primaryChallenge
                      ? state.draft.primaryChallenge.replace(/_/g, " ")
                      : state.draft.challenges.length > 0
                      ? state.draft.challenges[0].replace(/_/g, " ")
                      : "Not yet selected"}
                  </p>
                </div>

                {/* 5. Key Skills */}
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
                    Skills Shared
                  </span>
                  {state.draft.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {state.draft.skills.map((s) => (
                        <span
                          key={s.name}
                          className="px-2 py-0.5 rounded-md bg-primary-soft/40 text-primary-dark text-[11px] font-medium"
                        >
                          {s.name} ({s.level})
                        </span>
                      ))}
                    </div>
                  ) : state.draft.isExploringSkills ? (
                    <p className="text-text-secondary text-[11px]">Still exploring technical skills</p>
                  ) : (
                    <p className="text-text-muted italic">None selected yet</p>
                  )}
                </div>

                {/* 6. Strengths */}
                {state.draft.strengths.length > 0 && (
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
                      Strengths
                    </span>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {state.draft.strengths.map((st) => (
                        <span
                          key={st}
                          className="px-2 py-0.5 rounded-md bg-border-subtle text-text-secondary text-[11px]"
                        >
                          {st.replace(/_/g, " ")}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 7. Weekly Time */}
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
                    Weekly Commitment
                  </span>
                  <p className="text-text-primary font-medium capitalize">
                    {state.draft.timeBudget
                      ? state.draft.timeBudget.replace(/_/g, " ")
                      : "Not yet set"}
                  </p>
                </div>
              </div>

              {/* Informational Footer */}
              <div className="pt-3 border-t border-border-subtle text-[11px] text-text-muted flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                <span>
                  Answers shape your dashboard recommendations and 7-day action plan. You can edit them at any time.
                </span>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
