"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { InterviewStatusBadge } from "./InterviewStatusBadge";
import { Interview } from "@/types";
import { formatDate } from "@/lib/utils";
import {
  Calendar,
  Clock,
  Video,
  User,
  Copy,
  Check,
  Edit2,
  XCircle,
  Award,
  CheckCircle2,
  Info,
  AlertTriangle,
} from "lucide-react";

interface InterviewCardProps {
  interview: Interview;
  showCandidateName?: boolean;
  onViewDetails?: (interview: Interview) => void;
  onEdit?: (interview: Interview) => void;
  onCancel?: (interview: Interview) => void;
  onSubmitScorecard?: (interview: Interview) => void;
}

export function InterviewCard({
  interview,
  showCandidateName = true,
  onViewDetails,
  onEdit,
  onCancel,
  onSubmitScorecard,
}: InterviewCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!interview.meetingLink) return;
    try {
      await navigator.clipboard.writeText(interview.meetingLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const isCancelled = interview.status === "Cancelled";
  const isCompleted = interview.status === "Completed";
  const canEditOrCancel = !isCancelled && !isCompleted;

  return (
    <Card className="p-5 sm:p-6 bg-surface border-border flex flex-col gap-4 transition-all hover:border-border-strong hover:shadow-xs">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            {showCandidateName && (
              <h3 className="text-base font-bold text-text-primary">
                {interview.candidateName}
              </h3>
            )}
            <span className="text-xs font-semibold text-text-secondary bg-background px-2.5 py-0.5 rounded-md border border-border">
              {interview.roundName || "Round 1 - Technical"}
            </span>
            <InterviewStatusBadge status={interview.status} size="sm" />
          </div>

          <span className="text-xs text-text-muted mt-0.5">
            {interview.jobTitle}
          </span>
        </div>

        {/* Top Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {canEditOrCancel && (
            <>
              <a
                href={interview.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                <Button size="sm" variant="primary" leftIcon={<Video className="w-3.5 h-3.5" />}>
                  Join Meeting
                </Button>
              </a>

              {onSubmitScorecard && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onSubmitScorecard(interview)}
                >
                  Scorecard
                </Button>
              )}
            </>
          )}

          {isCompleted && (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Scorecard Logged
            </span>
          )}

          {onViewDetails && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onViewDetails(interview)}
              leftIcon={<Info className="w-3.5 h-3.5" />}
            >
              Details
            </Button>
          )}
        </div>
      </div>

      {/* Cancelled Banner */}
      {isCancelled && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex flex-col">
            <span className="font-bold">Interview Cancelled</span>
            <span>Reason: {interview.cancellationReason || "Cancelled by employer."}</span>
          </div>
        </div>
      )}

      {/* Date, Time & Interviewer metadata */}
      <div className="p-3.5 rounded-xl bg-background border border-border-subtle grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs text-text-secondary">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary shrink-0" />
          <div>
            <span className="font-semibold text-text-primary block">
              {formatDate(interview.scheduledAt)}
            </span>
            <span className="text-[11px] text-text-muted">IST Timezone</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary shrink-0" />
          <div>
            <span className="font-semibold text-text-primary block">
              {interview.durationMinutes || 45} Minutes
            </span>
            <span className="text-[11px] text-text-muted">{interview.meetingPlatform || "Google Meet"}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:col-span-2 md:col-span-1">
          <User className="w-4 h-4 text-primary shrink-0" />
          <div>
            <span className="font-semibold text-text-primary block">
              {interview.interviewerName}
            </span>
            <span className="text-[11px] text-text-muted">
              {interview.interviewerRole || "Hiring Manager"}
            </span>
          </div>
        </div>
      </div>

      {/* Video Meeting Link Bar */}
      <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-surface border border-border text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <Video className="w-4 h-4 text-primary shrink-0" />
          <span className="font-mono text-slate-700 truncate select-all text-[11px]">
            {interview.meetingLink}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleCopyLink}
            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 transition-colors flex items-center gap-1 text-[11px] font-medium"
            title="Copy meeting link"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Candidate Note if present */}
      {interview.candidateNote && (
        <div className="text-xs text-text-secondary bg-surface p-2.5 rounded-lg border border-border-subtle">
          <strong className="text-text-primary">Preparation Note:</strong> {interview.candidateNote}
        </div>
      )}

      {/* Scorecard Summary (if completed) */}
      {interview.scorecard && (
        <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200/80 flex flex-col gap-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-emerald-950 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-700" /> Evaluation Summary
            </span>
            <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
              Decision: {interview.scorecard.overallDecision}
            </span>
          </div>
          <div className="flex gap-4 text-emerald-900 text-[11px]">
            <span>Technical: <strong>{interview.scorecard.technicalRating} / 5</strong></span>
            <span>Communication: <strong>{interview.scorecard.communicationRating} / 5</strong></span>
          </div>
          {interview.scorecard.summary && (
            <p className="text-slate-700 italic mt-0.5">&quot;{interview.scorecard.summary}&quot;</p>
          )}
        </div>
      )}

      {/* Bottom Actions for Scheduling/Rescheduling */}
      {canEditOrCancel && (
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle">
          {onEdit && (
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Edit2 className="w-3.5 h-3.5 text-slate-500" />}
              onClick={() => onEdit(interview)}
              className="text-xs h-8"
            >
              Edit / Reschedule
            </Button>
          )}

          {onCancel && (
            <Button
              size="sm"
              variant="ghost"
              leftIcon={<XCircle className="w-3.5 h-3.5 text-rose-500" />}
              onClick={() => onCancel(interview)}
              className="text-xs h-8 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
            >
              Cancel
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
