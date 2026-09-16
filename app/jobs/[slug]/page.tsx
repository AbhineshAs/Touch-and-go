"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge, MatchBadge, SkillBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Checkbox } from "@/components/ui/Select";
import { MatchScore } from "@/components/matching/MatchScore";
import { MatchEvidence } from "@/components/matching/MatchEvidence";
import { LoadingState, EmptyState } from "@/components/ui/States";
import { useAuth } from "@/lib/auth/AuthContext";
import { AuthGateModal } from "@/components/auth/AuthGateModal";
import {
  MapPin,
  Building2,
  ShieldCheck,
  Bookmark,
  Calendar,
  Sparkles,
  CheckCircle2,
  ArrowLeft,
  Share2,
  Send,
  FileText,
  UserCheck,
} from "lucide-react";
import { Job, MatchResult } from "@/types";
import { getJobBySlug } from "@/lib/api/jobs";
import { getMatchEvidence } from "@/lib/api/matching";
import { getCandidateProfile, toggleSaveJob, getSavedJobIds } from "@/lib/api/candidate";
import { submitApplication } from "@/lib/api/applications";
import { formatSalaryRange, formatRelativeTime } from "@/lib/utils";

export default function JobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [job, setJob] = useState<Job | null>(null);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [candidateProfile, setCandidateProfile] = useState<any>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Auth Gate state
  const { isAuthenticated } = useAuth();
  const [authGateOpen, setAuthGateOpen] = useState(false);
  const [authGateAction, setAuthGateAction] = useState<"apply" | "save">("apply");

  // Application Modal state
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [screeningAnswers, setScreeningAnswers] = useState<Record<string, string>>({});
  const [consentGiven, setConsentGiven] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applicationSubmitted, setApplicationSubmitted] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const j = await getJobBySlug(slug);
      if (j) {
        setJob(j);
        const [match, profile, savedIds] = await Promise.all([
          getMatchEvidence("prof_cand_01", j.id),
          getCandidateProfile(),
          getSavedJobIds(),
        ]);
        setMatchResult(match);
        setCandidateProfile(profile);
        setIsSaved(savedIds.includes(j.id));
      }
      setIsLoading(false);
    }
    loadData();
  }, [slug]);

  const handleApplyClick = () => {
    if (!isAuthenticated) {
      setAuthGateAction("apply");
      setAuthGateOpen(true);
      return;
    }
    setIsApplyModalOpen(true);
  };

  const handleToggleSave = async () => {
    if (!job) return;
    if (!isAuthenticated) {
      setAuthGateAction("save");
      setAuthGateOpen(true);
      return;
    }
    setIsSaved(!isSaved);
    const res = await toggleSaveJob(job.id);
    setIsSaved(res.saved);
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job || !candidateProfile) return;

    setIsSubmitting(true);
    const answers = (job.screeningQuestions || []).map((sq) => ({
      questionId: sq.id,
      question: sq.question,
      answer: screeningAnswers[sq.id] || "Confirmed and acknowledged.",
    }));

    const app = await submitApplication(job.id, {
      jobSlug: job.slug,
      jobTitle: job.title,
      organizationId: job.organizationId,
      organizationName: job.organizationName,
      organizationLogo: job.organizationLogo,
      location: job.location,
      workMode: job.workMode,
      candidateId: candidateProfile.id,
      candidateName: candidateProfile.fullName,
      candidateHeadline: candidateProfile.headline,
      candidateEmail: candidateProfile.email,
      candidateAvatar: candidateProfile.avatarUrl,
      resumeFileName: candidateProfile.resumeFileName || "Ananya_Sharma_Resume.pdf",
      screeningAnswers: answers,
    });

    setIsSubmitting(false);
    setApplicationSubmitted(app.id);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <PublicNavbar />
        <div className="max-w-4xl mx-auto py-20 px-4 w-full">
          <LoadingState message="Loading job specifications and match criteria..." />
        </div>
        <Footer />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <PublicNavbar />
        <div className="max-w-3xl mx-auto py-20 px-4 text-center">
          <EmptyState
            title="Opportunity Not Found"
            description="The requested job posting may have been paused, unlisted, or expired."
            action={{
              label: "Browse Open Positions",
              onClick: () => router.push("/jobs"),
            }}
          />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-text-primary">
      <PublicNavbar />

      {/* Top Breadcrumb Header */}
      <div className="bg-surface border-b border-border py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Job Search</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted">Job ID: {job.id}</span>
          </div>
        </div>
      </div>

      {/* Main Layout Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Left Content Area */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            {/* Job Header Hero */}
            <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-border shadow-xs flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <img
                    src={job.organizationLogo}
                    alt={job.organizationName}
                    className="w-16 h-16 rounded-2xl object-cover border border-border shrink-0"
                  />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/companies/${job.organizationId}`}
                        className="text-xs font-semibold text-text-secondary hover:text-primary transition-colors"
                      >
                        {job.organizationName}
                      </Link>
                      {job.organizationVerified && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-success bg-success-soft px-2 py-0.5 rounded-full border border-success/20">
                          <ShieldCheck className="w-3 h-3" /> Verified Employer
                        </span>
                      )}
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary mt-1">
                      {job.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-text-secondary mt-2">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-text-muted" />
                        {job.location}
                      </span>
                      <span>•</span>
                      <span className="px-2 py-0.5 rounded bg-border-subtle font-medium text-[11px]">
                        {job.workMode}
                      </span>
                      <span>•</span>
                      <span>{job.employmentType}</span>
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                  {matchResult && (
                    <MatchBadge score={matchResult.overallAlignment} size="lg" />
                  )}
                  <span className="text-[11px] text-text-muted">
                    Posted {formatRelativeTime(job.publishedAt)}
                  </span>
                </div>
              </div>

              {/* Salary & Meta Row */}
              <div className="p-4 rounded-xl bg-background border border-border-subtle flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                    Published Compensation
                  </span>
                  <span className="text-base sm:text-lg font-bold text-text-primary">
                    {formatSalaryRange(job.minSalaryINR, job.maxSalaryINR, job.salaryPeriod)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                    Experience Requirement
                  </span>
                  <span className="text-sm font-semibold text-text-primary">
                    {job.experienceLevel}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                    Department
                  </span>
                  <span className="text-sm font-semibold text-text-primary">{job.department}</span>
                </div>
              </div>
            </div>

            {/* EXPLAINABLE MATCHING SECTION */}
            {matchResult && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-bold text-text-primary">Your Criteria Alignment</h2>
                  </div>
                  <span className="text-xs text-text-muted">
                    Based on your confirmed profile credentials
                  </span>
                </div>

                <MatchScore matchResult={matchResult} />
                <MatchEvidence
                  matched={matchResult.matched}
                  missing={matchResult.missing}
                  unknown={matchResult.unknown}
                  candidateId={candidateProfile?.id}
                  jobId={job.id}
                />
              </div>
            )}

            {/* ROLE DETAILS */}
            <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-border shadow-xs flex flex-col gap-6">
              {/* About Role */}
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-bold text-text-primary">About the Role</h3>
                <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                  {job.summary}
                </p>
              </div>

              {/* Responsibilities */}
              <div className="flex flex-col gap-3 pt-6 border-t border-border-subtle">
                <h3 className="text-base font-bold text-text-primary">Responsibilities</h3>
                <ul className="flex flex-col gap-2.5">
                  {job.responsibilities.map((resp, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-text-secondary">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Must Have Skills */}
              <div className="flex flex-col gap-3 pt-6 border-t border-border-subtle">
                <h3 className="text-base font-bold text-text-primary">Required Must-Have Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {job.mustHaveSkills.map((s) => (
                    <SkillBadge key={s} name={s} verified />
                  ))}
                </div>
              </div>

              {/* Preferred Skills */}
              {job.preferredSkills.length > 0 && (
                <div className="flex flex-col gap-3 pt-6 border-t border-border-subtle">
                  <h3 className="text-base font-bold text-text-primary">Preferred Qualifications</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.preferredSkills.map((s) => (
                      <SkillBadge key={s} name={s} />
                    ))}
                  </div>
                </div>
              )}

              {/* Benefits */}
              {job.benefits.length > 0 && (
                <div className="flex flex-col gap-3 pt-6 border-t border-border-subtle">
                  <h3 className="text-base font-bold text-text-primary">Benefits & Perks</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {job.benefits.map((b, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-background border border-border-subtle flex items-center gap-2.5 text-xs text-text-secondary font-medium"
                      >
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Sticky Application Panel */}
          <aside className="lg:col-span-1 sticky top-24 flex flex-col gap-5">
            <Card className="p-6 flex flex-col gap-5 border-border shadow-md">
              <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
                <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                  Application Process
                </span>
                <span className="text-xs text-success font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Direct Employer
                </span>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  size="lg"
                  variant="primary"
                  className="w-full text-base font-semibold shadow-xs"
                  onClick={handleApplyClick}
                >
                  Apply Now
                </Button>

                <Button
                  size="md"
                  variant="secondary"
                  className="w-full"
                  leftIcon={
                    <Bookmark
                      className={`w-4 h-4 ${isSaved ? "fill-primary text-primary" : ""}`}
                    />
                  }
                  onClick={handleToggleSave}
                >
                  {isSaved ? "Job Saved" : "Save For Later"}
                </Button>
              </div>

              <div className="p-3.5 rounded-xl bg-background border border-border-subtle flex flex-col gap-2 text-xs text-text-secondary">
                <div className="flex items-center justify-between">
                  <span>Current Applicants:</span>
                  <strong className="text-text-primary">{job.applicantsCount} candidates</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Candidate Review SLA:</span>
                  <strong className="text-text-primary">Within 3 business days</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Profile Privacy:</span>
                  <strong className="text-text-primary">Verified Employer only</strong>
                </div>
              </div>

              {/* Organization Snippet */}
              <div className="pt-4 border-t border-border-subtle flex flex-col gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-text-muted" />
                  <span className="font-semibold text-text-primary">{job.organizationName}</span>
                </div>
                <p className="text-text-muted text-[11px] leading-relaxed">
                  Verified entity under Ministry of Corporate Affairs regulations. Zero third-party recruiters.
                </p>
                <Link
                  href={`/companies/${job.organizationId}`}
                  className="text-primary hover:underline font-medium text-xs mt-1"
                >
                  View Company Profile →
                </Link>
              </div>
            </Card>
          </aside>
        </div>
      </div>

      {/* APPLICATION MODAL */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => {
          setIsApplyModalOpen(false);
          setApplicationSubmitted(null);
        }}
        title={applicationSubmitted ? "Application Submitted Successfully" : `Apply to ${job.organizationName}`}
        description={
          applicationSubmitted
            ? "Your structured profile and credentials have been delivered directly to the hiring pipeline."
            : "Review the structured information being submitted for this role."
        }
        size="lg"
      >
        {applicationSubmitted ? (
          <div className="py-8 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-success-soft text-success flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="flex flex-col gap-1 max-w-md">
              <h3 className="text-lg font-bold text-text-primary">
                Application Received by {job.organizationName}
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                You can monitor recruiter review progress, review notes, and interview invitations in your candidate applications timeline.
              </p>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <Link href={`/candidate/applications/${applicationSubmitted}`}>
                <Button variant="primary" size="md">
                  View Application Timeline
                </Button>
              </Link>
              <Button
                variant="secondary"
                size="md"
                onClick={() => {
                  setIsApplyModalOpen(false);
                  setApplicationSubmitted(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleApplySubmit} className="flex flex-col gap-6 text-xs">
            {/* Candidate Summary Block */}
            <div className="p-4 rounded-xl bg-background border border-border flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={candidateProfile?.avatarUrl}
                  alt={candidateProfile?.fullName}
                  className="w-10 h-10 rounded-full object-cover border border-border"
                />
                <div className="flex flex-col">
                  <span className="font-bold text-sm text-text-primary">{candidateProfile?.fullName}</span>
                  <span className="text-text-muted">{candidateProfile?.headline}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-semibold text-primary bg-primary-soft px-2.5 py-1 rounded-md border border-primary/20">
                  {matchResult?.overallAlignment || 86}% Alignment
                </span>
              </div>
            </div>

            {/* Resume verification */}
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-text-primary">Resume Document</label>
              <div className="p-3 rounded-lg border border-border bg-surface flex items-center justify-between">
                <div className="flex items-center gap-2 text-text-primary font-medium">
                  <FileText className="w-4 h-4 text-primary" />
                  <span>{candidateProfile?.resumeFileName || "Ananya_Sharma_Senior_Frontend_2026.pdf"}</span>
                </div>
                <span className="text-text-muted text-[11px]">Structured & Verified</span>
              </div>
            </div>

            {/* Screening Questions */}
            {job.screeningQuestions && job.screeningQuestions.length > 0 && (
              <div className="flex flex-col gap-4 pt-4 border-t border-border">
                <h4 className="font-bold text-sm text-text-primary">
                  Screening Questions from Employer
                </h4>
                {job.screeningQuestions.map((sq) => (
                  <div key={sq.id} className="flex flex-col gap-1.5">
                    <label className="font-semibold text-text-secondary">
                      {sq.question}
                      {sq.required && <span className="text-danger ml-0.5">*</span>}
                    </label>
                    {sq.type === "multiple_choice" && sq.options ? (
                      <select
                        required={sq.required}
                        value={screeningAnswers[sq.id] || ""}
                        onChange={(e) =>
                          setScreeningAnswers({ ...screeningAnswers, [sq.id]: e.target.value })
                        }
                        className="p-2.5 rounded-lg border border-border bg-surface text-text-primary text-xs"
                      >
                        <option value="">Select an option...</option>
                        {sq.options.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        required={sq.required}
                        placeholder="Your response..."
                        value={screeningAnswers[sq.id] || ""}
                        onChange={(e) =>
                          setScreeningAnswers({ ...screeningAnswers, [sq.id]: e.target.value })
                        }
                        className="p-2.5 rounded-lg border border-border bg-surface text-text-primary text-xs"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Consent Checkbox */}
            <div className="pt-4 border-t border-border">
              <Checkbox
                label="I confirm the accuracy of my structured profile and authorize RazorWave Technologies hiring team to review my credentials."
                description="Your contact details will only be accessible to verified members of this organization."
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
                required
              />
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => setIsApplyModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSubmitting}
                disabled={!consentGiven}
                leftIcon={<Send className="w-4 h-4" />}
              >
                Submit Application
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* LINKEDIN-STYLE AUTH GATE MODAL */}
      <AuthGateModal
        isOpen={authGateOpen}
        onClose={() => setAuthGateOpen(false)}
        jobTitle={job?.title}
        companyName={job?.organizationName}
        title={
          authGateAction === "apply"
            ? `Sign in to apply to ${job?.title || "this role"}`
            : "Sign in to save this job"
        }
        subtitle={
          authGateAction === "apply"
            ? "Create a candidate account or sign in with your verified profile to submit your application and view criteria match analysis."
            : "Sign in with your TAG account to save this job to your dashboard and track application deadlines."
        }
        onAuthenticated={() => {
          if (authGateAction === "apply") {
            setIsApplyModalOpen(true);
          } else if (job) {
            setIsSaved(true);
            toggleSaveJob(job.id);
          }
        }}
      />

      <Footer />
    </div>
  );
}
