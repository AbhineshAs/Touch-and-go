"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Interview } from "@/types";
import { scheduleInterview } from "@/lib/api/interviews";
import { Video, Calendar, Sparkles } from "lucide-react";

interface ScheduleInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  candidateId: string;
  candidateName: string;
  candidateEmail?: string;
  jobId: string;
  jobTitle: string;
  defaultInterviewerName?: string;
  onScheduled: (interview: Interview) => void;
}

export function ScheduleInterviewModal({
  isOpen,
  onClose,
  applicationId,
  candidateId,
  candidateName,
  candidateEmail,
  jobId,
  jobTitle,
  defaultInterviewerName,
  onScheduled,
}: ScheduleInterviewModalProps) {
  // Generate tomorrow 14:30 default date
  const getDefaultDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(14, 30, 0, 0);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T14:30`;
  };

  const [scheduledAt, setScheduledAt] = useState(getDefaultDate());
  const [roundName, setRoundName] = useState("Round 1 - Technical Screen");
  const [duration, setDuration] = useState("45 Minutes");
  const [interviewerName, setInterviewerName] = useState(defaultInterviewerName || "Alen William");
  const [interviewerRole, setInterviewerRole] = useState("Hiring Manager");
  const [meetingPlatform, setMeetingPlatform] = useState("Google Meet");
  const [meetingLink, setMeetingLink] = useState("https://meet.google.com/tag-interview");
  const [candidateNote, setCandidateNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (defaultInterviewerName) {
      setInterviewerName(defaultInterviewerName);
    }
  }, [defaultInterviewerName]);

  const handlePlatformChange = (platform: string) => {
    setMeetingPlatform(platform);
    if (platform === "Google Meet" && !meetingLink.includes("meet.google.com")) {
      const code = Math.random().toString(36).substring(2, 5) + "-" + Math.random().toString(36).substring(2, 6) + "-" + Math.random().toString(36).substring(2, 5);
      setMeetingLink(`https://meet.google.com/${code}`);
    } else if (platform === "Zoom" && !meetingLink.includes("zoom.us")) {
      const randomMeeting = Math.floor(1000000000 + Math.random() * 9000000000);
      setMeetingLink(`https://zoom.us/j/${randomMeeting}`);
    } else if (platform === "Microsoft Teams" && !meetingLink.includes("teams.microsoft.com")) {
      setMeetingLink("https://teams.microsoft.com/l/meetup-join/tag-interview");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const link = meetingLink.trim() || "https://meet.google.com/tag-interview";
      const durationMinutes = parseInt(String(duration).replace(/\D/g, "")) || 45;
      const result = await scheduleInterview({
        applicationId,
        candidateId,
        candidateName,
        candidateEmail,
        jobId,
        jobTitle,
        roundName: roundName.trim() || "Round 1 - Technical Screen",
        scheduledAt,
        durationMinutes,
        interviewerName: interviewerName.trim() || "Hiring Lead",
        interviewerRole: interviewerRole.trim() || "Hiring Manager",
        interviewerEmail: "recruiting@company.com",
        meetingLink: link,
        meetingPlatform,
        candidateNote: candidateNote.trim(),
      });

      onScheduled(result);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to schedule interview. Please check inputs.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Schedule Interview: ${candidateName}`}
      description="Select date, time, and lead interviewer. Meeting links and calendar invites will be generated."
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
            placeholder="e.g. Alen William"
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

        {/* Platform Selection */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="font-semibold text-text-secondary">Meeting Platform</label>
            <span className="text-[11px] text-text-muted">Preset helper</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {["Google Meet", "Zoom", "Microsoft Teams"].map((plat) => (
              <button
                key={plat}
                type="button"
                onClick={() => handlePlatformChange(plat)}
                className={`py-1.5 px-2 rounded-lg border text-xs font-medium transition-all ${
                  meetingPlatform === plat
                    ? "border-primary bg-primary-soft/30 text-primary font-bold shadow-2xs"
                    : "border-border bg-surface text-text-secondary hover:border-slate-300"
                }`}
              >
                {plat}
              </button>
            ))}
          </div>
        </div>

        {/* Meeting Link */}
        <Input
          label="Meeting Link (Google Meet, Zoom, Teams)"
          type="url"
          placeholder="e.g. https://meet.google.com/abc-defg-hij or https://zoom.us/j/..."
          value={meetingLink}
          onChange={(e) => setMeetingLink(e.target.value)}
          required
        />

        {/* Candidate Preparation Note */}
        <Textarea
          label="Candidate Preparation Note (Optional)"
          placeholder="e.g. Please be prepared to walk through your open source component architectures."
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
            Send Invitation & Advance
          </Button>
        </div>
      </form>
    </Modal>
  );
}
