"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/States";
import { formatSalaryRange } from "@/lib/utils";
import { Bookmark, Trash2, ArrowRight } from "lucide-react";
import { useCandidate } from "@/lib/candidate/context/CandidateContext";

export default function SavedJobsPage() {
  const { savedJobIds, toggleSaveJob, availableJobs } = useCandidate();

  const savedJobs = useMemo(() => {
    return availableJobs.filter((j) => savedJobIds.includes(j.id));
  }, [availableJobs, savedJobIds]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 pb-4 border-b border-border">
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          Saved Opportunities ({savedJobs.length})
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary">
          Positions you have bookmarked to review or explore further.
        </p>
      </div>

      {savedJobs.length === 0 ? (
        <EmptyState
          icon={<Bookmark className="w-8 h-8 text-text-muted" />}
          title="No saved jobs yet"
          description="Click the bookmark icon on any job card to save it here for later review."
          action={{
            label: "Explore Jobs",
            onClick: () => (window.location.href = "/candidate/jobs"),
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedJobs.map((job) => (
            <Card key={job.id} hoverable className="p-5 flex flex-col justify-between gap-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {job.organizationLogo ? (
                      <img
                        src={job.organizationLogo}
                        alt={job.organizationName}
                        className="w-11 h-11 rounded-xl object-contain p-0.5 border border-border shrink-0 bg-white"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-primary-soft text-primary font-bold flex items-center justify-center text-sm border border-border shrink-0">
                        {job.organizationName ? job.organizationName.charAt(0).toUpperCase() : "C"}
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-text-secondary">
                        {job.organizationName}
                      </span>
                      <Link href={`/jobs/${job.slug}`}>
                        <h3 className="text-base font-bold text-text-primary hover:text-primary transition-colors leading-snug">
                          {job.title}
                        </h3>
                      </Link>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleSaveJob(job.id)}
                    className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-background transition-colors cursor-pointer"
                    title="Remove from saved"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

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
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border-subtle text-xs">
                <span className="text-text-muted">{job.experienceLevel}</span>
                <Link href={`/jobs/${job.slug}`}>
                  <Button size="sm" variant="primary" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    View Details
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
