"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import {
  ShieldCheck,
  Building2,
  FileText,
  Globe,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Upload,
} from "lucide-react";
import { Organization, VerificationStatus } from "@/types";
import { getOrganization } from "@/lib/api/employers";
import { formatDate } from "@/lib/utils";
import { LoadingState } from "@/components/ui/States";

export default function EmployerVerificationPage() {
  const [org, setOrg] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const data = await getOrganization("org_razorwave");
      setOrg(data);
      setIsLoading(false);
    }
    load();
  }, []);

  if (isLoading || !org) {
    return <LoadingState message="Loading legal verification status..." />;
  }

  const v = org.verification;

  const workflowSteps = [
    { title: "Organization Profile", done: true, desc: "Entity name & operational hubs" },
    { title: "Business Registration", done: true, desc: "CIN & GSTIN compliance numbers" },
    { title: "Domain Verification", done: true, desc: `Confirmed via ${org.domain}` },
    { title: "Legal Documents", done: true, desc: `${v.documentsSubmitted.length} files approved` },
    { title: "Trust Review", done: v.status === "Verified", desc: "Reviewed by TAG Trust & Safety" },
  ];

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 pb-16">
      <div className="flex flex-col gap-1 pb-4 border-b border-border">
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          Employer Verification Status
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary">
          TAG requires legal entity validation to protect job seekers and maintain market trust.
        </p>
      </div>

      {/* Main Status Callout */}
      <Card className="p-6 sm:p-8 bg-surface border-border flex flex-col gap-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-success-soft text-success flex items-center justify-center shrink-0">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-text-primary">
                  Status: {v.status}
                </h2>
                <StatusBadge status={v.status} />
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                Approved by {v.reviewedBy} on {formatDate(v.reviewedAt!)}
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1 text-xs text-text-secondary bg-background px-3 py-1.5 rounded-lg border border-border">
            <span>Risk Indicator:</span>
            <strong className="text-success">{v.riskLevel} Risk</strong>
          </div>
        </div>

        {/* Guided Workflow Checklist */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-4 border-t border-border-subtle">
          {workflowSteps.map((step, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-background border border-border-subtle flex flex-col gap-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-text-muted">Step {idx + 1}</span>
                {step.done ? (
                  <CheckCircle2 className="w-4 h-4 text-success" />
                ) : (
                  <Clock className="w-4 h-4 text-amber-600" />
                )}
              </div>
              <span className="font-bold text-text-primary text-[11px] mt-1">{step.title}</span>
              <span className="text-[10px] text-text-muted leading-tight">{step.desc}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Submitted Documentation */}
      <Card className="p-6 bg-surface border-border flex flex-col gap-4">
        <h3 className="text-base font-bold text-text-primary">Submitted Compliance Records</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-background border border-border-subtle flex flex-col gap-1">
            <span className="text-text-muted">Corporate Entity Name:</span>
            <strong className="text-text-primary">{v.registeredEntityName}</strong>
          </div>
          <div className="p-4 rounded-xl bg-background border border-border-subtle flex flex-col gap-1">
            <span className="text-text-muted">MCA Corporate Identity Number (CIN):</span>
            <strong className="text-text-primary font-mono">{v.businessRegistrationNumber}</strong>
          </div>
          <div className="p-4 rounded-xl bg-background border border-border-subtle flex flex-col gap-1">
            <span className="text-text-muted">GST Identification Number:</span>
            <strong className="text-text-primary font-mono">{v.gstNumber}</strong>
          </div>
          <div className="p-4 rounded-xl bg-background border border-border-subtle flex flex-col gap-1">
            <span className="text-text-muted">Corporate Domain Verification:</span>
            <strong className="text-success font-medium">Domain TXT verified ({v.domain})</strong>
          </div>
        </div>

        {/* Uploaded Documents List */}
        <div className="flex flex-col gap-2 pt-2">
          <span className="text-xs font-semibold text-text-secondary">Submitted Files</span>
          {v.documentsSubmitted.map((doc) => (
            <div
              key={doc.id}
              className="p-3 rounded-lg border border-border bg-surface flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-primary" />
                <div className="flex flex-col">
                  <span className="font-semibold text-text-primary">{doc.type}</span>
                  <span className="text-[10px] text-text-muted">{doc.fileName}</span>
                </div>
              </div>
              <span className="text-success text-[11px] font-semibold bg-success-soft px-2 py-0.5 rounded">
                Verified Document
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
