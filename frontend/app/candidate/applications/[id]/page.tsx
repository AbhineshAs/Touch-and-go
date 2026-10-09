"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusBadge, MatchBadge } from "@/components/ui/Badge";
import { AlertDialog } from "@/components/ui/Modal";
import { LoadingState, EmptyState } from "@/components/ui/States";
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  MapPin,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import { Application } from "@/types";
import { getApplication, withdrawApplication } from "@/lib/api/applications";
import { formatDate } from "@/lib/utils";

export default function ApplicationTimelinePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const app = await getApplication(id);
      setApplication(app);
      setIsLoading(false);
    }
    load();
  }, [id]);

  const handleWithdraw = async () => {
    if (!application) return;
    setIsWithdrawing(true);
    await withdrawApplication(application.id);
    const refreshed = await getApplication(application.id);
    setApplication(refreshed);
    setIsWithdrawing(false);
    setIsWithdrawModalOpen(false);
  };

  if (isLoading) {
    return <LoadingState message="Loading application timeline..." />;
  }

  if (!application) {
    return (
      <EmptyState
        title="Application Not Found"
        description="The requested application could not be located."
        action={{
          label: "Back to Applications",
          onClick: () => router.push("/candidate/applications"),
        }}
      />
    );
  }

  const standardStages = [
    { name: "Applied", label: "Application Submitted" },
    { name: "Screening", label: "Recruiter Review" },
    { name: "Shortlisted", label: "Hiring Manager Shortlist" },
    { name: "Interview", label: "Interviews & Technical Rounds" },
    { name: "Decision", label: "Final Decision & Offer" },
  ];

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 pb-16">
      {/* Back link & Actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/candidate/applications"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Applications</span>
        </Link>

        {application.stage !== "Closed" && (
          <Button
            size="sm"
            variant="ghost"
            className="text-danger hover:bg-danger-soft hover:text-danger"
            onClick={() => setIsWithdrawModalOpen(true)}
          >
            Withdraw Application
          </Button>
        )}
      </div>

      {/* Header Banner */}
      <Card className="p-6 sm:p-8 bg-surface border-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <img
            src={application.organizationLogo}
            alt={application.organizationName}
            className="w-14 h-14 rounded-2xl object-cover border border-border shrink-0"
          />
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-text-secondary">
              {application.organizationName}
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary mt-0.5">
              {application.jobTitle}
            </h1>
            <div className="flex items-center gap-3 text-xs text-text-muted mt-1.5">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {application.location} ({application.workMode})
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Applied {formatDate(application.appliedAt)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start sm:items-end gap-2">
          <StatusBadge status={application.stage} />
          {application.overallAlignment && (
            <MatchBadge score={application.overallAlignment} size="sm" />
          )}
        </div>
      </Card>

      {/* APPLICATION TIMELINE COMPONENT */}
      <Card className="p-6 sm:p-8 bg-surface border-border flex flex-col gap-6">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <h2 className="text-base font-bold text-text-primary">Hiring Pipeline Progress</h2>
          <span className="text-xs text-text-muted">Direct telemetry from hiring team</span>
        </div>

        {/* Vertical Timeline Steps */}
        <div className="relative pl-6 sm:pl-8 flex flex-col gap-8 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-border">
          {application.timeline.map((event, idx) => {
            return (
              <div key={event.id} className="relative flex flex-col gap-1.5">
                {/* Node dot */}
                <div
                  className={`absolute -left-6 sm:-left-8 top-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs ${
                    event.completed
                      ? "bg-primary border-primary text-white"
                      : event.active
                      ? "bg-surface border-primary text-primary ring-4 ring-primary/20"
                      : "bg-surface border-border text-text-muted"
                  }`}
                >
                  {event.completed ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-current" />
                  )}
                </div>

                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="text-sm font-bold text-text-primary">{event.title}</h3>
                  <span className="text-[11px] text-text-muted whitespace-nowrap">
                    {event.date !== "Pending" ? formatDate(event.date) : "Pending"}
                  </span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed max-w-xl">
                  {event.description}
                </p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Submitted Screening Answers */}
      {application.screeningAnswers && application.screeningAnswers.length > 0 && (
        <Card className="p-6 bg-surface border-border flex flex-col gap-4">
          <h2 className="text-base font-bold text-text-primary">
            Your Screening Question Responses
          </h2>
          <div className="flex flex-col gap-3">
            {application.screeningAnswers.map((sq, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-background border border-border-subtle flex flex-col gap-1">
                <span className="text-xs font-semibold text-text-primary">{sq.question}</span>
                <p className="text-xs text-text-secondary">{sq.answer}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Attached Resume */}
      <Card className="p-5 bg-surface border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-text-primary">{application.resumeFileName}</span>
            <span className="text-[11px] text-text-muted">Structured document submitted with application</span>
          </div>
        </div>

        <span className="text-xs text-success font-semibold flex items-center gap-1">
          <ShieldCheck className="w-4 h-4" /> Delivered Securely
        </span>
      </Card>

      {/* WITHDRAW CONFIRMATION MODAL */}
      <AlertDialog
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        onConfirm={handleWithdraw}
        title="Withdraw Application"
        description="Are you sure you want to withdraw your application for this position? This action will notify the hiring manager and close your active pipeline candidacy."
        confirmText="Yes, Withdraw Application"
        isDestructive
        isLoading={isWithdrawing}
      />
    </div>
  );
}
