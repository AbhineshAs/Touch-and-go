"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { StatusBadge } from "@/components/ui/Badge";
import { LoadingState } from "@/components/ui/States";
import { ModerationReport } from "@/types";
import { getModerationReports, updateModerationStatus } from "@/lib/api/admin";
import { formatDate } from "@/lib/utils";
import { Flag, AlertTriangle, ShieldAlert, CheckCircle2, XCircle } from "lucide-react";

export default function AdminModerationPage() {
  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const data = await getModerationReports();
      setReports(data);
      setIsLoading(false);
    }
    load();
  }, []);

  const handleResolve = async (id: string, status: ModerationReport["status"]) => {
    const updated = await updateModerationStatus(id, status);
    setReports(reports.map((r) => (r.id === updated.id ? updated : r)));
  };

  const tabs = [
    { id: "all", label: "All Reports", count: reports.length },
    {
      id: "jobs",
      label: "Reported Jobs",
      count: reports.filter((r) => r.type === "Job Listing").length,
    },
    {
      id: "orgs",
      label: "Organizations",
      count: reports.filter((r) => r.type === "Organization").length,
    },
    {
      id: "users",
      label: "User Profiles",
      count: reports.filter((r) => r.type === "User Profile").length,
    },
  ];

  const filtered = reports.filter((r) => {
    if (activeTab === "all") return true;
    if (activeTab === "jobs") return r.type === "Job Listing";
    if (activeTab === "orgs") return r.type === "Organization";
    if (activeTab === "users") return r.type === "User Profile";
    return true;
  });

  if (isLoading) {
    return <LoadingState message="Loading moderation tickets..." />;
  }

  return (
    <div className="flex flex-col gap-6 pb-16">
      <div className="flex flex-col gap-1 pb-4 border-b border-border">
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          Marketplace Moderation ({reports.length})
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary">
          Investigate reported fraudulent job postings, automated scraping attempts, and trust appeals.
        </p>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <div className="flex flex-col gap-4">
        {filtered.map((report) => (
          <Card key={report.id} className="p-6 bg-surface border-border flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    report.severity === "Critical"
                      ? "bg-danger-soft text-danger"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-text-muted">{report.type}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        report.severity === "Critical"
                          ? "bg-danger-soft text-danger"
                          : "bg-amber-100 text-amber-900"
                      }`}
                    >
                      {report.severity} Severity
                    </span>
                    <StatusBadge status={report.status} />
                  </div>
                  <h3 className="text-base font-bold text-text-primary mt-1">
                    {report.targetTitle}
                  </h3>
                  <span className="text-xs text-text-muted mt-0.5">
                    Reported by {report.reportedBy} ({report.reportedByEmail}) on{" "}
                    {formatDate(report.createdAt)}
                  </span>
                </div>
              </div>

              {report.status === "Pending" && (
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-text-muted hover:text-text-primary"
                    onClick={() => handleResolve(report.id, "Dismissed")}
                  >
                    Dismiss
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleResolve(report.id, "Resolved")}
                  >
                    Suspend & Remove Listing
                  </Button>
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl bg-background border border-border-subtle text-xs text-text-secondary leading-relaxed">
              <strong className="text-text-primary block mb-0.5">Report Reason:</strong>
              {report.reason}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
