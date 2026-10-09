"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  RotateCcw,
  FileEdit,
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface ATSReportData {
  overallScore: number;
  grade: string;
  verdict: string;
  sourceName?: string;
  breakdown: {
    contact: { score: number; status: "good" | "warning" | "risk"; notes: string };
    experience: { score: number; status: "good" | "warning" | "risk"; notes: string };
    skills: { score: number; status: "good" | "warning" | "risk"; notes: string };
    education: { score: number; status: "good" | "warning" | "risk"; notes: string };
    formatting: { score: number; status: "good" | "warning" | "risk"; notes: string };
  };
  risks: {
    title: string;
    description: string;
    severity: "high" | "medium" | "low";
  }[];
  missingKeywords: string[];
  rewrites: {
    section: string;
    original: string;
    improved: string;
    rationale: string;
  }[];
}

interface ATSScoreReportProps {
  report: ATSReportData;
  onReset: () => void;
  className?: string;
}

export function ATSScoreReport({ report, onReset, className }: ATSScoreReportProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyRewrite = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const scoreColor =
    report.overallScore >= 80
      ? "text-[#4F46E5] border-[#4F46E5]"
      : report.overallScore >= 65
        ? "text-indigo-600 border-indigo-500"
        : "text-amber-600 border-amber-500";

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {/* Top Banner Card: Overall Score & Assessment */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5 sm:gap-6">
          {/* Radial-like Score Circle */}
          <div
            className={cn(
              "w-22 h-22 sm:w-26 sm:h-26 rounded-full border-4 flex flex-col items-center justify-center bg-slate-50/50 shadow-inner shrink-0",
              scoreColor
            )}
          >
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {report.overallScore}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              / 100
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-[#4F46E5] border border-indigo-150">
                Grade {report.grade}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                {report.sourceName ? `Audited: ${report.sourceName}` : "Audited Input"}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              {report.verdict}
            </h2>
            <p className="text-xs text-slate-500 max-w-md leading-relaxed">
              Your resume matches modern Workday, Greenhouse, and Lever parsing heuristics. Resolve the high-priority keyword and metric items below to boost interview calls.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full md:w-auto">
          <button
            type="button"
            onClick={onReset}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Scan Another</span>
          </button>
          <Link
            href="/candidate/resume/builder"
            className="flex-1 md:flex-none px-5 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <FileEdit className="w-3.5 h-3.5" />
            <span>Open in Builder</span>
          </Link>
        </div>
      </div>

      {/* Grid: Breakdown + Risks & Missing Keywords */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Section-by-Section Scoring */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] flex flex-col gap-4">
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
              Section Scoring Breakdown
            </h3>

            <div className="flex flex-col gap-4">
              {/* Contact Info */}
              <SectionBreakdownItem
                label="Contact Info & Links"
                score={report.breakdown.contact.score}
                status={report.breakdown.contact.status}
                notes={report.breakdown.contact.notes}
              />
              {/* Experience */}
              <SectionBreakdownItem
                label="Work Experience & Impact"
                score={report.breakdown.experience.score}
                status={report.breakdown.experience.status}
                notes={report.breakdown.experience.notes}
              />
              {/* Skills */}
              <SectionBreakdownItem
                label="Technical Skills & Taxonomy"
                score={report.breakdown.skills.score}
                status={report.breakdown.skills.status}
                notes={report.breakdown.skills.notes}
              />
              {/* Education */}
              <SectionBreakdownItem
                label="Education & Credentials"
                score={report.breakdown.education.score}
                status={report.breakdown.education.status}
                notes={report.breakdown.education.notes}
              />
              {/* Formatting */}
              <SectionBreakdownItem
                label="Layout & Machine Parsing Safety"
                score={report.breakdown.formatting.score}
                status={report.breakdown.formatting.status}
                notes={report.breakdown.formatting.notes}
              />
            </div>
          </div>

          {/* Actionable Bullet Rewrites */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Actionable Bullet Rewrites
              </h3>
              <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                AI Impact Polish
              </span>
            </div>

            <div className="flex flex-col gap-4">
              {report.rewrites.map((rw, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 flex flex-col gap-2.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    {rw.section}
                  </span>

                  <div className="flex flex-col gap-1 text-xs">
                    <span className="text-slate-400 font-medium line-through">
                      &quot;{rw.original}&quot;
                    </span>
                    <span className="text-[#4F46E5] font-semibold bg-[#EEF2FF] p-2 rounded-lg border border-indigo-200">
                      &quot;{rw.improved}&quot;
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-500 italic">
                      Why: {rw.rationale}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyRewrite(rw.improved, idx)}
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold text-[11px] hover:bg-slate-100 flex items-center gap-1 cursor-pointer transition-colors shrink-0"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check className="w-3 h-3 text-[#4F46E5]" />
                          <span className="text-[#4F46E5]">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-slate-500" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): ATS Risks & Missing Keywords */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Missing Keywords Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Missing Keywords
              </h3>
              <span className="text-[11px] font-semibold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
                Boost Matches
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Recruiter searches prioritize these competencies for your target profile. Integrate them into your experience bullets:
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {report.missingKeywords.map((kw, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-[#4F46E5] hover:border-indigo-200 border border-slate-200/70 transition-colors cursor-default"
                >
                  + {kw}
                </span>
              ))}
            </div>
          </div>

          {/* Identified ATS Risks Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Identified ATS Risks
              </h3>
              <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                {report.risks.length} Items Flagged
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {report.risks.map((risk, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 flex flex-col gap-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{risk.title}</span>
                    <span
                      className={cn(
                        "text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full",
                        risk.severity === "high"
                          ? "bg-red-50 text-red-600 border border-red-200"
                          : risk.severity === "medium"
                            ? "bg-amber-50 text-amber-600 border border-amber-200"
                            : "bg-blue-50 text-blue-600 border border-blue-200"
                      )}
                    >
                      {risk.severity} Risk
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
                    {risk.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionBreakdownItem({
  label,
  score,
  status,
  notes,
}: {
  label: string;
  score: number;
  status: "good" | "warning" | "risk";
  notes: string;
}) {
  const statusColor =
    status === "good"
      ? "bg-[#4F46E5]"
      : status === "warning"
        ? "bg-amber-500"
        : "bg-red-500";

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-xs font-semibold">
        <span className="text-slate-800">{label}</span>
        <span className="text-slate-700">{score}%</span>
      </div>
      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
        <div
          className={cn("h-full transition-all duration-500", statusColor)}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-[11px] text-slate-500 font-normal">{notes}</span>
    </div>
  );
}
