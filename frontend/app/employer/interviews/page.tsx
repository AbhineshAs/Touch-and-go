"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { LoadingState } from "@/components/ui/States";
import { Interview, InterviewScorecard } from "@/types";
import { getInterviews, submitScorecard } from "@/lib/api/interviews";
import { formatDate } from "@/lib/utils";
import {
  Calendar,
  Clock,
  Video,
  CheckCircle2,
  User,
  Star,
  Search,
  Filter,
  AlertTriangle,
  Award,
  Plus,
} from "lucide-react";
import {
  InterviewStatusBadge,
  InterviewDetailsModal,
  EditInterviewModal,
  CancelInterviewModal,
  InterviewCard,
} from "@/components/interview";

export default function EmployerInterviewsPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter
  const [statusFilter, setStatusFilter] = useState<"All" | "Scheduled" | "Completed" | "Cancelled">("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [selectedInterviewForScorecard, setSelectedInterviewForScorecard] = useState<Interview | null>(null);
  const [viewingInterview, setViewingInterview] = useState<Interview | null>(null);
  const [editingInterview, setEditingInterview] = useState<Interview | null>(null);
  const [cancellingInterview, setCancellingInterview] = useState<Interview | null>(null);

  // Scorecard modal state
  const [technicalRating, setTechnicalRating] = useState(5);
  const [communicationRating, setCommunicationRating] = useState(4);
  const [decision, setDecision] = useState<InterviewScorecard["overallDecision"]>("Strong Yes");
  const [summaryNote, setSummaryNote] = useState("");
  const [isSubmittingScorecard, setIsSubmittingScorecard] = useState(false);

  const loadInterviews = async () => {
    setIsLoading(true);
    const data = await getInterviews();
    setInterviews(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadInterviews();

    const handleUpdate = () => {
      getInterviews().then(setInterviews);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("tag_interviews_updated", handleUpdate);
      return () => {
        window.removeEventListener("tag_interviews_updated", handleUpdate);
      };
    }
  }, []);

  const handleScorecardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInterviewForScorecard) return;
    setIsSubmittingScorecard(true);

    const scorecard: InterviewScorecard = {
      interviewerId: "usr_emp_01",
      interviewerName: selectedInterviewForScorecard.interviewerName || "Vikramaditya Nair",
      technicalRating,
      communicationRating,
      domainKnowledgeRating: 5,
      cultureAddRating: 4,
      overallDecision: decision,
      summary: summaryNote,
      submittedAt: new Date().toISOString(),
    };

    const updated = await submitScorecard(selectedInterviewForScorecard.id, scorecard);
    setInterviews((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    setIsSubmittingScorecard(false);
    setSelectedInterviewForScorecard(null);
    setSummaryNote("");
  };

  const handleInterviewUpdated = (updated: Interview) => {
    setInterviews((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
  };

  const handleInterviewCancelled = (cancelled: Interview) => {
    setInterviews((prev) => prev.map((i) => (i.id === cancelled.id ? cancelled : i)));
  };

  // Filtered interviews
  const filteredInterviews = interviews.filter((int) => {
    if (statusFilter !== "All") {
      if (statusFilter === "Scheduled" && int.status !== "Scheduled" && int.status !== "Rescheduled") {
        return false;
      }
      if (statusFilter === "Completed" && int.status !== "Completed") {
        return false;
      }
      if (statusFilter === "Cancelled" && int.status !== "Cancelled") {
        return false;
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = int.candidateName.toLowerCase().includes(q);
      const matchJob = int.jobTitle.toLowerCase().includes(q);
      const matchInterviewer = int.interviewerName.toLowerCase().includes(q);
      if (!matchName && !matchJob && !matchInterviewer) return false;
    }

    return true;
  });

  // KPI Metrics
  const totalCount = interviews.length;
  const scheduledCount = interviews.filter(
    (i) => i.status === "Scheduled" || i.status === "Rescheduled"
  ).length;
  const completedCount = interviews.filter((i) => i.status === "Completed").length;
  const cancelledCount = interviews.filter((i) => i.status === "Cancelled").length;

  if (isLoading) {
    return <LoadingState message="Loading scheduled interviews and scorecards..." />;
  }

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Interviews & Candidate Evaluations
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary">
            Manage upcoming video rounds, reschedule meetings, update statuses, and log structured scorecards.
          </p>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 bg-surface border-border flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
            Total Sessions
          </span>
          <span className="text-2xl font-black text-text-primary">{totalCount}</span>
          <span className="text-[11px] text-text-muted">Recorded across pipelines</span>
        </Card>

        <Card className="p-4 bg-sky-50/60 border-sky-200/80 flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-sky-800 uppercase tracking-wider">
            Upcoming / Scheduled
          </span>
          <span className="text-2xl font-black text-sky-900">{scheduledCount}</span>
          <span className="text-[11px] text-sky-700">Awaiting technical rounds</span>
        </Card>

        <Card className="p-4 bg-emerald-50/60 border-emerald-200/80 flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
            Completed & Evaluated
          </span>
          <span className="text-2xl font-black text-emerald-900">{completedCount}</span>
          <span className="text-[11px] text-emerald-700">Scorecards submitted</span>
        </Card>

        <Card className="p-4 bg-rose-50/60 border-rose-200/80 flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-rose-800 uppercase tracking-wider">
            Cancelled
          </span>
          <span className="text-2xl font-black text-rose-900">{cancelledCount}</span>
          <span className="text-[11px] text-rose-700">Released time slots</span>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-surface border border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          {(["All", "Scheduled", "Completed", "Cancelled"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === tab
                  ? "bg-primary text-white shadow-2xs"
                  : "bg-background text-text-secondary hover:text-text-primary hover:bg-slate-100 border border-border-subtle"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search candidate, job, interviewer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-border bg-background text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* List of Interviews */}
      {filteredInterviews.length === 0 ? (
        <Card className="p-12 text-center bg-surface border-border flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-full bg-sky-50 flex items-center justify-center text-primary">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-text-primary">No Interviews Found</h3>
          <p className="text-xs text-text-secondary max-w-sm">
            {searchQuery || statusFilter !== "All"
              ? "No interviews match your selected status and search query. Try clearing the filters."
              : "No interviews scheduled yet. You can schedule interviews directly from the Candidate Review page."}
          </p>
          {(searchQuery || statusFilter !== "All") && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setStatusFilter("All");
                setSearchQuery("");
              }}
            >
              Reset Filters
            </Button>
          )}
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredInterviews.map((int) => (
            <InterviewCard
              key={int.id}
              interview={int}
              showCandidateName={true}
              onViewDetails={(item) => setViewingInterview(item)}
              onEdit={(item) => setEditingInterview(item)}
              onCancel={(item) => setCancellingInterview(item)}
              onSubmitScorecard={(item) => setSelectedInterviewForScorecard(item)}
            />
          ))}
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      <InterviewDetailsModal
        isOpen={!!viewingInterview}
        onClose={() => setViewingInterview(null)}
        interview={viewingInterview}
        onEdit={(item) => {
          setViewingInterview(null);
          setEditingInterview(item);
        }}
        onCancel={(item) => {
          setViewingInterview(null);
          setCancellingInterview(item);
        }}
      />

      {/* EDIT INTERVIEW MODAL */}
      <EditInterviewModal
        isOpen={!!editingInterview}
        onClose={() => setEditingInterview(null)}
        interview={editingInterview}
        onUpdated={handleInterviewUpdated}
      />

      {/* CANCEL INTERVIEW MODAL */}
      <CancelInterviewModal
        isOpen={!!cancellingInterview}
        onClose={() => setCancellingInterview(null)}
        interview={cancellingInterview}
        onCancelled={handleInterviewCancelled}
      />

      {/* SUBMIT SCORECARD MODAL */}
      <Modal
        isOpen={!!selectedInterviewForScorecard}
        onClose={() => setSelectedInterviewForScorecard(null)}
        title={`Interview Scorecard: ${selectedInterviewForScorecard?.candidateName}`}
        description="Structured evaluation rubric for technical competence, architecture design, and hiring decision."
        size="md"
      >
        <form onSubmit={handleScorecardSubmit} className="flex flex-col gap-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-text-secondary">Technical Competence (1-5)</label>
              <select
                value={technicalRating}
                onChange={(e) => setTechnicalRating(parseInt(e.target.value))}
                className="p-2 rounded-lg border border-border bg-surface text-text-primary"
              >
                <option value={5}>5 - Strong Technical Mastery</option>
                <option value={4}>4 - Solid Competence</option>
                <option value={3}>3 - Acceptable / Needs Support</option>
                <option value={2}>2 - Below Standard</option>
                <option value={1}>1 - Clear Gap</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-text-secondary">Communication & Articulation (1-5)</label>
              <select
                value={communicationRating}
                onChange={(e) => setCommunicationRating(parseInt(e.target.value))}
                className="p-2 rounded-lg border border-border bg-surface text-text-primary"
              >
                <option value={5}>5 - Exceptional Articulation</option>
                <option value={4}>4 - Clear & Structured</option>
                <option value={3}>3 - Moderate</option>
                <option value={2}>2 - Unclear</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-text-secondary">Overall Recommendation</label>
            <select
              value={decision}
              onChange={(e) => setDecision(e.target.value as any)}
              className="p-2 rounded-lg border border-border bg-surface text-text-primary"
            >
              <option value="Strong Yes">Strong Yes (Immediate Shortlist for Offer)</option>
              <option value="Yes">Yes (Meets Standard)</option>
              <option value="Mixed">Mixed (Needs Second Round)</option>
              <option value="No">No (Do Not Advance)</option>
            </select>
          </div>

          <Textarea
            label="Evaluation Summary & Justification"
            placeholder="Document specific technical observations, strengths in code review, and areas of concern..."
            value={summaryNote}
            onChange={(e) => setSummaryNote(e.target.value)}
            rows={3}
            required
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setSelectedInterviewForScorecard(null)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmittingScorecard}>
              Submit Scorecard
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
