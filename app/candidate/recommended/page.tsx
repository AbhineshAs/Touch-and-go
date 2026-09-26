"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SkillBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/States";
import { Modal } from "@/components/ui/Modal";
import { formatSalaryRange, formatRelativeTime } from "@/lib/utils";
import { Sparkles, ShieldCheck, MapPin, ArrowRight, Bookmark, CheckCircle2 } from "lucide-react";
import { useCandidate } from "@/lib/candidate/context/CandidateContext";

export default function RecommendedJobsPage() {
  const {
    candidateRecord,
    matchedJobs,
    savedJobIds,
    applications,
    toggleSaveJob,
    applyToJob,
  } = useCandidate();

  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);
  const [applyNotes, setApplyNotes] = useState("");
  const [isAppliedSuccess, setIsAppliedSuccess] = useState(false);

  const targetRolesStr =
    candidateRecord?.discovery?.targetRoles?.filter((r) => r.toLowerCase() !== "exploring").join(", ") ||
    candidateRecord?.profile?.headline ||
    "Technology Roles";

  const handleConfirmApply = () => {
    if (!applyingJobId) return;
    applyToJob(applyingJobId, applyNotes);
    setIsAppliedSuccess(true);
    setTimeout(() => {
      setIsAppliedSuccess(false);
      setApplyingJobId(null);
      setApplyNotes("");
    }, 1500);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header with explainability banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex flex-col gap-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-soft text-primary-dark font-semibold text-xs border border-primary/20 w-fit">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>Profile-Matched Sample Opportunities</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Recommended For You
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            These sample positions match your confirmed focus in{" "}
            <strong className="text-text-primary">{targetRolesStr}</strong>. Every match provides explicit, factual reasons rather than unexplained scores.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-background border border-border-subtle flex flex-col gap-1 text-xs text-text-muted shrink-0">
          <span className="font-bold text-text-primary">Matching Criteria:</span>
          <span>• Target Direction Fit</span>
          <span>• Career Stage & Seniority</span>
          <span>• Stated Core Skills</span>
          <span>• Location & Work Mode Fit</span>
        </div>
      </div>

      {matchedJobs.length === 0 ? (
        <EmptyState
          title="No recommendations currently available"
          description="Update your skills and target preferences in your profile to view tailored criteria matches."
          action={{
            label: "Update Profile",
            onClick: () => (window.location.href = "/candidate/profile"),
          }}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {matchedJobs.map(({ job, matchReasons, unconfirmedSkills }) => {
            const isSaved = savedJobIds.includes(job.id);
            const hasApplied = applications.some((a) => a.jobId === job.id);

            return (
              <Card key={job.id} hoverable className="p-6 bg-surface border-border flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <img
                      src={job.organizationLogo}
                      alt={job.organizationName}
                      className="w-12 h-12 rounded-xl object-cover border border-border shrink-0"
                    />
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-text-secondary">
                          {job.organizationName}
                        </span>
                        {job.organizationVerified && (
                          <ShieldCheck className="w-3.5 h-3.5 text-success" />
                        )}
                        <span className="text-[10px] px-2 py-0.5 rounded bg-border-subtle text-text-muted font-medium">
                          Sample Job
                        </span>
                      </div>
                      <Link href={`/jobs/${job.slug}`}>
                        <h3 className="text-lg font-bold text-text-primary hover:text-primary transition-colors leading-snug">
                          {job.title}
                        </h3>
                      </Link>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {job.location} ({job.workMode})
                        </span>
                        <span>•</span>
                        <span className="font-semibold text-text-primary">
                          {formatSalaryRange(job.minSalaryINR, job.maxSalaryINR, job.salaryPeriod)}
                        </span>
                        <span>•</span>
                        <span className="text-text-muted">{job.experienceLevel}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleSaveJob(job.id)}
                      className="p-2 rounded-xl border border-border text-text-muted hover:text-primary transition-colors cursor-pointer"
                      title={isSaved ? "Saved" : "Save Job"}
                    >
                      <Bookmark className={`w-4 h-4 ${isSaved ? "fill-primary text-primary" : ""}`} />
                    </button>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                  {job.summary}
                </p>

                {/* Factual Match Reasons */}
                <div className="flex flex-wrap gap-1.5 text-xs">
                  {matchReasons.map((reason, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md bg-primary-soft/40 text-primary-dark font-medium text-[11px]"
                    >
                      ✓ {reason}
                    </span>
                  ))}
                </div>

                {/* Unconfirmed Skills if any */}
                {unconfirmedSkills.length > 0 && (
                  <div className="text-xs text-text-muted">
                    <span>Skills not yet confirmed in profile: </span>
                    <span className="text-text-secondary font-medium">
                      {unconfirmedSkills.join(", ")}
                    </span>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-1">
                  {job.mustHaveSkills.map((sk: string) => (
                    <SkillBadge key={sk} name={sk} />
                  ))}
                </div>

                <div className="pt-4 border-t border-border-subtle flex items-center justify-between">
                  <span className="text-xs text-text-muted">
                    Posted {formatRelativeTime(job.publishedAt)}
                  </span>
                  <div className="flex items-center gap-2">
                    <Link href={`/jobs/${job.slug}`}>
                      <Button size="sm" variant="outline">
                        Job Details
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="primary"
                      disabled={hasApplied}
                      rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                      onClick={() => setApplyingJobId(job.id)}
                    >
                      {hasApplied ? "Applied" : "Simulate Apply"}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* SIMULATED APPLY MODAL */}
      <Modal
        isOpen={Boolean(applyingJobId)}
        onClose={() => setApplyingJobId(null)}
        title="Simulate Job Application"
        description="Test how applications appear in your candidate workspace."
        size="md"
      >
        <div className="flex flex-col gap-4">
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="font-bold">Not sent to employer (Simulation)</span>
              <span>
                This is a local simulated application. No email or personal data is transmitted.
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-primary">
              Candidate Cover Note (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Briefly highlight why your verified skills match this role..."
              value={applyNotes}
              onChange={(e) => setApplyNotes(e.target.value)}
              className="p-3 rounded-xl border border-border bg-background text-xs text-text-primary focus:outline-none focus:border-primary"
            />
          </div>

          {isAppliedSuccess && (
            <div className="p-3 rounded-xl bg-success text-white text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Simulated application submitted successfully!</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setApplyingJobId(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={isAppliedSuccess}
              onClick={handleConfirmApply}
            >
              Confirm Simulated Submission
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
