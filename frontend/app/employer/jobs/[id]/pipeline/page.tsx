"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { MatchBadge, StatusBadge } from "@/components/ui/Badge";
import { LoadingState } from "@/components/ui/States";
import { ResumePreviewModal } from "@/components/employer/ResumePreviewModal";
import { Application, ApplicationStage, Job, CandidateProfile } from "@/types";
import { getJobBySlug } from "@/lib/api/jobs";
import { getApplicantsForJob, updateApplicationStage } from "@/lib/api/applications";
import { resolveCandidateProfileByEmailOrId } from "@/lib/api/candidate";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, FileText } from "lucide-react";

const PIPELINE_STAGES: ApplicationStage[] = [
  "Applied",
  "Screening",
  "Shortlisted",
  "Interview",
  "Decision",
  "Closed",
];

export default function ApplicantPipelinePage() {
  const params = useParams();
  const router = useRouter();
  const jobId = (params?.id as string) || "job_01";

  const [job, setJob] = useState<Job | null>(null);
  const [applicants, setApplicants] = useState<Application[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Resume Modal State
  const [activeResumeApp, setActiveResumeApp] = useState<Application | null>(null);
  const [activeResumeProfile, setActiveResumeProfile] = useState<CandidateProfile | null>(null);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const [j, apps] = await Promise.all([getJobBySlug(jobId), getApplicantsForJob(jobId)]);
      setJob(j);
      setApplicants(apps);
      setIsLoading(false);
    }
    load();

    const handleUpdate = () => {
      getApplicantsForJob(jobId).then(setApplicants);
    };
    window.addEventListener("tag_applications_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("tag_applications_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [jobId]);

  const handleStageChange = async (appId: string, newStage: ApplicationStage) => {
    setApplicants((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, stage: newStage } : a))
    );
    await updateApplicationStage(appId, newStage);
  };

  const handleOpenResume = (app: Application) => {
    const profile = resolveCandidateProfileByEmailOrId(app.candidateEmail, app.candidateId);
    setActiveResumeApp(app);
    setActiveResumeProfile(profile);
    setIsResumeModalOpen(true);
  };

  const filteredApplicants = applicants.filter(
    (a) =>
      a.candidateName.toLowerCase().includes(search.toLowerCase()) ||
      a.candidateHeadline.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return <LoadingState message="Loading applicant pipeline..." />;
  }

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-border">
        <h2 className="text-xl font-bold text-text-primary mb-2">Job Pipeline Not Found</h2>
        <p className="text-sm text-text-secondary mb-4">
          The requested job does not exist or has been removed. Please select an active job from your listings.
        </p>
        <Link href="/employer/jobs">
          <Button variant="primary">Back to Job Listings</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-16">
      {/* Pipeline Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex flex-col gap-1">
          <Link
            href="/employer/jobs"
            className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Job Listings</span>
          </Link>
          <div className="flex items-center gap-2 mt-0.5">
            <h1 className="text-2xl font-black tracking-tight text-text-primary">
              {job.title}
            </h1>
            <span className="text-xs font-semibold text-text-muted bg-border-subtle px-2.5 py-0.5 rounded-full border border-border">
              Pipeline ({applicants.length})
            </span>
          </div>
        </div>

        {/* All Applicants Link */}
        <div className="flex items-center gap-3">
          <Link href="/employer/candidates">
            <Button size="sm" variant="outline" className="text-xs font-bold">
              All Applicants ({applicants.length})
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="max-w-md w-full">
          <SearchInput
            placeholder="Filter candidate name or skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* TABLE LIST VIEW ONLY */}
      <Card className="bg-surface border-border overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-background border-b border-border text-text-secondary uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="p-4">Candidate</th>
                <th className="p-4">Criteria Alignment</th>
                <th className="p-4">Stage</th>
                <th className="p-4">Applied Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filteredApplicants.map((app) => (
                <tr key={app.id} className="hover:bg-background/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {app.candidateAvatar ? (
                        <img
                          src={app.candidateAvatar}
                          alt={app.candidateName}
                          className="w-8 h-8 rounded-full object-cover border border-border shrink-0"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = "none";
                            const fallback = e.currentTarget.parentElement?.querySelector(".avatar-fallback") as HTMLElement;
                            if (fallback) fallback.classList.remove("hidden");
                          }}
                        />
                      ) : null}
                      <div
                        className={`w-8 h-8 rounded-full bg-primary-soft text-primary font-bold flex items-center justify-center text-xs border border-border shrink-0 avatar-fallback ${
                          app.candidateAvatar ? "hidden" : ""
                        }`}
                      >
                        {(app.candidateName || "C").charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <Link
                          href={`/employer/candidates/${app.id}`}
                          className="font-bold text-text-primary hover:text-primary transition-colors"
                        >
                          {app.candidateName}
                        </Link>
                        <span className="text-[11px] text-text-muted">{app.candidateHeadline}</span>
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    <MatchBadge score={app.overallAlignment} size="sm" />
                  </td>

                  <td className="p-4">
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
                          : "bg-blue-50 text-primary border-blue-200"
                      }`}
                    >
                      {PIPELINE_STAGES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="p-4 text-text-muted">{formatDate(app.appliedAt)}</td>

                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* View Resume Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenResume(app)}
                        title="View Resume"
                        className="p-1.5 rounded-lg border border-border bg-surface hover:bg-surface-muted text-text-primary transition-colors flex items-center gap-1 cursor-pointer text-xs font-semibold"
                      >
                        <FileText className="w-3.5 h-3.5 text-primary" />
                        <span className="hidden md:inline">Resume</span>
                      </button>

                      {/* View Profile */}
                      <Link href={`/employer/candidates/${app.id}`}>
                        <Button size="sm" variant="primary" className="text-xs">
                          Profile
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredApplicants.length === 0 && (
          <div className="py-12 text-center text-xs text-text-muted">
            No candidates found matching filter criteria.
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
