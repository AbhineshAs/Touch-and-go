"use client";

import React from "react";
import { CheckCircle2, Award, BarChart3, AlertTriangle, KeyRound, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ATSFeatureSummaryProps {
  className?: string;
}

export function ATSFeatureSummary({ className }: ATSFeatureSummaryProps) {
  const features = [
    {
      title: "Overall ATS-style score and grade",
      description: "Get a clear 0–100 benchmark metric calibrated against standard enterprise ATS algorithms.",
      icon: <Award className="w-4 h-4 text-[#4F46E5]" />,
      color: "bg-indigo-50 text-[#4F46E5] border-indigo-200",
      bulletColor: "bg-[#4F46E5]",
    },
    {
      title: "Section-by-section scoring breakdown",
      description: "Individual pass ratings for contact details, summary, experience, skills, and formatting.",
      icon: <BarChart3 className="w-4 h-4 text-[#4F46E5]" />,
      color: "bg-indigo-50 text-[#4F46E5] border-indigo-200",
      bulletColor: "bg-[#4F46E5]",
    },
    {
      title: "ATS risks and why they matter",
      description: "Detect columns, tables, non-standard headings, or date formats that trip automated parser filters.",
      icon: <AlertTriangle className="w-4 h-4 text-amber-600" />,
      color: "bg-amber-50 text-amber-600 border-amber-200",
      bulletColor: "bg-amber-500",
    },
    {
      title: "Missing keyword suggestions",
      description: "Extract high-frequency technical skills, frameworks, and role competencies absent from your CV.",
      icon: <KeyRound className="w-4 h-4 text-sky-600" />,
      color: "bg-sky-50 text-sky-600 border-sky-200",
      bulletColor: "bg-sky-500",
    },
    {
      title: "Ready-to-use rewrite recommendations",
      description: "AI-suggested bullet improvements with quantifiable metrics and active impact verbs.",
      icon: <Sparkles className="w-4 h-4 text-purple-600" />,
      color: "bg-purple-50 text-purple-600 border-purple-200",
      bulletColor: "bg-purple-500",
    },
  ];

  return (
    <div
      className={cn(
        "bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] flex flex-col gap-4",
        className
      )}
    >
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 className="text-base font-bold text-slate-900">What You&apos;ll Get</h3>
        <span className="text-[11px] font-semibold text-[#4F46E5] bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-150">
          5 Core Audits
        </span>
      </div>

      <div className="flex flex-col gap-3.5">
        {features.map((feature, idx) => (
          <div key={idx} className="flex items-start gap-3 group">
            <div className="mt-0.5 shrink-0 flex items-center justify-center">
              <span className={cn("w-2 h-2 rounded-full", feature.bulletColor)} />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold text-slate-800 group-hover:text-[#4F46E5] transition-colors">
                {feature.title}
              </span>
              <span className="text-[11px] text-slate-500 leading-relaxed font-normal">
                {feature.description}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
