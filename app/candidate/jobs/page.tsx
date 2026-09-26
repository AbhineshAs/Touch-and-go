"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { SkillBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/States";
import { SAMPLE_JOBS_CATALOGUE } from "@/lib/candidate/jobs/matcher";
import { formatSalaryRange, formatRelativeTime } from "@/lib/utils";
import { Bookmark, MapPin, ShieldCheck } from "lucide-react";
import { useCandidate } from "@/lib/candidate/context/CandidateContext";

export default function CandidateJobsPage() {
  const { savedJobIds, toggleSaveJob } = useCandidate();
  const [search, setSearch] = useState("");

  const filteredJobs = SAMPLE_JOBS_CATALOGUE.filter(
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
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Find Sample Jobs</h1>
          <p className="text-xs sm:text-sm text-text-secondary">
            Browse our typed catalogue of sample technology openings across seniorities and domains.
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

      {filteredJobs.length === 0 ? (
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
                          <span className="text-[10px] px-2 py-0.5 rounded bg-border-subtle text-text-muted font-medium">
                            Sample Job
                          </span>
                        </div>
                        <Link href={`/jobs/${job.slug}`}>
                          <h3 className="text-base font-bold text-text-primary hover:text-primary transition-colors leading-snug">
                            {job.title}
                          </h3>
                        </Link>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => toggleSaveJob(job.id)}
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
                      View Match Details
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
