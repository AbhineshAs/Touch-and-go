"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Bookmark,
  MapPin,
  ShieldCheck,
  Search,
  ArrowUpDown,
  Download,
  ChevronDown,
  CheckCircle2,
  X,
  Clock,
  ArrowRight,
  Briefcase,
  ExternalLink,
  Sparkles,
  Check,
} from "lucide-react";
import { useCandidate } from "@/lib/candidate/context/CandidateContext";
import { formatSalaryRange, formatRelativeTime, formatDate, cn } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";

export function SavedJobsPage() {
  const { savedJobIds, toggleSaveJob, availableJobs, applications, applyToJob } = useCandidate();

  // Search, Sort & Filter State
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "salary" | "title">("newest");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isExportCopied, setIsExportCopied] = useState(false);

  // Apply Modal State
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);
  const [applyNotes, setApplyNotes] = useState("");
  const [isAppliedSuccess, setIsAppliedSuccess] = useState(false);

  const sortRef = useRef<HTMLDivElement>(null);

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Filter available jobs down to those whose ID is in savedJobIds
  const savedJobs = useMemo(() => {
    return availableJobs.filter((j) => savedJobIds.includes(j.id));
  }, [availableJobs, savedJobIds]);

  // Filtered & Sorted saved jobs
  const processedSavedJobs = useMemo(() => {
    return savedJobs
      .filter((job) => {
        const query = search.trim().toLowerCase();
        if (!query) return true;
        const inTitle = job.title.toLowerCase().includes(query);
        const inOrg = job.organizationName.toLowerCase().includes(query);
        const inLoc = job.location.toLowerCase().includes(query);
        const inSkills = job.mustHaveSkills?.some((s) => s.toLowerCase().includes(query));
        return inTitle || inOrg || inLoc || inSkills;
      })
      .sort((a, b) => {
        if (sortBy === "salary") {
          const salA = a.maxSalaryINR || a.minSalaryINR || 0;
          const salB = b.maxSalaryINR || b.minSalaryINR || 0;
          return salB - salA;
        }
        if (sortBy === "title") {
          return a.title.localeCompare(b.title);
        }
        // Default: newest saved/published
        const dateA = new Date(a.publishedAt || a.updatedAt || 0).getTime();
        const dateB = new Date(b.publishedAt || b.updatedAt || 0).getTime();
        return dateB - dateA;
      });
  }, [savedJobs, search, sortBy]);

  // Batch Export Handler (Copies clean structured summary or downloads JSON)
  const handleExportSaved = () => {
    if (savedJobs.length === 0) return;
    const textData = savedJobs
      .map(
        (j, i) =>
          `${i + 1}. ${j.title} at ${j.organizationName}\n   Location: ${j.location} (${j.workMode})\n   Compensation: ${formatSalaryRange(
            j.minSalaryINR,
            j.maxSalaryINR,
            j.salaryPeriod
          )}\n   Skills: ${(j.mustHaveSkills || []).join(", ")}`
      )
      .join("\n\n");

    if (navigator.clipboard) {
      navigator.clipboard.writeText(textData);
      setIsExportCopied(true);
      setTimeout(() => setIsExportCopied(false), 2000);
    }
  };

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

  const selectedApplyingJob = availableJobs.find((j) => j.id === applyingJobId);

  return (
    <div className="flex flex-col gap-6">
      {/* A. Saved Header & Toolbar */}
      <div className="flex flex-col gap-4">
        {/* Title Block */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Saved Opportunities
              </h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
                ({savedJobs.length})
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Review and track positions you have shortlisted. Apply directly or organize your pipeline.
            </p>
          </div>

          {/* Export Action */}
          {savedJobs.length > 0 && (
            <button
              type="button"
              onClick={handleExportSaved}
              className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              {isExportCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied Shortlist</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Export Shortlist</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Action Toolbar */}
        {savedJobs.length > 0 && (
          <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
            {/* Search/filter input */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search saved jobs, companies, skills..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 w-full pl-10 pr-10 bg-slate-50/70 border border-slate-200/80 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div ref={sortRef} className="relative shrink-0">
              <button
                type="button"
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="h-10 px-3.5 rounded-xl border border-slate-200/80 bg-slate-50/70 hover:bg-slate-100/70 text-slate-700 text-xs font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {sortBy === "newest"
                    ? "Sort by: Date Saved (Newest)"
                    : sortBy === "salary"
                    ? "Sort by: Salary (High to Low)"
                    : "Sort by: Role Title (A-Z)"}
                </span>
                <ChevronDown
                  className={cn(
                    "w-3.5 h-3.5 text-slate-400 transition-transform",
                    isSortOpen && "rotate-180"
                  )}
                />
              </button>

              {isSortOpen && (
                <div className="absolute right-0 mt-1.5 w-56 rounded-xl bg-white border border-slate-200 shadow-lg py-1.5 z-30">
                  <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Sort Saved Jobs
                  </div>
                  {[
                    { value: "newest", label: "Date Saved (Newest)" },
                    { value: "salary", label: "Salary (High to Low)" },
                    { value: "title", label: "Role Title (A-Z)" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setSortBy(opt.value as "newest" | "salary" | "title");
                        setIsSortOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors cursor-pointer",
                        sortBy === opt.value
                          ? "text-blue-600 bg-blue-50 font-semibold"
                          : "text-slate-700 hover:bg-slate-50"
                      )}
                    >
                      <span>{opt.label}</span>
                      {sortBy === opt.value && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {savedJobs.length === 0 ? (
        /* High-Fidelity Empty State */
        <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center shadow-xs flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-2xs">
            <Bookmark className="w-8 h-8 fill-blue-600/20" />
          </div>
          <div className="max-w-md">
            <h2 className="text-lg font-semibold text-slate-900">
              No saved opportunities yet
            </h2>
            <p className="text-sm text-slate-500 mt-1 leading-relaxed">
              Bookmark positions while exploring open jobs to build your shortlist, track deadlines, and compare requirements side-by-side.
            </p>
          </div>
          <Link href="/candidate/jobs">
            <button
              type="button"
              className="bg-blue-600 text-white hover:bg-blue-700 h-10 px-5 rounded-lg text-sm font-medium shadow-xs transition-colors cursor-pointer mt-2"
            >
              Explore Open Positions
            </button>
          </Link>
        </div>
      ) : processedSavedJobs.length === 0 ? (
        /* Filtered Empty State */
        <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center shadow-xs flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">
            No saved jobs match &ldquo;{search}&rdquo;
          </h3>
          <p className="text-xs text-slate-500 max-w-sm">
            Try adjusting your search query or clear the filter to view all your bookmarked roles.
          </p>
          <button
            type="button"
            onClick={() => setSearch("")}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 underline mt-1 cursor-pointer"
          >
            Clear Search
          </button>
        </div>
      ) : (
        /* B. Responsive 2-Column Grid & Card Architecture */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {processedSavedJobs.map((job) => {
            const hasApplied = applications.some((a) => a.jobId === job.id || (job.slug && a.jobId === job.slug));

            return (
              <div
                key={job.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs hover:border-slate-300 hover:shadow-md transition-all"
              >
                <div>
                  {/* Top Row (Company & Save Toggle) */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Company avatar */}
                      <div className="h-11 w-11 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                        {job.organizationLogo ? (
                          <img
                            src={job.organizationLogo}
                            alt={job.organizationName}
                            className="w-full h-full object-contain p-1 bg-white"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              const fallback = e.currentTarget.parentElement?.querySelector(".company-fallback");
                              if (fallback) (fallback as HTMLElement).style.display = "flex";
                            }}
                          />
                        ) : null}
                        <div
                          className={cn(
                            "w-full h-full items-center justify-center text-sm font-bold text-white bg-slate-900 company-fallback",
                            job.organizationLogo ? "hidden" : "flex"
                          )}
                        >
                          {job.organizationName ? job.organizationName.charAt(0).toUpperCase() : "C"}
                        </div>
                      </div>

                      {/* Company name with verified badge and employment type pill */}
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

                    {/* Saved Toggle: Active bookmark button */}
                    <button
                      type="button"
                      onClick={() => toggleSaveJob(job.id)}
                      className="w-8 h-8 rounded-lg text-blue-600 bg-blue-50 hover:bg-blue-100 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                      title="Remove from saved"
                      aria-label="Remove from saved"
                    >
                      <Bookmark className="w-4 h-4 fill-current text-blue-600" />
                    </button>
                  </div>

                  {/* Body Content */}
                  <div className="mt-3.5">
                    {/* Job Title */}
                    <Link href={`/jobs/${job.slug}`}>
                      <h2 className="text-base font-bold text-slate-900 tracking-tight hover:text-blue-600 cursor-pointer transition-colors leading-snug">
                        {job.title}
                      </h2>
                    </Link>

                    {/* Compensation & Location */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 mt-2.5">
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
                        {job.workMode || "Hybrid"}
                      </span>
                    </div>

                    {/* Experience Level & Tech Stack Chips */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-3.5">
                      {job.experienceLevel && (
                        <span className="rounded-md bg-slate-100 text-slate-700 px-2.5 py-1 text-xs font-medium">
                          {job.experienceLevel}
                        </span>
                      )}
                      {job.mustHaveSkills && job.mustHaveSkills.length > 0 && (
                        <>
                          {job.mustHaveSkills.slice(0, 3).map((skill) => (
                            <span
                              key={skill}
                              className="rounded-md bg-slate-50 text-slate-700 border border-slate-200/60 px-2.5 py-1 text-xs font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                          {job.mustHaveSkills.length > 3 && (
                            <span className="rounded-md bg-slate-50 text-slate-500 border border-slate-200/60 px-2 py-1 text-xs font-medium">
                              +{job.mustHaveSkills.length - 3}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Row */}
                <div className="border-t border-slate-100 pt-4 mt-6 flex items-center justify-between gap-3">
                  {/* Left: Saved date with bookmark icon */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 min-w-0">
                    <Bookmark className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">
                      Saved {job.publishedAt ? formatRelativeTime(job.publishedAt) : "recently"}
                    </span>
                  </div>

                  {/* Right: Dual action group */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    <Link href={`/jobs/${job.slug}`}>
                      <button
                        type="button"
                        className="border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 h-9 px-3.5 rounded-lg text-xs font-semibold inline-flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
                      >
                        View Details
                      </button>
                    </Link>

                    {hasApplied ? (
                      <button
                        type="button"
                        disabled
                        className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 h-9 px-3.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 cursor-not-allowed"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Applied</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setApplyingJobId(job.id)}
                        className="bg-blue-600 text-white hover:bg-blue-700 h-9 px-4 rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span>Apply Now</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QUICK APPLY SIMULATION MODAL */}
      {selectedApplyingJob && (
        <Modal
          isOpen={Boolean(applyingJobId)}
          onClose={() => setApplyingJobId(null)}
          title={`Apply to ${selectedApplyingJob.title}`}
          description={`Submit your verified candidate profile to ${selectedApplyingJob.organizationName}.`}
          size="md"
        >
          <div className="flex flex-col gap-4">
            <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-blue-900 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5">
                <span className="font-bold">Verified Profile Submission</span>
                <span>
                  Your verified skills, experiences, and uploaded resume will be packaged and shared with {selectedApplyingJob.organizationName}.
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Candidate Note to Hiring Manager (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Briefly state why your technical background makes you an ideal fit..."
                value={applyNotes}
                onChange={(e) => setApplyNotes(e.target.value)}
                className="p-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>

            {isAppliedSuccess && (
              <div className="p-3 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Application submitted successfully!</span>
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
                className="bg-blue-600 text-white hover:bg-blue-700 h-9 px-4 rounded-lg text-xs font-semibold inline-flex items-center justify-center transition-colors shadow-xs cursor-pointer disabled:opacity-50"
              >
                Submit Application
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default SavedJobsPage;
