"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { StatusBadge, MatchBadge } from "@/components/ui/Badge";
import { LoadingState, EmptyState } from "@/components/ui/States";
import { Application, ApplicationStage } from "@/types";
import { getApplications } from "@/lib/api/applications";
import { formatDate } from "@/lib/utils";
import {
  FileText,
  Building2,
  Calendar,
  ArrowRight,
  Sparkles,
  MapPin,
  Clock,
} from "lucide-react";

export default function CandidateApplicationsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const data = await getApplications("prof_cand_01");
      setApplications(data);
      setIsLoading(false);
    }
    load();
  }, []);

  const tabs = [
    { id: "all", label: "All Applications", count: applications.length },
    {
      id: "applied",
      label: "Applied",
      count: applications.filter((a) => a.stage === "Applied").length,
    },
    {
      id: "screening",
      label: "Review",
      count: applications.filter((a) => a.stage === "Screening").length,
    },
    {
      id: "interview",
      label: "Interview",
      count: applications.filter((a) => a.stage === "Interview").length,
    },
    {
      id: "decision",
      label: "Offer / Decision",
      count: applications.filter((a) => a.stage === "Decision").length,
    },
    {
      id: "closed",
      label: "Closed",
      count: applications.filter((a) => a.stage === "Closed").length,
    },
  ];

  const filtered = applications.filter((a) => {
    if (activeTab === "all") return true;
    return a.stage.toLowerCase() === activeTab;
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 pb-4 border-b border-border">
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          Your Applications
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary">
          Track real-time recruiter review stages, scheduled interviews, and hiring decisions.
        </p>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {isLoading ? (
        <LoadingState message="Loading your active applications..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No applications in this stage"
          description="Explore published opportunities matching your verified skills."
          action={{
            label: "Explore Recommended Jobs",
            onClick: () => (window.location.href = "/candidate/recommended"),
          }}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((app) => (
            <Card key={app.id} hoverable className="p-5 sm:p-6 bg-surface border-border">
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <img
                      src={app.organizationLogo}
                      alt={app.organizationName}
                      className="w-12 h-12 rounded-xl object-cover border border-border shrink-0"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-text-secondary">
                        {app.organizationName}
                      </span>
                      <Link href={`/candidate/applications/${app.id}`}>
                        <h3 className="text-base sm:text-lg font-bold text-text-primary hover:text-primary transition-colors leading-snug">
                          {app.jobTitle}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-3 text-xs text-text-muted mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {app.location} ({app.workMode})
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          Applied {formatDate(app.appliedAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <StatusBadge status={app.stage} />
                    {app.overallAlignment && (
                      <MatchBadge score={app.overallAlignment} size="sm" />
                    )}
                  </div>
                </div>

                {/* Progress Mini Step Bar */}
                <div className="p-3.5 rounded-xl bg-background border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>
                      Latest Activity:{" "}
                      <strong className="text-text-primary">
                        {app.timeline[app.timeline.length - 1]?.title}
                      </strong>
                    </span>
                  </div>

                  <Link href={`/candidate/applications/${app.id}`}>
                    <Button size="sm" variant="primary" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                      View Detailed Timeline
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
