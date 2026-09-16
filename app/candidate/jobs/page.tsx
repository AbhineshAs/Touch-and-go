"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { MatchBadge, SkillBadge } from "@/components/ui/Badge";
import { LoadingState, EmptyState } from "@/components/ui/States";
import { Job } from "@/types";
import { getJobs } from "@/lib/api/jobs";
import { getSavedJobIds, toggleSaveJob } from "@/lib/api/candidate";
import { formatSalaryRange, formatRelativeTime } from "@/lib/utils";
import { Bookmark, MapPin, Search, ShieldCheck } from "lucide-react";

export default function CandidateJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const [allJobs, saved] = await Promise.all([getJobs(), getSavedJobIds()]);
      setJobs(allJobs);
      setSavedJobIds(saved);
      setIsLoading(false);
    }
    load();
  }, []);

  const handleToggleSave = async (jobId: string, e: React.MouseEvent) => {
    e.preventDefault();
    const isSaved = savedJobIds.includes(jobId);
    setSavedJobIds((prev) => (isSaved ? prev.filter((id) => id !== jobId) : [...prev, jobId]));
    const res = await toggleSaveJob(jobId);
    setSavedJobIds(res.savedIds);
  };

  const filteredJobs = jobs.filter(
    (j) =>
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.organizationName.toLowerCase().includes(search.toLowerCase()) ||
      j.location.toLowerCase().includes(search.toLowerCase()) ||
      j.mustHaveSkills.some((s) => s.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Find Jobs</h1>
          <p className="text-xs sm:text-sm text-text-secondary">
            Verified engineering openings calculated against your confirmed credentials.
          </p>
        </div>

        <div className="w-full sm:w-80">
          <SearchInput
            placeholder="Search jobs, skills, locations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch("")}
          />
        </div>
      </div>

      {isLoading ? (
        <LoadingState message="Discovering verified jobs..." />
      ) : filteredJobs.length === 0 ? (
        <EmptyState
          title="No jobs matched your search"
          description="Try broadening your search keywords or exploring recommended roles."
          action={{
            label: "Clear Search",
            onClick: () => setSearch(""),
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredJobs.map((job) => {
            const isSaved = savedJobIds.includes(job.id);
            return (
              <Card key={job.id} hoverable className="p-5 flex flex-col justify-between gap-4">
                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <img
                        src={job.organizationLogo}
                        alt={job.organizationName}
                        className="w-11 h-11 rounded-xl object-cover border border-border shrink-0"
                      />
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-text-secondary">
                            {job.organizationName}
                          </span>
                          {job.organizationVerified && (
                            <ShieldCheck className="w-3.5 h-3.5 text-success" />
                          )}
                        </div>
                        <Link href={`/jobs/${job.slug}`}>
                          <h3 className="text-base font-bold text-text-primary hover:text-primary transition-colors leading-snug">
                            {job.title}
                          </h3>
                        </Link>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {job.matchScore && <MatchBadge score={job.matchScore} size="sm" />}
                      <button
                        onClick={(e) => handleToggleSave(job.id, e)}
                        className="p-1.5 rounded-lg border border-border text-text-muted hover:text-primary transition-colors cursor-pointer"
                        title={isSaved ? "Saved" : "Save Job"}
                      >
                        <Bookmark className={`w-4 h-4 ${isSaved ? "fill-primary text-primary" : ""}`} />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                    {job.summary}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
                    <span className="font-semibold text-text-primary">
                      {formatSalaryRange(job.minSalaryINR, job.maxSalaryINR, job.salaryPeriod)}
                    </span>
                    <span>•</span>
                    <span>{job.location}</span>
                    <span>•</span>
                    <span className="px-2 py-0.5 rounded bg-border-subtle text-[11px] font-medium">
                      {job.workMode}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {job.mustHaveSkills.slice(0, 3).map((sk) => (
                      <SkillBadge key={sk} name={sk} />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border-subtle text-xs">
                  <span className="text-text-muted">Posted {formatRelativeTime(job.publishedAt)}</span>
                  <Link href={`/jobs/${job.slug}`}>
                    <Button size="sm" variant="primary">
                      View Match & Apply
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
