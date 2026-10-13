"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusBadge, MatchBadge } from "@/components/ui/Badge";
import { AlertDialog } from "@/components/ui/Modal";
import { LoadingState, EmptyState } from "@/components/ui/States";
import { ResumePreviewModal } from "@/components/employer/ResumePreviewModal";
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
  UserCheck,
  Sparkles,
  Award,
  Video,
  Download,
  Eye,
  ExternalLink,
  MessageSquare,
  Briefcase,
} from "lucide-react";
import { Application, ApplicationStage, CandidateProfile, Interview } from "@/types";
import { getApplication, withdrawApplication } from "@/lib/api/applications";
import { getInterviewsForApplication } from "@/lib/api/interviews";
import { resolveCandidateProfileByEmailOrId } from "@/lib/api/candidate";
import { formatDate } from "@/lib/utils";

const STAGE_ORDER: ApplicationStage[] = [
  "Applied",
  "Screening",
  "Shortlisted",
  "Interview",
  "Decision",
];

export default function ApplicationTimelinePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [application, setApplication] = useState<Application | null>(null);
  const [candidateProfile, setCandidateProfile] = useState<CandidateProfile | null>(null);
  const [scheduledInterviews, setScheduledInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Resume Modal State
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);

  // Withdraw Modal State
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const app = await getApplication(id);
      if (app) {
        setApplication(app);
        const profile = resolveCandidateProfileByEmailOrId(app.candidateEmail, app.candidateId);
        setCandidateProfile(profile);

        const ints = await getInterviewsForApplication(app.id);
        setScheduledInterviews(ints);
      }
      setIsLoading(false);
    }
    load();

    const handleUpdate = () => {
      getApplication(id).then((app) => {
        if (app) {
          setApplication(app);
          getInterviewsForApplication(app.id).then(setScheduledInterviews);
        }
      });
    };
    window.addEventListener("tag_applications_updated", handleUpdate);
    window.addEventListener("tag_interviews_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("tag_applications_updated", handleUpdate);
      window.removeEventListener("tag_interviews_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
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
    return <LoadingState message="Loading application details..." />;
  }

  if (!application) {
    return (
      <EmptyState
        title="Application Not Found"
        description="The requested application could not be located in your active profile."
        action={{
          label: "Back to Applications",
          onClick: () => router.push("/candidate/applications"),
        }}
      />
    );
  }

  const currentStageIndex = STAGE_ORDER.indexOf(application.stage);
  const isClosed = application.stage === "Closed";

  const pipelineMilestones = [
    {
      stage: "Applied" as ApplicationStage,
      title: "Application Submitted",
      description: `Profile, credentials, and resume submitted directly to ${application.organizationName}.`,
      icon: CheckCircle2,
      activeContext: "Your application has been received and logged into the talent acquisition system.",
    },
    {
      stage: "Screening" as ApplicationStage,
      title: "Recruiter Review",
      description: `Talent acquisition is assessing your profile alignment against role criteria.`,
      icon: FileText,
      activeContext: "The hiring team is currently evaluating your qualifications and technical experience.",
    },
    {
      stage: "Shortlisted" as ApplicationStage,
      title: "Profile Shortlisted",
      description: `Hiring manager has selected your profile for forward technical assessment.`,
      icon: UserCheck,
      activeContext: `Congratulations! The hiring team at ${application.organizationName} has shortlisted your profile. You will be contacted regarding next steps.`,
    },
    {
      stage: "Interview" as ApplicationStage,
      title: "Interviews & Assessment",
      description: `Live technical, architectural, or managerial evaluations with the engineering team.`,
      icon: Calendar,
      activeContext: "You have advanced to interview rounds. Check below for meeting links and preparation instructions.",
    },
    {
      stage: "Decision" as ApplicationStage,
      title: "Final Decision & Offer",
      description: `Final leadership evaluation, compensation alignment, and formal employment offer.`,
      icon: Award,
      activeContext: "Your candidacy is in final evaluation with leadership. We will update you with offer details shortly.",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6 pb-20">
      {/* Top Breadcrumb & Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div className="flex items-center gap-2 text-xs font-semibold text-text-muted">
          <Link
            href="/candidate/applications"
            className="hover:text-primary transition-colors inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Applications</span>
          </Link>
          <span>/</span>
          <span className="text-text-primary font-bold truncate max-w-xs sm:max-w-md">
            {application.jobTitle}
          </span>
        </div>

        {!isClosed && (
          <Button
            size="sm"
            variant="ghost"
            className="text-danger hover:bg-danger-soft hover:text-danger text-xs font-bold self-start sm:self-auto"
            onClick={() => setIsWithdrawModalOpen(true)}
          >
            Withdraw Application
          </Button>
        )}
      </div>

      {/* Main Hero Requisition Card */}
      <Card className="p-6 sm:p-8 bg-surface border-border shadow-xs rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary-hover to-accent" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            {application.organizationLogo ? (
              <img
                src={application.organizationLogo}
                alt={application.organizationName}
                className="w-16 h-16 rounded-2xl object-contain bg-white border border-border shrink-0 p-1.5 shadow-2xs"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = "none";
                  const fallback = e.currentTarget.parentElement?.querySelector(".logo-fallback") as HTMLElement;
                  if (fallback) fallback.classList.remove("hidden");
                }}
              />
            ) : null}
            <div
              className={`w-16 h-16 rounded-2xl bg-primary-soft text-primary font-black flex items-center justify-center text-2xl border border-border shrink-0 shadow-2xs logo-fallback ${
                application.organizationLogo ? "hidden" : ""
              }`}
            >
              {(application.organizationName || "C").charAt(0).toUpperCase()}
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-text-secondary tracking-wide uppercase">
                  {application.organizationName}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-success-soft text-success">
                  <ShieldCheck className="w-3 h-3" />
                  MCA Verified
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-text-primary">
                {application.jobTitle}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted mt-1">
                <span className="inline-flex items-center gap-1 bg-background px-2.5 py-1 rounded-md border border-border-subtle">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  {application.location} ({application.workMode})
                </span>
                <span className="inline-flex items-center gap-1 bg-background px-2.5 py-1 rounded-md border border-border-subtle">
                  <Calendar className="w-3.5 h-3.5 text-text-muted" />
                  Applied {formatDate(application.appliedAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Right Badges */}
          <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2.5 pt-4 md:pt-0 border-t md:border-t-0 border-border-subtle">
            <StatusBadge status={application.stage} />
            {application.overallAlignment && (
              <MatchBadge score={application.overallAlignment} size="sm" />
            )}
          </div>
        </div>
      </Card>

      {/* Closed Status Banner if application is closed */}
      {isClosed && (
        <Card className="p-5 bg-slate-50 border-slate-200 flex items-start gap-3.5">
          <AlertTriangle className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <h3 className="text-sm font-bold text-slate-800">Application Concluded</h3>
            <p className="text-xs text-slate-600">
              This application has been closed or withdrawn. Thank you for your interest in {application.organizationName}.
            </p>
          </div>
        </Card>
      )}

      {/* Scheduled / Rescheduled / Cancelled Interview Card */}
      {scheduledInterviews.length > 0 && (
        <div className="flex flex-col gap-4">
          {scheduledInterviews.map((int) => {
            const isCancelled = int.status === "Cancelled";
            const isRescheduled = int.status === "Rescheduled";
            const isCompleted = int.status === "Completed";

            return (
              <Card
                key={int.id}
                className={`p-6 border shadow-xs rounded-2xl flex flex-col gap-4 ${
                  isCancelled
                    ? "bg-rose-50/50 border-rose-200"
                    : isRescheduled
                    ? "bg-amber-50/40 border-amber-200"
                    : isCompleted
                    ? "bg-emerald-50/40 border-emerald-200"
                    : "bg-gradient-to-r from-primary-soft/40 via-surface to-background border-primary/30"
                }`}
              >
                <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        isCancelled
                          ? "bg-rose-500"
                          : isRescheduled
                          ? "bg-amber-500 animate-pulse"
                          : isCompleted
                          ? "bg-emerald-500"
                          : "bg-primary animate-pulse"
                      }`}
                    />
                    <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">
                      {isCancelled
                        ? "Interview Session Cancelled"
                        : isRescheduled
                        ? "Interview Rescheduled / Updated"
                        : isCompleted
                        ? "Interview Completed"
                        : "Upcoming Interview Confirmed"}
                    </h2>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                      isCancelled
                        ? "bg-rose-100 text-rose-800 border border-rose-200"
                        : isRescheduled
                        ? "bg-amber-100 text-amber-900 border border-amber-200"
                        : isCompleted
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        : "bg-primary text-white"
                    }`}
                  >
                    {int.roundName || "Round 1"}
                  </span>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-3">
                      <span className="text-base font-bold text-text-primary flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-primary" />
                        {formatDate(int.scheduledAt)}
                      </span>
                      <span className="text-xs text-text-muted bg-background px-2 py-0.5 rounded border border-border">
                        {int.durationMinutes} Minutes (IST)
                      </span>
                    </div>

                    <div className="text-xs text-text-secondary flex items-center gap-2">
                      <span>
                        Interviewer: <strong>{int.interviewerName}</strong> ({int.interviewerRole})
                      </span>
                      {int.meetingPlatform && (
                        <span className="text-text-muted">· {int.meetingPlatform}</span>
                      )}
                    </div>

                    {int.candidateNote && (
                      <p className="text-xs text-text-muted bg-surface/80 p-2.5 rounded-lg border border-border-subtle mt-1">
                        <strong>Preparation Note:</strong> {int.candidateNote}
                      </p>
                    )}

                    {isCancelled && int.cancellationReason && (
                      <p className="text-xs text-rose-700 bg-rose-100/70 p-2.5 rounded-lg border border-rose-200 mt-1 font-medium">
                        <strong>Cancellation Reason:</strong> {int.cancellationReason}
                      </p>
                    )}
                  </div>

                  {!isCancelled && !isCompleted && int.meetingLink && (
                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={int.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0"
                      >
                        <Button variant="primary" size="md" leftIcon={<Video className="w-4 h-4" />}>
                          Join Video Interview
                        </Button>
                      </a>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* HIRING PIPELINE PROGRESS TRACKER */}
      <Card className="p-6 sm:p-8 bg-surface border-border shadow-xs rounded-2xl flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-border">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-lg font-black tracking-tight text-text-primary">
              Hiring Pipeline Progress
            </h2>
            <p className="text-xs text-text-secondary">
              Direct telemetry from {application.organizationName} recruitment desk
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-xs font-bold text-text-primary">
              Stage: <span className="text-primary">{application.stage}</span>
            </span>
          </div>
        </div>

        {/* Linear Stepper */}
        <div className="flex flex-col gap-6">
          {pipelineMilestones.map((milestone, idx) => {
            const isCompleted = !isClosed && currentStageIndex > idx;
            const isActive = !isClosed && (currentStageIndex === idx || (currentStageIndex === -1 && idx === 0));
            const isUpcoming = !isCompleted && !isActive;

            const IconComponent = milestone.icon;

            return (
              <div
                key={milestone.stage}
                className={`flex items-start gap-4 p-4 rounded-xl transition-all border ${
                  isActive
                    ? "bg-primary-soft/30 border-primary/30 ring-1 ring-primary/20"
                    : isCompleted
                    ? "bg-background/40 border-border/60"
                    : "bg-surface border-border-subtle opacity-70"
                }`}
              >
                {/* Step indicator node */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
                    isCompleted
                      ? "bg-primary border-primary text-white shadow-2xs"
                      : isActive
                      ? "bg-surface border-primary text-primary ring-4 ring-primary/20 shadow-xs"
                      : "bg-background border-border text-text-muted"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  ) : (
                    <IconComponent className="w-4 h-4" />
                  )}
                </div>

                <div className="flex flex-col flex-1 gap-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <h3
                        className={`text-sm font-bold ${
                          isActive
                            ? "text-primary font-black"
                            : isCompleted
                            ? "text-text-primary"
                            : "text-text-muted"
                        }`}
                      >
                        {milestone.title}
                      </h3>

                      {isActive && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-primary text-white tracking-wider">
                          Active Stage
                        </span>
                      )}
                      {isCompleted && (
                        <span className="text-[10px] font-bold text-success bg-success-soft px-2 py-0.5 rounded-full">
                          Completed
                        </span>
                      )}
                    </div>

                    <span className="text-[11px] font-semibold text-text-muted">
                      {isCompleted || isActive ? (
                        idx === 0 ? formatDate(application.appliedAt) : "In Progress / Logged"
                      ) : (
                        "Pending"
                      )}
                    </span>
                  </div>

                  <p className="text-xs text-text-secondary leading-relaxed">
                    {milestone.description}
                  </p>

                  {/* Active Context Callout */}
                  {isActive && (
                    <div className="mt-2 p-3 bg-white border border-primary/20 rounded-lg text-xs text-text-primary flex items-start gap-2 shadow-2xs">
                      <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>{milestone.activeContext}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Grid: Resume + Screening Answers + Requisition Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Submitted Resume Card */}
          <Card className="p-6 bg-surface border-border shadow-xs rounded-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-sm font-bold text-text-primary">Submitted Candidate Resume</h3>
              <span className="text-xs text-success font-semibold flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" /> Delivered Securely
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-background border border-border-subtle">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-text-primary">
                    {application.resumeFileName || "Candidate_Resume.pdf"}
                  </span>
                  <span className="text-[11px] text-text-muted">
                    Structured PDF submitted with verified application
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="text-xs font-bold"
                leftIcon={<Eye className="w-3.5 h-3.5" />}
                onClick={() => setIsResumeModalOpen(true)}
              >
                View Resume
              </Button>
            </div>
          </Card>

          {/* Submitted Screening Questions */}
          {application.screeningAnswers && application.screeningAnswers.length > 0 && (
            <Card className="p-6 bg-surface border-border shadow-xs rounded-2xl flex flex-col gap-4">
              <h3 className="text-sm font-bold text-text-primary">
                Screening Question Responses
              </h3>
              <div className="flex flex-col gap-3">
                {application.screeningAnswers.map((sq, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-background border border-border-subtle flex flex-col gap-1.5"
                  >
                    <span className="text-xs font-bold text-text-primary">
                      {sq.question}
                    </span>
                    <p className="text-xs text-text-secondary leading-relaxed bg-surface p-2.5 rounded-lg border border-border-subtle">
                      {sq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right Column (1 Col) */}
        <div className="flex flex-col gap-6">
          {/* Requisition Overview Card */}
          <Card className="p-6 bg-surface border-border shadow-xs rounded-2xl flex flex-col gap-4">
            <h3 className="text-sm font-bold text-text-primary">Role Overview</h3>

            <div className="flex flex-col gap-3 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-border-subtle">
                <span className="text-text-muted">Organization</span>
                <span className="font-bold text-text-primary">{application.organizationName}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-border-subtle">
                <span className="text-text-muted">Location Mode</span>
                <span className="font-bold text-text-primary">{application.workMode}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-border-subtle">
                <span className="text-text-muted">Applied Date</span>
                <span className="font-bold text-text-primary">{formatDate(application.appliedAt)}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-border-subtle">
                <span className="text-text-muted">Application ID</span>
                <span className="font-mono text-[10px] text-text-secondary">{application.id}</span>
              </div>
            </div>

            <Link href={`/jobs/${application.jobSlug || application.jobId}`}>
              <Button variant="outline" size="sm" className="w-full text-xs font-bold" rightIcon={<ChevronRight className="w-3.5 h-3.5" />}>
                View Original Job Post
              </Button>
            </Link>
          </Card>
        </div>
      </div>

      {/* RESUME PREVIEW MODAL */}
      <ResumePreviewModal
        isOpen={isResumeModalOpen}
        onClose={() => setIsResumeModalOpen(false)}
        candidateProfile={candidateProfile}
        application={application}
      />

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
