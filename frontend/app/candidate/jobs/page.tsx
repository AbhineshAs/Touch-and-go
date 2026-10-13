"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { SkillBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/States";
import { formatSalaryRange, formatRelativeTime } from "@/lib/utils";
import { Bookmark, MapPin, ShieldCheck, Briefcase } from "lucide-react";
import { useCandidate } from "@/lib/candidate/context/CandidateContext";

export default function CandidateJobsPage() {
  const { savedJobIds, toggleSaveJob, availableJobs, applications } = useCandidate();
  const [search, setSearch] = useState("");

  const publishedJobs = useMemo(() => {
    return availableJobs.filter((j) => j.status === "Published" || !j.status);
  }, [availableJobs]);

  const filteredJobs = useMemo(() => {
    return publishedJobs.filter(
      (j) =>
        j.title.toLowerCase().includes(search.toLowerCase()) ||
        j.organizationName.toLowerCase().includes(search.toLowerCase()) ||
        j.location.toLowerCase().includes(search.toLowerCase()) ||
        (j.mustHaveSkills && j.mustHaveSkills.some((s) => s.toLowerCase().includes(search.toLowerCase())))
    );
  }, [publishedJobs, search]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Explore Jobs ({publishedJobs.length})
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary">
            Browse open positions posted directly by employers and verified companies.
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

      {publishedJobs.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="w-8 h-8 text-text-muted" />}
          title="No open jobs posted yet"
          description="When employers publish open positions in the portal, they will appear here in real-time."
        />
      ) : filteredJobs.length === 0 ? (
        <EmptyState
          title="No jobs matched your search"
          description="Try broadening your search keywords or clearing filters."
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
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-text-secondary">
                            {job.organizationName}
                          </span>
                          {job.organizationVerified && (
                            <ShieldCheck className="w-3.5 h-3.5 text-success" />
                          )}
                          <span className="text-[10px] px-2 py-0.5 rounded bg-primary-soft text-primary font-medium">
                            {job.employmentType || "Full-time"}
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
                    {job.summary || "No description provided."}
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

                  {job.mustHaveSkills && job.mustHaveSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {job.mustHaveSkills.slice(0, 3).map((sk) => (
                        <SkillBadge key={sk} name={sk} />
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border-subtle text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-text-muted">Posted {formatRelativeTime(job.publishedAt)}</span>
                    {applications.some((a) => a.jobId === job.id || (job.slug && a.jobId === job.slug)) && (
                      <span className="px-2 py-0.5 rounded-full bg-success-soft text-success text-[10px] font-bold">
                        Applied
                      </span>
                    )}
                  </div>
                  <Link href={`/jobs/${job.slug}`}>
                    <Button
                      size="sm"
                      variant={
                        applications.some((a) => a.jobId === job.id || (job.slug && a.jobId === job.slug))
                          ? "secondary"
                          : "primary"
                      }
                    >
                      {applications.some((a) => a.jobId === job.id || (job.slug && a.jobId === job.slug))
                        ? "View Application"
                        : "View Match Details"}
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
