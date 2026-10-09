"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { MatchEvidenceItem } from "@/types";
import {
  CheckCircle2,
  HelpCircle,
  MinusCircle,
  Flag,
  ThumbsUp,
  ThumbsDown,
  Info,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { submitMatchFeedback } from "@/lib/api/matching";

export interface MatchEvidenceProps {
  matched: MatchEvidenceItem[];
  missing: MatchEvidenceItem[];
  unknown: MatchEvidenceItem[];
  candidateId?: string;
  jobId?: string;
  className?: string;
}

export function MatchEvidence({
  matched,
  missing,
  unknown,
  candidateId = "prof_cand_01",
  jobId = "job_01",
  className,
}: MatchEvidenceProps) {
  const [feedbackGiven, setFeedbackGiven] = useState<boolean | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportSubmitted, setReportSubmitted] = useState(false);

  const handleFeedback = async (relevant: boolean) => {
    setFeedbackGiven(relevant);
    if (!relevant) {
      setIsReportOpen(true);
    } else {
      await submitMatchFeedback(candidateId, jobId, true);
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitMatchFeedback(candidateId, jobId, false, reportReason);
    setReportSubmitted(true);
    setTimeout(() => {
      setIsReportOpen(false);
    }, 1200);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {/* 1. MATCHED SECTION */}
      <div className="rounded-2xl border border-emerald-200/80 bg-surface p-6 shadow-[0_2px_12px_-4px_rgba(22,107,92,0.06)] flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
          <div className="flex items-center gap-2.5 text-emerald-800 font-bold text-sm">
            <span className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            </span>
            <span>MATCHED CRITERIA ({matched.length})</span>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
            Verified Citations
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {matched.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-gradient-to-br from-emerald-50/50 to-teal-50/20 border border-emerald-200/50 flex flex-col gap-2 hover:border-emerald-300 transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-xs text-text-primary">{item.criterion}</span>
                <span className="text-[10px] uppercase font-extrabold text-emerald-800 tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 shrink-0">
                  Verified
                </span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                <span className="font-semibold text-text-primary">Source: </span>
                {item.evidenceText}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 2. MISSING SECTION */}
      <div className="rounded-2xl border border-amber-200/80 bg-surface p-6 shadow-[0_2px_12px_-4px_rgba(217,119,6,0.06)] flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-amber-100">
          <div className="flex items-center gap-2.5 text-amber-900 font-bold text-sm">
            <span className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <MinusCircle className="w-4 h-4 text-amber-700" />
            </span>
            <span>MISSING CRITERIA ({missing.length})</span>
          </div>
          <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200/60 px-2.5 py-0.5 rounded-full">
            Actionable Gaps
          </span>
        </div>

        <p className="text-xs text-text-muted">
          These criteria are specified by the employer but were not found in the current profile history.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {missing.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-amber-50/40 border border-amber-200/60 flex flex-col gap-2 hover:border-amber-300 transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-xs text-text-primary">{item.criterion}</span>
                <span className="text-[10px] uppercase font-extrabold text-amber-800 tracking-wider px-2 py-0.5 rounded-full bg-amber-100 shrink-0">
                  Gap
                </span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">{item.evidenceText}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. UNKNOWN / UNCONFIRMED SECTION (Never penalized) */}
      <div className="rounded-2xl border border-slate-200 bg-surface p-6 shadow-[0_2px_12px_-4px_rgba(15,23,42,0.04)] flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
          <div className="flex items-center gap-2.5 text-text-primary font-bold text-sm">
            <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
              <HelpCircle className="w-4 h-4 text-slate-500" />
            </span>
            <span>UNKNOWN / UNCONFIRMED ({unknown.length})</span>
          </div>
          <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">
            Neutral Signal
          </span>
        </div>

        {/* Mandatory Reassurance Notice */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
          <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-600 leading-relaxed">
            <strong className="font-semibold text-slate-800">Non-Penalty Guarantee: </strong>
            These items were not mentioned or verified in the structured profile history. TAG’s
            matching engine{" "}
            <span className="underline decoration-slate-400 font-semibold">
              never treats unknown information as a penalty or negative score
            </span>
            .
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {unknown.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-background-alt/50 border border-border-subtle flex flex-col gap-2 hover:border-border transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-xs text-text-primary">{item.criterion}</span>
                <span className="text-[10px] uppercase font-extrabold text-text-muted tracking-wider px-2 py-0.5 rounded-full bg-border-subtle shrink-0">
                  Unconfirmed
                </span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">{item.evidenceText}</p>
            </div>
          ))}
        </div>
      </div>

      {/* RELEVANCE FEEDBACK */}
      <div className="rounded-2xl border border-border/80 bg-background-alt/40 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2.5 text-text-secondary">
          <Sparkles className="w-4 h-4 text-primary shrink-0" />
          <span className="font-medium">Was this criteria breakdown accurate and relevant?</span>
        </div>

        <div className="flex items-center gap-2">
          {feedbackGiven === null ? (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleFeedback(true)}
                leftIcon={<ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />}
              >
                Relevant
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleFeedback(false)}
                leftIcon={<ThumbsDown className="w-3.5 h-3.5 text-amber-600" />}
              >
                Irrelevant
              </Button>
            </>
          ) : (
            <div className="inline-flex items-center gap-1.5 text-primary font-semibold text-xs bg-primary-soft/80 px-3 py-1.5 rounded-full border border-primary/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Feedback recorded. Thank you for refining TAG criteria accuracy!</span>
            </div>
          )}
        </div>
      </div>

      {/* Irrelevance Reporting Modal */}
      <Modal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        title="Report Match Discrepancy"
      >
        <form onSubmit={handleReportSubmit} className="flex flex-col gap-4 py-2">
          <p className="text-xs text-text-muted">
            Help our explainability model improve. Please indicate why this criteria alignment did
            not match expectations:
          </p>

          <textarea
            required
            rows={4}
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            placeholder="e.g. My experience at PhonePe was primarily backend microservices, but was classified as frontend..."
            className="w-full text-xs p-3 rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary/40 leading-relaxed resize-none"
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsReportOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={reportSubmitted}>
              {reportSubmitted ? "Submitted!" : "Submit Feedback"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
