"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowLeft, RotateCcw, FileText, CheckCircle2 } from "lucide-react";
import { ResumeModeSelector } from "@/components/resume/ResumeModeSelector";
import { ATSResumeUploader, ATSAnalysisPayload } from "@/components/resume/ATSResumeUploader";
import { ATSFeatureSummary } from "@/components/resume/ATSFeatureSummary";
import { ATSQuickActions } from "@/components/resume/ATSQuickActions";
import { ATSScoreReport, ATSReportData } from "@/components/resume/ATSScoreReport";
import { cn } from "@/lib/utils";

export default function CandidateResumePage() {
  const [activeTab, setActiveTab] = useState<"selector" | "ats">("selector");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisReport, setAnalysisReport] = useState<ATSReportData | null>(null);

  const handleRunAnalysis = async (payload: ATSAnalysisPayload) => {
    setIsAnalyzing(true);
    setAnalysisReport(null);

    // Simulate smart ATS analysis heuristics
    await new Promise((r) => setTimeout(r, 1200));

    const textLength = payload.text.length;
    const hasMetrics = /\d+%|\$\d+|\b\d+\s+(users|clients|projects|ms|seconds|engineers)\b/i.test(payload.text);
    const hasTypeScript = /typescript|ts/i.test(payload.text);
    const hasNext = /next\.?js|react/i.test(payload.text);

    // Dynamic scoring based on actual content
    let calculatedScore = 78;
    if (hasMetrics) calculatedScore += 6;
    if (hasTypeScript) calculatedScore += 4;
    if (hasNext) calculatedScore += 4;
    if (textLength > 600) calculatedScore += 2;
    calculatedScore = Math.min(94, Math.max(68, calculatedScore));

    const grade = calculatedScore >= 90 ? "A" : calculatedScore >= 80 ? "B+" : "B";

    const mockReport: ATSReportData = {
      overallScore: calculatedScore,
      grade,
      verdict:
        calculatedScore >= 85
          ? "Strong ATS Match • Ready for Direct Job Application"
          : "Good Foundation • Minor Keyword & Formatting Refinements Recommended",
      sourceName: payload.fileName || "Pasted Resume Text",
      breakdown: {
        contact: {
          score: 100,
          status: "good",
          notes: "Full Name, email, telephone number, and LinkedIn handles parsed cleanly.",
        },
        experience: {
          score: hasMetrics ? 88 : 74,
          status: hasMetrics ? "good" : "warning",
          notes: hasMetrics
            ? "Strong quantifiable impact metrics detected in recent roles."
            : "Include more quantifiable outcomes (e.g., % latency reduction, user growth).",
        },
        skills: {
          score: 82,
          status: "good",
          notes: "Recognized 18 core technical competencies and software engineering libraries.",
        },
        education: {
          score: 95,
          status: "good",
          notes: "Degree, university name, and graduation timeline mapped accurately.",
        },
        formatting: {
          score: 86,
          status: "good",
          notes: "Clean hierarchical headers. Parser traversed sections in single pass.",
        },
      },
      risks: [
        {
          title: "Quantifiable Performance Metrics",
          description:
            "Some bullet points describe day-to-day duties rather than business impact. Add percentage, speed, or team size figures.",
          severity: "medium",
        },
        {
          title: "Target Keyword Frequency",
          description:
            "Key engineering keywords like CI/CD, Unit Testing, and Cloud Architecture appeared only once in the parsed text.",
          severity: "low",
        },
        {
          title: "Parser Section Header Consistency",
          description:
            "Standard headings ('Work Experience', 'Skills', 'Education') ensure 100% traversal across older ATS parsers.",
          severity: "low",
        },
      ],
      missingKeywords: [
        "CI/CD Pipelines",
        "System Design",
        "RESTful APIs",
        "Unit Testing (Jest)",
        "Docker",
        "Agile / Scrum",
        "State Management",
      ],
      rewrites: [
        {
          section: "Work Experience",
          original: "Worked on frontend features using React and improved page load times.",
          improved:
            "Architected high-velocity React & Next.js user interfaces, reducing core page load latency by 34% across 120,000 monthly active users.",
          rationale: "Introduces strong action verbs, quantifiable metrics, and verified user scale.",
        },
        {
          section: "Technical Leadership",
          original: "Collaborated with team members to ship new software products on schedule.",
          improved:
            "Partnered with cross-functional engineering and design squads to deliver 4 major product milestones ahead of sprint deadlines.",
          rationale: "Demonstrates proactive cross-functional collaboration and delivery velocity.",
        },
      ],
    };

    setAnalysisReport(mockReport);
    setIsAnalyzing(false);
  };

  const handleResetAnalysis = () => {
    setAnalysisReport(null);
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-8 py-6 sm:py-8 bg-[#F8FAFC]">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        {/* Top Breadcrumb & View Toggle Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Link
              href="/candidate/dashboard"
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
            >
              Candidate Portal
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-bold text-slate-900">Resume &amp; ATS</span>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200/90 rounded-xl shadow-2xs">
            <button
              type="button"
              onClick={() => {
                setActiveTab("selector");
                setAnalysisReport(null);
              }}
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                activeTab === "selector"
                  ? "bg-indigo-50 text-[#4F46E5] shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              Resume Overview
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("ats")}
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                activeTab === "ats"
                  ? "bg-indigo-50 text-[#4F46E5] shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              ATS Resume Checker
            </button>
          </div>
        </div>

        {/* VIEW 1: RESUME ENTRY VIEW (Mode Selector) */}
        {activeTab === "selector" && (
          <div className="flex flex-col gap-8">
            <ResumeModeSelector
              onSelectMode={(mode) => {
                if (mode === "ats") setActiveTab("ats");
              }}
            />

            {/* In-page ATS Preview / Quick Jump Card */}
            <div className="bg-gradient-to-r from-indigo-500/10 via-sky-500/10 to-transparent border border-indigo-150 rounded-2xl p-6 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-5">
              <div className="flex flex-col gap-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#4F46E5]">
                    Instant Verification
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Already have a resume? Check your ATS score in seconds
                </h3>
                <p className="text-xs text-slate-500 max-w-xl">
                  Upload your CV to simulate enterprise applicant tracking system algorithms and discover missing keywords before applying.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab("ats")}
                className="px-5 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-xs shadow-xs transition-colors shrink-0 cursor-pointer"
              >
                Open ATS Checker →
              </button>
            </div>
          </div>
        )}

        {/* VIEW 2: ATS RESUME CHECKER PANEL */}
        {activeTab === "ats" && (
          <div className="flex flex-col gap-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                    ATS Resume Checker
                  </h1>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-[#4F46E5] border border-indigo-200/80">
                    <Sparkles className="w-3.5 h-3.5 text-[#4F46E5]" />
                    Smart ATS Analysis
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 font-normal max-w-3xl leading-relaxed">
                  Upload your resume with drag and drop, compare it against a job description, and get a polished ATS-style analysis with scores, risks, keywords, and actionable rewrites.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("selector");
                  setAnalysisReport(null);
                }}
                className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold cursor-pointer shadow-2xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Overview</span>
              </button>
            </div>

            {/* If Report is ready, show ATSScoreReport */}
            {analysisReport ? (
              <ATSScoreReport report={analysisReport} onReset={handleResetAnalysis} />
            ) : (
              /* Two-Column Layout Grid matching Image 3 */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column (7 cols): Upload & Text Area */}
                <div className="lg:col-span-7 flex flex-col gap-6">
                  <ATSResumeUploader onAnalyze={handleRunAnalysis} isAnalyzing={isAnalyzing} />
                </div>

                {/* Right Column (5 cols): Insights & Quick Actions */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                  <ATSFeatureSummary />
                  <ATSQuickActions />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
