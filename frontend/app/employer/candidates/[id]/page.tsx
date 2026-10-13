"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { MatchBadge, StatusBadge, SkillBadge } from "@/components/ui/Badge";
import { Modal, AlertDialog } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { MatchScore } from "@/components/matching/MatchScore";
import { MatchEvidence } from "@/components/matching/MatchEvidence";
import { LoadingState, EmptyState } from "@/components/ui/States";
import { ResumePreviewModal } from "@/components/employer/ResumePreviewModal";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Lock,
  Mail,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Building2,
  GraduationCap,
  Sparkles,
  UserCheck,
  XCircle,
  FileText,
  Briefcase,
  Award,
  Phone,
  Clock,
  ExternalLink,
  ChevronRight,
  Download,
} from "lucide-react";
import { Application, ApplicationStage, MatchResult, CandidateProfile, Interview } from "@/types";
import { getApplication, updateApplicationStage, addRecruiterNote } from "@/lib/api/applications";
import { getMatchEvidence } from "@/lib/api/matching";
import { getInterviewsForApplication } from "@/lib/api/interviews";
import { resolveCandidateProfileByEmailOrId } from "@/lib/api/candidate";
import { formatDate } from "@/lib/utils";
import {
  InterviewStatusBadge,
  ScheduleInterviewModal,
  EditInterviewModal,
  CancelInterviewModal,
  InterviewDetailsModal,
  InterviewCard,
} from "@/components/interview";
import { Video, Copy, Edit2, AlertCircle } from "lucide-react";

const PIPELINE_STAGES: ApplicationStage[] = [
  "Applied",
  "Screening",
  "Shortlisted",
  "Interview",
  "Decision",
  "Closed",
];

export default function CandidateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const appId = (params?.id as string) || "app_01";

  const [application, setApplication] = useState<Application | null>(null);
  const [candidateProfile, setCandidateProfile] = useState<CandidateProfile | null>(null);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Active view tab
  const [activeTab, setActiveTab] = useState<"profile" | "application" | "resume" | "notes" | "interviews">("profile");

  // Private note input
  const [newNote, setNewNote] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Resume Modal State
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);

  // Interviews State & Modals
  const [candidateInterviews, setCandidateInterviews] = useState<Interview[]>([]);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingInterview, setEditingInterview] = useState<Interview | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancellingInterview, setCancellingInterview] = useState<Interview | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [viewingInterview, setViewingInterview] = useState<Interview | null>(null);
  const [interviewerName, setInterviewerName] = useState("Alen William");

  // Rejection alert dialog
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const app = await getApplication(appId);
      if (app) {
        setApplication(app);
        const [match, ints] = await Promise.all([
          getMatchEvidence(app.candidateId, app.jobId),
          getInterviewsForApplication(app.id),
        ]);
        setMatchResult(match);
        setCandidateInterviews(ints);
        const profile = resolveCandidateProfileByEmailOrId(app.candidateEmail, app.candidateId);
        setCandidateProfile(profile);
      }
      if (typeof window !== "undefined") {
        try {
          const authRaw = localStorage.getItem("tag_auth_user");
          if (authRaw) {
            const auth = JSON.parse(authRaw);
            if (auth.name) setInterviewerName(auth.name);
          }
        } catch {}
      }
      setIsLoading(false);
    }
    load();

    const handleInterviewsUpdate = async () => {
      if (appId) {
        const ints = await getInterviewsForApplication(appId);
        setCandidateInterviews(ints);
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("tag_interviews_updated", handleInterviewsUpdate);
      return () => {
        window.removeEventListener("tag_interviews_updated", handleInterviewsUpdate);
      };
    }
  }, [appId]);

  const handleStageUpdate = async (stage: ApplicationStage, noteText?: string) => {
    if (!application) return;
    const updated = await updateApplicationStage(application.id, stage, noteText);
    setApplication(updated);
    showFeedback(`Candidate status updated to "${stage}"`);
  };

  const handleShortlist = async () => {
    await handleStageUpdate("Shortlisted", "Shortlisted by hiring manager after profile review.");
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !application) return;
    setIsAddingNote(true);
    const updated = await addRecruiterNote(
      application.id,
      newNote.trim(),
      "Hiring Manager"
    );
    setApplication(updated);
    setNewNote("");
    setIsAddingNote(false);
    showFeedback("Private hiring note added.");
  };

  const handleInterviewScheduled = async (newInterview: Interview) => {
    setCandidateInterviews((prev) => [newInterview, ...prev.filter((i) => i.id !== newInterview.id)]);
    if (application) {
      const updated = await updateApplicationStage(
        application.id,
        "Interview",
        `Scheduled ${newInterview.roundName || "interview"} with ${newInterview.interviewerName}. Video Link: ${newInterview.meetingLink}`
      );
      setApplication(updated);
    }
    showFeedback(`Interview successfully scheduled with ${newInterview.interviewerName}`);
  };

  const handleInterviewUpdated = async (updated: Interview) => {
    setCandidateInterviews((prev) =>
      prev.map((i) => (i.id === updated.id ? updated : i))
    );
    if (application) {
      const updatedApp = await updateApplicationStage(
        application.id,
        application.stage,
        `Rescheduled ${updated.roundName || "interview"} with ${updated.interviewerName} to ${formatDate(updated.scheduledAt)}.`
      );
      setApplication(updatedApp);
    }
    showFeedback("Interview details updated.");
  };

  const handleInterviewCancelled = async (cancelled: Interview) => {
    setCandidateInterviews((prev) =>
      prev.map((i) => (i.id === cancelled.id ? cancelled : i))
    );
    if (application) {
      const updatedApp = await updateApplicationStage(
        application.id,
        application.stage,
        `Interview cancelled: ${cancelled.cancellationReason || "By employer"}`
      );
      setApplication(updatedApp);
    }
    showFeedback("Interview cancelled.");
  };

  const handleRejectConfirm = async () => {
    if (!application) return;
    await updateApplicationStage(
      application.id,
      "Closed",
      "Candidate not advancing based on current team criteria."
    );
    setIsRejectDialogOpen(false);
    showFeedback("Candidate marked as rejected.");
    router.push(`/employer/jobs/${application.jobId}/pipeline`);
  };

  const showFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  if (isLoading || !application) {
    return <LoadingState message="Loading candidate credentials and explainable citations..." />;
  }

  const isShortlisted = application.stage === "Shortlisted";

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6 pb-16">
      {/* Action Notification Toast */}
      {feedbackMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#0A66C2] text-white px-4 py-2.5 rounded-xl shadow-lg text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Top back navigation */}
      <div className="flex items-center justify-between">
        <Link
          href={`/employer/jobs/${application.jobId}/pipeline`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#0A66C2] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Candidate Pipeline</span>
        </Link>

        <Link
          href="/employer/candidates"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#0A66C2] transition-colors"
        >
          <span>All Company Applicants</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Candidate Header Hero Card */}
      <Card className="p-6 sm:p-8 bg-white border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        <div className="flex items-start gap-5">
          {application.candidateAvatar ? (
            <img
              src={application.candidateAvatar}
              alt={application.candidateName}
              className="w-20 h-20 rounded-2xl object-cover border border-slate-200 shrink-0"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = "none";
                const fallback = e.currentTarget.parentElement?.querySelector(".avatar-fallback") as HTMLElement;
                if (fallback) fallback.classList.remove("hidden");
              }}
            />
          ) : null}
          <div
            className={`w-20 h-20 rounded-2xl bg-[#0A66C2] text-white font-black flex items-center justify-center text-2xl border border-slate-200 shrink-0 avatar-fallback ${
              application.candidateAvatar ? "hidden" : ""
            }`}
          >
            {(application.candidateName || "C").charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                {application.candidateName}
              </h1>
              <StatusBadge status={application.stage} />
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
              {application.candidateHeadline}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2 font-medium">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {application.location}
              </span>
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {application.candidateEmail}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Applied {formatDate(application.appliedAt)}
              </span>
            </div>

            {/* Requisition Reference */}
            <div className="flex items-center gap-2 mt-3 text-xs bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl self-start">
              <Briefcase className="w-3.5 h-3.5 text-[#0A66C2]" />
              <span className="text-slate-500 font-medium">Requisition:</span>
              <Link
                href={`/employer/jobs/${application.jobId}`}
                className="font-bold text-[#0A66C2] hover:underline"
              >
                {application.jobTitle}
              </Link>
            </div>
          </div>
        </div>

        {/* Action Panel: Shortlist, Reject, View Resume, Change Status */}
        <div className="flex flex-col gap-2.5 shrink-0 w-full lg:w-56 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100">
          {/* Change Application Status Dropdown */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Change Application Status:
            </label>
            <select
              value={application.stage}
              onChange={(e) => handleStageUpdate(e.target.value as ApplicationStage)}
              className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0A66C2]/30"
            >
              {PIPELINE_STAGES.map((s) => (
                <option key={s} value={s}>
                  Status: {s}
                </option>
              ))}
            </select>
          </div>

          {/* Active Interview Mini Widget or Schedule Interview Button */}
          {(() => {
            const activeInterview = candidateInterviews.find(
              (i) => i.status === "Scheduled" || i.status === "Rescheduled"
            );
            const latestInterview = candidateInterviews[0];

            if (activeInterview) {
              return (
                <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-200/80 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-sky-800 uppercase tracking-wider">
                      Active Interview
                    </span>
                    <InterviewStatusBadge status={activeInterview.status} size="sm" />
                  </div>

                  <div className="flex flex-col text-xs">
                    <span className="font-bold text-slate-900 leading-tight">
                      {activeInterview.roundName || "Round 1 - Technical"}
                    </span>
                    <span className="text-[11px] text-slate-600 mt-0.5">
                      {formatDate(activeInterview.scheduledAt)}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      With {activeInterview.interviewerName}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 pt-1">
                    <a
                      href={activeInterview.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button
                        size="sm"
                        variant="primary"
                        leftIcon={<Video className="w-3.5 h-3.5" />}
                        className="w-full justify-center text-xs h-7 py-1"
                      >
                        Join Call
                      </Button>
                    </a>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setViewingInterview(activeInterview);
                        setIsDetailsModalOpen(true);
                      }}
                      className="text-xs h-7 py-1 px-2"
                      title="View full details"
                    >
                      Details
                    </Button>
                  </div>

                  <div className="flex items-center justify-between border-t border-sky-100 pt-1.5 text-[11px]">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingInterview(activeInterview);
                        setIsEditModalOpen(true);
                      }}
                      className="text-[#0A66C2] hover:underline font-semibold"
                    >
                      Edit / Reschedule
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCancellingInterview(activeInterview);
                        setIsCancelModalOpen(true);
                      }}
                      className="text-rose-600 hover:underline font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              );
            }

            if (latestInterview && latestInterview.status === "Completed") {
              return (
                <div className="flex flex-col gap-2">
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs flex items-center justify-between">
                    <span className="font-bold text-emerald-800">Round Completed</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setViewingInterview(latestInterview);
                        setIsDetailsModalOpen(true);
                      }}
                      className="text-[11px] h-6 px-2"
                    >
                      Scorecard
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    variant="primary"
                    leftIcon={<Calendar className="w-3.5 h-3.5" />}
                    onClick={() => setIsScheduleModalOpen(true)}
                    className="w-full justify-center"
                  >
                    Schedule Next Round
                  </Button>
                </div>
              );
            }

            return (
              <div className="flex flex-col gap-1">
                <Button
                  size="sm"
                  variant="primary"
                  leftIcon={<Calendar className="w-3.5 h-3.5" />}
                  onClick={() => setIsScheduleModalOpen(true)}
                  className="w-full justify-center"
                >
                  Schedule Interview
                </Button>
                {latestInterview && latestInterview.status === "Cancelled" && (
                  <span className="text-[10px] text-slate-500 text-center italic">
                    Previous round was cancelled
                  </span>
                )}
              </div>
            );
          })()}

          {/* Shortlist Candidate Button */}
          {!isShortlisted ? (
            <Button
              size="sm"
              variant="outline"
              leftIcon={<UserCheck className="w-3.5 h-3.5 text-emerald-600" />}
              onClick={handleShortlist}
              className="w-full justify-center border-emerald-200 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100 hover:text-emerald-800"
            >
              Shortlist Candidate
            </Button>
          ) : (
            <div className="w-full py-2 px-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Candidate Shortlisted</span>
            </div>
          )}

          {/* View Resume Button */}
          <Button
            size="sm"
            variant="outline"
            leftIcon={<FileText className="w-3.5 h-3.5 text-[#0A66C2]" />}
            onClick={() => setIsResumeModalOpen(true)}
            className="w-full justify-center"
          >
            View Resume
          </Button>

          {/* Reject Candidate Button */}
          {application.stage !== "Closed" && (
            <Button
              size="sm"
              variant="ghost"
              leftIcon={<XCircle className="w-3.5 h-3.5 text-rose-500" />}
              onClick={() => setIsRejectDialogOpen(true)}
              className="w-full justify-center text-rose-600 hover:bg-rose-50 hover:text-rose-700"
            >
              Reject Candidate
            </Button>
          )}
        </div>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-px text-xs font-bold overflow-x-auto">
        <button
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-2.5 rounded-t-xl border-b-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === "profile"
              ? "border-[#0A66C2] text-[#0A66C2] bg-white font-black"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Candidate Profile</span>
        </button>

        <button
          onClick={() => setActiveTab("application")}
          className={`px-4 py-2.5 rounded-t-xl border-b-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === "application"
              ? "border-[#0A66C2] text-[#0A66C2] bg-white font-black"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>AI Criteria Alignment ({matchResult?.overallAlignment || application.overallAlignment}%)</span>
        </button>

        <button
          onClick={() => setActiveTab("resume")}
          className={`px-4 py-2.5 rounded-t-xl border-b-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === "resume"
              ? "border-[#0A66C2] text-[#0A66C2] bg-white font-black"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Resume & Documents</span>
        </button>

        <button
          onClick={() => setActiveTab("interviews")}
          className={`px-4 py-2.5 rounded-t-xl border-b-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === "interviews"
              ? "border-[#0A66C2] text-[#0A66C2] bg-white font-black"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Interviews ({candidateInterviews.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("notes")}
          className={`px-4 py-2.5 rounded-t-xl border-b-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === "notes"
              ? "border-[#0A66C2] text-[#0A66C2] bg-white font-black"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Hiring Team Notes ({application.recruiterNotes?.length || 0})</span>
        </button>
      </div>

      {/* TAB 1: CANDIDATE PROFILE */}
      {activeTab === "profile" && (
        <div className="flex flex-col gap-6">
          {/* About / Summary Card */}
          <Card className="p-6 bg-white border-slate-200 flex flex-col gap-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              About Candidate
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
              {candidateProfile?.summary ||
                "Product-focused professional with background qualifications matching stated job criteria."}
            </p>
          </Card>

          {/* Work Experience */}
          <Card className="p-6 bg-white border-slate-200 flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Briefcase className="w-5 h-5 text-[#0A66C2]" />
              <h3 className="text-base font-bold text-slate-900">
                Work Experience
              </h3>
            </div>

            {candidateProfile?.experiences && candidateProfile.experiences.length > 0 ? (
              <div className="flex flex-col gap-5 divide-y divide-slate-100">
                {candidateProfile.experiences.map((exp, idx) => (
                  <div key={idx} className={`flex flex-col gap-1.5 text-xs ${idx > 0 ? "pt-4" : ""}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span className="font-extrabold text-slate-900 text-sm">
                        {exp.title}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md self-start sm:self-auto">
                        {exp.startDate} – {exp.current ? "Present" : exp.endDate || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 font-semibold">
                      <span>{exp.company}</span>
                      <span>•</span>
                      <span>{exp.location}</span>
                    </div>
                    {exp.description && (
                      <p className="text-slate-600 leading-relaxed mt-1">
                        {exp.description}
                      </p>
                    )}
                    {exp.skillsUsed && exp.skillsUsed.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {exp.skillsUsed.map((sk, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-2 py-0.5 rounded-md bg-blue-50 text-[#0A66C2] text-[10px] font-bold border border-blue-200"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No formal employment entries listed.</p>
            )}
          </Card>

          {/* Education & Skills Side-by-Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Education */}
            <Card className="p-6 bg-white border-slate-200 flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <GraduationCap className="w-5 h-5 text-[#0A66C2]" />
                <h3 className="text-base font-bold text-slate-900">Education</h3>
              </div>

              {candidateProfile?.education && candidateProfile.education.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {candidateProfile.education.map((edu, idx) => (
                    <div key={idx} className="flex flex-col gap-1 text-xs">
                      <span className="font-bold text-slate-900 text-sm">
                        {edu.degree} in {edu.fieldOfStudy}
                      </span>
                      <span className="text-slate-600 font-medium">{edu.institution}</span>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span>
                          {edu.startYear} – {edu.endYear}
                        </span>
                        {edu.grade && <span>• Grade: {edu.grade}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No education entries listed.</p>
              )}
            </Card>

            {/* Verified Skills */}
            <Card className="p-6 bg-white border-slate-200 flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Sparkles className="w-5 h-5 text-[#0A66C2]" />
                <h3 className="text-base font-bold text-slate-900">Verified Skills</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {candidateProfile?.skills && candidateProfile.skills.length > 0 ? (
                  candidateProfile.skills.map((s, idx) => {
                    const sName = typeof s === "string" ? s : s.name;
                    return (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#0A66C2] text-xs font-bold border border-blue-200"
                      >
                        {sName}
                      </span>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-500 italic">No skills listed.</p>
                )}
              </div>
            </Card>
          </div>

          {/* Certifications */}
          {candidateProfile?.certifications && candidateProfile.certifications.length > 0 && (
            <Card className="p-6 bg-white border-slate-200 flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Award className="w-5 h-5 text-[#0A66C2]" />
                <h3 className="text-base font-bold text-slate-900">Certifications</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {candidateProfile.certifications.map((c, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-1"
                  >
                    <span className="font-bold text-slate-900">{c.name}</span>
                    <span className="text-[11px] text-slate-500">
                      {c.issuingOrganization} • {c.issueDate}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* TAB 2: APPLICATION & MATCHING */}
      {activeTab === "application" && (
        <div className="flex flex-col gap-6">
          {/* EXPLAINABLE CRITERIA ALIGNMENT BREAKDOWN */}
          {matchResult && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-bold text-slate-900">
                    Candidate Criteria Alignment ({matchResult.overallAlignment}%)
                  </h2>
                </div>
                <span className="text-xs text-slate-500">
                  Published Criteria vs Verified Candidate Profile
                </span>
              </div>

              <MatchScore matchResult={matchResult} />
              <MatchEvidence
                matched={matchResult.matched}
                missing={matchResult.missing}
                unknown={matchResult.unknown}
              />
            </div>
          )}

          {/* SCREENING ANSWERS */}
          {application.screeningAnswers && application.screeningAnswers.length > 0 && (
            <Card className="p-6 bg-white border-slate-200 flex flex-col gap-4">
              <h3 className="text-base font-bold text-slate-900">
                Candidate Screening Responses
              </h3>
              <div className="flex flex-col gap-3">
                {application.screeningAnswers.map((sq, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-1 text-xs"
                  >
                    <span className="font-semibold text-slate-900">{sq.question}</span>
                    <p className="text-slate-600 mt-0.5">{sq.answer}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* APPLICATION TIMELINE */}
          <Card className="p-6 bg-white border-slate-200 flex flex-col gap-4">
            <h3 className="text-base font-bold text-slate-900">Application Timeline</h3>
            <div className="flex flex-col gap-3">
              {application.timeline.map((event, idx) => (
                <div key={event.id || idx} className="flex items-start gap-3 text-xs">
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-[#0A66C2] flex items-center justify-center shrink-0 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{event.title}</span>
                      <span className="text-[11px] text-slate-400">
                        {formatDate(event.date)}
                      </span>
                    </div>
                    <p className="text-slate-500 mt-0.5">{event.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: RESUME & DOCUMENTS */}
      {activeTab === "resume" && (
        <Card className="p-6 sm:p-8 bg-white border-slate-200 flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#0A66C2] flex items-center justify-center font-bold">
                <FileText className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-slate-900 text-sm">
                  {application.resumeFileName || "Candidate_Resume.pdf"}
                </span>
                <span className="text-xs text-slate-500">
                  Verified Candidate ATS Resume
                </span>
              </div>
            </div>

            <Button
              variant="primary"
              size="sm"
              leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
              onClick={() => setIsResumeModalOpen(true)}
            >
              Open Interactive Resume Viewer
            </Button>
          </div>

          {/* Inline Resume Overview */}
          <div className="border border-slate-200 rounded-2xl p-6 flex flex-col gap-4 text-xs">
            <h4 className="font-black text-slate-900 text-base">ATS Parsed Resume Summary</h4>
            <div className="flex flex-col gap-2 text-slate-700 leading-relaxed">
              <p>
                <strong>Candidate:</strong> {application.candidateName}
              </p>
              <p>
                <strong>Headline:</strong> {application.candidateHeadline}
              </p>
              <p>
                <strong>Email:</strong> {application.candidateEmail}
              </p>
              <p>
                <strong>Applied Requisition:</strong> {application.jobTitle}
              </p>
              <p>
                <strong>Key Skills:</strong>{" "}
                {candidateProfile?.skills
                  ?.map((s) => (typeof s === "string" ? s : s.name))
                  .join(", ") || "TypeScript, React, Node.js"}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* TAB 4: HIRING NOTES */}
      {activeTab === "notes" && (
        <Card className="p-6 bg-white border-slate-200 flex flex-col gap-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-600" />
              <h3 className="text-base font-bold text-slate-900">Internal Hiring Team Notes</h3>
            </div>
            <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              Only visible to your hiring team
            </span>
          </div>

          {/* Existing notes */}
          <div className="flex flex-col gap-3">
            {application.recruiterNotes && application.recruiterNotes.length > 0 ? (
              application.recruiterNotes.map((note) => (
                <div
                  key={note.id}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{note.authorName}</span>
                    <span className="text-[11px] text-slate-400">{formatDate(note.createdAt)}</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{note.content}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 py-2">No private notes added yet.</p>
            )}
          </div>

          {/* Add note form */}
          <form onSubmit={handleAddNote} className="flex flex-col gap-3 pt-2">
            <Textarea
              placeholder="Add confidential feedback, system design observations, or compensation considerations..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={2}
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                size="sm"
                variant="secondary"
                isLoading={isAddingNote}
                disabled={!newNote.trim()}
              >
                Add Private Note
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* TAB 5: INTERVIEW ROUNDS */}
      {activeTab === "interviews" && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Evaluation & Technical Interview Rounds
              </h3>
              <p className="text-xs text-slate-500">
                Coordinate video rooms, track interview stages, edit dates, and log decisions
              </p>
            </div>
            <Button
              size="sm"
              variant="primary"
              leftIcon={<Calendar className="w-3.5 h-3.5" />}
              onClick={() => setIsScheduleModalOpen(true)}
            >
              Schedule Interview Round
            </Button>
          </div>

          {candidateInterviews.length === 0 ? (
            <Card className="p-8 text-center bg-white border-slate-200 flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-full bg-sky-50 flex items-center justify-center text-primary">
                <Calendar className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">No Interviews Scheduled Yet</h4>
              <p className="text-xs text-slate-500 max-w-sm">
                Coordinate with the candidate by setting up a technical screen, architecture discussion, or hiring manager review.
              </p>
              <Button
                size="sm"
                variant="primary"
                leftIcon={<Calendar className="w-3.5 h-3.5" />}
                onClick={() => setIsScheduleModalOpen(true)}
                className="mt-2"
              >
                Schedule First Round
              </Button>
            </Card>
          ) : (
            <div className="flex flex-col gap-4">
              {candidateInterviews.map((int) => (
                <InterviewCard
                  key={int.id}
                  interview={int}
                  showCandidateName={false}
                  onViewDetails={(item) => {
                    setViewingInterview(item);
                    setIsDetailsModalOpen(true);
                  }}
                  onEdit={(item) => {
                    setEditingInterview(item);
                    setIsEditModalOpen(true);
                  }}
                  onCancel={(item) => {
                    setCancellingInterview(item);
                    setIsCancelModalOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* SCHEDULE INTERVIEW MODAL */}
      <ScheduleInterviewModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        applicationId={application.id}
        candidateId={application.candidateId}
        candidateName={application.candidateName}
        candidateEmail={application.candidateEmail}
        jobId={application.jobId}
        jobTitle={application.jobTitle}
        defaultInterviewerName={interviewerName}
        onScheduled={handleInterviewScheduled}
      />

      {/* EDIT INTERVIEW MODAL */}
      <EditInterviewModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingInterview(null);
        }}
        interview={editingInterview}
        onUpdated={handleInterviewUpdated}
      />

      {/* CANCEL INTERVIEW MODAL */}
      <CancelInterviewModal
        isOpen={isCancelModalOpen}
        onClose={() => {
          setIsCancelModalOpen(false);
          setCancellingInterview(null);
        }}
        interview={cancellingInterview}
        onCancelled={handleInterviewCancelled}
      />

      {/* INTERVIEW DETAILS MODAL */}
      <InterviewDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setViewingInterview(null);
        }}
        interview={viewingInterview}
        onEdit={(item) => {
          setEditingInterview(item);
          setIsEditModalOpen(true);
        }}
        onCancel={(item) => {
          setCancellingInterview(item);
          setIsCancelModalOpen(true);
        }}
      />

      {/* REJECTION CONFIRMATION ALERT */}
      <AlertDialog
        isOpen={isRejectDialogOpen}
        onClose={() => setIsRejectDialogOpen(false)}
        onConfirm={handleRejectConfirm}
        title="Confirm Candidate Rejection"
        description="Are you sure you want to decline this candidate? They will be removed from active pipeline stages and notified politely."
        confirmText="Confirm Rejection"
        isDestructive
      />

      {/* INTERACTIVE RESUME PREVIEW MODAL */}
      <ResumePreviewModal
        isOpen={isResumeModalOpen}
        onClose={() => setIsResumeModalOpen(false)}
        candidateProfile={candidateProfile}
        application={application}
      />
    </div>
  );
}
