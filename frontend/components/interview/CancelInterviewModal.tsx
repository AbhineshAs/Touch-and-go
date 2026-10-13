"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { Interview } from "@/types";
import { cancelInterview } from "@/lib/api/interviews";
import { AlertTriangle } from "lucide-react";

interface CancelInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  interview: Interview | null;
  onCancelled: (interview: Interview) => void;
}

const REASON_PRESETS = [
  "Candidate requested reschedule / emergency",
  "Internal hiring team scheduling conflict",
  "Position filled or placed on temporary hold",
  "Candidate withdrew or unavailable",
  "Role requirement modifications",
  "Other reason",
];

export function CancelInterviewModal({
  isOpen,
  onClose,
  interview,
  onCancelled,
}: CancelInterviewModalProps) {
  const [selectedPreset, setSelectedPreset] = useState(REASON_PRESETS[0]);
  const [customDetails, setCustomDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!interview) return null;

  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const fullReason = customDetails.trim()
        ? `${selectedPreset}: ${customDetails.trim()}`
        : selectedPreset;

      const cancelled = await cancelInterview(interview.id, fullReason);
      onCancelled(cancelled);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to cancel interview.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cancel Interview Session"
      description={`Are you sure you want to cancel the interview for ${interview.candidateName}?`}
      size="md"
    >
      <form onSubmit={handleCancelSubmit} className="flex flex-col gap-4 text-xs">
        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-medium">
            {errorMsg}
          </div>
        )}

        <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="font-bold text-rose-950">Confirm Session Cancellation</span>
            <p className="text-slate-600 text-xs">
              The interview status will be marked as <strong>Cancelled</strong>. The meeting room
              will be released and the candidate timeline updated.
            </p>
          </div>
        </div>

        {/* Reason Presets */}
        <div className="flex flex-col gap-1.5">
          <label className="font-semibold text-text-secondary">Cancellation Reason</label>
          <select
            value={selectedPreset}
            onChange={(e) => setSelectedPreset(e.target.value)}
            className="p-2 rounded-lg border border-border bg-surface text-text-primary text-xs focus:ring-1 focus:ring-primary focus:outline-none"
          >
            {REASON_PRESETS.map((reason) => (
              <option key={reason} value={reason}>
                {reason}
              </option>
            ))}
          </select>
        </div>

        {/* Custom Details */}
        <Textarea
          label="Additional Details / Internal Note (Optional)"
          placeholder="Document context regarding why this session was cancelled..."
          value={customDetails}
          onChange={(e) => setCustomDetails(e.target.value)}
          rows={2}
        />

        {/* Buttons */}
        <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Keep Interview
          </Button>
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            isLoading={isSubmitting}
            className="bg-rose-600 text-white hover:bg-rose-700 hover:text-white"
          >
            Confirm Cancellation
          </Button>
        </div>
      </form>
    </Modal>
  );
}
