"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { LoadingState, EmptyState } from "@/components/ui/States";
import { Job, JobStatus } from "@/types";
import { getEmployerJobs, updateJobStatus } from "@/lib/api/jobs";
import { formatDate, formatSalaryRange } from "@/lib/utils";
import {
  Plus,
  Search,
  Filter,
  Users,
  Eye,
  PauseCircle,
  PlayCircle,
  XCircle,
  Copy,
  ChevronRight,
  ArrowRight,
} from "lucide-react";

export default function EmployerJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

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

  const filteredJobs = jobs.filter((j) => {
    const matchesSearch =
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.department.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || j.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Job Listings ({jobs.length})
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary">
            Manage your open technology positions, review applicant pipelines, and calibrate matching.
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
            placeholder="Search by job title or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch("")}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto max-w-full overflow-x-auto scrollbar-none">
          {["All", "Published", "Draft", "Paused"].map((st) => (
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
            <Card key={job.id} className="p-6 bg-surface border-border flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={job.status} />
                    <span className="text-xs text-text-muted">
                      Published {formatDate(job.publishedAt)}
                    </span>
                  </div>
                  <Link href={`/employer/jobs/${job.id}/pipeline`}>
                    <h2 className="text-lg font-bold text-text-primary hover:text-primary transition-colors mt-1.5">
                      {job.title}
                    </h2>
                  </Link>
                  <p className="text-xs text-text-secondary mt-1">
                    {job.department} • {job.location} ({job.workMode}) • {formatSalaryRange(job.minSalaryINR, job.maxSalaryINR)}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link href={`/employer/jobs/${job.id}/pipeline`}>
                    <Button size="sm" variant="primary" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                      Applicant Pipeline ({job.applicantsCount})
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
              <div className="flex items-center justify-between pt-2 border-t border-border-subtle text-xs">
                <Link
                  href={`/jobs/${job.slug}`}
                  target="_blank"
                  className="text-text-muted hover:text-primary flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Public View</span>
                </Link>

                <div className="flex items-center gap-2">
                  {job.status === "Published" ? (
                    <button
                      onClick={() => handleStatusChange(job.id, "Paused")}
                      className="px-2.5 py-1 text-xs text-text-secondary hover:text-text-primary hover:bg-background rounded-md transition-colors cursor-pointer"
                    >
                      Pause Listing
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStatusChange(job.id, "Published")}
                      className="px-2.5 py-1 text-xs text-primary hover:bg-primary-soft rounded-md transition-colors cursor-pointer"
                    >
                      Publish
                    </button>
                  )}
                  <button
                    onClick={() => handleStatusChange(job.id, "Closed")}
                    className="px-2.5 py-1 text-xs text-danger hover:bg-danger-soft rounded-md transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
