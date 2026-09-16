"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge, MatchBadge, StatusBadge } from "@/components/ui/Badge";
import { LoadingState } from "@/components/ui/States";
import {
  Search,
  MapPin,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Clock,
  ArrowRight,
  Bookmark,
  FileText,
  Building2,
  Video,
  ChevronRight,
} from "lucide-react";
import { CandidateProfile, Job, Application, Interview } from "@/types";
import { getCandidateProfile } from "@/lib/api/candidate";
import { getRecommendedJobs } from "@/lib/api/jobs";
import { getApplications } from "@/lib/api/applications";
import { getInterviews } from "@/lib/api/interviews";
import { formatSalaryRange, formatRelativeTime, formatDate } from "@/lib/utils";

export default function CandidateDashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchLocation, setSearchLocation] = useState("");

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const [p, jobs, apps, ints] = await Promise.all([
        getCandidateProfile(),
        getRecommendedJobs(),
        getApplications("prof_cand_01"),
        getInterviews(),
      ]);
      setProfile(p);
      setRecommendedJobs(jobs.slice(0, 3));
      setApplications(apps);
      setInterviews(ints.filter((i) => i.status === "Scheduled"));
      setIsLoading(false);
    }
    loadData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchKeyword) params.set("q", searchKeyword);
    if (searchLocation) params.set("location", searchLocation);
    router.push(`/candidate/jobs?${params.toString()}`);
  };

  if (isLoading || !profile) {
    return <LoadingState message="Loading your candidate dashboard..." />;
  }

  return (
    <div className="flex flex-col gap-8">
      {/* 1. Greeting & Profile Completeness Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
            Welcome back, {profile.fullName.split(" ")[0]}
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary">
            {profile.headline}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/candidate/profile/resume">
            <Button size="sm" variant="outline">
              Update Resume
            </Button>
          </Link>
          <Link href="/candidate/profile">
            <Button size="sm" variant="primary">
              View Profile
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Top Two-Column Widgets: Profile Completeness + Upcoming Interview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Completion Widget */}
        <Card className="lg:col-span-2 p-6 flex flex-col justify-between gap-5 bg-surface border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
                <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-border"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-primary"
                    strokeDasharray={`${profile.completionPercentage}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute font-black text-sm text-text-primary">
                  {profile.completionPercentage}%
                </span>
              </div>

              <div className="flex flex-col">
                <h3 className="text-base font-bold text-text-primary">Profile Completeness</h3>
                <p className="text-xs text-text-muted">
                  Structured profiles with verified skills receive 3.2x higher recruiter response.
                </p>
              </div>
            </div>

            <Link href="/candidate/profile">
              <Button size="sm" variant="soft">
                Complete Profile
              </Button>
            </Link>
          </div>

          {/* Missing items checklist */}
          <div className="pt-4 border-t border-border-subtle flex flex-col gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
              Recommended additions for higher criteria match:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {profile.missingItems.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-background border border-border-subtle flex items-center gap-2 text-xs text-text-secondary"
                >
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="truncate">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Upcoming Interview Widget */}
        <Card className="p-6 flex flex-col justify-between gap-4 bg-primary-soft/20 border-primary/20">
          <div className="flex items-center justify-between pb-2 border-b border-primary/20">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Upcoming Interview
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          {interviews.length > 0 ? (
            <div className="flex flex-col gap-3">
              <div>
                <h4 className="font-bold text-sm text-text-primary leading-snug">
                  {interviews[0].jobTitle}
                </h4>
                <p className="text-xs text-text-secondary mt-0.5 font-medium">
                  With {interviews[0].interviewerName} ({interviews[0].interviewerRole})
                </p>
              </div>

              <div className="p-3 rounded-lg bg-surface border border-border-subtle flex flex-col gap-1.5 text-xs">
                <div className="flex items-center gap-2 text-text-primary font-semibold">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>Thursday, 17 Sep 2026 · 03:00 PM IST</span>
                </div>
                <div className="flex items-center gap-2 text-text-muted">
                  <Clock className="w-4 h-4" />
                  <span>{interviews[0].durationMinutes} Minutes · Google Meet</span>
                </div>
              </div>

              <a
                href={interviews[0].meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full"
              >
                <Button size="sm" variant="primary" className="w-full" leftIcon={<Video className="w-4 h-4" />}>
                  Join Meeting Room
                </Button>
              </a>
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-text-muted">
              No interviews scheduled at this time.
            </div>
          )}
        </Card>
      </div>

      {/* 3. Job Search Component */}
      <Card className="p-6 bg-surface border-border shadow-xs flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-text-primary">Discover Verified Technology Roles</h3>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background">
            <Search className="w-4 h-4 text-text-muted shrink-0" />
            <input
              type="text"
              placeholder="Search by title or stack (e.g. React, Next.js, Python, Go)"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full bg-transparent text-xs text-text-primary focus:outline-none"
            />
          </div>

          <div className="sm:w-64 flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background">
            <MapPin className="w-4 h-4 text-text-muted shrink-0" />
            <input
              type="text"
              placeholder="Bengaluru, Kochi, Remote..."
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              className="w-full bg-transparent text-xs text-text-primary focus:outline-none"
            />
          </div>

          <Button type="submit" size="md" variant="primary" className="shrink-0">
            Find Matches
          </Button>
        </form>

        <div className="flex items-center gap-2 flex-wrap text-xs text-text-muted pt-1">
          <span>Quick filters:</span>
          {["React 19", "Remote Jobs", "Bengaluru Hybrid", "FastAPI Python"].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => router.push(`/candidate/jobs?q=${encodeURIComponent(tag)}`)}
              className="px-2 py-0.5 rounded-full bg-background border border-border hover:border-primary hover:text-primary transition-colors cursor-pointer text-[11px]"
            >
              {tag}
            </button>
          ))}
        </div>
      </Card>

      {/* 4. Two-Column Split: High Match Opportunities + Active Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Recommended Opportunities */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <h2 className="text-base font-bold text-text-primary">Recommended Opportunities</h2>
            </div>
            <Link
              href="/candidate/recommended"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {recommendedJobs.map((job) => (
              <Card key={job.id} hoverable className="p-4 sm:p-5 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={job.organizationLogo}
                      alt={job.organizationName}
                      className="w-10 h-10 rounded-xl object-cover border border-border shrink-0"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-text-muted">
                        {job.organizationName}
                      </span>
                      <Link href={`/jobs/${job.slug}`}>
                        <h4 className="font-bold text-sm text-text-primary hover:text-primary transition-colors">
                          {job.title}
                        </h4>
                      </Link>
                    </div>
                  </div>
                  {job.matchScore && <MatchBadge score={job.matchScore} size="sm" />}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border-subtle text-xs">
                  <span className="font-semibold text-text-primary">
                    {formatSalaryRange(job.minSalaryINR, job.maxSalaryINR, job.salaryPeriod)}
                  </span>
                  <Link href={`/jobs/${job.slug}`}>
                    <Button size="sm" variant="outline">
                      Review Match
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Active Application Activity */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <h2 className="text-base font-bold text-text-primary">Application Activity</h2>
            </div>
            <Link
              href="/candidate/applications"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <span>View All ({applications.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {applications.map((app) => (
              <Card key={app.id} hoverable className="p-4 sm:p-5 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-text-muted">{app.organizationName}</span>
                    <Link href={`/candidate/applications/${app.id}`}>
                      <h4 className="font-bold text-sm text-text-primary hover:text-primary transition-colors">
                        {app.jobTitle}
                      </h4>
                    </Link>
                  </div>
                  <StatusBadge status={app.stage} />
                </div>

                <div className="p-2.5 rounded-lg bg-background border border-border-subtle flex items-center justify-between text-xs text-text-secondary">
                  <span>
                    Current Stage: <strong className="text-text-primary">{app.stage}</strong>
                  </span>
                  <span className="text-text-muted">Applied {formatDate(app.appliedAt)}</span>
                </div>

                <div className="flex justify-end pt-1">
                  <Link href={`/candidate/applications/${app.id}`}>
                    <Button size="sm" variant="secondary" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                      View Timeline
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
