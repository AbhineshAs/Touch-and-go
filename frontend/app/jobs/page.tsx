"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Input, SearchInput } from "@/components/ui/Input";
import { MatchBadge, SkillBadge } from "@/components/ui/Badge";
import { Drawer } from "@/components/ui/Modal";
import { LoadingState, EmptyState } from "@/components/ui/States";
import { Pagination } from "@/components/ui/Tabs";
import {
  Search,
  MapPin,
  Filter,
  Bookmark,
  Building2,
  ShieldCheck,
  ChevronDown,
  ArrowRight,
  Zap,
} from "lucide-react";
import { Job, WorkMode, EmploymentType, ExperienceLevel } from "@/types";
import { getJobs, JobFilterParams } from "@/lib/api/jobs";
import { getSavedJobIds, toggleSaveJob } from "@/lib/api/candidate";
import { formatSalaryRange, formatRelativeTime } from "@/lib/utils";
import { useAuth } from "@/lib/auth/AuthContext";
import { AuthGateModal } from "@/components/auth/AuthGateModal";

function JobsSearchContent() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") || "";
  const initialLoc = searchParams.get("location") || "";

  const [keyword, setKeyword] = useState(initialQ);
  const [location, setLocation] = useState(initialLoc);
  const [selectedWorkModes, setSelectedWorkModes] = useState<WorkMode[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<EmploymentType[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<ExperienceLevel[]>([]);
  const [sortBy, setSortBy] = useState<"relevant" | "newest" | "match">("relevant");

  const [jobs, setJobs] = useState<Job[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Auth gate state
  const { isAuthenticated } = useAuth();
  const [authGateOpen, setAuthGateOpen] = useState(false);
  const [targetJobToSave, setTargetJobToSave] = useState<{ id: string; title: string; org: string } | null>(null);

  const fetchJobs = async () => {
    setIsLoading(true);
    const filterPayload: JobFilterParams = {
      keyword: keyword || undefined,
      location: location || undefined,
      workModes: selectedWorkModes.length > 0 ? selectedWorkModes : undefined,
      employmentTypes: selectedTypes.length > 0 ? selectedTypes : undefined,
      experienceLevels: selectedLevels.length > 0 ? selectedLevels : undefined,
      sortBy,
    };
    const data = await getJobs(filterPayload);
    setJobs(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchJobs();
  }, [keyword, location, selectedWorkModes, selectedTypes, selectedLevels, sortBy]);

  useEffect(() => {
    getSavedJobIds().then(setSavedJobIds);
  }, []);

  const handleToggleSave = async (jobId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      const found = jobs.find((j) => j.id === jobId);
      setTargetJobToSave({
        id: jobId,
        title: found?.title || "this job",
        org: found?.organizationName || "",
      });
      setAuthGateOpen(true);
      return;
    }
    const isCurrentlySaved = savedJobIds.includes(jobId);
    setSavedJobIds((prev) =>
      isCurrentlySaved ? prev.filter((id) => id !== jobId) : [...prev, jobId]
    );
    const res = await toggleSaveJob(jobId);
    setSavedJobIds(res.savedIds);
  };

  const workModeOptions: WorkMode[] = ["Remote", "Hybrid", "On-site"];
  const employmentTypeOptions: EmploymentType[] = ["Full-time", "Contract", "Part-time", "Internship"];
  const experienceOptions: ExperienceLevel[] = [
    "Entry (0-2 yrs)",
    "Mid (3-5 yrs)",
    "Senior (6-8 yrs)",
    "Lead (8+ yrs)",
  ];

  const clearAllFilters = () => {
    setKeyword("");
    setLocation("");
    setSelectedWorkModes([]);
    setSelectedTypes([]);
    setSelectedLevels([]);
  };

  const activeFilterCount =
    (keyword ? 1 : 0) +
    (location ? 1 : 0) +
    selectedWorkModes.length +
    selectedTypes.length +
    selectedLevels.length;

  const FilterControls = () => (
    <div className="flex flex-col gap-6 text-xs font-sans text-slate-700">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <span className="font-extrabold text-sm text-slate-900">Filters</span>
        {activeFilterCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-[#2563EB] hover:underline font-bold cursor-pointer text-xs"
          >
            Clear all ({activeFilterCount})
          </button>
        )}
      </div>

      {/* Work Mode */}
      <div className="flex flex-col gap-2.5">
        <label className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px]">Work Mode</label>
        {workModeOptions.map((mode) => (
          <label key={mode} className="flex items-center gap-2.5 text-slate-700 hover:text-slate-900 cursor-pointer font-medium">
            <input
              type="checkbox"
              checked={selectedWorkModes.includes(mode)}
              onChange={(e) => {
                setSelectedWorkModes(
                  e.target.checked
                    ? [...selectedWorkModes, mode]
                    : selectedWorkModes.filter((m) => m !== mode)
                );
              }}
              className="rounded border-slate-300 text-[#2563EB] focus:ring-blue-500/20 accent-[#2563EB] w-4 h-4"
            />
            <span>{mode}</span>
          </label>
        ))}
      </div>

      {/* Employment Type */}
      <div className="flex flex-col gap-2.5 pt-4 border-t border-slate-200">
        <label className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px]">Employment Type</label>
        {employmentTypeOptions.map((type) => (
          <label key={type} className="flex items-center gap-2.5 text-slate-700 hover:text-slate-900 cursor-pointer font-medium">
            <input
              type="checkbox"
              checked={selectedTypes.includes(type)}
              onChange={(e) => {
                setSelectedTypes(
                  e.target.checked
                    ? [...selectedTypes, type]
                    : selectedTypes.filter((t) => t !== type)
                );
              }}
              className="rounded border-slate-300 text-[#2563EB] focus:ring-blue-500/20 accent-[#2563EB] w-4 h-4"
            />
            <span>{type}</span>
          </label>
        ))}
      </div>

      {/* Experience Level */}
      <div className="flex flex-col gap-2.5 pt-4 border-t border-slate-200">
        <label className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px]">Experience Level</label>
        {experienceOptions.map((lvl) => (
          <label key={lvl} className="flex items-center gap-2.5 text-slate-700 hover:text-slate-900 cursor-pointer font-medium">
            <input
              type="checkbox"
              checked={selectedLevels.includes(lvl)}
              onChange={(e) => {
                setSelectedLevels(
                  e.target.checked
                    ? [...selectedLevels, lvl]
                    : selectedLevels.filter((l) => l !== lvl)
                );
              }}
              className="rounded border-slate-300 text-[#2563EB] focus:ring-blue-500/20 accent-[#2563EB] w-4 h-4"
            />
            <span>{lvl}</span>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 font-sans">
      <PublicNavbar />

      {/* Top Search Banner */}
      <div className="bg-white/95 backdrop-blur-md border-b border-slate-200/90 py-6 px-4 sm:px-6 lg:px-8 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-3">
          <div className="w-full flex-1">
            <SearchInput
              placeholder="Search by job title or skills (e.g. React, Python, Node, AI)..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onClear={() => setKeyword("")}
            />
          </div>

          <div className="w-full md:w-72 flex items-center">
            <Input
              placeholder="City (e.g. Bengaluru, Gurgaon, Remote)"
              leftIcon={<MapPin className="w-4 h-4 text-[#2563EB]" />}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            {/* Mobile Filter Button */}
            <Button
              variant="secondary"
              size="md"
              leftIcon={<Filter className="w-4 h-4" />}
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex-1"
            >
              Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </Button>

            {/* Sort Selector */}
            <div className="relative flex-1 md:w-52">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full appearance-none rounded-xl bg-slate-50 border border-slate-300 px-3.5 py-2.5 pr-8 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#2563EB] cursor-pointer"
              >
                <option value="relevant">Sort: Most Relevant</option>
                <option value="match">Sort: Highest Match</option>
                <option value="newest">Sort: Newest First</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Left Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
              <FilterControls />
            </div>
          </aside>

          {/* Job Results List */}
          <main className="lg:col-span-3 flex flex-col gap-4">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium pb-2">
              <span>
                Showing <strong className="text-slate-900 font-bold">{jobs.length}</strong> verified opportunities in India
              </span>
              <span className="text-[#2563EB] font-bold">Criteria Match Active</span>
            </div>

            {isLoading ? (
              <LoadingState message="Discovering verified opportunities..." />
            ) : jobs.length === 0 ? (
              <EmptyState
                title="No jobs match your filter criteria"
                description="Try clearing your search terms or broadening your selected locations and work modes."
                action={{
                  label: "Clear All Filters",
                  onClick: clearAllFilters,
                }}
              />
            ) : (
              <div className="flex flex-col gap-4">
                {jobs.map((job) => {
                  const isSaved = savedJobIds.includes(job.id);
                  return (
                    <div
                      key={job.id}
                      className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs hover:shadow-md hover:border-blue-400 transition-all flex flex-col justify-between"
                    >
                      <div className="flex flex-col gap-4">
                        {/* Header line */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3.5">
                            <img
                              src={job.organizationLogo}
                              alt={job.organizationName}
                              className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0 shadow-2xs"
                            />
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-600">
                                  {job.organizationName}
                                </span>
                                {job.organizationVerified && (
                                  <span title="Verified Employer">
                                    <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
                                  </span>
                                )}
                              </div>
                              <Link href={`/jobs/${job.slug}`}>
                                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 hover:text-[#2563EB] transition-colors mt-0.5 leading-snug">
                                  {job.title}
                                </h2>
                              </Link>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {job.matchScore && (
                              <MatchBadge score={job.matchScore} size="md" />
                            )}
                            <button
                              onClick={(e) => handleToggleSave(job.id, e)}
                              className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-[#2563EB] hover:border-blue-300 transition-colors cursor-pointer"
                              aria-label={isSaved ? "Remove from saved" : "Save job"}
                              title={isSaved ? "Saved" : "Save Job"}
                            >
                              <Bookmark
                                className={`w-4 h-4 ${isSaved ? "fill-[#2563EB] text-[#2563EB]" : ""}`}
                              />
                            </button>
                          </div>
                        </div>

                        {/* Summary */}
                        <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed font-medium">
                          {job.summary}
                        </p>

                        {/* Key Attributes */}
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 font-semibold pt-1">
                          <span className="font-bold text-slate-900 font-mono">
                            {formatSalaryRange(job.minSalaryINR, job.maxSalaryINR, job.salaryPeriod)}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span>{job.location}</span>
                          <span className="text-slate-300">•</span>
                          <span className="px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-[11px] font-bold text-[#2563EB]">
                            {job.workMode}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span>{job.experienceLevel}</span>
                        </div>

                        {/* Skills */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {job.mustHaveSkills.map((skill) => (
                            <SkillBadge key={skill} name={skill} />
                          ))}
                        </div>

                        {/* Footer / Apply action */}
                        <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-100 text-xs">
                          <span className="text-slate-400 font-medium">
                            Posted {formatRelativeTime(job.publishedAt)}
                          </span>
                          <div className="flex items-center gap-2">
                            <Link href={`/jobs/${job.slug}`}>
                              <button className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer">
                                <Zap className="w-3.5 h-3.5" />
                                <span>1-Touch Apply</span>
                              </button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <Pagination
                  currentPage={currentPage}
                  totalPages={1}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Drawer Filter Sheet */}
      <Drawer
        isOpen={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        title="Filter Opportunities"
        side="bottom"
      >
        <div className="py-2">
          <FilterControls />
          <div className="mt-6 pt-4 border-t border-slate-200">
            <Button
              className="w-full"
              size="md"
              onClick={() => setMobileFilterOpen(false)}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </Drawer>

      {/* Auth Gate for Saving Jobs */}
      <AuthGateModal
        isOpen={authGateOpen}
        onClose={() => setAuthGateOpen(false)}
        title="Sign in to save this job"
        subtitle="Sign in with your verified profile to track this role, receive status notifications, and compare criteria alignment."
        jobTitle={targetJobToSave?.title}
        companyName={targetJobToSave?.org}
        onAuthenticated={() => {
          if (targetJobToSave) {
            setSavedJobIds((prev) => [...prev, targetJobToSave.id]);
            toggleSaveJob(targetJobToSave.id);
          }
        }}
      />

      <Footer />
    </div>
  );
}

export default function JobsSearchPage() {
  return (
    <React.Suspense fallback={<LoadingState message="Loading jobs marketplace..." className="min-h-screen bg-[#F8FAFC]" />}>
      <JobsSearchContent />
    </React.Suspense>
  );
}
