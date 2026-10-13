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
  Briefcase,
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
      <div className="flex flex-col items-center justify-center py-16 text-center gap-4 bg-white border border-slate-200/80 rounded-2xl p-8 shadow-xs max-w-xl mx-auto my-12">
        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/80 flex items-center justify-center font-black text-xl">
          T
        </div>
        <h2 className="text-xl font-bold text-slate-900">No Active Candidate Profile</h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md">
          Start your personalized candidate journey by completing our quick career conversation.
        </p>
        <Link href="/onboarding" className="mt-2">
          <button className="h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer">
            Start Profile Discovery
          </button>
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
    <div className="flex flex-col gap-6">
      {/* 1. Greeting & Candidate Banner */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-none">
            Welcome back, {firstName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal">{headline}</p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {hasPendingResumeUpdates ? (
            <Link href="/candidate/resume">
              <button className="h-9 px-3.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer">
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Review Resume Updates</span>
              </button>
            </Link>
          ) : (
            <Link href="/candidate/resume">
              <button className="h-9 px-3.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>Resume</span>
              </button>
            </Link>
          )}

          <Link href="/candidate/profile">
            <button className="h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer">
              <span>View Profile</span>
            </button>
          </Link>
        </div>
      </header>

      {/* 2. Top Widgets: Profile Completeness + Career Guidance / Upcoming Interview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Profile Completion Widget */}
        <Card className="lg:col-span-2 p-6 flex flex-col justify-between gap-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
          {completeness.score === 100 ? (
            <div className="flex flex-col gap-5 h-full justify-between">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-lg font-semibold text-slate-900 tracking-tight">
                      Profile Complete &amp; Verified
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed mt-1">
                      Your backend engineering profile is fully verified and indexed. You have maximum visibility with hiring teams.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Verified Profile
                  </span>
                  <Link href="/candidate/profile">
                    <button className="h-8 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer shadow-2xs">
                      Edit Profile
                    </button>
                  </Link>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-slate-600 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Your profile is publicly searchable by verified partner companies.</span>
                </div>
                <Link href="/candidate/profile" className="text-blue-600 font-semibold hover:underline shrink-0 ml-2">
                  Preview Public Profile →
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-5 h-full justify-between">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
                    <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-200"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-blue-600 transition-all duration-500"
                        strokeDasharray={`${completeness.score}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className="absolute font-bold text-sm text-slate-900">
                      {completeness.score}%
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">Profile Completeness</h3>
                      <span className="text-[11px] font-semibold text-slate-500">
                        ({completeness.completedGroups.length}/6 groups complete)
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Structured profiles with verified skills receive clearer matches and faster employer criteria evaluation.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsMissingDetailsOpen(true)}
                    className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer"
                  >
                    See missing details
                  </button>
                  <Link href="/candidate/profile">
                    <button className="h-8 px-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200 transition-colors cursor-pointer">
                      Complete Profile
                    </button>
                  </Link>
                </div>
              </div>

              {/* Profile Improvement Suggestions */}
              <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Recommended profile additions:
                </span>
                {suggestions.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {suggestions.map((sug) => (
                      <Link
                        key={sug.id}
                        href={sug.targetHref}
                        className="p-3 rounded-lg bg-slate-50/70 border border-slate-200 hover:border-blue-400 hover:bg-white hover:shadow-xs transition-all flex flex-col gap-1 text-xs"
                      >
                        <div className="flex items-center gap-1.5 font-bold text-slate-900">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span className="truncate">{sug.title}</span>
                        </div>
                        <span className="text-[11px] text-slate-500 line-clamp-2">
                          {sug.description}
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>All essential profile detail groups are fulfilled. Your profile is in excellent shape!</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>

        {/* Career Guidance or Upcoming Interview */}
        <Card className="p-6 flex flex-col justify-between gap-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md">
              {activeInterviews.length > 0 ? "Upcoming Interview" : "Career Guidance"}
            </span>
            {activeInterviews.length > 0 ? (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            ) : (
              <Sparkles className="w-4 h-4 text-indigo-500" />
            )}
          </div>

          {activeInterviews.length > 0 ? (
            <div className="flex flex-col gap-3 justify-between h-full">
              <div>
                <h4 className="font-bold text-sm text-slate-900 leading-snug">
                  {activeInterviews[0].jobTitle}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  With {activeInterviews[0].interviewerName} ({activeInterviews[0].interviewerRole})
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex flex-col gap-1.5 text-xs">
                <div className="flex items-center gap-2 text-slate-900 font-semibold">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>{formatDate(activeInterviews[0].scheduledAt)}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
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
                <button className="w-full h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer">
                  <Video className="w-4 h-4" />
                  <span>Join Meeting Room</span>
                </button>
              </a>
            </div>
          ) : nextGuidance ? (
            <div className="flex flex-col justify-between gap-3 h-full">
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                  Targeted for {discovery.primaryChallenge ? discovery.primaryChallenge.replace(/_/g, " ") : "Career Transition"}
                </span>
                <h4 className="font-bold text-sm text-slate-900 leading-snug">
                  {nextGuidance.title}
                </h4>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {nextGuidance.benefit}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>~{nextGuidance.estimatedDurationMinutes || 30} mins</span>
                </span>
                <Link href={`/dashboard/activities/${nextGuidance.activityId}`}>
                  <button className="h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer">
                    <span>Start Activity</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col justify-between gap-3 h-full">
              <div className="flex flex-col gap-1.5">
                <h4 className="font-bold text-sm text-slate-900">Explore Role Milestones</h4>
                <p className="text-xs text-slate-500">
                  Target your next career jump with tailored skill recommendations and roadmap items.
                </p>
              </div>
              <Link href="/candidate/recommended">
                <button className="w-full h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors cursor-pointer">
                  View Career Plan →
                </button>
              </Link>
            </div>
          )}
        </Card>
      </div>

      {/* 3. Role Discovery Search Bar */}
      <Card className="p-5 flex flex-col gap-3.5 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <Search className="w-4 h-4 text-blue-600" />
          <span>Discover Matching Roles</span>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center border border-slate-200 rounded-xl p-1.5 bg-white shadow-xs gap-1.5 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          <div className="flex-1 flex items-center gap-2.5 px-3 py-2 w-full">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search by title, stack, or skills (e.g. React, Next.js, Python, Go)"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none font-normal"
            />
          </div>

          <div className="hidden sm:block h-6 w-px bg-slate-200 shrink-0" />

          <div className="sm:w-72 flex items-center gap-2.5 px-3 py-2 w-full">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Bengaluru, Remote, Hybrid..."
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none font-normal"
            />
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto h-10 px-6 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition-colors shrink-0 flex items-center justify-center cursor-pointer shadow-2xs"
          >
            <span>Find Matches</span>
          </button>
        </form>

        <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500 pt-0.5">
          <span className="font-medium text-slate-400">Quick filters:</span>
          {["React", "Remote", "Bengaluru", "Python", "Full-time"].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => router.push(`/candidate/jobs?q=${encodeURIComponent(tag)}`)}
              className="bg-slate-100 hover:bg-slate-200/80 text-slate-600 text-xs px-3 py-1 rounded-full cursor-pointer transition-colors font-medium"
            >
              {tag}
            </button>
          ))}
        </div>
      </Card>

      {/* 4. Two-Column Split: Profile-Matched Opportunities + Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Recommended Opportunities */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">
                Recommended Opportunities
              </h2>
            </div>
            <Link
              href="/candidate/recommended"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 transition-colors"
            >
              <span>View all →</span>
            </Link>
          </div>

          <div className="flex flex-col gap-3 h-full">
            {topJobs.length > 0 ? (
              topJobs.map(({ job, matchReasons, unconfirmedSkills }) => {
                const isSaved = savedJobIds.includes(job.id);
                const hasApplied = applications.some((a) => a.jobId === job.id);

                return (
                  <Card key={job.id} hoverable className="p-4 sm:p-5 flex flex-col gap-3 bg-white border border-slate-200/80 rounded-xl shadow-xs">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {job.organizationLogo ? (
                          <img
                            src={job.organizationLogo}
                            alt={job.organizationName}
                            className="w-10 h-10 rounded-xl object-contain p-0.5 border border-slate-200 shrink-0 bg-white"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 font-bold flex items-center justify-center text-xs border border-blue-200 shrink-0">
                            {job.organizationName ? job.organizationName.charAt(0).toUpperCase() : "C"}
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-slate-500">
                            {job.organizationName}
                          </span>
                          <Link href={`/jobs/${job.slug}`}>
                            <h4 className="font-bold text-sm text-slate-900 hover:text-blue-600 transition-colors">
                              {job.title}
                            </h4>
                          </Link>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleSaveJob(job.id)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-blue-600 hover:bg-slate-50 transition-colors cursor-pointer"
                          title={isSaved ? "Saved" : "Save Job"}
                        >
                          <Bookmark className={`w-4 h-4 ${isSaved ? "fill-blue-600 text-blue-600" : ""}`} />
                        </button>
                      </div>
                    </div>

                    {/* Factual Match Reasons */}
                    <div className="flex flex-wrap gap-1.5 text-[11px]">
                      {matchReasons.map((reason, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium"
                        >
                          ✓ {reason}
                        </span>
                      ))}
                    </div>

                    {/* Unconfirmed Skills if any */}
                    {unconfirmedSkills.length > 0 && (
                      <div className="text-[11px] text-slate-500">
                        <span>Skills not yet confirmed: </span>
                        <span className="text-slate-700">
                          {unconfirmedSkills.slice(0, 3).join(", ")}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <span className="font-semibold text-slate-900">
                        {formatSalaryRange(job.minSalaryINR, job.maxSalaryINR, job.salaryPeriod)}
                      </span>
                      <div className="flex items-center gap-2">
                        <Link href={`/jobs/${job.slug}`}>
                          <button className="h-8 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer">
                            Details
                          </button>
                        </Link>
                        <button
                          type="button"
                          disabled={hasApplied}
                          onClick={() => setApplyingJobId(job.id)}
                          className="h-8 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold transition-colors cursor-pointer"
                        >
                          {hasApplied ? "Applied" : "Simulate Apply"}
                        </button>
                      </div>
                    </div>
                  </Card>
                );
              })
            ) : (
              <Card className="p-8 bg-white border border-slate-200/80 rounded-xl shadow-xs text-center flex flex-col items-center justify-center gap-3 h-full min-h-[240px]">
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600">
                  <Briefcase className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">No Matching Roles Found</h3>
                <p className="text-xs text-slate-500 max-w-sm">
                  We couldn&apos;t find open positions matching your stated filters. Explore all live job requisitions on the marketplace.
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <Link href="/candidate/profile">
                    <button className="h-8 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer">
                      Adjust Preferences
                    </button>
                  </Link>
                  <Link href="/candidate/jobs">
                    <button className="h-8 px-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors cursor-pointer">
                      Explore All Jobs
                    </button>
                  </Link>
                </div>
              </Card>
            )}
          </div>
        </section>

        {/* Application Activity */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">
                Application Activity ({applications.length})
              </h2>
            </div>
            <Link
              href="/candidate/applications"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 transition-colors"
            >
              <span>View all →</span>
            </Link>
          </div>

          <div className="flex flex-col gap-3 h-full">
            {applications.length > 0 ? (
              applications.map((app) => (
                <Card key={app.id} hoverable className="p-4 sm:p-5 flex flex-col gap-3 bg-white border border-slate-200/80 rounded-xl shadow-xs">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-slate-500">
                        {app.organizationName}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 leading-snug">
                        {app.jobTitle}
                      </h4>
                    </div>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                        app.stage === "Shortlisted"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : app.stage === "Interview"
                          ? "bg-purple-50 text-purple-700 border-purple-200"
                          : app.stage === "Closed"
                          ? "bg-slate-100 text-slate-600 border-slate-200"
                          : app.stage === "Decision"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                      }`}
                    >
                      {app.stage}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50/80 border border-slate-200/70 flex items-center justify-between text-xs text-slate-600">
                    <span>
                      Status: <strong className="text-slate-900">{app.stage}</strong>
                    </span>
                    <span className="text-slate-500">Applied {formatDate(app.appliedAt)}</span>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-8 bg-white border border-slate-200/80 rounded-xl shadow-xs text-center flex flex-col items-center justify-center gap-3 h-full min-h-[240px]">
                <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                  <FileText className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">No Active Applications</h4>
                <p className="text-xs text-slate-500 max-w-sm">
                  You haven&apos;t submitted any simulated applications yet. Browse recommended sample roles to test the process.
                </p>
                <Link href="/candidate/jobs" className="pt-2">
                  <button className="h-8 px-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors cursor-pointer">
                    Explore Sample Jobs
                  </button>
                </Link>
              </Card>
            )}
          </div>
        </section>
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
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="font-bold text-sm text-slate-900">Overall Completeness</span>
            <span className="font-black text-lg text-blue-600">{completeness.score}%</span>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
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
                  className="p-2.5 rounded-lg border border-slate-200/80 bg-white flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                    )}
                    <span className={isDone ? "text-slate-900 font-medium" : "text-slate-600"}>
                      {label}
                    </span>
                  </div>
                  <span className={`font-bold text-[11px] ${isDone ? "text-emerald-600" : "text-amber-600"}`}>
                    {isDone ? "Complete" : "Missing"}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-200">
            <Link href="/candidate/profile" onClick={() => setIsMissingDetailsOpen(false)}>
              <button className="h-8 px-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer">
                Edit Profile Information
              </button>
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
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="font-bold">Not sent to employer (Simulation)</span>
              <span>
                This is a local simulation. No email or application data is transmitted externally.
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-900">
              Candidate Cover Note (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Briefly highlight why your verified skills match this role..."
              value={applyNotes}
              onChange={(e) => setApplyNotes(e.target.value)}
              className="p-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
          </div>

          {isAppliedSuccess && (
            <div className="p-3 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Simulated application submitted successfully!</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setApplyingJobId(null)}
              className="h-8 px-3.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isAppliedSuccess}
              onClick={handleConfirmApply}
              className="h-8 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              Confirm Simulated Submission
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
