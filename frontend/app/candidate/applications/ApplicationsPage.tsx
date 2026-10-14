"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Calendar,
  ArrowRight,
  MapPin,
  Clock,
  ShieldCheck,
  Check,
  CheckCircle2,
  Video,
  ExternalLink,
  Briefcase,
  Sparkles,
  BookOpen,
  ChevronRight,
  Info,
} from "lucide-react";
import { useCandidate } from "@/lib/candidate/context/CandidateContext";
import { formatDate, formatRelativeTime, cn } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";

interface StageStep {
  key: string;
  label: string;
}

const PIPELINE_STEPS: StageStep[] = [
  { key: "applied", label: "Applied" },
  { key: "screening", label: "Screening" },
  { key: "interview", label: "Interview" },
  { key: "decision", label: "Offer / Decision" },
];

export function ApplicationsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [prepModalAppId, setPrepModalAppId] = useState<string | null>(null);

  const { applications, interviews } = useCandidate();

  const tabs = [
    { id: "all", label: "All Applications", count: applications.length },
    {
      id: "applied",
      label: "Applied",
      count: applications.filter((a) => a.stage.toLowerCase() === "applied").length,
    },
    {
      id: "screening",
      label: "Review",
      count: applications.filter(
        (a) => a.stage.toLowerCase() === "screening" || a.stage.toLowerCase() === "shortlisted"
      ).length,
    },
    {
      id: "interview",
      label: "Interview",
      count: applications.filter((a) => a.stage.toLowerCase() === "interview").length,
    },
    {
      id: "decision",
      label: "Offer / Decision",
      count: applications.filter((a) => a.stage.toLowerCase() === "decision").length,
    },
  ];

  const filtered = applications.filter((a) => {
    if (activeTab === "all") return true;
    const stage = a.stage.toLowerCase();
    if (activeTab === "screening") {
      return stage === "screening" || stage === "shortlisted";
    }
    return stage === activeTab;
  });

  // Helper to determine the active progress index (0 to 3)
  const getStageIndex = (stage: string): number => {
    const s = stage.toLowerCase();
    if (s === "applied") return 0;
    if (s === "screening" || s === "shortlisted") return 1;
    if (s === "interview") return 2;
    if (s === "decision" || s === "offer") return 3;
    return 0;
  };

  const selectedPrepApp = applications.find((a) => a.id === prepModalAppId);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1 pb-2">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Application Pipeline
          </h1>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
            {applications.length} Active {applications.length === 1 ? "Role" : "Roles"}
          </span>
        </div>
        <p className="text-sm text-slate-500">
          Track real-time candidate review stages, scheduled loops, and upcoming interview actions.
        </p>
      </div>

      {/* A. Stage Filter Toolbar */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200/60 w-fit overflow-x-auto max-w-full">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "rounded-lg px-3.5 py-1.5 text-xs flex items-center gap-2 cursor-pointer transition-all shrink-0",
                isActive
                  ? "bg-white text-slate-900 font-semibold shadow-2xs"
                  : "text-slate-500 hover:text-slate-800 font-medium"
              )}
            >
              <span>{tab.label}</span>
              <span
                className={cn(
                  "font-mono text-[11px] px-1.5 py-0.5 rounded-full leading-none",
                  isActive
                    ? "bg-blue-100 text-blue-700 font-semibold"
                    : "bg-slate-200/70 text-slate-600"
                )}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Applications List or Empty State */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center shadow-xs flex flex-col items-center justify-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-2xs">
            <Briefcase className="w-7 h-7" />
          </div>
          <div className="max-w-md">
            <h3 className="text-base font-semibold text-slate-900">
              {applications.length === 0
                ? "No applications submitted yet"
                : "No applications in this specific stage"}
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              {applications.length === 0
                ? "Browse open roles matched to your verified tech stack and apply directly to partner companies."
                : "Try selecting a different filter above to view applications in other review stages."}
            </p>
          </div>
          <Link href="/candidate/jobs">
            <button
              type="button"
              className="bg-blue-600 text-white hover:bg-blue-700 h-9 px-4 rounded-lg text-sm font-medium shadow-xs transition-colors cursor-pointer"
            >
              Explore Open Positions
            </button>
          </Link>
        </div>
      ) : (
        /* B. Rich Application Card Anatomy */
        <div className="flex flex-col gap-5">
          {filtered.map((app) => {
            const currentStageIdx = getStageIndex(app.stage);
            const isInterviewStage = app.stage.toLowerCase() === "interview";

            // Find any scheduled interview associated with this application
            const matchingInterview = interviews.find((i) => i.applicationId === app.id);
            const interviewRoundTitle =
              matchingInterview?.jobTitle || "Technical Architecture Interview";
            const interviewMeetingUrl =
              matchingInterview?.meetingLink || "https://meet.google.com/tag-interview";

            return (
              <div
                key={app.id}
                className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all flex flex-col"
              >
                {/* Top Row (Entity & Status) */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0">
                    {/* Company avatar */}
                    <div className="w-12 h-12 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center text-lg shadow-2xs overflow-hidden shrink-0">
                      {app.organizationLogo ? (
                        <img
                          src={app.organizationLogo}
                          alt={app.organizationName}
                          className="w-full h-full object-contain p-1 bg-white"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            const fallback = e.currentTarget.parentElement?.querySelector(".avatar-fallback");
                            if (fallback) (fallback as HTMLElement).style.display = "flex";
                          }}
                        />
                      ) : null}
                      <div
                        className={cn(
                          "w-full h-full items-center justify-center text-lg font-bold text-white bg-slate-900 avatar-fallback",
                          app.organizationLogo ? "hidden" : "flex"
                        )}
                      >
                        {app.organizationName ? app.organizationName.charAt(0).toUpperCase() : "C"}
                      </div>
                    </div>

                    {/* Role & Company Info */}
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-semibold text-slate-600">
                          {app.organizationName}
                        </span>
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600 fill-blue-50 shrink-0" />
                      </div>

                      <Link href={`/candidate/applications/${app.id}`}>
                        <h2 className="text-base font-bold text-slate-900 tracking-tight hover:text-blue-600 transition-colors mt-0.5">
                          {app.jobTitle}
                        </h2>
                      </Link>

                      {/* Meta row: location, work mode, and submission date */}
                      <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500 mt-1.5">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{app.location}</span>
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="bg-slate-100 text-slate-700 text-xs font-medium px-2 py-0.5 rounded-md">
                          {app.workMode || "Remote"}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Applied {formatDate(app.appliedAt)}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stage Badge with active status dot */}
                  <div className="shrink-0 self-start">
                    {isInterviewStage ? (
                      <span className="bg-purple-50 text-purple-700 border border-purple-200/70 text-xs px-2.5 py-1 rounded-md font-semibold inline-flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse" />
                        <span>Interview</span>
                      </span>
                    ) : app.stage.toLowerCase() === "screening" || app.stage.toLowerCase() === "shortlisted" ? (
                      <span className="bg-blue-50 text-blue-700 border border-blue-200/70 text-xs px-2.5 py-1 rounded-md font-semibold inline-flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                        <span>Review</span>
                      </span>
                    ) : app.stage.toLowerCase() === "decision" ? (
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/70 text-xs px-2.5 py-1 rounded-md font-semibold inline-flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        <span>Offer / Decision</span>
                      </span>
                    ) : (
                      <span className="bg-slate-100 text-slate-700 border border-slate-200/80 text-xs px-2.5 py-1 rounded-md font-semibold inline-flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        <span>{app.stage}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Middle Section (Visual Stage Pipeline Tracker) */}
                <div className="mt-6 pt-5 border-t border-slate-100">
                  <div className="flex items-center justify-between w-full">
                    {PIPELINE_STEPS.map((step, idx) => {
                      const isCompleted = idx < currentStageIdx;
                      const isActive = idx === currentStageIdx;
                      const isFuture = idx > currentStageIdx;

                      return (
                        <React.Fragment key={step.key}>
                          {/* Step Node */}
                          <div className="flex flex-col items-center gap-1.5 text-center">
                            {isCompleted ? (
                              <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs shadow-2xs shrink-0">
                                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                              </div>
                            ) : isActive ? (
                              <div
                                className={cn(
                                  "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 shadow-2xs",
                                  isInterviewStage
                                    ? "border-purple-600 bg-purple-50"
                                    : "border-blue-600 bg-blue-50"
                                )}
                              >
                                <span
                                  className={cn(
                                    "w-2 h-2 rounded-full animate-pulse",
                                    isInterviewStage ? "bg-purple-600" : "bg-blue-600"
                                  )}
                                />
                              </div>
                            ) : (
                              <div className="w-6 h-6 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                              </div>
                            )}

                            <span
                              className={cn(
                                "text-xs tracking-tight select-none",
                                isCompleted
                                  ? "font-semibold text-slate-900"
                                  : isActive
                                  ? isInterviewStage
                                    ? "font-bold text-purple-700"
                                    : "font-bold text-blue-700"
                                  : "font-medium text-slate-400"
                              )}
                            >
                              {step.label} {isActive ? "(Active)" : ""}
                            </span>
                          </div>

                          {/* Connecting Bar (except after last step) */}
                          {idx < PIPELINE_STEPS.length - 1 && (
                            <div
                              className={cn(
                                "flex-1 h-0.5 mx-2 rounded-full transition-colors mb-5",
                                idx < currentStageIdx ? "bg-emerald-500" : "bg-slate-200"
                              )}
                            />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>

                {/* Next Action / Scheduled Callout Strip */}
                {isInterviewStage ? (
                  <div className="rounded-xl border border-purple-100 bg-purple-50/50 p-4 mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Calendar className="w-4 h-4 text-purple-700" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-purple-900">
                          Next Step: {interviewRoundTitle}
                        </span>
                        <span className="text-xs text-purple-700 mt-0.5">
                          {matchingInterview?.scheduledAt
                            ? `Scheduled on ${formatDate(matchingInterview.scheduledAt)} • 45 min Google Meet`
                            : "Thursday, Oct 16 • 3:30 PM – 4:15 PM IST • Google Meet"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                      <a
                        href={interviewMeetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-purple-600 text-white hover:bg-purple-700 h-8 px-3 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-2xs"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Join Meeting</span>
                      </a>
                    </div>
                  </div>
                ) : app.stage.toLowerCase() === "screening" || app.stage.toLowerCase() === "shortlisted" ? (
                  <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                        <Clock className="w-4 h-4 text-blue-700" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-blue-900">
                          Next Step: Recruiter Review &amp; Portfolio Assessment
                        </span>
                        <span className="text-xs text-blue-700">
                          Application actively being evaluated by {app.organizationName}&apos;s talent team • Est. 2 business days
                        </span>
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Card Footer */}
                <div className="border-t border-slate-100 pt-4 mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left: Last updated timestamp */}
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Updated {formatRelativeTime(app.appliedAt)} by Recruiter</span>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2.5 self-end sm:self-auto">
                    <Link href={`/candidate/applications/${app.id}`}>
                      <button
                        type="button"
                        className="border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 h-9 px-3.5 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                      >
                        <span>View Full Timeline</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    </Link>

                    {isInterviewStage ? (
                      <button
                        type="button"
                        onClick={() => setPrepModalAppId(app.id)}
                        className="bg-purple-600 text-white hover:bg-purple-700 h-9 px-4 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Interview Prep Kit</span>
                      </button>
                    ) : (
                      <Link href={`/jobs/${app.jobId}`}>
                        <button
                          type="button"
                          className="bg-blue-600 text-white hover:bg-blue-700 h-9 px-4 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                        >
                          <span>View Job Details</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Interview Prep Kit Modal */}
      {selectedPrepApp && (
        <Modal
          isOpen={Boolean(prepModalAppId)}
          onClose={() => setPrepModalAppId(null)}
          title={`Interview Prep Kit: ${selectedPrepApp.jobTitle}`}
          description={`Tailored preparation guide for your interview loop with ${selectedPrepApp.organizationName}.`}
          size="lg"
        >
          <div className="flex flex-col gap-4">
            <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-100 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-purple-900">
                  Recommended Technical Focus Areas
                </span>
                <p className="text-xs text-purple-800 leading-relaxed">
                  Based on {selectedPrepApp.organizationName}&apos;s verified job requirements, focus your discussion on state management architecture, API contract design, and modular test coverage.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                <span className="text-xs font-bold text-slate-900 block mb-1">
                  1. Format &amp; Timing
                </span>
                <p className="text-xs text-slate-500 leading-relaxed">
                  45-minute live pair architecture session. 10m intro, 25m design exercise, 10m Q&amp;A.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                <span className="text-xs font-bold text-slate-900 block mb-1">
                  2. Suggested Questions to Ask
                </span>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Ask about their release deployment cadence, team structure, and code review practices.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
              <span className="text-slate-600">
                Meeting link ready: <strong className="text-slate-900">Google Meet (Ready)</strong>
              </span>
              <a
                href="https://meet.google.com/tag-interview"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 hover:text-purple-700 font-semibold inline-flex items-center gap-1"
              >
                <span>Test Audio &amp; Video</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPrepModalAppId(null)}
                className="border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 h-9 px-4 rounded-lg text-xs font-medium inline-flex items-center justify-center transition-colors cursor-pointer"
              >
                Close Prep Kit
              </button>
              <Link href={`/candidate/applications/${selectedPrepApp.id}`}>
                <button
                  type="button"
                  onClick={() => setPrepModalAppId(null)}
                  className="bg-blue-600 text-white hover:bg-blue-700 h-9 px-4 rounded-lg text-xs font-semibold inline-flex items-center justify-center transition-colors shadow-xs cursor-pointer"
                >
                  View Full Application Details
                </button>
              </Link>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default ApplicationsPage;
