"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Interview } from "@/types";
import { updateInterview } from "@/lib/api/interviews";

interface EditInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  interview: Interview | null;
  onUpdated: (interview: Interview) => void;
}

export function EditInterviewModal({
  isOpen,
  onClose,
  interview,
  onUpdated,
}: EditInterviewModalProps) {
  const [scheduledAt, setScheduledAt] = useState("");
  const [roundName, setRoundName] = useState("");
  const [duration, setDuration] = useState("45 Minutes");
  const [interviewerName, setInterviewerName] = useState("");
  const [interviewerRole, setInterviewerRole] = useState("Hiring Manager");
  const [meetingPlatform, setMeetingPlatform] = useState("Google Meet");
  const [meetingLink, setMeetingLink] = useState("");
  const [candidateNote, setCandidateNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (interview) {
      let isoDate = "";
      try {
        const d = new Date(interview.scheduledAt);
        const pad = (n: number) => String(n).padStart(2, "0");
        isoDate = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      } catch {
        isoDate = interview.scheduledAt;
      }

      setScheduledAt(isoDate);
      setRoundName(interview.roundName || "Round 1 - Technical Screen");
      setDuration(interview.durationMinutes ? `${interview.durationMinutes} Minutes` : "45 Minutes");
      setInterviewerName(interview.interviewerName || "");
      setInterviewerRole(interview.interviewerRole || "Hiring Manager");
      setMeetingPlatform(interview.meetingPlatform || "Google Meet");
      setMeetingLink(interview.meetingLink || "");
      setCandidateNote(interview.candidateNote || "");
      setErrorMsg(null);
    }
  }, [interview]);

  if (!interview) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const durationMinutes = parseInt(String(duration).replace(/\D/g, "")) || 45;
      const updated = await updateInterview(interview.id, {
        scheduledAt,
        roundName: roundName.trim(),
        durationMinutes,
        interviewerName: interviewerName.trim(),
        interviewerRole: interviewerRole.trim(),
        meetingPlatform,
        meetingLink: meetingLink.trim(),
        candidateNote: candidateNote.trim(),
        status: "Rescheduled",
      });

      onUpdated(updated);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to update interview.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Interview: ${interview.candidateName}`}
      description="Update date, time, lead interviewer, or video meeting link."
      size="md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-medium">
            {errorMsg}
          </div>
        )}

        {/* Date and Time */}
        <Input
          label="Date and Time (IST)"
          type="datetime-local"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
          required
        />

        {/* Round Name & Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Interview Round"
            placeholder="e.g. Round 1 - Technical Screen"
            value={roundName}
            onChange={(e) => setRoundName(e.target.value)}
            required
          />

          <Input
            label="Duration"
            placeholder="e.g. 45 Minutes"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
          />
        </div>

        {/* Lead Interviewer & Role */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Lead Interviewer"
            value={interviewerName}
            onChange={(e) => setInterviewerName(e.target.value)}
            required
          />

          <Input
            label="Interviewer Role"
            placeholder="e.g. Hiring Manager"
            value={interviewerRole}
            onChange={(e) => setInterviewerRole(e.target.value)}
            required
          />
        </div>

        {/* Meeting Link */}
        <Input
          label="Meeting Link (Google Meet, Zoom, Teams)"
          type="url"
          value={meetingLink}
          onChange={(e) => setMeetingLink(e.target.value)}
          required
        />

        {/* Candidate Preparation Note */}
        <Textarea
          label="Candidate Preparation Note (Optional)"
          value={candidateNote}
          onChange={(e) => setCandidateNote(e.target.value)}
          rows={2}
        />

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
            Save Changes & Update
          </Button>
        </div>
      </form>
    </Modal>
  );
}
