"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { MatchBadge, StatusBadge, SkillBadge } from "@/components/ui/Badge";
import { Modal, AlertDialog } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { MatchScore } from "@/components/matching/MatchScore";
import { MatchEvidence } from "@/components/matching/MatchEvidence";
import { LoadingState, EmptyState } from "@/components/ui/States";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Lock,
  Mail,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Building2,
  GraduationCap,
  Sparkles,
  UserCheck,
  XCircle,
  FileText,
} from "lucide-react";
import { Application, ApplicationStage, MatchResult } from "@/types";
import { getApplication, updateApplicationStage, addRecruiterNote } from "@/lib/api/applications";
import { getMatchEvidence } from "@/lib/api/matching";
import { scheduleInterview } from "@/lib/api/interviews";
import { formatDate } from "@/lib/utils";

export default function CandidateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const appId = (params?.id as string) || "app_01";

  const [application, setApplication] = useState<Application | null>(null);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Private note input
  const [newNote, setNewNote] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Schedule Interview modal
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [interviewDate, setInterviewDate] = useState("2026-09-18T14:30");
  const [interviewerName, setInterviewerName] = useState("Karthik Raman");
  const [interviewDuration, setInterviewDuration] = useState("45");
  const [interviewNote, setInterviewNote] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);

  // Rejection alert dialog
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const app = await getApplication(appId);
      if (app) {
        setApplication(app);
        const match = await getMatchEvidence(app.candidateId, app.jobId);
        setMatchResult(match);
      }
      setIsLoading(false);
    }
    load();
  }, [appId]);

  const handleStageUpdate = async (stage: ApplicationStage) => {
    if (!application) return;
    const updated = await updateApplicationStage(application.id, stage);
    setApplication(updated);
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !application) return;
    setIsAddingNote(true);
    const updated = await addRecruiterNote(application.id, newNote.trim(), "Vikramaditya Nair (Lead Recruiter)");
    setApplication(updated);
    setNewNote("");
    setIsAddingNote(false);
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!application) return;
    setIsScheduling(true);
    await scheduleInterview({
      applicationId: application.id,
      candidateId: application.candidateId,
      candidateName: application.candidateName,
      jobId: application.jobId,
      jobTitle: application.jobTitle,
      scheduledAt: interviewDate,
      durationMinutes: parseInt(interviewDuration) || 45,
      interviewerName,
      interviewerRole: "Hiring Manager",
      interviewerEmail: "karthik.r@razorwave.tech",
      meetingLink: "https://meet.google.com/tag-rzw-arch",
      candidateNote: interviewNote,
    });
    // Advance stage to interview
    const updated = await updateApplicationStage(application.id, "Interview", `Scheduled interview with ${interviewerName}`);
    setApplication(updated);
    setIsScheduling(false);
    setIsScheduleModalOpen(false);
  };

  const handleRejectConfirm = async () => {
    if (!application) return;
    await updateApplicationStage(application.id, "Closed", "Candidate not advancing based on current team criteria.");
    setIsRejectDialogOpen(false);
    router.push(`/employer/jobs/${application.jobId}/pipeline`);
  };

  if (isLoading || !application) {
    return <LoadingState message="Loading candidate credentials and explainable citations..." />;
  }

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-8 pb-16">
      {/* Top back navigation */}
      <div className="flex items-center justify-between">
        <Link
          href={`/employer/jobs/${application.jobId}/pipeline`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Candidate Pipeline</span>
        </Link>
      </div>

      {/* Candidate Header Card */}
      <Card className="p-6 sm:p-8 bg-surface border-border shadow-xs flex flex-col sm:flex-row sm:items-start justify-between gap-6">
        <div className="flex items-start gap-5">
          <img
            src={application.candidateAvatar}
            alt={application.candidateName}
            className="w-20 h-20 rounded-2xl object-cover border border-border shrink-0"
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-text-primary">
                {application.candidateName}
              </h1>
              <StatusBadge status={application.stage} />
            </div>
            <p className="text-xs sm:text-sm font-medium text-text-secondary mt-1">
              {application.candidateHeadline}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted mt-2">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {application.location}
              </span>
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                {application.candidateEmail}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Applied {formatDate(application.appliedAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Panel Buttons */}
        <div className="flex sm:flex-col gap-2 shrink-0 w-full sm:w-48">
          <Button
            size="sm"
            variant="primary"
            leftIcon={<Calendar className="w-3.5 h-3.5" />}
            onClick={() => setIsScheduleModalOpen(true)}
            className="w-full justify-center"
          >
            Schedule Interview
          </Button>

          {application.stage !== "Shortlisted" && (
            <Button
              size="sm"
              variant="outline"
              leftIcon={<UserCheck className="w-3.5 h-3.5" />}
              onClick={() => handleStageUpdate("Shortlisted")}
              className="w-full justify-center"
            >
              Shortlist Candidate
            </Button>
          )}

          <Button
            size="sm"
            variant="ghost"
            leftIcon={<XCircle className="w-3.5 h-3.5" />}
            onClick={() => setIsRejectDialogOpen(true)}
            className="w-full justify-center text-danger hover:bg-danger-soft hover:text-danger"
          >
            Reject Candidate
          </Button>
        </div>
      </Card>

      {/* EXPLAINABLE CRITERIA ALIGNMENT BREAKDOWN */}
      {matchResult && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-text-primary">
                Candidate Criteria Alignment ({matchResult.overallAlignment}%)
              </h2>
            </div>
            <span className="text-xs text-text-muted">
              Published Criteria vs Verified Candidate Profile
            </span>
          </div>

          <MatchScore matchResult={matchResult} />
          <MatchEvidence
            matched={matchResult.matched}
            missing={matchResult.missing}
            unknown={matchResult.unknown}
          />
        </div>
      )}

      {/* PRIVATE RECRUITER NOTES (Protected Recruiter Section) */}
      <Card className="p-6 bg-surface border-border flex flex-col gap-5">
        <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-600" />
            <h3 className="text-base font-bold text-text-primary">Internal Hiring Team Notes</h3>
          </div>
          <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
            Only visible to your hiring team
          </span>
        </div>

        {/* Existing notes */}
        <div className="flex flex-col gap-3">
          {application.recruiterNotes && application.recruiterNotes.length > 0 ? (
            application.recruiterNotes.map((note) => (
              <div
                key={note.id}
                className="p-4 rounded-xl bg-background border border-border-subtle flex flex-col gap-1.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-text-primary">{note.authorName}</span>
                  <span className="text-[11px] text-text-muted">{formatDate(note.createdAt)}</span>
                </div>
                <p className="text-text-secondary leading-relaxed">{note.content}</p>
              </div>
            ))
          ) : (
            <p className="text-xs text-text-muted py-2">No private notes added yet.</p>
          )}
        </div>

        {/* Add note form */}
        <form onSubmit={handleAddNote} className="flex flex-col gap-3 pt-2">
          <Textarea
            placeholder="Add confidential feedback, system design observations, or compensation considerations..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            rows={2}
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              size="sm"
              variant="secondary"
              isLoading={isAddingNote}
              disabled={!newNote.trim()}
            >
              Add Private Note
            </Button>
          </div>
        </form>
      </Card>

      {/* SCREENING ANSWERS */}
      {application.screeningAnswers && application.screeningAnswers.length > 0 && (
        <Card className="p-6 bg-surface border-border flex flex-col gap-4">
          <h3 className="text-base font-bold text-text-primary">
            Candidate Screening Responses
          </h3>
          <div className="flex flex-col gap-3">
            {application.screeningAnswers.map((sq, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-background border border-border-subtle flex flex-col gap-1 text-xs">
                <span className="font-semibold text-text-primary">{sq.question}</span>
                <p className="text-text-secondary mt-0.5">{sq.answer}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* SCHEDULE INTERVIEW MODAL */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title={`Schedule Interview: ${application.candidateName}`}
        description="Select date, time, and lead interviewer. Meeting links and calendar invites will be generated."
        size="md"
      >
        <form onSubmit={handleScheduleSubmit} className="flex flex-col gap-4 text-xs">
          <Input
            label="Date and Time (IST)"
            type="datetime-local"
            value={interviewDate}
            onChange={(e) => setInterviewDate(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Lead Interviewer"
              value={interviewerName}
              onChange={(e) => setInterviewerName(e.target.value)}
              required
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-text-secondary">Duration</label>
              <select
                value={interviewDuration}
                onChange={(e) => setInterviewDuration(e.target.value)}
                className="p-2 rounded-lg border border-border bg-surface text-text-primary"
              >
                <option value="30">30 Minutes</option>
                <option value="45">45 Minutes</option>
                <option value="60">60 Minutes</option>
              </select>
            </div>
          </div>

          <Textarea
            label="Candidate Preparation Note (Optional)"
            placeholder="e.g. Please be prepared to walk through your open source component architectures."
            value={interviewNote}
            onChange={(e) => setInterviewNote(e.target.value)}
            rows={2}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsScheduleModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isScheduling}>
              Send Invitation & Advance
            </Button>
          </div>
        </form>
      </Modal>

      {/* REJECTION CONFIRMATION ALERT */}
      <AlertDialog
        isOpen={isRejectDialogOpen}
        onClose={() => setIsRejectDialogOpen(false)}
        onConfirm={handleRejectConfirm}
        title="Confirm Candidate Rejection"
        description="Are you sure you want to decline this candidate? They will be removed from active pipeline stages and notified politely."
        confirmText="Confirm Rejection"
        isDestructive
      />
    </div>
  );
}
