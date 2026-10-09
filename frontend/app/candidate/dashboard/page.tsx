"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { MatchBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { LoadingState } from "@/components/ui/States";
import {
  Search,
  MapPin,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Clock,
  ArrowRight,
  Bookmark,
  FileText,
  Building2,
  Video,
  ChevronRight,
  Layers,
  Award,
  Sliders,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Info,
} from "lucide-react";
import { useCandidate } from "@/lib/candidate/context/CandidateContext";
import { formatSalaryRange, formatRelativeTime, formatDate } from "@/lib/utils";

export default function CandidateDashboardPage() {
  const router = useRouter();
  const {
    candidateRecord,
    completeness,
    suggestions,
    matchedJobs,
    savedJobIds,
    applications,
    interviews,
    recommendations,
    resumeDraft,
    toggleSaveJob,
    applyToJob,
  } = useCandidate();

  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [isMissingDetailsOpen, setIsMissingDetailsOpen] = useState(false);

  // Apply Simulation Modal State
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);
  const [applyNotes, setApplyNotes] = useState("");
  const [isAppliedSuccess, setIsAppliedSuccess] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchKeyword) params.set("q", searchKeyword);
    if (searchLocation) params.set("location", searchLocation);
    router.push(`/candidate/jobs?${params.toString()}`);
  };

  // If candidate record not loaded yet, or fresh without onboarding
  if (!candidateRecord) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-primary-soft text-primary flex items-center justify-center font-black text-xl">
          T
        </div>
        <h2 className="text-xl font-bold text-text-primary">No Active Candidate Profile</h2>
        <p className="text-xs sm:text-sm text-text-muted max-w-md">
          Start your personalized candidate journey by completing our quick career conversation.
        </p>
        <Link href="/onboarding">
          <Button size="md" variant="primary">
            Start Profile Discovery
          </Button>
        </Link>
      </div>
    );
  }

  const { identity, profile, discovery, profileRevision } = candidateRecord;
  const fullName = identity?.fullName || "Candidate";
  const firstName = fullName.split(" ")[0] || "Candidate";
  const headline = profile?.headline || "Technology Candidate";

  // Career Guidance next action from discovery engine
  const nextGuidance = recommendations[0];

  // Resume status: Create vs Continue vs Review Updates
  const hasResumeDraft = Boolean(resumeDraft);
  const hasPendingResumeUpdates =
    hasResumeDraft &&
    resumeDraft?.sourceProfileRevision !== undefined &&
    profileRevision > resumeDraft.sourceProfileRevision &&
    !resumeDraft.hasReviewedProfileChanges;

  const topJobs = matchedJobs.slice(0, 3);
  const activeInterviews = interviews.filter((i) => i.status === "Scheduled");

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
    <div className="flex flex-col gap-8">
      {/* 1. Greeting & Candidate Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
              Welcome back, {firstName}
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary-soft text-primary font-bold uppercase tracking-wider">
              Revision {profileRevision}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-text-secondary">{headline}</p>
        </div>

        <div className="flex items-center gap-3">
          {hasPendingResumeUpdates ? (
            <Link href="/candidate/resume">
              <Button
                size="sm"
                variant="primary"
                className="bg-amber-600 hover:bg-amber-700 text-white"
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Review Resume Updates
              </Button>
            </Link>
          ) : (
            <Link href="/candidate/resume">
              <Button size="sm" variant="outline" leftIcon={<FileText className="w-3.5 h-3.5" />}>
                Resume
              </Button>
            </Link>
          )}

          <Link href="/candidate/profile">
            <Button size="sm" variant="primary">
              View Profile
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Top Widgets: Profile Completeness + Career Guidance / Upcoming Interview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Completion Widget (Computed via 6-group transparent formula) */}
        <Card className="lg:col-span-2 p-6 flex flex-col justify-between gap-5 bg-surface border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
                <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-border"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-primary transition-all duration-500"
                    strokeDasharray={`${completeness.score}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute font-black text-sm text-text-primary">
                  {completeness.score}%
                </span>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-text-primary">Profile Completeness</h3>
                  <span className="text-[11px] font-semibold text-text-muted">
                    ({completeness.completedGroups.length}/6 groups complete)
                  </span>
                </div>
                <p className="text-xs text-text-muted">
                  Structured profiles with verified skills receive clearer matches and faster employer criteria evaluation.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsMissingDetailsOpen(true)}
                className="text-xs text-primary font-semibold hover:underline cursor-pointer"
              >
                See missing details
              </button>
              <Link href="/candidate/profile">
                <Button size="sm" variant="soft">
                  Complete Profile
                </Button>
              </Link>
            </div>
          </div>

          {/* Profile Improvement Suggestions (at most 3 contextual additions) */}
          <div className="pt-4 border-t border-border-subtle flex flex-col gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
              Recommended profile additions:
            </span>
            {suggestions.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {suggestions.map((sug) => (
                  <Link
                    key={sug.id}
                    href={sug.targetHref}
                    className="p-2.5 rounded-lg bg-background border border-border-subtle hover:border-primary/40 transition-colors flex flex-col gap-1 text-xs"
                  >
                    <div className="flex items-center gap-1.5 font-bold text-text-primary">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="truncate">{sug.title}</span>
                    </div>
                    <span className="text-[11px] text-text-muted line-clamp-2">
                      {sug.description}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-success-soft/30 border border-success/20 text-xs text-success flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>All essential profile detail groups are fulfilled. Your profile is in excellent shape!</span>
              </div>
            )}
          </div>
        </Card>

        {/* Upcoming Interview or Career Guidance Hero Widget */}
        <Card className="p-6 flex flex-col justify-between gap-4 bg-primary-soft/20 border-primary/20">
          <div className="flex items-center justify-between pb-2 border-b border-primary/20">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              {activeInterviews.length > 0 ? "Upcoming Interview" : "Career Guidance"}
            </span>
            {activeInterviews.length > 0 ? (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            ) : (
              <Sparkles className="w-4 h-4 text-primary" />
            )}
          </div>

          {activeInterviews.length > 0 ? (
            <div className="flex flex-col gap-3">
              <div>
                <h4 className="font-bold text-sm text-text-primary leading-snug">
                  {activeInterviews[0].jobTitle}
                </h4>
                <p className="text-xs text-text-secondary mt-0.5 font-medium">
                  With {activeInterviews[0].interviewerName} ({activeInterviews[0].interviewerRole})
                </p>
              </div>

              <div className="p-3 rounded-lg bg-surface border border-border-subtle flex flex-col gap-1.5 text-xs">
                <div className="flex items-center gap-2 text-text-primary font-semibold">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>{formatDate(activeInterviews[0].scheduledAt)}</span>
                </div>
                <div className="flex items-center gap-2 text-text-muted">
                  <Clock className="w-4 h-4" />
                  <span>{activeInterviews[0].durationMinutes} Minutes · Video Call</span>
                </div>
              </div>

              <a
                href={activeInterviews[0].meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full"
              >
                <Button size="sm" variant="primary" className="w-full" leftIcon={<Video className="w-4 h-4" />}>
                  Join Meeting Room
                </Button>
              </a>
            </div>
          ) : nextGuidance ? (
            <div className="flex flex-col justify-between gap-3 h-full">
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                  Targeted for {discovery.primaryChallenge ? discovery.primaryChallenge.replace(/_/g, " ") : "your goals"}
                </span>
                <h4 className="font-bold text-sm text-text-primary leading-snug">
                  {nextGuidance.title}
                </h4>
                <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                  {nextGuidance.benefit}
                </p>
              </div>

              <div className="pt-2 border-t border-primary/20 flex items-center justify-between">
                <span className="text-[11px] text-text-muted flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>~{nextGuidance.estimatedDurationMinutes}m</span>
                </span>
                <Link href={`/dashboard/activities/${nextGuidance.activityId}`}>
                  <Button size="sm" variant="primary" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    Start Activity
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-text-muted flex flex-col items-center gap-2">
              <Info className="w-5 h-5 text-text-muted" />
              <span>No interviews scheduled at this time.</span>
            </div>
          )}
        </Card>
      </div>

      {/* 3. Job Search Component */}
      <Card className="p-6 bg-surface border-border shadow-xs flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-text-primary">Discover Sample Technology Roles</h3>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background">
            <Search className="w-4 h-4 text-text-muted shrink-0" />
            <input
              type="text"
              placeholder="Search by title or stack (e.g. React, Next.js, Python, Go)"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full bg-transparent text-xs text-text-primary focus:outline-none"
            />
          </div>

          <div className="sm:w-64 flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background">
            <MapPin className="w-4 h-4 text-text-muted shrink-0" />
            <input
              type="text"
              placeholder="Bengaluru, Remote, Hybrid..."
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              className="w-full bg-transparent text-xs text-text-primary focus:outline-none"
            />
          </div>

          <Button type="submit" size="md" variant="primary" className="shrink-0">
            Find Matches
          </Button>
        </form>

        <div className="flex items-center gap-2 flex-wrap text-xs text-text-muted pt-1">
          <span>Quick filters:</span>
          {["React", "Remote", "Bengaluru", "Python", "Full-time"].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => router.push(`/candidate/jobs?q=${encodeURIComponent(tag)}`)}
              className="px-2 py-0.5 rounded-full bg-background border border-border hover:border-primary hover:text-primary transition-colors cursor-pointer text-[11px]"
            >
              {tag}
            </button>
          ))}
        </div>
      </Card>

      {/* 4. Two-Column Split: Profile-Matched Sample Opportunities + Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Recommended Sample Opportunities */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <h2 className="text-base font-bold text-text-primary">
                Recommended Sample Opportunities
              </h2>
            </div>
            <Link
              href="/candidate/recommended"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {topJobs.length > 0 ? (
              topJobs.map(({ job, matchReasons, unconfirmedSkills }) => {
                const isSaved = savedJobIds.includes(job.id);
                const hasApplied = applications.some((a) => a.jobId === job.id);

                return (
                  <Card key={job.id} hoverable className="p-4 sm:p-5 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={job.organizationLogo}
                          alt={job.organizationName}
                          className="w-10 h-10 rounded-xl object-cover border border-border shrink-0"
                        />
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-text-muted">
                            {job.organizationName}
                          </span>
                          <Link href={`/jobs/${job.slug}`}>
                            <h4 className="font-bold text-sm text-text-primary hover:text-primary transition-colors">
                              {job.title}
                            </h4>
                          </Link>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleSaveJob(job.id)}
                          className="p-1.5 rounded-lg border border-border text-text-muted hover:text-primary transition-colors cursor-pointer"
                          title={isSaved ? "Saved" : "Save Job"}
                        >
                          <Bookmark className={`w-4 h-4 ${isSaved ? "fill-primary text-primary" : ""}`} />
                        </button>
                      </div>
                    </div>

                    {/* Factual Match Reasons */}
                    <div className="flex flex-wrap gap-1.5 text-[11px]">
                      {matchReasons.map((reason, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-primary-soft/40 text-primary-dark font-medium"
                        >
                          ✓ {reason}
                        </span>
                      ))}
                    </div>

                    {/* Unconfirmed Skills if any */}
                    {unconfirmedSkills.length > 0 && (
                      <div className="text-[11px] text-text-muted">
                        <span>Skills not yet confirmed: </span>
                        <span className="text-text-secondary">
                          {unconfirmedSkills.slice(0, 3).join(", ")}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-border-subtle text-xs">
                      <span className="font-semibold text-text-primary">
                        {formatSalaryRange(job.minSalaryINR, job.maxSalaryINR, job.salaryPeriod)}
                      </span>
                      <div className="flex items-center gap-2">
                        <Link href={`/jobs/${job.slug}`}>
                          <Button size="sm" variant="outline">
                            Details
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="primary"
                          disabled={hasApplied}
                          onClick={() => setApplyingJobId(job.id)}
                        >
                          {hasApplied ? "Applied" : "Simulate Apply"}
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })
            ) : (
              <div className="p-6 rounded-2xl bg-surface border border-border text-center flex flex-col items-center gap-3">
                <Info className="w-8 h-8 text-text-muted" />
                <h3 className="text-sm font-bold text-text-primary">No Matching Sample Roles</h3>
                <p className="text-xs text-text-muted max-w-sm">
                  We could not find sample positions strictly matching your stated filters.
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <Link href="/candidate/profile">
                    <Button size="sm" variant="outline">
                      Edit Preferences
                    </Button>
                  </Link>
                  <Link href="/candidate/jobs">
                    <Button size="sm" variant="primary">
                      Browse All Sample Jobs
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Application Activity */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <h2 className="text-base font-bold text-text-primary">
                Application Activity ({applications.length})
              </h2>
            </div>
            <Link
              href="/candidate/applications"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {applications.length > 0 ? (
              applications.map((app) => (
                <Card key={app.id} hoverable className="p-4 sm:p-5 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-text-muted">
                        {app.organizationName}
                      </span>
                      <h4 className="font-bold text-sm text-text-primary leading-snug">
                        {app.jobTitle}
                      </h4>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-primary-soft text-primary-dark text-xs font-semibold">
                      {app.stage}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-background border border-border-subtle flex items-center justify-between text-xs text-text-secondary">
                    <span>
                      Status: <strong className="text-text-primary">{app.stage}</strong>
                    </span>
                    <span className="text-text-muted">Applied {formatDate(app.appliedAt)}</span>
                  </div>
                </Card>
              ))
            ) : (
              <div className="p-8 rounded-2xl bg-surface border border-border text-center flex flex-col items-center gap-3">
                <FileText className="w-8 h-8 text-text-muted" />
                <h4 className="text-sm font-bold text-text-primary">No active applications</h4>
                <p className="text-xs text-text-muted max-w-sm">
                  You haven&apos;t submitted any simulated applications yet. Browse recommended sample roles to test the process.
                </p>
                <Link href="/candidate/jobs" className="pt-2">
                  <Button size="sm" variant="outline">
                    Explore Sample Jobs
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MISSING DETAILS MODAL */}
      <Modal
        isOpen={isMissingDetailsOpen}
        onClose={() => setIsMissingDetailsOpen(false)}
        title="Profile Completeness Breakdown"
        description="TAG calculates completeness across 6 transparent, equally weighted groups."
        size="md"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-background border border-border">
            <span className="font-bold text-sm text-text-primary">Overall Completeness</span>
            <span className="font-black text-lg text-primary">{completeness.score}%</span>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Detail Groups Status
            </span>
            {[
              { id: "contact", label: "Contact Information (Name, Email, Phone)" },
              { id: "direction", label: "Career Direction (Target Role or Descriptive Headline)" },
              { id: "skills", label: "Technical Skills (At least 1 listed skill)" },
              { id: "background_evidence", label: "Background Evidence (Education, Experience, or Project)" },
              { id: "work_preferences", label: "Work Preferences (Work Mode, Job Type, Availability)" },
              { id: "summary", label: "Professional Summary (Confirmed narrative)" },
            ].map(({ id, label }) => {
              const isDone = completeness.completedGroups.includes(id as any);
              return (
                <div
                  key={id}
                  className="p-2.5 rounded-lg border border-border-subtle flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                    )}
                    <span className={isDone ? "text-text-primary font-medium" : "text-text-secondary"}>
                      {label}
                    </span>
                  </div>
                  <span className={`font-bold text-[11px] ${isDone ? "text-success" : "text-amber-600"}`}>
                    {isDone ? "Complete" : "Missing"}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-3 border-t border-border">
            <Link href="/candidate/profile" onClick={() => setIsMissingDetailsOpen(false)}>
              <Button size="sm" variant="primary">
                Edit Profile Information
              </Button>
            </Link>
          </div>
        </div>
      </Modal>

      {/* SIMULATED APPLY CONFIRMATION MODAL */}
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
                This is a local simulation. No email or application data is transmitted externally.
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
