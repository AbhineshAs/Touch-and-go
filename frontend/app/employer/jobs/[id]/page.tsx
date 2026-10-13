"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Job, JobStatus } from "@/types";
import { getJobById, deleteJob, updateJobStatus } from "@/lib/api/jobs";
import { formatSalaryRange, formatDate } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge, SkillBadge } from "@/components/ui/Badge";
import { LoadingState, EmptyState } from "@/components/ui/States";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  DollarSign,
  Briefcase,
  MapPin,
  Pencil,
  Trash2,
  Users,
  Eye,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  PlayCircle,
  PauseCircle,
  XCircle,
} from "lucide-react";

export default function EmployerJobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = (params?.id as string) || "";

  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      if (jobId) {
        const found = await getJobById(jobId);
        setJob(found);
      }
      setIsLoading(false);
    }
    load();
  }, [jobId]);

  const handleStatusUpdate = async (newStatus: JobStatus) => {
    if (!job) return;
    const updated = await updateJobStatus(job.id, newStatus);
    setJob(updated);
    setStatusMessage(`Status updated to ${newStatus}`);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleDelete = async () => {
    if (!job) return;
    setIsDeleting(true);
    await deleteJob(job.id);
    setShowDeleteModal(false);
    router.push("/employer/jobs");
  };

  if (isLoading) {
    return <LoadingState message="Loading job details..." />;
  }

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <EmptyState
          title="Job listing not found"
          description="The requested job listing could not be found or may have been deleted."
          action={{
            label: "Return to Job Listings",
            onClick: () => router.push("/employer/jobs"),
          }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6 pb-20">
      {/* Toast Feedback */}
      {statusMessage && (
        <div className="fixed top-5 right-5 z-50 p-4 rounded-xl bg-slate-900 text-white shadow-2xl text-xs font-semibold flex items-center gap-2.5 animate-in slide-in-from-top-2 duration-200 border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-[#818CF8]" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex flex-col gap-1">
          <Link
            href="/employer/jobs"
            className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Job Listings</span>
          </Link>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
              {job.title}
            </h1>
            <StatusBadge status={job.status} />
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <Link href={`/jobs/${job.slug}`} target="_blank">
            <Button variant="outline" size="sm" leftIcon={<Eye className="w-3.5 h-3.5" />}>
              Public View
            </Button>
          </Link>

          <Link href={`/employer/jobs/${job.id}/pipeline`}>
            <Button variant="secondary" size="sm" leftIcon={<Users className="w-3.5 h-3.5" />}>
              Pipeline ({job.applicantsCount})
            </Button>
          </Link>

          <Link href={`/employer/jobs/${job.id}/edit`}>
            <Button variant="primary" size="sm" leftIcon={<Pencil className="w-3.5 h-3.5" />}>
              Edit Job
            </Button>
          </Link>

          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowDeleteModal(true)}
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* 9 Key Fields Summary Card */}
      <Card className="p-6 bg-surface border-border shadow-xs flex flex-col gap-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          {/* 1. Job Type */}
          <div className="p-3.5 rounded-xl bg-background border border-border-subtle flex flex-col gap-1">
            <span className="text-text-muted text-[11px] font-medium flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-primary" />
              Job Type
            </span>
            <strong className="text-text-primary text-sm font-semibold">{job.employmentType}</strong>
          </div>

          {/* 2. Experience */}
          <div className="p-3.5 rounded-xl bg-background border border-border-subtle flex flex-col gap-1">
            <span className="text-text-muted text-[11px] font-medium flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-primary" />
              Experience
            </span>
            <strong className="text-text-primary text-sm font-semibold">{job.experienceLevel}</strong>
          </div>

          {/* 3. Salary */}
          <div className="p-3.5 rounded-xl bg-background border border-border-subtle flex flex-col gap-1">
            <span className="text-text-muted text-[11px] font-medium flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-primary" />
              Salary
            </span>
            <strong className="text-text-primary text-sm font-semibold">
              {formatSalaryRange(job.minSalaryINR, job.maxSalaryINR)}
            </strong>
          </div>

          {/* 4. Location */}
          <div className="p-3.5 rounded-xl bg-background border border-border-subtle flex flex-col gap-1">
            <span className="text-text-muted text-[11px] font-medium flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              Location & Mode
            </span>
            <strong className="text-text-primary text-sm font-semibold truncate">
              {job.location} ({job.workMode})
            </strong>
          </div>

          {/* 5. Deadline */}
          <div className="p-3.5 rounded-xl bg-background border border-border-subtle flex flex-col gap-1">
            <span className="text-text-muted text-[11px] font-medium flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              Application Deadline
            </span>
            <strong className="text-text-primary text-sm font-semibold">
              {job.deadline
                ? new Date(job.deadline).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Open until filled"}
            </strong>
          </div>

          {/* 6. Department */}
          <div className="p-3.5 rounded-xl bg-background border border-border-subtle flex flex-col gap-1">
            <span className="text-text-muted text-[11px] font-medium flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-primary" />
              Department
            </span>
            <strong className="text-text-primary text-sm font-semibold">{job.department}</strong>
          </div>

          {/* 7. Status */}
          <div className="p-3.5 rounded-xl bg-background border border-border-subtle flex flex-col gap-1">
            <span className="text-text-muted text-[11px] font-medium">Status</span>
            <div className="flex items-center gap-2">
              <StatusBadge status={job.status} />
            </div>
          </div>

          {/* 8. Posted Date */}
          <div className="p-3.5 rounded-xl bg-background border border-border-subtle flex flex-col gap-1">
            <span className="text-text-muted text-[11px] font-medium">Published Date</span>
            <strong className="text-text-primary text-sm font-semibold">
              {formatDate(job.publishedAt)}
            </strong>
          </div>
        </div>

        {/* Quick Status Bar Controller */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <span className="font-medium text-slate-700">Quick Status Controls:</span>
          <div className="flex items-center gap-2">
            {job.status !== "Published" && (
              <button
                type="button"
                onClick={() => handleStatusUpdate("Published")}
                className="px-3 py-1 rounded-lg bg-green-50 text-green-700 border border-green-200 font-semibold hover:bg-green-100 flex items-center gap-1 cursor-pointer"
              >
                <PlayCircle className="w-3.5 h-3.5" />
                Publish (Active)
              </button>
            )}
            {job.status === "Published" && (
              <button
                type="button"
                onClick={() => handleStatusUpdate("Paused")}
                className="px-3 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 font-semibold hover:bg-amber-100 flex items-center gap-1 cursor-pointer"
              >
                <PauseCircle className="w-3.5 h-3.5" />
                Pause
              </button>
            )}
            {job.status !== "Closed" && (
              <button
                type="button"
                onClick={() => handleStatusUpdate("Closed")}
                className="px-3 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 font-semibold hover:bg-rose-100 flex items-center gap-1 cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5" />
                Close
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Description Section */}
      <Card className="p-6 sm:p-7 bg-surface border-border shadow-xs flex flex-col gap-4">
        <h2 className="text-base font-bold text-text-primary">Role Overview & Description</h2>
        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed whitespace-pre-line">
          {job.summary}
        </p>

        {job.responsibilities && job.responsibilities.length > 0 && (
          <div className="mt-3 flex flex-col gap-2">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
              Key Responsibilities
            </h3>
            <ul className="flex flex-col gap-2 text-xs sm:text-sm text-text-secondary">
              {job.responsibilities.map((resp, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>{resp}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      {/* Skills Section */}
      <Card className="p-6 sm:p-7 bg-surface border-border shadow-xs flex flex-col gap-5">
        <h2 className="text-base font-bold text-text-primary">Technical & Core Skills</h2>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-text-secondary">
            Must-Have Required Skills:
          </span>
          <div className="flex flex-wrap gap-2">
            {job.mustHaveSkills && job.mustHaveSkills.length > 0 ? (
              job.mustHaveSkills.map((skill) => (
                <SkillBadge key={skill} name={skill} verified />
              ))
            ) : (
              <span className="text-xs text-text-muted">None specified</span>
            )}
          </div>
        </div>

        {job.preferredSkills && job.preferredSkills.length > 0 && (
          <div className="flex flex-col gap-2 pt-3 border-t border-border-subtle">
            <span className="text-xs font-semibold text-text-secondary">
              Preferred / Bonus Skills:
            </span>
            <div className="flex flex-wrap gap-2">
              {job.preferredSkills.map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 rounded-md bg-background border border-border text-xs text-text-secondary font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
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
              Are you sure you want to delete <strong className="text-slate-900">"{job.title}"</strong>?
              This will permanently remove the listing and all associated applicant matches.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDelete}
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
