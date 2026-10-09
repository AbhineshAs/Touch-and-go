"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { MatchBadge, StatusBadge } from "@/components/ui/Badge";
import { LoadingState } from "@/components/ui/States";
import { Application, ApplicationStage, Job } from "@/types";
import { getJobBySlug } from "@/lib/api/jobs";
import { getApplicantsForJob, updateApplicationStage } from "@/lib/api/applications";
import { formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  Kanban,
  List,
  Search,
  SlidersHorizontal,
  ChevronDown,
  User,
  CheckCircle2,
  Calendar,
  MessageSquare,
} from "lucide-react";

const PIPELINE_STAGES: ApplicationStage[] = [
  "Applied",
  "Screening",
  "Shortlisted",
  "Interview",
  "Decision",
];

export default function ApplicantPipelinePage() {
  const params = useParams();
  const router = useRouter();
  const jobId = (params?.id as string) || "job_01";

  const [job, setJob] = useState<Job | null>(null);
  const [applicants, setApplicants] = useState<Application[]>([]);
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const [j, apps] = await Promise.all([getJobBySlug(jobId), getApplicantsForJob(jobId)]);
      setJob(j);
      setApplicants(apps);
      setIsLoading(false);
    }
    load();
  }, [jobId]);

  const handleStageChange = async (appId: string, newStage: ApplicationStage) => {
    // Optimistically update
    setApplicants((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, stage: newStage } : a))
    );
    await updateApplicationStage(appId, newStage);
  };

  const filteredApplicants = applicants.filter(
    (a) =>
      a.candidateName.toLowerCase().includes(search.toLowerCase()) ||
      a.candidateHeadline.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading || !job) {
    return <LoadingState message="Loading applicant pipeline..." />;
  }

  return (
    <div className="flex flex-col gap-6">
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
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">
              {job.title}
            </h1>
            <span className="text-xs font-semibold text-text-muted bg-border-subtle px-2.5 py-0.5 rounded">
              Pipeline ({applicants.length})
            </span>
          </div>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-2">
          <div className="p-1 bg-border-subtle rounded-lg flex items-center gap-1">
            <button
              onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "kanban"
                  ? "bg-surface text-primary shadow-xs"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "list"
                  ? "bg-surface text-primary shadow-xs"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Table List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="w-full sm:w-80">
        <SearchInput
          placeholder="Filter candidate name or skills..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch("")}
        />
      </div>

      {/* KANBAN VIEW */}
      {viewMode === "kanban" ? (
        <div className="flex flex-row overflow-x-auto gap-4 pb-4 snap-x snap-mandatory scrollbar-thin">
          {PIPELINE_STAGES.map((stg) => {
            const stageApplicants = filteredApplicants.filter((a) => a.stage === stg);
            return (
              <div
                key={stg}
                className="flex flex-col gap-3 min-w-[240px] bg-background/60 p-3 rounded-xl border border-border"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <span className="text-xs font-bold text-text-primary uppercase tracking-wider">
                    {stg}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-surface border border-border text-text-secondary">
                    {stageApplicants.length}
                  </span>
                </div>

                {/* Candidate Cards */}
                <div className="flex flex-col gap-3">
                  {stageApplicants.map((app) => (
                    <Card
                      key={app.id}
                      hoverable
                      className="p-4 bg-surface border-border flex flex-col gap-3 cursor-default"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={app.candidateAvatar}
                            alt={app.candidateName}
                            className="w-9 h-9 rounded-full object-cover border border-border shrink-0"
                          />
                          <div className="flex flex-col">
                            <Link href={`/employer/candidates/${app.id}`}>
                              <h4 className="text-xs font-bold text-text-primary hover:text-primary transition-colors">
                                {app.candidateName}
                              </h4>
                            </Link>
                            <span className="text-[10px] text-text-muted line-clamp-1">
                              {app.candidateHeadline}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <MatchBadge score={app.overallAlignment} size="sm" />
                        <span className="text-[10px] text-text-muted">
                          {formatDate(app.appliedAt)}
                        </span>
                      </div>

                      {/* Accessible Stage Change Menu */}
                      <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-xs">
                        <span className="text-[10px] text-text-muted font-medium">Stage:</span>
                        <select
                          value={app.stage}
                          onChange={(e) =>
                            handleStageChange(app.id, e.target.value as ApplicationStage)
                          }
                          className="text-[11px] font-semibold bg-background border border-border rounded-md px-2 py-1 text-text-primary cursor-pointer focus:border-primary"
                        >
                          {PIPELINE_STAGES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>

                      <Link href={`/employer/candidates/${app.id}`}>
                        <Button size="sm" variant="outline" className="w-full text-xs">
                          Inspect Evidence
                        </Button>
                      </Link>
                    </Card>
                  ))}

                  {stageApplicants.length === 0 && (
                    <div className="py-8 text-center text-xs text-text-muted border border-dashed border-border rounded-lg">
                      No candidates
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE LIST VIEW */
        <Card className="bg-surface border-border overflow-hidden">
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
                        <img
                          src={app.candidateAvatar}
                          alt={app.candidateName}
                          className="w-8 h-8 rounded-full object-cover border border-border shrink-0"
                        />
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
                        className="text-xs font-semibold bg-background border border-border rounded-md px-2 py-1 text-text-primary cursor-pointer"
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
                      <Link href={`/employer/candidates/${app.id}`}>
                        <Button size="sm" variant="secondary">
                          Review Profile
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
