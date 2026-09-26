"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/States";
import { formatDate } from "@/lib/utils";
import {
  FileText,
  Calendar,
  ArrowRight,
  MapPin,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { useCandidate } from "@/lib/candidate/context/CandidateContext";

export default function CandidateApplicationsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const { applications } = useCandidate();

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
  ];

  const filtered = applications.filter((a) => {
    if (activeTab === "all") return true;
    return a.stage.toLowerCase() === activeTab;
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 pb-4 border-b border-border">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Your Applications ({applications.length})
          </h1>
          <span className="text-[10px] px-2 py-0.5 rounded bg-primary-soft text-primary font-bold">
            Simulated Workspace
          </span>
        </div>
        <p className="text-xs sm:text-sm text-text-secondary">
          Track real-time candidate review stages, scheduled interviews, and simulated application timelines.
        </p>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {filtered.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-8 h-8 text-text-muted" />}
          title="No applications in this stage"
          description={
            applications.length === 0
              ? "You haven't submitted any simulated applications yet. Explore recommended sample roles to test the process."
              : "No applications found in this specific stage filter."
          }
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
                    {app.organizationLogo ? (
                      <img
                        src={app.organizationLogo}
                        alt={app.organizationName}
                        className="w-12 h-12 rounded-xl object-cover border border-border shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-primary-soft text-primary font-bold flex items-center justify-center shrink-0">
                        {app.organizationName.charAt(0)}
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-text-secondary">
                        {app.organizationName}
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-text-primary leading-snug">
                        {app.jobTitle}
                      </h3>
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

                  <span className="px-3 py-1 rounded-full bg-primary-soft text-primary-dark font-bold text-xs">
                    {app.stage}
                  </span>
                </div>

                {app.notes && (
                  <div className="p-3 rounded-lg bg-background border border-border-subtle text-xs text-text-secondary">
                    <span className="font-semibold text-text-primary">Cover Note: </span>
                    {app.notes}
                  </div>
                )}

                <div className="p-3 rounded-xl bg-background border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-text-muted">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>
                      Application status: <strong className="text-text-primary">{app.stage}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-text-muted">
                    <ShieldCheck className="w-3.5 h-3.5 text-success" />
                    <span>Local test simulation</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
