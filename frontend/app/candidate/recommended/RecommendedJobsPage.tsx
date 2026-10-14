"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Compass,
  ShieldCheck,
  MapPin,
  ArrowRight,
  Bookmark,
  CheckCircle2,
  Cpu,
  Globe,
  BellRing,
  ExternalLink,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";
import { useCandidate } from "@/lib/candidate/context/CandidateContext";
import { formatSalaryRange, formatRelativeTime, cn } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";

export function RecommendedJobsPage() {
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

  // Derive dynamic profile parameters for active matching badges
  const targetRoleDisplay =
    candidateRecord?.discovery?.targetRoles?.filter((r) => r.toLowerCase() !== "exploring")[0] ||
    candidateRecord?.profile?.jobPreferences?.desiredRoles?.[0] ||
    candidateRecord?.profile?.headline ||
    "Backend Engineer";

  const expCount = candidateRecord?.profile?.experience?.length || 0;
  const levelDisplay =
    expCount >= 4
      ? "Senior (4+ yrs)"
      : expCount >= 2
      ? "Mid-Level"
      : expCount === 1
      ? "Junior / Mid"
      : "Verified Fresher";

  const skillsList =
    candidateRecord?.profile?.skills?.map((s) => s.name) ||
    candidateRecord?.discovery?.skills?.map((s) => s.name) ||
    [];
  const stackDisplay =
    skillsList.length > 0
      ? skillsList.slice(0, 3).join(" • ")
      : "Python • Django • REST APIs";

  const modesList =
    candidateRecord?.profile?.jobPreferences?.desiredWorkModes ||
    (candidateRecord?.discovery?.workPreferences?.locationMode
      ? [candidateRecord.discovery.workPreferences.locationMode]
      : []);
  const modeDisplay =
    modesList.length > 0
      ? modesList
          .map((m) => m.charAt(0).toUpperCase() + m.slice(1).toLowerCase())
          .join(" / ")
      : "Remote / Hybrid";

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
      {/* A. Recommendation Scope Header Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Left Column (Context) */}
        <div className="flex flex-col max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200/60 w-fit">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>AI Match Curation</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-2">
            Recommended For You
          </h1>
          <p className="text-sm text-slate-500 mt-1 leading-relaxed">
            Roles curated and ranked against your verified tech stack, experience level, and preferred work arrangements.
          </p>
        </div>

        {/* Right Column (Active Matching Parameters) */}
        <div className="flex flex-col gap-2.5 p-4 rounded-xl bg-slate-50 border border-slate-200/70 shrink-0 lg:max-w-md w-full lg:w-auto">
          <div className="flex items-center justify-between text-xs gap-3">
            <span className="font-semibold text-slate-700">Active Matching Parameters</span>
            <Link
              href="/candidate/profile"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-0.5 transition-colors"
            >
              Adjust Matching Preferences →
            </Link>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-white text-slate-700 border border-slate-200/80 shadow-2xs">
              <span className="text-slate-400 font-normal">Target:</span>
              <span className="font-semibold text-slate-800">{targetRoleDisplay}</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-white text-slate-700 border border-slate-200/80 shadow-2xs">
              <span className="text-slate-400 font-normal">Level:</span>
              <span className="font-semibold text-slate-800">{levelDisplay}</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-white text-slate-700 border border-slate-200/80 shadow-2xs">
              <span className="text-slate-400 font-normal">Stack:</span>
              <span className="font-semibold text-slate-800">{stackDisplay}</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-white text-slate-700 border border-slate-200/80 shadow-2xs">
              <span className="text-slate-400 font-normal">Mode:</span>
              <span className="font-semibold text-slate-800">{modeDisplay}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area: Empty State or Matched Jobs Grid */}
      {matchedJobs.length === 0 ? (
        /* B. High-Fidelity Empty State Card */
        <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center shadow-xs flex flex-col items-center justify-center">
          {/* Layered circle illustration */}
          <div className="h-16 w-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-2xs">
            <Sparkles className="h-8 w-8" />
          </div>

          {/* Heading & Copy */}
          <h2 className="text-lg font-semibold text-slate-900 mt-4">
            No Active Matches Today
          </h2>
          <p className="max-w-md text-sm text-slate-500 leading-relaxed mt-1.5">
            Notifications are dispatched automatically as new partner openings match your verified skills, experience level, and preferred locations.
          </p>

          {/* Dual Action Button Group */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <Link href="/candidate/jobs">
              <button
                type="button"
                className="bg-blue-600 text-white hover:bg-blue-700 h-10 px-5 rounded-lg text-sm font-medium shadow-xs inline-flex items-center justify-center transition-colors cursor-pointer"
              >
                Explore All Openings
              </button>
            </Link>
            <Link href="/candidate/profile">
              <button
                type="button"
                className="border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 h-10 px-5 rounded-lg text-sm font-medium inline-flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
              >
                Review Target Criteria
              </button>
            </Link>
          </div>
        </div>
      ) : (
        /* Matched Jobs Listings */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {matchedJobs.map(({ job, matchReasons, unconfirmedSkills }) => {
            const isSaved = savedJobIds.includes(job.id);
            const application = applications.find(
              (a) => a.jobId === job.id || (job.slug && a.jobId === job.slug)
            );
            const hasApplied = Boolean(application);

            return (
              <div
                key={job.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 transition-all hover:border-slate-300 hover:shadow-sm"
              >
                <div>
                  {/* Top Row (Company & Bookmark) */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                        {job.organizationLogo ? (
                          <img
                            src={job.organizationLogo}
                            alt={job.organizationName}
                            className="w-full h-full object-contain p-1"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              const fallback = e.currentTarget.parentElement?.querySelector(".logo-fallback");
                              if (fallback) (fallback as HTMLElement).style.display = "flex";
                            }}
                          />
                        ) : null}
                        <div
                          className={cn(
                            "w-full h-full items-center justify-center text-sm font-bold text-slate-700 bg-slate-100 logo-fallback",
                            job.organizationLogo ? "hidden" : "flex"
                          )}
                        >
                          {job.organizationName ? job.organizationName.charAt(0).toUpperCase() : "C"}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                        <span className="text-xs font-semibold text-slate-700 truncate">
                          {job.organizationName}
                        </span>
                        {job.organizationVerified && (
                          <span title="Verified Employer" className="inline-flex items-center shrink-0">
                            <ShieldCheck className="w-3.5 h-3.5 text-blue-600 fill-blue-50" />
                          </span>
                        )}
                        <span className="bg-slate-100 text-slate-700 text-xs font-medium px-2 py-0.5 rounded-md shrink-0">
                          {job.employmentType || "Full-time"}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleSaveJob(job.id);
                      }}
                      className={cn(
                        "w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors shrink-0 cursor-pointer",
                        isSaved
                          ? "text-blue-600 bg-blue-50/70 hover:bg-blue-100/70"
                          : "text-slate-400 hover:text-slate-700"
                      )}
                      title={isSaved ? "Saved" : "Save Job"}
                      aria-label={isSaved ? "Saved" : "Save Job"}
                    >
                      <Bookmark className={cn("w-4 h-4", isSaved && "fill-current text-blue-600")} />
                    </button>
                  </div>

                  {/* Middle Section */}
                  <div className="mt-3.5">
                    <Link href={`/jobs/${job.slug}`}>
                      <h3 className="text-lg font-bold text-slate-900 tracking-tight hover:text-blue-600 transition-colors">
                        {job.title}
                      </h3>
                    </Link>

                    <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed mt-2">
                      {job.summary || "No description provided."}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 mt-3.5">
                      <span className="font-semibold text-slate-900">
                        {formatSalaryRange(job.minSalaryINR, job.maxSalaryINR, job.salaryPeriod)}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{job.location}</span>
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="bg-slate-100 text-slate-700 text-xs font-medium px-2 py-0.5 rounded-md">
                        {job.workMode || "Remote"}
                      </span>
                    </div>

                    {/* Factual Match Reasons */}
                    {matchReasons && matchReasons.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3.5">
                        {matchReasons.map((reason, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200/60 font-medium text-xs"
                          >
                            <CheckCircle2 className="w-3 h-3 text-blue-600 shrink-0" />
                            <span>{reason}</span>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Unconfirmed Skills if any */}
                    {unconfirmedSkills && unconfirmedSkills.length > 0 && (
                      <div className="text-xs text-slate-500 mt-2.5 flex items-center gap-1.5 flex-wrap">
                        <span className="text-slate-400">Skills to confirm:</span>
                        <span className="font-medium text-slate-700">
                          {unconfirmedSkills.join(", ")}
                        </span>
                      </div>
                    )}

                    {/* Tech Stack Badges */}
                    {job.mustHaveSkills && job.mustHaveSkills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-4">
                        {job.mustHaveSkills.slice(0, 4).map((tech: string) => (
                          <span
                            key={tech}
                            className="rounded-md bg-slate-50 text-slate-700 border border-slate-200/60 px-2.5 py-1 text-xs font-medium"
                          >
                            {tech}
                          </span>
                        ))}
                        {job.mustHaveSkills.length > 4 && (
                          <span className="rounded-md bg-slate-50 text-slate-500 border border-slate-200/60 px-2 py-1 text-xs font-medium">
                            +{job.mustHaveSkills.length - 4} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Row */}
                <div className="border-t border-slate-100 pt-4 mt-6 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 flex-wrap min-w-0">
                    <span className="text-xs text-slate-500">
                      Posted {formatRelativeTime(job.publishedAt)}
                    </span>
                    {hasApplied && (
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-xs px-2.5 py-1 rounded-md font-medium inline-flex items-center gap-1.5 shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Applied</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link href={`/jobs/${job.slug}`}>
                      <button
                        type="button"
                        className="border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 h-9 px-3.5 rounded-lg text-sm font-medium inline-flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
                      >
                        Job Details
                      </button>
                    </Link>
                    <button
                      type="button"
                      disabled={hasApplied}
                      onClick={() => setApplyingJobId(job.id)}
                      className={cn(
                        "h-9 px-4 rounded-lg text-sm font-medium inline-flex items-center gap-1.5 justify-center transition-colors shadow-xs cursor-pointer",
                        hasApplied
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      )}
                    >
                      <span>{hasApplied ? "Applied" : "Simulate Apply"}</span>
                      {!hasApplied && <ArrowRight className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* C. Proactive Suggestions Strip (Bottom Helper Cards) */}
      <div className="flex flex-col gap-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">
            Improve Your Matching Frequency
          </h2>
          <span className="text-xs text-slate-400">Proactive Recommendations</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Expand Skills */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 flex flex-col justify-between hover:border-slate-300 hover:shadow-xs transition-all group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-3 group-hover:scale-105 transition-transform">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Expand Skills</h3>
              <p className="text-xs text-slate-500 leading-relaxed mt-1">
                Verify additional frameworks, libraries, or cloud tools to qualify for roles with broader technical requirements.
              </p>
            </div>
            <Link
              href="/candidate/resume"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 mt-4 transition-colors"
            >
              <span>Verify more skills</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Card 2: Update Locations */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 flex flex-col justify-between hover:border-slate-300 hover:shadow-xs transition-all group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-3 group-hover:scale-105 transition-transform">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Update Locations</h3>
              <p className="text-xs text-slate-500 leading-relaxed mt-1">
                Add open-to-relocate or flexible remote preferences to capture high-compensation distributed positions.
              </p>
            </div>
            <Link
              href="/candidate/profile"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 mt-4 transition-colors"
            >
              <span>Edit location modes</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Card 3: Turn on Instant Alerts */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 flex flex-col justify-between hover:border-slate-300 hover:shadow-xs transition-all group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 mb-3 group-hover:scale-105 transition-transform">
                <BellRing className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Turn on Instant Alerts</h3>
              <p className="text-xs text-slate-500 leading-relaxed mt-1">
                Receive immediate email alerts when new positions matching 90%+ of your criteria are published.
              </p>
            </div>
            <Link
              href="/candidate/settings"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:text-purple-700 mt-4 transition-colors"
            >
              <span>Manage match alerts</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

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
            <label className="text-xs font-semibold text-slate-700">
              Candidate Cover Note (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Briefly highlight why your verified skills match this role..."
              value={applyNotes}
              onChange={(e) => setApplyNotes(e.target.value)}
              className="p-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          {isAppliedSuccess && (
            <div className="p-3 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Simulated application submitted successfully!</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              className="border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 h-9 px-4 rounded-lg text-xs font-medium inline-flex items-center justify-center transition-colors cursor-pointer"
              onClick={() => setApplyingJobId(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isAppliedSuccess}
              onClick={handleConfirmApply}
              className="bg-blue-600 text-white hover:bg-blue-700 h-9 px-4 rounded-lg text-xs font-medium inline-flex items-center justify-center transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            >
              Confirm Simulated Submission
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default RecommendedJobsPage;
