"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge, MatchBadge } from "@/components/ui/Badge";
import { LoadingState, EmptyState } from "@/components/ui/States";
import {
  Building2,
  ShieldCheck,
  MapPin,
  Globe,
  Users,
  Briefcase,
  CheckCircle2,
  ArrowLeft,
  FileText,
} from "lucide-react";
import { Organization, Job } from "@/types";
import { getOrganization } from "@/lib/api/employers";
import { getEmployerJobs } from "@/lib/api/jobs";
import { formatSalaryRange, formatRelativeTime } from "@/lib/utils";

export default function CompanyProfilePage() {
  const params = useParams();
  const slug = (params?.slug as string) || "org_razorwave";

  const [org, setOrg] = useState<Organization | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const [o, j] = await Promise.all([
        getOrganization(slug),
        getEmployerJobs(slug),
      ]);
      setOrg(o);
      setJobs(j.filter((item) => item.status === "Published"));
      setIsLoading(false);
    }
    load();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <PublicNavbar />
        <div className="max-w-4xl mx-auto py-20 px-4 w-full">
          <LoadingState message="Loading company profile..." />
        </div>
        <Footer />
      </div>
    );
  }

  if (!org) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <PublicNavbar />
        <div className="max-w-3xl mx-auto py-20 px-4 text-center">
          <EmptyState title="Company Not Found" description="This organization profile could not be found." />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-text-primary">
      <PublicNavbar />

      <div className="bg-surface border-b border-border py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Job Search</span>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 flex flex-col gap-8">
        {/* Company Banner Header */}
        <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-border shadow-xs flex flex-col sm:flex-row items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <img
              src={org.logo}
              alt={org.name}
              className="w-20 h-20 rounded-2xl object-cover border border-border shrink-0"
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
                  {org.name}
                </h1>
                {org.verification.status === "Verified" && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-success bg-success-soft px-2.5 py-0.5 rounded-full border border-success/20">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified Employer
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-text-secondary mt-1 max-w-xl">
                {org.tagline}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted mt-3">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> {org.headquarters}
                </span>
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" /> {org.industry}
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" /> {org.companySize}
                </span>
                <a
                  href={org.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary hover:underline"
                >
                  <Globe className="w-3.5 h-3.5" /> {org.domain}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Two-column layout: About & Verification info | Open Positions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: About & Legal Verification Badge */}
          <div className="flex flex-col gap-6">
            <Card className="p-6 flex flex-col gap-4">
              <h2 className="text-base font-bold text-text-primary">About {org.name}</h2>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                {org.about}
              </p>
              <div className="pt-4 border-t border-border-subtle flex flex-col gap-2 text-xs">
                <span className="font-semibold text-text-primary">Office Hubs</span>
                <div className="flex flex-wrap gap-1.5">
                  {org.offices.map((office) => (
                    <span key={office} className="px-2.5 py-1 rounded-md bg-background border border-border text-text-secondary">
                      {office}
                    </span>
                  ))}
                </div>
              </div>
            </Card>

            {/* Verification credentials charter */}
            <Card className="p-6 flex flex-col gap-3 bg-primary-soft/20 border-primary/30">
              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                <ShieldCheck className="w-5 h-5" />
                <span>TAG Verification Record</span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                This organization has undergone legal entity validation against Ministry of Corporate Affairs records.
              </p>
              <div className="flex flex-col gap-2 text-xs text-text-secondary pt-2 border-t border-primary/20">
                <div className="flex justify-between">
                  <span className="text-text-muted">Entity Name:</span>
                  <span className="font-medium text-text-primary">{org.verification.registeredEntityName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">CIN/Registration:</span>
                  <span className="font-mono text-text-primary">{org.verification.businessRegistrationNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Domain Ownership:</span>
                  <span className="font-medium text-success">Confirmed ({org.domain})</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column: Open Verified Jobs */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2">
              <h2 className="text-lg font-bold text-text-primary">
                Open Positions at {org.name} ({jobs.length})
              </h2>
              <span className="text-xs text-text-muted">Direct applications · No agents</span>
            </div>

            {jobs.length === 0 ? (
              <EmptyState
                title="No active listings"
                description={`${org.name} does not have any public job openings at this time.`}
              />
            ) : (
              <div className="flex flex-col gap-4">
                {jobs.map((j) => (
                  <Card key={j.id} hoverable className="p-5 sm:p-6">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-3">
                        <Link href={`/jobs/${j.slug}`}>
                          <h3 className="text-base font-bold text-text-primary hover:text-primary transition-colors">
                            {j.title}
                          </h3>
                        </Link>
                        {j.matchScore && <MatchBadge score={j.matchScore} size="sm" />}
                      </div>

                      <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                        {j.summary}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-text-secondary pt-1">
                        <span className="font-semibold text-text-primary">
                          {formatSalaryRange(j.minSalaryINR, j.maxSalaryINR, j.salaryPeriod)}
                        </span>
                        <span>•</span>
                        <span>{j.location}</span>
                        <span>•</span>
                        <span className="px-2 py-0.5 rounded bg-border-subtle text-[11px] font-medium">
                          {j.workMode}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-border-subtle text-xs">
                        <span className="text-text-muted">
                          Posted {formatRelativeTime(j.publishedAt)}
                        </span>
                        <Link href={`/jobs/${j.slug}`}>
                          <Button size="sm" variant="primary">
                            View Criteria
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
