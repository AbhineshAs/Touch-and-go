"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { StatusBadge, SkillBadge } from "@/components/ui/Badge";
import { LoadingState, EmptyState } from "@/components/ui/States";
import { Job, JobStatus } from "@/types";
import { getEmployerJobs, updateJobStatus, deleteJob } from "@/lib/api/jobs";
import { formatDate, formatSalaryRange } from "@/lib/utils";
import {
  Plus,
  Eye,
  ArrowRight,
  Pencil,
  Trash2,
  Calendar,
  Briefcase,
  Clock,
  AlertTriangle,
  PlayCircle,
  PauseCircle,
  XCircle,
} from "lucide-react";

export default function EmployerJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const j = await getEmployerJobs("org_razorwave");
      setJobs(j);
      setIsLoading(false);
    }
    load();
  }, []);

  const handleStatusChange = async (jobId: string, newStatus: JobStatus) => {
    await updateJobStatus(jobId, newStatus);
    setJobs(
      jobs.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j))
    );
  };

  const handleDeleteConfirm = async () => {
    if (!jobToDelete) return;
    setIsDeleting(true);
    await deleteJob(jobToDelete.id);
    setJobs(jobs.filter((j) => j.id !== jobToDelete.id));
    setIsDeleting(false);
    setJobToDelete(null);
  };

  const filteredJobs = jobs.filter((j) => {
    const matchesSearch =
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.department.toLowerCase().includes(search.toLowerCase()) ||
      (j.location && j.location.toLowerCase().includes(search.toLowerCase())) ||
      (j.mustHaveSkills && j.mustHaveSkills.some((s) => s.toLowerCase().includes(search.toLowerCase())));
    const matchesStatus = statusFilter === "All" || j.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Job Listings ({jobs.length})
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary">
            Manage your open technology positions, edit requisitions, and track applicants.
          </p>
        </div>

        <Link href="/employer/jobs/new">
          <Button variant="primary" size="md" leftIcon={<Plus className="w-4 h-4" />}>
            Create Job
          </Button>
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="w-full sm:flex-1">
          <SearchInput
            placeholder="Search by job title, department, skills, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch("")}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto max-w-full overflow-x-auto scrollbar-none">
          {["All", "Published", "Draft", "Paused", "Closed"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                statusFilter === st
                  ? "bg-primary text-white shadow-xs"
                  : "bg-surface border border-border text-text-secondary hover:bg-background"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <LoadingState message="Loading your organization's job listings..." />
      ) : filteredJobs.length === 0 ? (
        <EmptyState
          title="No jobs found"
          description="Create your first job listing to begin receiving verified candidate applications."
          action={{
            label: "Create Job Listing",
            onClick: () => (window.location.href = "/employer/jobs/new"),
          }}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="p-6 bg-surface border-border flex flex-col gap-4 shadow-2xs hover:border-border-subtle transition-all">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusBadge status={job.status} />
                    <span className="text-xs text-text-muted">
                      Published {formatDate(job.publishedAt)}
                    </span>
                    {job.deadline && (
                      <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md font-medium border border-amber-200/60 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Deadline: {new Date(job.deadline).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                      </span>
                    )}
                  </div>

                  <Link href={`/employer/jobs/${job.id}`}>
                    <h2 className="text-lg font-bold text-text-primary hover:text-primary transition-colors mt-2">
                      {job.title}
                    </h2>
                  </Link>

                  <p className="text-xs text-text-secondary mt-1">
                    {job.department} • {job.location} ({job.workMode}) • {job.employmentType} • {job.experienceLevel} • {formatSalaryRange(job.minSalaryINR, job.maxSalaryINR)}
                  </p>

                  {job.summary && (
                    <p className="text-xs text-text-muted mt-2 line-clamp-2 leading-relaxed">
                      {job.summary}
                    </p>
                  )}

                  {/* Skills tags */}
                  {job.mustHaveSkills && job.mustHaveSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {job.mustHaveSkills.slice(0, 5).map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded bg-background border border-border text-[11px] font-medium text-text-secondary">
                          {s}
                        </span>
                      ))}
                      {job.mustHaveSkills.length > 5 && (
                        <span className="text-[11px] text-text-muted self-center">
                          +{job.mustHaveSkills.length - 5} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Primary Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <Link href={`/employer/jobs/${job.id}`}>
                    <Button size="sm" variant="outline" leftIcon={<Eye className="w-3.5 h-3.5" />}>
                      View
                    </Button>
                  </Link>

                  <Link href={`/employer/jobs/${job.id}/edit`}>
                    <Button size="sm" variant="secondary" leftIcon={<Pencil className="w-3.5 h-3.5" />}>
                      Edit
                    </Button>
                  </Link>

                  <Link href={`/employer/jobs/${job.id}/pipeline`}>
                    <Button size="sm" variant="primary" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                      Pipeline ({job.applicantsCount})
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Metrics Pill Grid */}
              <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-background border border-border-subtle text-xs text-center">
                <div>
                  <span className="text-text-muted text-[11px] block">Total Applicants</span>
                  <strong className="text-text-primary text-base font-bold">{job.applicantsCount}</strong>
                </div>
                <div>
                  <span className="text-text-muted text-[11px] block">Shortlisted</span>
                  <strong className="text-text-primary text-base font-bold">{job.shortlistedCount}</strong>
                </div>
                <div>
                  <span className="text-text-muted text-[11px] block">Interviews</span>
                  <strong className="text-text-primary text-base font-bold">{job.interviewsCount}</strong>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center justify-between pt-2 border-t border-border-subtle text-xs flex-wrap gap-2">
                <Link
                  href={`/jobs/${job.slug}`}
                  target="_blank"
                  className="text-text-muted hover:text-primary flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Candidate Public View</span>
                </Link>

                <div className="flex items-center gap-2">
                  {job.status === "Published" ? (
                    <button
                      onClick={() => handleStatusChange(job.id, "Paused")}
                      className="px-2.5 py-1 text-xs text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-md transition-colors cursor-pointer border border-amber-200 flex items-center gap-1"
                    >
                      <PauseCircle className="w-3 h-3" />
                      Pause
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStatusChange(job.id, "Published")}
                      className="px-2.5 py-1 text-xs text-green-700 bg-green-50 hover:bg-green-100 rounded-md transition-colors cursor-pointer border border-green-200 flex items-center gap-1"
                    >
                      <PlayCircle className="w-3 h-3" />
                      Publish
                    </button>
                  )}

                  <button
                    onClick={() => setJobToDelete(job)}
                    className="px-2.5 py-1 text-xs text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-md transition-colors cursor-pointer border border-rose-200 flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {jobToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Delete Job Listing</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete <strong className="text-slate-900">"{jobToDelete.title}"</strong>?
              This will remove the listing and all applicant submissions from your portal.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setJobToDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDeleteConfirm}
                isLoading={isDeleting}
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

