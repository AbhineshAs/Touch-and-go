"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { MatchBadge, SkillBadge } from "@/components/ui/Badge";
import { LoadingState, EmptyState } from "@/components/ui/States";
import { Job } from "@/types";
import { getRecommendedJobs } from "@/lib/api/jobs";
import { formatSalaryRange, formatRelativeTime } from "@/lib/utils";
import { Sparkles, ShieldCheck, MapPin, ArrowRight, HelpCircle } from "lucide-react";

export default function RecommendedJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const data = await getRecommendedJobs();
      setJobs(data);
      setIsLoading(false);
    }
    load();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {/* Header with explainability banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex flex-col gap-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-soft text-primary-dark font-semibold text-xs border border-primary/20 w-fit">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>High Criteria Alignment (75%+)</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Recommended For You
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            These positions closely match your confirmed commercial experience in React, TypeScript, and Design Systems. Every score is explainable down to specific requirement citations.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-background border border-border-subtle flex flex-col gap-1 text-xs text-text-muted shrink-0">
          <span className="font-bold text-text-primary">Explainability Standard:</span>
          <span>• 35% Verified Skills</span>
          <span>• 25% Commercial Scope</span>
          <span>• 15% Role Seniority</span>
          <span>• 10% Location Fit</span>
        </div>
      </div>

      {isLoading ? (
        <LoadingState message="Calculating explainable alignment..." />
      ) : jobs.length === 0 ? (
        <EmptyState
          title="No recommendations currently available"
          description="Update your skills and experience to receive tailored criteria matches."
          action={{
            label: "Update Profile",
            onClick: () => (window.location.href = "/candidate/profile"),
          }}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {jobs.map((job) => (
            <Card key={job.id} hoverable className="p-6 bg-surface border-border flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <img
                    src={job.organizationLogo}
                    alt={job.organizationName}
                    className="w-12 h-12 rounded-xl object-cover border border-border shrink-0"
                  />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-text-secondary">
                        {job.organizationName}
                      </span>
                      {job.organizationVerified && (
                        <ShieldCheck className="w-3.5 h-3.5 text-success" />
                      )}
                    </div>
                    <Link href={`/jobs/${job.slug}`}>
                      <h3 className="text-lg font-bold text-text-primary hover:text-primary transition-colors leading-snug">
                        {job.title}
                      </h3>
                    </Link>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {job.location} ({job.workMode})
                      </span>
                      <span>•</span>
                      <span className="font-semibold text-text-primary">
                        {formatSalaryRange(job.minSalaryINR, job.maxSalaryINR, job.salaryPeriod)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center sm:flex-col sm:items-end gap-2 shrink-0">
                  {job.matchScore && <MatchBadge score={job.matchScore} size="lg" />}
                  <span className="text-[11px] text-text-muted">
                    Posted {formatRelativeTime(job.publishedAt)}
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                {job.summary}
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                {job.mustHaveSkills.map((sk) => (
                  <SkillBadge key={sk} name={sk} verified />
                ))}
              </div>

              <div className="pt-4 border-t border-border-subtle flex items-center justify-between">
                <span className="text-xs text-text-muted">
                  {job.applicantsCount} active applicants in employer pipeline
                </span>
                <Link href={`/jobs/${job.slug}`}>
                  <Button size="sm" variant="primary" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    Inspect Evidence & Apply
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
