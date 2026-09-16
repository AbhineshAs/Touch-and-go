"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, MetricCard } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { LoadingState } from "@/components/ui/States";
import {
  ShieldCheck,
  Building2,
  Users,
  Flag,
  FileSpreadsheet,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Tags,
  CheckCircle2,
} from "lucide-react";
import { Organization, AuditEvent, ModerationReport } from "@/types";
import { getVerificationQueue, getAuditLogs, getModerationReports } from "@/lib/api/admin";
import { formatDate } from "@/lib/utils";

export default function AdminDashboardPage() {
  const [queue, setQueue] = useState<Organization[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>([]);
  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const [q, logs, rep] = await Promise.all([
        getVerificationQueue(),
        getAuditLogs(),
        getModerationReports(),
      ]);
      setQueue(q);
      setAuditLogs(logs);
      setReports(rep);
      setIsLoading(false);
    }
    load();
  }, []);

  if (isLoading) {
    return <LoadingState message="Loading administrative metrics..." />;
  }

  return (
    <div className="flex flex-col gap-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
            Platform Trust & Administration
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary">
            Oversee marketplace integrity, legal employer verification, content moderation, and taxonomy.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/verifications">
            <Button variant="primary" size="sm" leftIcon={<ShieldCheck className="w-4 h-4" />}>
              Review Queue ({queue.length})
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Verified Employers"
          value="48"
          icon={<Building2 className="w-5 h-5 text-primary" />}
          change="+4 this week"
          changeType="positive"
        />
        <MetricCard
          label="Active Candidates"
          value="1,420"
          icon={<Users className="w-5 h-5 text-primary" />}
          change="+18% MoM"
          changeType="positive"
        />
        <MetricCard
          label="Pending Moderation"
          value={reports.filter((r) => r.status === "Pending").length}
          icon={<Flag className="w-5 h-5 text-amber-600" />}
          subtitle="Action required"
        />
        <MetricCard
          label="System Health SLA"
          value="99.98%"
          icon={<CheckCircle2 className="w-5 h-5 text-success" />}
          subtitle="Zero unverified leaks"
        />
      </div>

      {/* Two Column Grid: Verification Queue + Moderation Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Verification Queue */}
        <Card className="p-6 bg-surface border-border flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <h2 className="text-base font-bold text-text-primary">Employer Verification Queue</h2>
            </div>
            <Link
              href="/admin/verifications"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Open Full Queue →
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {queue.slice(0, 3).map((org) => (
              <div
                key={org.id}
                className="p-4 rounded-xl bg-background border border-border-subtle flex items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={org.logo}
                    alt={org.name}
                    className="w-10 h-10 rounded-lg object-cover border border-border shrink-0"
                  />
                  <div className="flex flex-col">
                    <span className="font-bold text-text-primary">{org.name}</span>
                    <span className="text-[11px] text-text-muted">{org.domain} • {org.industry}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <StatusBadge status={org.verification.status} />
                  <Link href="/admin/verifications">
                    <Button size="sm" variant="outline">
                      Review
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Content Moderation Tickets */}
        <Card className="p-6 bg-surface border-border flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
            <div className="flex items-center gap-2">
              <Flag className="w-5 h-5 text-amber-600" />
              <h2 className="text-base font-bold text-text-primary">Content Moderation Alerts</h2>
            </div>
            <Link
              href="/admin/moderation"
              className="text-xs font-semibold text-primary hover:underline"
            >
              All Reports ({reports.length}) →
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {reports.map((rep) => (
              <div
                key={rep.id}
                className="p-4 rounded-xl bg-background border border-border-subtle flex flex-col gap-1.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-text-primary">{rep.type}: {rep.targetTitle}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      rep.severity === "Critical" ? "bg-danger-soft text-danger" : "bg-amber-100 text-amber-900"
                    }`}
                  >
                    {rep.severity}
                  </span>
                </div>
                <p className="text-text-muted leading-relaxed">{rep.reason}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Immutable Audit Log Highlights */}
      <Card className="p-6 bg-surface border-border flex flex-col gap-4">
        <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-primary" />
            <h2 className="text-base font-bold text-text-primary">Recent Audit Events</h2>
          </div>
          <Link
            href="/admin/audit"
            className="text-xs font-semibold text-primary hover:underline"
          >
            View Complete Audit Log →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-background text-text-secondary uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Actor</th>
                <th className="p-3">Action</th>
                <th className="p-3">Resource</th>
                <th className="p-3">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {auditLogs.slice(0, 4).map((log) => (
                <tr key={log.id} className="hover:bg-background/50">
                  <td className="p-3 font-mono text-text-muted text-[11px]">{formatDate(log.timestamp)}</td>
                  <td className="p-3 font-semibold text-text-primary">{log.actorName}</td>
                  <td className="p-3 font-mono text-primary text-[11px]">{log.action}</td>
                  <td className="p-3 text-text-secondary truncate max-w-xs">{log.resource}</td>
                  <td className="p-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        log.riskLevel === "High"
                          ? "bg-danger-soft text-danger"
                          : "bg-border-subtle text-text-secondary"
                      }`}
                    >
                      {log.riskLevel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
