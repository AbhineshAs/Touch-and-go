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
import { Calendar, Clock, Video, CheckCircle2, User, Star, ArrowRight } from "lucide-react";

export default function EmployerInterviewsPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Scorecard modal state
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [technicalRating, setTechnicalRating] = useState(5);
  const [communicationRating, setCommunicationRating] = useState(4);
  const [decision, setDecision] = useState<InterviewScorecard["overallDecision"]>("Strong Yes");
  const [summaryNote, setSummaryNote] = useState("");
  const [isSubmittingScorecard, setIsSubmittingScorecard] = useState(false);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const data = await getInterviews();
      setInterviews(data);
      setIsLoading(false);
    }
    load();
  }, []);

  const handleScorecardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInterview) return;
    setIsSubmittingScorecard(true);

    const scorecard: InterviewScorecard = {
      interviewerId: "usr_emp_01",
      interviewerName: "Vikramaditya Nair",
      technicalRating,
      communicationRating,
      domainKnowledgeRating: 5,
      cultureAddRating: 4,
      overallDecision: decision,
      summary: summaryNote,
      submittedAt: new Date().toISOString(),
    };

    const updated = await submitScorecard(selectedInterview.id, scorecard);
    setInterviews(interviews.map((i) => (i.id === updated.id ? updated : i)));
    setIsSubmittingScorecard(false);
    setSelectedInterview(null);
    setSummaryNote("");
  };

  if (isLoading) {
    return <LoadingState message="Loading scheduled interviews and scorecards..." />;
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 pb-16">
      <div className="flex flex-col gap-1 pb-4 border-b border-border">
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          Interviews & Candidate Evaluations
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary">
          Track technical rounds, coordinate meeting links, and submit structured feedback scorecards.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {interviews.map((int) => (
          <Card key={int.id} className="p-6 bg-surface border-border flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-text-primary">{int.candidateName}</h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      int.status === "Completed"
                        ? "bg-success-soft text-success"
                        : "bg-primary-soft text-primary"
                    }`}
                  >
                    {int.status}
                  </span>
                </div>
                <span className="text-xs text-text-secondary mt-0.5">{int.jobTitle}</span>
              </div>

              <div className="flex items-center gap-2">
                {int.status === "Scheduled" ? (
                  <>
                    <a href={int.meetingLink} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="primary" leftIcon={<Video className="w-3.5 h-3.5" />}>
                        Join Meeting
                      </Button>
                    </a>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedInterview(int)}
                    >
                      Submit Scorecard
                    </Button>
                  </>
                ) : (
                  <span className="text-xs font-semibold text-success flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Scorecard Logged
                  </span>
                )}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-background border border-border-subtle grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-text-secondary">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span>Scheduled: Thursday, 17 Sep 2026 · 03:00 PM IST</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                <span>
                  Interviewer: {int.interviewerName} ({int.interviewerRole})
                </span>
              </div>
            </div>

            {/* If scorecard exists */}
            {int.scorecard && (
              <div className="p-4 rounded-xl bg-primary-soft/20 border border-primary/20 flex flex-col gap-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-text-primary">Evaluation Scorecard</span>
                  <span className="font-bold text-primary bg-surface px-2 py-0.5 rounded border border-primary/20">
                    Decision: {int.scorecard.overallDecision}
                  </span>
                </div>
                <div className="flex gap-4 text-text-secondary">
                  <span>Technical: {int.scorecard.technicalRating} / 5</span>
                  <span>Communication: {int.scorecard.communicationRating} / 5</span>
                </div>
                <p className="text-text-secondary italic mt-1">&quot;{int.scorecard.summary}&quot;</p>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* SUBMIT SCORECARD MODAL */}
      <Modal
        isOpen={!!selectedInterview}
        onClose={() => setSelectedInterview(null)}
        title={`Interview Scorecard: ${selectedInterview?.candidateName}`}
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
                <option value="5">5 - Strong Technical Mastery</option>
                <option value="4">4 - Solid Competence</option>
                <option value="3">3 - Acceptable / Needs Support</option>
                <option value="2">2 - Below Standard</option>
                <option value="1">1 - Clear Gap</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-text-secondary">Communication & Articulation (1-5)</label>
              <select
                value={communicationRating}
                onChange={(e) => setCommunicationRating(parseInt(e.target.value))}
                className="p-2 rounded-lg border border-border bg-surface text-text-primary"
              >
                <option value="5">5 - Exceptional Articulation</option>
                <option value="4">4 - Clear & Structured</option>
                <option value="3">3 - Moderate</option>
                <option value="2">2 - Unclear</option>
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
              onClick={() => setSelectedInterview(null)}
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
