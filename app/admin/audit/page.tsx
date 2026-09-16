"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { SearchInput } from "@/components/ui/Input";
import { LoadingState } from "@/components/ui/States";
import { AuditEvent } from "@/types";
import { getAuditLogs } from "@/lib/api/admin";
import { formatDate } from "@/lib/utils";
import { FileSpreadsheet, Shield, Lock, Search, Filter } from "lucide-react";

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("All");

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const data = await getAuditLogs();
      setLogs(data);
      setIsLoading(false);
    }
    load();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.actorName.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.resource.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase());
    const matchesRisk = riskFilter === "All" || log.riskLevel === riskFilter;
    return matchesSearch && matchesRisk;
  });

  if (isLoading) {
    return <LoadingState message="Verifying tamper-evident audit ledger..." />;
  }

  return (
    <div className="flex flex-col gap-6 pb-16">
      <div className="flex flex-col gap-1 pb-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Immutable Audit Ledger ({logs.length} Events)
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-text-secondary">
          Cryptographically hashed and append-only activity trail for verification approvals, stage transitions, and security telemetry.
        </p>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="w-full sm:flex-1">
          <SearchInput
            placeholder="Search by actor, action, resource, or IP address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch("")}
          />
        </div>

        <div className="flex items-center gap-2">
          {["All", "Low", "Medium", "High"].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRiskFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                riskFilter === r
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-surface border border-border text-text-secondary hover:bg-background"
              }`}
            >
              {r} {r !== "All" && "Risk"}
            </button>
          ))}
        </div>
      </div>

      <Card className="bg-surface border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-background border-b border-border text-text-secondary uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="p-4">Timestamp (UTC)</th>
                <th className="p-4">Actor</th>
                <th className="p-4">Action</th>
                <th className="p-4">Target Resource</th>
                <th className="p-4">Event Details</th>
                <th className="p-4">IP Origin</th>
                <th className="p-4 text-right">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-background/50 transition-colors font-mono">
                  <td className="p-4 text-text-muted text-[11px] whitespace-nowrap">
                    {formatDate(log.timestamp)}
                  </td>
                  <td className="p-4 font-sans">
                    <span className="font-semibold text-text-primary block">{log.actorName}</span>
                    <span className="text-[10px] text-text-muted">{log.actorEmail}</span>
                  </td>
                  <td className="p-4 font-bold text-primary text-[11px] whitespace-nowrap">
                    {log.action}
                  </td>
                  <td className="p-4 font-sans text-text-primary truncate max-w-xs">
                    {log.resource}
                  </td>
                  <td className="p-4 font-sans text-text-secondary text-[11px] max-w-sm">
                    {log.details}
                  </td>
                  <td className="p-4 text-text-muted text-[11px]">{log.ipAddress}</td>
                  <td className="p-4 text-right font-sans">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        log.riskLevel === "High"
                          ? "bg-danger-soft text-danger"
                          : log.riskLevel === "Medium"
                          ? "bg-amber-100 text-amber-900"
                          : "bg-success-soft text-success"
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
