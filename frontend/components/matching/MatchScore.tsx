"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { MatchResult } from "@/types";
import {
  Sparkles,
  HelpCircle,
  Code2,
  Briefcase,
  Compass,
  MapPin,
  GraduationCap,
  Brain,
  ShieldCheck,
} from "lucide-react";

export interface MatchScoreProps {
  matchResult: MatchResult;
  className?: string;
  showBreakdown?: boolean;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "Core Technical Skills": <Code2 className="w-3.5 h-3.5" />,
  "Relevant Experience": <Briefcase className="w-3.5 h-3.5" />,
  "Role Alignment & Seniority": <Compass className="w-3.5 h-3.5" />,
  "Location & Work Mode": <MapPin className="w-3.5 h-3.5" />,
  "Semantic Relevance": <Brain className="w-3.5 h-3.5" />,
  "Education & Credentials": <GraduationCap className="w-3.5 h-3.5" />,
};

export function MatchScore({
  matchResult,
  className,
  showBreakdown = true,
}: MatchScoreProps) {
  const { overallAlignment, breakdown } = matchResult;

  const categories = [
    breakdown.skills,
    breakdown.relevantExperience,
    breakdown.roleAlignment,
    breakdown.location,
    breakdown.semanticRelevance,
    breakdown.education,
  ].filter(Boolean);

  // SVG Gauge calculations
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallAlignment / 100) * circumference;

  return (
    <div
      className={cn(
        "rounded-2xl border border-border/80 bg-surface p-6 sm:p-7 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.05)] flex flex-col gap-6 relative overflow-hidden",
        className
      )}
    >
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      {/* Alignment Header with Precision Circular Gauge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-border-subtle relative">
        <div className="flex items-center gap-5">
          {/* Radial SVG Gauge */}
          <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
            <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 96 96">
              <defs>
                <linearGradient id="scoreTealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366F1" />
                  <stop offset="100%" stopColor="#4F46E5" />
                </linearGradient>
              </defs>
              <circle
                cx="48"
                cy="48"
                r={radius}
                className="stroke-indigo-900/10"
                strokeWidth="7"
                fill="transparent"
              />
              <circle
                cx="48"
                cy="48"
                r={radius}
                stroke="url(#scoreTealGrad)"
                strokeWidth="7"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-extrabold text-primary leading-none tracking-tight">
                {overallAlignment}%
              </span>
              <span className="text-[9px] font-bold text-primary-dark uppercase mt-0.5 tracking-wider">
                Match
              </span>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-text-primary tracking-tight">
                {overallAlignment}% Alignment with Published Criteria
              </h3>
              <span
                title="Calculated strictly against publisher criteria. Not a black-box probability of hire."
                className="text-text-muted hover:text-primary transition-colors cursor-help"
              >
                <HelpCircle className="w-4 h-4" />
              </span>
            </div>
            <p className="text-xs text-text-muted mt-1 leading-relaxed max-w-xl">
              Deterministic, explainable criteria matching. Audited against stated requirements
              without opaque automated rejection thresholds.
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 self-start sm:self-auto px-3.5 py-1.5 rounded-full bg-primary-soft/60 text-primary-dark text-xs font-semibold border border-primary/25 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>Explainable AI Engine</span>
        </div>
      </div>

      {/* Weighted Category Breakdown */}
      {showBreakdown && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs font-semibold text-text-secondary uppercase tracking-wider">
            <span>Criteria Dimension Breakdown</span>
            <span className="text-text-muted font-normal capitalize">Earned vs Max Weight</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {categories.map((cat, idx) => {
              const percentage = Math.round((cat.earned / cat.max) * 100);
              const icon = CATEGORY_ICONS[cat.name] || <Briefcase className="w-3.5 h-3.5" />;
              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-background-alt/50 border border-border-subtle hover:border-border transition-all duration-150 flex flex-col gap-2.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-medium text-text-secondary">
                      <span className="text-primary">{icon}</span>
                      <span className="truncate">{cat.name}</span>
                    </div>
                    <span className="font-bold text-text-primary shrink-0">
                      {cat.earned}{" "}
                      <span className="text-text-muted font-normal text-[11px]">/ {cat.max}</span>
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-border/80 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-[#4F46E5] rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
