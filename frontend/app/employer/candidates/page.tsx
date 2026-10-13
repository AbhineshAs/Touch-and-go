"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MatchBadge, StatusBadge } from "@/components/ui/Badge";
import { LoadingState } from "@/components/ui/States";
import { ResumePreviewModal } from "@/components/employer/ResumePreviewModal";
import {
  getAllApplications,
  updateApplicationStage,
} from "@/lib/api/applications";
import { getEmployerJobs } from "@/lib/api/jobs";
import { resolveCandidateProfileByEmailOrId } from "@/lib/api/candidate";
import { Application, ApplicationStage, Job, CandidateProfile } from "@/types";
import { formatDate } from "@/lib/utils";
import {
  Users,
  Search,
  Filter,
  FileText,
  SlidersHorizontal,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Eye,
  ChevronRight,
  LayoutGrid,
  List,
} from "lucide-react";

const PIPELINE_STAGES: ApplicationStage[] = [
  "Applied",
  "Screening",
  "Shortlisted",
  "Interview",
  "Decision",
  "Closed",
];

export default function ApplicantManagementPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJobId, setSelectedJobId] = useState("all");
  const [selectedStage, setSelectedStage] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"alignment" | "date" | "name">("alignment");

  // Resume Modal State
  const [activeResumeApp, setActiveResumeApp] = useState<Application | null>(null);
  const [activeResumeProfile, setActiveResumeProfile] = useState<CandidateProfile | null>(null);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);

  // Action status notification message
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const [allApps, employerJobs] = await Promise.all([
        getAllApplications(),
        getEmployerJobs(),
      ]);
      setApplications(allApps);
      setJobs(employerJobs);
      setIsLoading(false);
    }
    loadData();

    const handleUpdate = () => {
      getAllApplications().then(setApplications);
    };
    window.addEventListener("tag_applications_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("tag_applications_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const handleStageChange = async (appId: string, newStage: ApplicationStage) => {
    try {
      const updated = await updateApplicationStage(appId, newStage);
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, stage: updated.stage, timeline: updated.timeline } : a))
      );
      showFeedback(`Updated applicant stage to "${newStage}"`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenResume = (app: Application) => {
    const profile = resolveCandidateProfileByEmailOrId(app.candidateEmail, app.candidateId);
    setActiveResumeApp(app);
    setActiveResumeProfile(profile);
    setIsResumeModalOpen(true);
  };

  const showFeedback = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 3500);
  };

  // Filter & Search Logic
  const filteredApplicants = applications.filter((app) => {
    const matchesJob = selectedJobId === "all" || app.jobId === selectedJobId;
    const matchesStage = selectedStage === "all" || app.stage === selectedStage;
    const query = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !query ||
      app.candidateName.toLowerCase().includes(query) ||
      app.candidateHeadline.toLowerCase().includes(query) ||
      app.candidateEmail.toLowerCase().includes(query) ||
      app.jobTitle.toLowerCase().includes(query);

    return matchesJob && matchesStage && matchesQuery;
  });

  // Sorting
  const sortedApplicants = [...filteredApplicants].sort((a, b) => {
    if (sortBy === "alignment") {
      return (b.overallAlignment || 0) - (a.overallAlignment || 0);
    }
    if (sortBy === "date") {
      return new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime();
    }
    return a.candidateName.localeCompare(b.candidateName);
  });

  // Stage Metrics
  const totalCount = applications.length;
  const inReviewCount = applications.filter((a) => a.stage === "Applied" || a.stage === "Screening").length;
  const shortlistedCount = applications.filter((a) => a.stage === "Shortlisted").length;
  const interviewCount = applications.filter((a) => a.stage === "Interview").length;
  const decisionCount = applications.filter((a) => a.stage === "Decision").length;
  const closedCount = applications.filter((a) => a.stage === "Closed").length;

  if (isLoading) {
    return <LoadingState message="Loading applicant records and candidate evaluations..." />;
  }

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 pb-16">
      {/* Action Notification Toast */}
      {actionFeedback && (
        <div className="fixed top-5 right-5 z-50 bg-[#0A66C2] text-white px-4 py-2.5 rounded-xl shadow-lg text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Applicant Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-[#0A66C2] text-xs font-black">
              {totalCount} Total
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Review candidate profiles, inspect verified ATS resumes, shortlist top matches, and manage hiring stages.
          </p>
        </div>

        {/* Post Requisition Action */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link href="/employer/jobs/new">
            <Button size="sm" variant="primary" className="text-xs">
              + Post Requisition
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div
          onClick={() => setSelectedStage("all")}
          className={`p-3.5 rounded-2xl bg-white border cursor-pointer transition-all ${
            selectedStage === "all"
              ? "border-[#0A66C2] ring-2 ring-[#0A66C2]/20 shadow-xs"
              : "border-slate-200 hover:border-slate-300"
          }`}
        >
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">All Applicants</span>
          <div className="text-xl font-black text-slate-900 mt-1">{totalCount}</div>
        </div>

        <div
          onClick={() => setSelectedStage("Applied")}
          className={`p-3.5 rounded-2xl bg-white border cursor-pointer transition-all ${
            selectedStage === "Applied"
              ? "border-blue-500 ring-2 ring-blue-500/20 shadow-xs"
              : "border-slate-200 hover:border-slate-300"
          }`}
        >
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">In Review</span>
          <div className="text-xl font-black text-slate-900 mt-1">{inReviewCount}</div>
        </div>

        <div
          onClick={() => setSelectedStage("Shortlisted")}
          className={`p-3.5 rounded-2xl bg-white border cursor-pointer transition-all ${
            selectedStage === "Shortlisted"
              ? "border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs"
              : "border-slate-200 hover:border-slate-300"
          }`}
        >
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Shortlisted</span>
          <div className="text-xl font-black text-emerald-700 mt-1">{shortlistedCount}</div>
        </div>

        <div
          onClick={() => setSelectedStage("Interview")}
          className={`p-3.5 rounded-2xl bg-white border cursor-pointer transition-all ${
            selectedStage === "Interview"
              ? "border-purple-500 ring-2 ring-purple-500/20 shadow-xs"
              : "border-slate-200 hover:border-slate-300"
          }`}
        >
          <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">Interviewing</span>
          <div className="text-xl font-black text-purple-700 mt-1">{interviewCount}</div>
        </div>

        <div
          onClick={() => setSelectedStage("Decision")}
          className={`p-3.5 rounded-2xl bg-white border cursor-pointer transition-all ${
            selectedStage === "Decision"
              ? "border-amber-500 ring-2 ring-amber-500/20 shadow-xs"
              : "border-slate-200 hover:border-slate-300"
          }`}
        >
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Offer / Decision</span>
          <div className="text-xl font-black text-amber-700 mt-1">{decisionCount}</div>
        </div>

        <div
          onClick={() => setSelectedStage("Closed")}
          className={`p-3.5 rounded-2xl bg-white border cursor-pointer transition-all ${
            selectedStage === "Closed"
              ? "border-slate-500 ring-2 ring-slate-500/20 shadow-xs"
              : "border-slate-200 hover:border-slate-300"
          }`}
        >
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Closed</span>
          <div className="text-xl font-black text-slate-700 mt-1">{closedCount}</div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search candidate name, headline, email, or job..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0A66C2]/30 text-xs"
          />
        </div>

        {/* Filter by Job Requisition */}
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold text-xs focus:outline-none cursor-pointer"
          >
            <option value="all">All Requisitions ({jobs.length})</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
        </div>

        {/* Filter by Stage */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold text-xs focus:outline-none cursor-pointer"
          >
            <option value="all">All Stages</option>
            {PIPELINE_STAGES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold text-xs focus:outline-none cursor-pointer"
          >
            <option value="alignment">Match Score (High → Low)</option>
            <option value="date">Most Recent Applied</option>
            <option value="name">Candidate Name (A → Z)</option>
          </select>
        </div>
      </div>

      {/* APPLICANT LIST: TABLE VIEW */}
      <Card className="bg-white border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="p-4">Candidate</th>
                  <th className="p-4">Applied Requisition</th>
                  <th className="p-4">Criteria Alignment</th>
                  <th className="p-4">Application Status</th>
                  <th className="p-4">Applied Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedApplicants.map((app) => {
                  const isShortlisted = app.stage === "Shortlisted";
                  return (
                    <tr
                      key={app.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* Candidate Column */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {app.candidateAvatar ? (
                            <img
                              src={app.candidateAvatar}
                              alt={app.candidateName}
                              className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                              onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = "none";
                                const fallback = e.currentTarget.parentElement?.querySelector(".avatar-fallback") as HTMLElement;
                                if (fallback) fallback.classList.remove("hidden");
                              }}
                            />
                          ) : null}
                          <div
                            className={`w-9 h-9 rounded-full bg-[#0A66C2] text-white font-bold flex items-center justify-center text-xs shrink-0 avatar-fallback ${
                              app.candidateAvatar ? "hidden" : ""
                            }`}
                          >
                            {(app.candidateName || "C").charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <Link
                              href={`/employer/candidates/${app.id}`}
                              className="font-bold text-slate-900 group-hover:text-[#0A66C2] transition-colors truncate"
                            >
                              {app.candidateName}
                            </Link>
                            <span className="text-[11px] text-slate-500 truncate max-w-xs">
                              {app.candidateHeadline}
                            </span>
                            <span className="text-[10px] text-slate-400 truncate">
                              {app.candidateEmail}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Job Requisition */}
                      <td className="p-4">
                        <Link
                          href={`/employer/jobs/${app.jobId}/pipeline`}
                          className="font-semibold text-slate-800 hover:text-[#0A66C2] transition-colors flex items-center gap-1.5"
                        >
                          <span className="truncate max-w-[200px]">{app.jobTitle}</span>
                          <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                        </Link>
                        <span className="text-[10px] text-slate-400">{app.location}</span>
                      </td>

                      {/* Criteria Alignment */}
                      <td className="p-4">
                        <MatchBadge score={app.overallAlignment || 75} size="sm" />
                      </td>

                      {/* Interactive Application Status Dropdown */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <select
                            value={app.stage}
                            onChange={(e) =>
                              handleStageChange(app.id, e.target.value as ApplicationStage)
                            }
                            className={`text-xs font-bold rounded-lg px-2.5 py-1 border transition-colors cursor-pointer focus:outline-none ${
                              app.stage === "Shortlisted"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : app.stage === "Interview"
                                ? "bg-purple-50 text-purple-700 border-purple-200"
                                : app.stage === "Closed"
                                ? "bg-slate-100 text-slate-600 border-slate-200"
                                : "bg-blue-50 text-[#0A66C2] border-blue-200"
                            }`}
                          >
                            {PIPELINE_STAGES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>

                      {/* Applied Date */}
                      <td className="p-4 text-slate-500 text-xs">
                        {formatDate(app.appliedAt)}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Resume Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenResume(app)}
                            title="View Resume"
                            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition-colors flex items-center gap-1 cursor-pointer text-xs font-semibold"
                          >
                            <FileText className="w-3.5 h-3.5 text-[#0A66C2]" />
                            <span className="hidden md:inline">Resume</span>
                          </button>

                          {/* View Application & Profile Link */}
                          <Link href={`/employer/candidates/${app.id}`}>
                            <button className="px-2.5 py-1.5 rounded-lg bg-[#0A66C2] hover:bg-[#004182] text-white text-xs font-bold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer">
                              <span>Profile</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {sortedApplicants.length === 0 && (
            <div className="py-16 text-center flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center font-bold">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">No applicants found</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                No candidate records match your selected filter criteria. Try resetting the search or stage filters.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedJobId("all");
                  setSelectedStage("all");
                }}
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </Card>

      {/* RESUME PREVIEW MODAL */}
      <ResumePreviewModal
        isOpen={isResumeModalOpen}
        onClose={() => setIsResumeModalOpen(false)}
        candidateProfile={activeResumeProfile}
        application={activeResumeApp}
      />
    </div>
  );
}
