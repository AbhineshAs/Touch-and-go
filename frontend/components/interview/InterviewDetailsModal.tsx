"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
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
  ExternalLink,
  Edit2,
  XCircle,
  FileText,
  AlertTriangle,
  Award,
  Sparkles,
} from "lucide-react";

interface InterviewDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  interview: Interview | null;
  onEdit?: (interview: Interview) => void;
  onCancel?: (interview: Interview) => void;
}

export function InterviewDetailsModal({
  isOpen,
  onClose,
  interview,
  onEdit,
  onCancel,
}: InterviewDetailsModalProps) {
  const [isCopied, setIsCopied] = useState(false);

  if (!interview) return null;

  const handleCopyLink = async () => {
    if (!interview.meetingLink) return;
    try {
      await navigator.clipboard.writeText(interview.meetingLink);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  // Google Calendar helper link
  const getGoogleCalendarUrl = () => {
    try {
      const startTime = new Date(interview.scheduledAt);
      const endTime = new Date(startTime.getTime() + (interview.durationMinutes || 45) * 60000);
      const formatGCalDate = (d: Date) =>
        d.toISOString().replace(/-|:|\.\d\d\d/g, "");

      const title = encodeURIComponent(
        `Touch & Go: ${interview.roundName || "Interview"} - ${interview.candidateName} (${interview.jobTitle})`
      );
      const details = encodeURIComponent(
        `Interview with ${interview.candidateName} for ${interview.jobTitle}.\nInterviewer: ${interview.interviewerName} (${interview.interviewerRole})\nMeeting Link: ${interview.meetingLink}\n\nNotes: ${interview.candidateNote || "None"}`
      );
      const location = encodeURIComponent(interview.meetingLink);
      const dates = `${formatGCalDate(startTime)}/${formatGCalDate(endTime)}`;

      return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
    } catch {
      return "#";
    }
  };

  const isCancelled = interview.status === "Cancelled";
  const isCompleted = interview.status === "Completed";
  const canEditOrCancel = !isCancelled && !isCompleted;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={interview.roundName || "Interview Details"}
      description={`Evaluation session details for ${interview.candidateName} · ${interview.jobTitle}`}
      size="lg"
    >
      <div className="flex flex-col gap-5 text-xs text-text-primary">
        {/* Top Header Card */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Candidate
            </span>
            <span className="text-base font-bold text-slate-900">{interview.candidateName}</span>
            <span className="text-xs text-slate-600">{interview.jobTitle}</span>
          </div>

          <div className="flex items-center gap-2">
            <InterviewStatusBadge status={interview.status} size="md" />
          </div>
        </div>

        {/* Cancelled Banner if cancelled */}
        {isCancelled && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <span className="font-bold text-rose-900">This interview has been cancelled</span>
              <p className="text-rose-700">
                <strong>Reason:</strong>{" "}
                {interview.cancellationReason || "No cancellation reason provided."}
              </p>
              {interview.cancelledAt && (
                <span className="text-[11px] text-rose-500">
                  Cancelled on {formatDate(interview.cancelledAt)}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Schedule & Timing Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-start gap-3">
            <Calendar className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] text-slate-500 font-semibold uppercase">Date & Time</span>
              <span className="text-xs font-bold text-slate-900">
                {formatDate(interview.scheduledAt)}
              </span>
              <span className="text-[11px] text-slate-500">Indian Standard Time (IST)</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-start gap-3">
            <Clock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] text-slate-500 font-semibold uppercase">Duration</span>
              <span className="text-xs font-bold text-slate-900">
                {interview.durationMinutes || 45} Minutes
              </span>
              <span className="text-[11px] text-slate-500">Scheduled video session</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-start gap-3">
            <User className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] text-slate-500 font-semibold uppercase">Lead Interviewer</span>
              <span className="text-xs font-bold text-slate-900">{interview.interviewerName}</span>
              <span className="text-[11px] text-slate-500">
                {interview.interviewerRole || "Hiring Manager"}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-start gap-3">
            <Video className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] text-slate-500 font-semibold uppercase">Platform</span>
              <span className="text-xs font-bold text-slate-900">
                {interview.meetingPlatform || "Google Meet"}
              </span>
              <span className="text-[11px] text-slate-500">Video Conferencing</span>
            </div>
          </div>
        </div>

        {/* Video Meeting Link Action Box */}
        <div className="p-4 rounded-xl border border-primary/20 bg-primary-soft/10 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <Video className="w-4 h-4 text-primary" />
              Interview Meeting Link
            </span>
            <span className="text-[11px] font-semibold text-primary">Live Conference Room</span>
          </div>

          <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-white border border-slate-200 overflow-hidden">
            <span className="font-mono text-xs text-slate-700 truncate select-all">
              {interview.meetingLink}
            </span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleCopyLink}
              leftIcon={isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              className="shrink-0 text-xs py-1 px-2.5 h-7"
            >
              {isCopied ? "Copied" : "Copy"}
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <a
              href={interview.meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex"
            >
              <Button size="sm" variant="primary" leftIcon={<Video className="w-3.5 h-3.5" />}>
                Join Video Meeting
              </Button>
            </a>

            <a
              href={getGoogleCalendarUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex"
            >
              <Button size="sm" variant="outline" leftIcon={<Calendar className="w-3.5 h-3.5" />}>
                Add to Google Calendar
              </Button>
            </a>
          </div>
        </div>

        {/* Candidate Preparation Note */}
        {interview.candidateNote && (
          <div className="p-3.5 rounded-xl border border-slate-200 bg-white flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Candidate Preparation Note
            </span>
            <p className="text-xs text-slate-700 leading-relaxed font-normal bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              {interview.candidateNote}
            </p>
          </div>
        )}

        {/* Evaluation Scorecard (if completed) */}
        {isCompleted && interview.scorecard && (
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-700" />
                Submitted Evaluation Scorecard
              </span>
              <span className="px-2.5 py-0.5 rounded-full font-bold text-xs bg-emerald-100 text-emerald-800 border border-emerald-300">
                Decision: {interview.scorecard.overallDecision}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs text-emerald-900">
              <div className="p-2 rounded bg-white border border-emerald-200 flex justify-between">
                <span>Technical Mastery</span>
                <strong>{interview.scorecard.technicalRating} / 5</strong>
              </div>
              <div className="p-2 rounded bg-white border border-emerald-200 flex justify-between">
                <span>Communication</span>
                <strong>{interview.scorecard.communicationRating} / 5</strong>
              </div>
            </div>

            {interview.scorecard.summary && (
              <p className="text-xs text-slate-700 italic bg-white p-3 rounded-lg border border-emerald-200">
                &quot;{interview.scorecard.summary}&quot;
              </p>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <div className="flex items-center gap-2">
            {canEditOrCancel && onEdit && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                leftIcon={<Edit2 className="w-3.5 h-3.5 text-slate-600" />}
                onClick={() => {
                  onClose();
                  onEdit(interview);
                }}
              >
                Edit / Reschedule
              </Button>
            )}

            {canEditOrCancel && onCancel && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                leftIcon={<XCircle className="w-3.5 h-3.5 text-rose-500" />}
                onClick={() => {
                  onClose();
                  onCancel(interview);
                }}
                className="text-rose-600 hover:bg-rose-50"
              >
                Cancel Interview
              </Button>
            )}
          </div>

          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
