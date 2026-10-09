"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, MetricCard } from "@/components/ui/Card";
import { StatusBadge, MatchBadge } from "@/components/ui/Badge";
import { LoadingState } from "@/components/ui/States";
import {
  Briefcase,
  Users,
  UserCheck,
  Calendar,
  Plus,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Clock,
  ShieldCheck,
  Building2,
  ChevronRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Job, Application, Interview } from "@/types";
import { getEmployerJobs } from "@/lib/api/jobs";
import { getApplicantsForJob } from "@/lib/api/applications";
import { getInterviews } from "@/lib/api/interviews";
import { formatDate } from "@/lib/utils";

export default function EmployerDashboardPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const [j, ints] = await Promise.all([getEmployerJobs("org_razorwave"), getInterviews()]);
      setJobs(j);
      setInterviews(ints);
      setIsLoading(false);
    }
    load();
  }, []);

  const totalApplicants = jobs.reduce((acc, curr) => acc + curr.applicantsCount, 0);
  const totalShortlisted = jobs.reduce((acc, curr) => acc + curr.shortlistedCount, 0);
  const totalInterviews = jobs.reduce((acc, curr) => acc + curr.interviewsCount, 0);

  // Pipeline funnel data for chart
  const funnelData = [
    { stage: "Applied", count: totalApplicants },
    { stage: "Screened", count: Math.round(totalApplicants * 0.55) },
    { stage: "Shortlisted", count: totalShortlisted },
    { stage: "Interview", count: totalInterviews },
    { stage: "Offer", count: 2 },
  ];

  if (isLoading) {
    return <LoadingState message="Loading employer hiring dashboard..." />;
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
            Hiring Command Center
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary">
            RazorWave Technologies · Active recruitment pipelines and candidate alignment
          </p>
        </div>

        <Link href="/employer/jobs/new">
          <Button variant="primary" size="md" leftIcon={<Plus className="w-4 h-4" />}>
            Create Job Listing
          </Button>
        </Link>
      </div>

      {/* 1. Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Active Published Jobs"
          value={jobs.filter((j) => j.status === "Published").length}
          icon={<Briefcase className="w-5 h-5 text-primary" />}
          change="+1 this week"
          changeType="positive"
        />
        <MetricCard
          label="Total Applicants"
          value={totalApplicants}
          icon={<Users className="w-5 h-5 text-primary" />}
          change="+14 new"
          changeType="positive"
        />
        <MetricCard
          label="Shortlisted Candidates"
          value={totalShortlisted}
          icon={<UserCheck className="w-5 h-5 text-primary" />}
          subtitle="Top alignment band"
        />
        <MetricCard
          label="Interviews Scheduled"
          value={interviews.length}
          icon={<Calendar className="w-5 h-5 text-primary" />}
          change="2 today"
          changeType="neutral"
        />
      </div>

      {/* 2. Pipeline Overview Chart + Jobs Requiring Attention */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Restrained Recharts Funnel */}
        <Card className="lg:col-span-2 p-6 bg-surface border-border flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
            <div>
              <h2 className="text-base font-bold text-text-primary">Applicant Pipeline Funnel</h2>
              <p className="text-xs text-text-muted">Conversion across active hiring stages</p>
            </div>
            <Link
              href="/employer/analytics"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Detailed Analytics →
            </Link>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E7EC" />
                <XAxis dataKey="stage" tick={{ fontSize: 11, fill: "#475467" }} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#475467" }} axisLine={false} />
                <Tooltip
                  cursor={{ fill: "rgba(79, 70, 229, 0.08)" }}
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "8px",
                    border: "1px solid #E4E7EC",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="count" fill="#4F46E5" radius={[4, 4, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Action Required / Jobs Needing Review */}
        <Card className="p-6 bg-surface border-border flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <h2 className="text-base font-bold text-text-primary">Needs Attention</h2>
            </div>
            <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
              Action Required
            </span>
          </div>

          <div className="flex flex-col gap-3 text-xs">
            <div className="p-3 rounded-lg bg-background border border-border-subtle flex flex-col gap-1">
              <span className="font-semibold text-text-primary">
                Senior Frontend Engineer (React)
              </span>
              <p className="text-text-muted">
                4 new applicants with &gt;80% criteria alignment awaiting recruiter screening.
              </p>
              <Link
                href="/employer/jobs/job_01/pipeline"
                className="text-primary font-semibold hover:underline mt-1 inline-flex items-center gap-1"
              >
                <span>Open Pipeline</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="p-3 rounded-lg bg-background border border-border-subtle flex flex-col gap-1">
              <span className="font-semibold text-text-primary">
                Pending Interview Feedback
              </span>
              <p className="text-text-muted">
                Karthik Raman has not submitted scorecard for candidate Aditya Hegde.
              </p>
              <Link
                href="/employer/interviews"
                className="text-primary font-semibold hover:underline mt-1 inline-flex items-center gap-1"
              >
                <span>Submit Scorecard</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          <div className="pt-2 border-t border-border-subtle text-xs text-text-muted">
            SLA Standard: Review applicants within 3 days.
          </div>
        </Card>
      </div>

      {/* 3. Two-column: Active Job Listings + Upcoming Interviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Active Jobs */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-text-primary">Active Published Jobs</h2>
            <Link
              href="/employer/jobs"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <span>Manage All ({jobs.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {jobs.slice(0, 3).map((job) => (
              <Card key={job.id} hoverable className="p-5 flex flex-col gap-3 bg-surface border-border">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link href={`/employer/jobs/${job.id}/pipeline`}>
                      <h3 className="text-sm font-bold text-text-primary hover:text-primary transition-colors">
                        {job.title}
                      </h3>
                    </Link>
                    <span className="text-xs text-text-muted mt-0.5 block">
                      {job.department} • {job.location} ({job.workMode})
                    </span>
                  </div>
                  <StatusBadge status={job.status} />
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border-subtle text-xs text-center">
                  <div className="p-2 rounded-lg bg-background">
                    <span className="text-text-muted block text-[10px] uppercase">Applicants</span>
                    <strong className="text-text-primary text-sm">{job.applicantsCount}</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-background">
                    <span className="text-text-muted block text-[10px] uppercase">Shortlisted</span>
                    <strong className="text-text-primary text-sm">{job.shortlistedCount}</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-background">
                    <span className="text-text-muted block text-[10px] uppercase">Interviews</span>
                    <strong className="text-text-primary text-sm">{job.interviewsCount}</strong>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <Link href={`/employer/jobs/${job.id}/pipeline`}>
                    <Button size="sm" variant="secondary" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                      View Applicant Pipeline
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Upcoming Interviews */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-text-primary">Upcoming Interviews</h2>
            <Link
              href="/employer/interviews"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <span>View Calendar</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {interviews.map((int) => (
              <Card key={int.id} hoverable className="p-5 flex flex-col gap-3 bg-surface border-border">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-text-primary">{int.candidateName}</h3>
                    <span className="text-xs text-text-secondary">{int.jobTitle}</span>
                  </div>
                  <span className="text-xs font-semibold text-primary bg-primary-soft px-2.5 py-0.5 rounded-full border border-primary/20">
                    {int.durationMinutes} mins
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-background border border-border-subtle flex flex-col gap-1 text-xs">
                  <div className="flex items-center gap-2 text-text-primary font-medium">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    <span>Thursday, 17 Sep 2026 · 03:00 PM IST</span>
                  </div>
                  <span className="text-text-muted">
                    Interviewer: {int.interviewerName} ({int.interviewerRole})
                  </span>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <a href={int.meetingLink} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="primary">
                      Launch Meeting
                    </Button>
                  </a>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
