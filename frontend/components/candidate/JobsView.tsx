"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search,
  MapPin,
  ShieldCheck,
  Bookmark,
  CheckCircle2,
  X,
  ChevronDown,
  ArrowUpDown,
  SlidersHorizontal,
  Briefcase,
  Building2,
  RotateCcw,
} from "lucide-react";
import { useCandidate } from "@/lib/candidate/context/CandidateContext";
import { formatSalaryRange, formatRelativeTime, cn } from "@/lib/utils";
import { Job } from "@/types";

export interface JobsViewProps {
  initialSearch?: string;
}

export function JobsView({ initialSearch = "" }: JobsViewProps) {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("q") || "";

  const { savedJobIds, toggleSaveJob, availableJobs, applications, matchedJobs } = useCandidate();

  // Search & Filter State
  const [search, setSearch] = useState(queryParam || initialSearch);
  const [selectedJobType, setSelectedJobType] = useState<string>("all");
  const [selectedWorkplace, setSelectedWorkplace] = useState<string>("all");
  const [selectedTech, setSelectedTech] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"relevant" | "newest" | "salary">("relevant");

  // Dropdown open states
  const [openDropdown, setOpenDropdown] = useState<"jobType" | "workplace" | "tech" | "sort" | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownContainerRef = useRef<HTMLDivElement>(null);

  // Sync with query param if it changes from external search (e.g. Header Cmd+K)
  useEffect(() => {
    if (queryParam) {
      setSearch(queryParam);
    }
  }, [queryParam]);

  // Global keyboard shortcut to focus search input (Cmd+K or /)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") ||
        ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k")
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === "Escape") {
        setOpenDropdown(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        dropdownContainerRef.current &&
        !dropdownContainerRef.current.contains(e.target as Node)
      ) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Published open jobs
  const publishedJobs = useMemo(() => {
    return availableJobs.filter((j) => j.status === "Published" || !j.status);
  }, [availableJobs]);

  // Extract all unique tech skills from published jobs for the tech stack dropdown
  const availableTechStacks = useMemo(() => {
    const skillsSet = new Set<string>();
    publishedJobs.forEach((job) => {
      job.mustHaveSkills?.forEach((skill) => skillsSet.add(skill));
    });
    return Array.from(skillsSet).sort();
  }, [publishedJobs]);

  // Helper map for match score lookup
  const matchScoreMap = useMemo(() => {
    const map = new Map<string, number>();
    if (matchedJobs && matchedJobs.length > 0) {
      matchedJobs.forEach((m) => {
        if (m.job?.id) {
          map.set(m.job.id, m.score || 0);
        }
        if (m.job?.slug) {
          map.set(m.job.slug, m.score || 0);
        }
      });
    }
    return map;
  }, [matchedJobs]);

  // Filtered and sorted jobs
  const filteredJobs = useMemo(() => {
    return publishedJobs
      .filter((job) => {
        // Search text matching
        const searchLower = search.trim().toLowerCase();
        if (searchLower) {
          const matchesTitle = job.title.toLowerCase().includes(searchLower);
          const matchesOrg = job.organizationName.toLowerCase().includes(searchLower);
          const matchesLocation = job.location.toLowerCase().includes(searchLower);
          const matchesSkills = job.mustHaveSkills?.some((s) =>
            s.toLowerCase().includes(searchLower)
          );
          const matchesSummary = job.summary?.toLowerCase().includes(searchLower);

          if (!matchesTitle && !matchesOrg && !matchesLocation && !matchesSkills && !matchesSummary) {
            return false;
          }
        }

        // Job Type Filter
        if (selectedJobType !== "all") {
          const jobType = (job.employmentType || "Full-time").toLowerCase();
          if (jobType !== selectedJobType.toLowerCase()) {
            return false;
          }
        }

        // Workplace Filter
        if (selectedWorkplace !== "all") {
          const workMode = (job.workMode || "").toLowerCase();
          if (!workMode.includes(selectedWorkplace.toLowerCase())) {
            return false;
          }
        }

        // Tech Stack Filter
        if (selectedTech !== "all") {
          const hasSkill = job.mustHaveSkills?.some(
            (s) => s.toLowerCase() === selectedTech.toLowerCase()
          );
          if (!hasSkill) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "newest") {
          const dateA = new Date(a.publishedAt || a.updatedAt || 0).getTime();
          const dateB = new Date(b.publishedAt || b.updatedAt || 0).getTime();
          return dateB - dateA;
        }

        if (sortBy === "salary") {
          const salaryA = a.maxSalaryINR || a.minSalaryINR || 0;
          const salaryB = b.maxSalaryINR || b.minSalaryINR || 0;
          return salaryB - salaryA;
        }

        // Default: Most Relevant
        const scoreA = matchScoreMap.get(a.id) ?? matchScoreMap.get(a.slug) ?? a.matchScore ?? 0;
        const scoreB = matchScoreMap.get(b.id) ?? matchScoreMap.get(b.slug) ?? b.matchScore ?? 0;
        return scoreB - scoreA;
      });
  }, [
    publishedJobs,
    search,
    selectedJobType,
    selectedWorkplace,
    selectedTech,
    sortBy,
    matchScoreMap,
  ]);

  const hasActiveFilters =
    search.trim() !== "" ||
    selectedJobType !== "all" ||
    selectedWorkplace !== "all" ||
    selectedTech !== "all" ||
    sortBy !== "relevant";

  const handleResetFilters = () => {
    setSearch("");
    setSelectedJobType("all");
    setSelectedWorkplace("all");
    setSelectedTech("all");
    setSortBy("relevant");
    setOpenDropdown(null);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Page Title Block & Result Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Explore Positions
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
              Explore Jobs ({filteredJobs.length})
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Browse verified open positions posted directly by employers and partner tech companies.
          </p>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset filters</span>
          </button>
        )}
      </div>

      {/* Filter & Control Toolbar */}
      <div
        ref={dropdownContainerRef}
        className="bg-white p-3 sm:p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col lg:flex-row lg:items-center gap-3 justify-between"
      >
        {/* Search Input (Left) */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search jobs, skills, locations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full pl-10 pr-20 bg-slate-50/70 border border-slate-200/80 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium text-slate-400 bg-white border border-slate-200 shadow-2xs pointer-events-none">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Filter Dropdowns (Center) & Sort Dropdown (Right) */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Job Type Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === "jobType" ? null : "jobType")}
              className={cn(
                "h-10 px-3 rounded-xl border text-xs font-medium inline-flex items-center gap-2 transition-colors",
                selectedJobType !== "all"
                  ? "bg-blue-50 text-blue-700 border-blue-200/80 font-semibold"
                  : "bg-slate-50/70 text-slate-700 border-slate-200/80 hover:bg-slate-100/70 hover:text-slate-900"
              )}
            >
              <span>{selectedJobType === "all" ? "Job Type" : selectedJobType}</span>
              <ChevronDown
                className={cn(
                  "w-3.5 h-3.5 text-slate-400 transition-transform",
                  openDropdown === "jobType" && "rotate-180"
                )}
              />
            </button>

            {openDropdown === "jobType" && (
              <div className="absolute left-0 lg:left-auto lg:right-0 mt-1.5 w-48 rounded-xl bg-white border border-slate-200 shadow-lg py-1.5 z-30">
                <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Select Job Type
                </div>
                {[
                  { value: "all", label: "All Job Types" },
                  { value: "Full-time", label: "Full-time" },
                  { value: "Contract", label: "Contract" },
                  { value: "Part-time", label: "Part-time" },
                  { value: "Internship", label: "Internship" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setSelectedJobType(opt.value);
                      setOpenDropdown(null);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition-colors",
                      selectedJobType.toLowerCase() === opt.value.toLowerCase()
                        ? "text-blue-600 bg-blue-50 font-semibold"
                        : "text-slate-700 hover:bg-slate-50"
                    )}
                  >
                    <span>{opt.label}</span>
                    {selectedJobType.toLowerCase() === opt.value.toLowerCase() && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Workplace Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === "workplace" ? null : "workplace")}
              className={cn(
                "h-10 px-3 rounded-xl border text-xs font-medium inline-flex items-center gap-2 transition-colors",
                selectedWorkplace !== "all"
                  ? "bg-blue-50 text-blue-700 border-blue-200/80 font-semibold"
                  : "bg-slate-50/70 text-slate-700 border-slate-200/80 hover:bg-slate-100/70 hover:text-slate-900"
              )}
            >
              <span>{selectedWorkplace === "all" ? "Workplace" : selectedWorkplace}</span>
              <ChevronDown
                className={cn(
                  "w-3.5 h-3.5 text-slate-400 transition-transform",
                  openDropdown === "workplace" && "rotate-180"
                )}
              />
            </button>

            {openDropdown === "workplace" && (
              <div className="absolute left-0 lg:left-auto lg:right-0 mt-1.5 w-48 rounded-xl bg-white border border-slate-200 shadow-lg py-1.5 z-30">
                <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Select Workplace
                </div>
                {[
                  { value: "all", label: "All Workplaces" },
                  { value: "Remote", label: "Remote" },
                  { value: "Hybrid", label: "Hybrid" },
                  { value: "On-site", label: "On-site" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setSelectedWorkplace(opt.value);
                      setOpenDropdown(null);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition-colors",
                      selectedWorkplace.toLowerCase() === opt.value.toLowerCase()
                        ? "text-blue-600 bg-blue-50 font-semibold"
                        : "text-slate-700 hover:bg-slate-50"
                    )}
                  >
                    <span>{opt.label}</span>
                    {selectedWorkplace.toLowerCase() === opt.value.toLowerCase() && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tech Stack Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === "tech" ? null : "tech")}
              className={cn(
                "h-10 px-3 rounded-xl border text-xs font-medium inline-flex items-center gap-2 transition-colors",
                selectedTech !== "all"
                  ? "bg-blue-50 text-blue-700 border-blue-200/80 font-semibold"
                  : "bg-slate-50/70 text-slate-700 border-slate-200/80 hover:bg-slate-100/70 hover:text-slate-900"
              )}
            >
              <span>{selectedTech === "all" ? "Tech Stack" : selectedTech}</span>
              <ChevronDown
                className={cn(
                  "w-3.5 h-3.5 text-slate-400 transition-transform",
                  openDropdown === "tech" && "rotate-180"
                )}
              />
            </button>

            {openDropdown === "tech" && (
              <div className="absolute right-0 mt-1.5 w-52 max-h-64 overflow-y-auto rounded-xl bg-white border border-slate-200 shadow-lg py-1.5 z-30">
                <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Select Tech Stack
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTech("all");
                    setOpenDropdown(null);
                  }}
                  className={cn(
                    "w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition-colors",
                    selectedTech === "all"
                      ? "text-blue-600 bg-blue-50 font-semibold"
                      : "text-slate-700 hover:bg-slate-50"
                  )}
                >
                  <span>All Tech Stacks</span>
                  {selectedTech === "all" && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                </button>
                {availableTechStacks.map((tech) => (
                  <button
                    key={tech}
                    type="button"
                    onClick={() => {
                      setSelectedTech(tech);
                      setOpenDropdown(null);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition-colors",
                      selectedTech.toLowerCase() === tech.toLowerCase()
                        ? "text-blue-600 bg-blue-50 font-semibold"
                        : "text-slate-700 hover:bg-slate-50"
                    )}
                  >
                    <span>{tech}</span>
                    {selectedTech.toLowerCase() === tech.toLowerCase() && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-slate-200 hidden sm:block mx-0.5" />

          {/* Sort Dropdown (Right) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === "sort" ? null : "sort")}
              className="h-10 px-3 rounded-xl border border-slate-200/80 bg-slate-50/70 text-slate-700 hover:bg-slate-100/70 hover:text-slate-900 text-xs font-medium inline-flex items-center gap-2 transition-colors"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {sortBy === "relevant"
                  ? "Sort by: Most Relevant"
                  : sortBy === "newest"
                  ? "Sort by: Newest"
                  : "Sort by: Salary"}
              </span>
              <ChevronDown
                className={cn(
                  "w-3.5 h-3.5 text-slate-400 transition-transform",
                  openDropdown === "sort" && "rotate-180"
                )}
              />
            </button>

            {openDropdown === "sort" && (
              <div className="absolute right-0 mt-1.5 w-52 rounded-xl bg-white border border-slate-200 shadow-lg py-1.5 z-30">
                <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Order Positions
                </div>
                {[
                  { value: "relevant", label: "Sort by: Most Relevant" },
                  { value: "newest", label: "Sort by: Newest" },
                  { value: "salary", label: "Sort by: Highest Compensation" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setSortBy(opt.value as "relevant" | "newest" | "salary");
                      setOpenDropdown(null);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition-colors",
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
      </div>

      {/* Main Grid or Empty States */}
      {publishedJobs.length === 0 ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-400">
            <Briefcase className="w-6 h-6" />
          </div>
          <div className="max-w-md">
            <h3 className="text-base font-semibold text-slate-900">
              No open positions posted yet
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              When employers publish open roles on the TAG marketplace, they will appear here in real-time.
            </p>
          </div>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-400">
            <Search className="w-6 h-6" />
          </div>
          <div className="max-w-md">
            <h3 className="text-base font-semibold text-slate-900">
              No jobs matched your criteria
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Try adjusting your keywords, workplace mode, or clearing active filters to see all available openings.
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetFilters}
            className="h-9 px-4 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium transition-colors shadow-xs"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        /* Job Card Architecture */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredJobs.map((job) => {
            const isSaved = savedJobIds.includes(job.id);
            const application = applications.find(
              (a) => a.jobId === job.id || (job.slug && a.jobId === job.slug)
            );
            const isApplied = Boolean(application);

            return (
              <div
                key={job.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 transition-all hover:border-slate-300 hover:shadow-sm"
              >
                <div>
                  {/* Top Row (Company & Bookmark) */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Company logo avatar */}
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

                      {/* Company name with verified shield icon, work-type pill badge */}
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

                    {/* Bookmark action */}
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
                      title={isSaved ? "Saved to your list" : "Save job"}
                      aria-label={isSaved ? "Saved to your list" : "Save job"}
                    >
                      <Bookmark className={cn("w-4 h-4", isSaved && "fill-current text-blue-600")} />
                    </button>
                  </div>

                  {/* Middle Section (Title & Meta) */}
                  <div className="mt-3.5">
                    <Link href={`/jobs/${job.slug}`}>
                      <h3 className="text-lg font-bold text-slate-900 tracking-tight hover:text-blue-600 transition-colors">
                        {job.title}
                      </h3>
                    </Link>

                    <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed mt-2">
                      {job.summary || "No description provided."}
                    </p>

                    {/* Key Meta Row: Compensation range, Location, and Workplace badge */}
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

                    {/* Tech Stack Badges */}
                    {job.mustHaveSkills && job.mustHaveSkills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-4">
                        {job.mustHaveSkills.slice(0, 4).map((tech) => (
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

                {/* Footer Row (Status & Primary CTA) */}
                <div className="border-t border-slate-100 pt-4 mt-6 flex items-center justify-between gap-3">
                  {/* Left metadata: Relative posting time & Applied badge */}
                  <div className="flex items-center gap-2.5 flex-wrap min-w-0">
                    <span className="text-xs text-slate-500">
                      Posted {formatRelativeTime(job.publishedAt)}
                    </span>
                    {isApplied && (
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-xs px-2.5 py-1 rounded-md font-medium inline-flex items-center gap-1.5 shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Applied</span>
                      </span>
                    )}
                  </div>

                  {/* Right action button */}
                  {isApplied ? (
                    <Link
                      href={application?.id ? `/candidate/applications/${application.id}` : `/jobs/${job.slug}`}
                    >
                      <button
                        type="button"
                        className="border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 h-9 px-4 rounded-lg text-sm font-medium inline-flex items-center justify-center transition-colors shadow-2xs shrink-0 cursor-pointer"
                      >
                        View Application
                      </button>
                    </Link>
                  ) : (
                    <Link href={`/jobs/${job.slug}`}>
                      <button
                        type="button"
                        className="bg-blue-600 text-white hover:bg-blue-700 h-9 px-4 rounded-lg text-sm font-medium shadow-xs inline-flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                      >
                        View Match Details
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default JobsView;
