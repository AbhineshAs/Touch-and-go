"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge, MatchBadge, SkillBadge } from "@/components/ui/Badge";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { createJob } from "@/lib/api/jobs";
import { formatSalaryRange } from "@/lib/utils";

export default function JobBuilderPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autosaveStatus, setAutosaveStatus] = useState("Draft autosaved just now");

  // Step 1 - Basics
  const [title, setTitle] = useState("Senior Frontend Engineer (React 19)");
  const [department, setDepartment] = useState("Core Platform");
  const [employmentType, setEmploymentType] = useState("Full-time");
  const [location, setLocation] = useState("Bengaluru, Karnataka");
  const [workMode, setWorkMode] = useState("Hybrid");
  const [minSalary, setMinSalary] = useState("2400000");
  const [maxSalary, setMaxSalary] = useState("3200000");
  const [experienceLevel, setExperienceLevel] = useState("Mid (3-5 yrs)");

  // Step 2 - Description
  const [summary, setSummary] = useState(
    "We are seeking an experienced Frontend Engineer to take technical ownership of RazorWave's flagship Merchant Settlement Portal. You will lead UI architecture and scale our design system."
  );
  const [responsibilities, setResponsibilities] = useState([
    "Architect and scale responsive web applications using React 19, Next.js, and TypeScript.",
    "Enforce strict WCAG 2.2 AA accessibility and component design tokens.",
    "Optimize Core Web Vitals and client bundle performance.",
  ]);
  const [newResp, setNewResp] = useState("");

  // Step 3 - Requirements
  const [mustHaveSkills, setMustHaveSkills] = useState(["React", "TypeScript", "Next.js", "Design Systems"]);
  const [newMustSkill, setNewMustSkill] = useState("");
  const [preferredSkills, setPreferredSkills] = useState(["TanStack Query", "GraphQL", "Playwright"]);
  const [newPrefSkill, setNewPrefSkill] = useState("");

  const steps = [
    { num: 1, name: "Basics" },
    { num: 2, name: "Description" },
    { num: 3, name: "Requirements" },
    { num: 4, name: "Match Criteria" },
    { num: 5, name: "Preview & Publish" },
  ];

  const handleAddResp = () => {
    if (!newResp.trim()) return;
    setResponsibilities([...responsibilities, newResp.trim()]);
    setNewResp("");
  };

  const handleAddMustSkill = () => {
    if (!newMustSkill.trim()) return;
    setMustHaveSkills([...mustHaveSkills, newMustSkill.trim()]);
    setNewMustSkill("");
  };

  const handleAddPrefSkill = () => {
    if (!newPrefSkill.trim()) return;
    setPreferredSkills([...preferredSkills, newPrefSkill.trim()]);
    setNewPrefSkill("");
  };

  const handlePublish = async () => {
    setIsSubmitting(true);
    const newJob = await createJob({
      title,
      department,
      employmentType: employmentType as any,
      location,
      workMode: workMode as any,
      minSalaryINR: parseInt(minSalary) || undefined,
      maxSalaryINR: parseInt(maxSalary) || undefined,
      experienceLevel: experienceLevel as any,
      summary,
      responsibilities,
      mustHaveSkills,
      preferredSkills,
      screeningQuestions: [],
      status: "Published",
    });
    setIsSubmitting(false);
    router.push(`/employer/jobs/${newJob.id}/pipeline`);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex flex-col gap-1">
          <Link
            href="/employer/jobs"
            className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Job Listings</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Create New Job Opportunity
          </h1>
        </div>

        <div className="text-xs text-text-muted flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#4F46E5]" />
          <span>{autosaveStatus}</span>
        </div>
      </div>

      {/* 5-Step Horizontal Wizard Stepper */}
      <div className="grid grid-cols-5 gap-2 p-2 bg-surface rounded-xl border border-border shadow-xs">
        {steps.map((s) => {
          const isCurrent = s.num === currentStep;
          const isPassed = s.num < currentStep;
          return (
            <button
              key={s.num}
              type="button"
              onClick={() => setCurrentStep(s.num)}
              className={`flex flex-col items-center text-center p-2 rounded-lg transition-colors cursor-pointer ${
                isCurrent
                  ? "bg-primary text-white font-semibold shadow-xs"
                  : isPassed
                  ? "text-primary hover:bg-primary-soft/40"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              <span className="text-xs">{isPassed ? "✓" : s.num}</span>
              <span className="text-[10px] hidden sm:block truncate w-full">{s.name}</span>
            </button>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="flex flex-col gap-6">
        {/* STEP 1: BASICS */}
        {currentStep === 1 && (
          <Card className="p-6 sm:p-8 bg-surface border-border flex flex-col gap-5">
            <h2 className="text-base font-bold text-text-primary">Step 1 — Role Basics</h2>

            <Input
              label="Job Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior Frontend Engineer (React)"
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Core Engineering, Payments"
                required
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-secondary">Employment Type</label>
                <select
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value)}
                  className="rounded-lg border border-border bg-surface p-2 text-xs text-text-primary focus:border-primary"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Office Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Bengaluru, Karnataka"
                required
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-secondary">Work Mode</label>
                <select
                  value={workMode}
                  onChange={(e) => setWorkMode(e.target.value)}
                  className="rounded-lg border border-border bg-surface p-2 text-xs text-text-primary focus:border-primary"
                >
                  <option value="Hybrid">Hybrid</option>
                  <option value="Remote">Remote</option>
                  <option value="On-site">On-site</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Minimum Base Salary (INR / year)"
                type="number"
                value={minSalary}
                onChange={(e) => setMinSalary(e.target.value)}
                placeholder="2400000"
              />
              <Input
                label="Maximum Base Salary (INR / year)"
                type="number"
                value={maxSalary}
                onChange={(e) => setMaxSalary(e.target.value)}
                placeholder="3200000"
              />
            </div>
          </Card>
        )}

        {/* STEP 2: DESCRIPTION */}
        {currentStep === 2 && (
          <Card className="p-6 sm:p-8 bg-surface border-border flex flex-col gap-5">
            <h2 className="text-base font-bold text-text-primary">Step 2 — Role Description</h2>

            <Textarea
              label="Role Overview & Objective"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={4}
              placeholder="Provide a concise summary of the team and mission..."
              required
            />

            <div className="flex flex-col gap-3 pt-2">
              <label className="text-xs font-semibold text-text-secondary">Key Responsibilities</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newResp}
                  onChange={(e) => setNewResp(e.target.value)}
                  placeholder="Add a key responsibility..."
                  className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-xs text-text-primary focus:border-primary"
                />
                <Button type="button" size="sm" variant="secondary" onClick={handleAddResp}>
                  Add
                </Button>
              </div>

              <div className="flex flex-col gap-2 mt-2">
                {responsibilities.map((r, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg bg-background border border-border-subtle flex items-center justify-between text-xs text-text-secondary"
                  >
                    <span>{r}</span>
                    <button
                      type="button"
                      onClick={() => setResponsibilities(responsibilities.filter((_, idx) => idx !== i))}
                      className="text-text-muted hover:text-danger p-1"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* STEP 3: REQUIREMENTS */}
        {currentStep === 3 && (
          <Card className="p-6 sm:p-8 bg-surface border-border flex flex-col gap-6">
            <h2 className="text-base font-bold text-text-primary">Step 3 — Technical Requirements</h2>

            {/* Must have */}
            <div className="flex flex-col gap-3">
              <label className="text-xs font-semibold text-text-secondary">
                Must-Have Required Skills (Weight: High in criteria score)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMustSkill}
                  onChange={(e) => setNewMustSkill(e.target.value)}
                  placeholder="e.g. React 19, TypeScript, GraphQL..."
                  className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-xs text-text-primary focus:border-primary"
                />
                <Button type="button" size="sm" variant="primary" onClick={handleAddMustSkill}>
                  Add Skill
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {mustHaveSkills.map((s, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-primary-soft text-primary-dark font-medium text-xs border border-primary/20"
                  >
                    <span>{s}</span>
                    <button
                      type="button"
                      onClick={() => setMustHaveSkills(mustHaveSkills.filter((_, i) => i !== idx))}
                      className="text-text-muted hover:text-danger font-bold"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Preferred */}
            <div className="flex flex-col gap-3 pt-4 border-t border-border-subtle">
              <label className="text-xs font-semibold text-text-secondary">
                Preferred Skills (Bonus alignment criteria)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPrefSkill}
                  onChange={(e) => setNewPrefSkill(e.target.value)}
                  placeholder="e.g. TanStack Query, AWS, Docker..."
                  className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-xs text-text-primary focus:border-primary"
                />
                <Button type="button" size="sm" variant="secondary" onClick={handleAddPrefSkill}>
                  Add Skill
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {preferredSkills.map((s, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-background text-text-secondary font-medium text-xs border border-border"
                  >
                    <span>{s}</span>
                    <button
                      type="button"
                      onClick={() => setPreferredSkills(preferredSkills.filter((_, i) => i !== idx))}
                      className="text-text-muted hover:text-danger font-bold"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* STEP 4: MATCH CRITERIA */}
        {currentStep === 4 && (
          <Card className="p-6 sm:p-8 bg-surface border-border flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="text-base font-bold text-text-primary">
                Step 4 — Explainable Match Configuration
              </h2>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              TAG uses your published criteria to calculate explainable alignment. The breakdown below shows the exact weight candidates and recruiters will see.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-background border border-border-subtle flex flex-col gap-1">
                <span className="font-bold text-text-primary">Skills Alignment (35%)</span>
                <p className="text-text-muted">Must-have skills match against verified candidate history.</p>
              </div>
              <div className="p-4 rounded-xl bg-background border border-border-subtle flex flex-col gap-1">
                <span className="font-bold text-text-primary">Commercial Experience (25%)</span>
                <p className="text-text-muted">Confirmed position years in production codebases.</p>
              </div>
              <div className="p-4 rounded-xl bg-background border border-border-subtle flex flex-col gap-1">
                <span className="font-bold text-text-primary">Role Seniority (15%)</span>
                <p className="text-text-muted">Scope of architectural ownership and developer mentorship.</p>
              </div>
              <div className="p-4 rounded-xl bg-background border border-border-subtle flex flex-col gap-1">
                <span className="font-bold text-text-primary">Location & Work Mode (10%)</span>
                <p className="text-text-muted">Agreement on hybrid Indiranagar office policy.</p>
              </div>
            </div>
          </Card>
        )}

        {/* STEP 5: PREVIEW & PUBLISH */}
        {currentStep === 5 && (
          <div className="flex flex-col gap-6">
            <div className="p-4 rounded-xl bg-primary-soft/30 border border-primary/20 flex items-center justify-between">
              <span className="text-xs font-semibold text-primary">
                Candidate Live Preview — This is exactly how job seekers will see your listing
              </span>
              <Badge variant="outline">Preview Mode</Badge>
            </div>

            {/* Rendered Job Card identical to Candidate view */}
            <Card className="p-6 sm:p-8 bg-surface border-border shadow-md flex flex-col gap-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-lg">
                    R
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-text-secondary">
                        RazorWave Technologies
                      </span>
                      <ShieldCheck className="w-3.5 h-3.5 text-success" />
                    </div>
                    <h2 className="text-2xl font-bold text-text-primary mt-0.5">{title}</h2>
                    <div className="flex items-center gap-3 text-xs text-text-muted mt-1.5">
                      <span>{location}</span>
                      <span>•</span>
                      <span>{workMode}</span>
                      <span>•</span>
                      <span>{employmentType}</span>
                    </div>
                  </div>
                </div>

                <MatchBadge score={86} size="md" />
              </div>

              <div className="p-4 rounded-xl bg-background border border-border-subtle text-xs">
                <span className="text-text-muted">Compensation: </span>
                <strong className="text-text-primary">
                  {formatSalaryRange(parseInt(minSalary) || undefined, parseInt(maxSalary) || undefined)}
                </strong>
              </div>

              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-bold text-text-primary">Role Summary</h3>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">{summary}</p>
              </div>

              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-bold text-text-primary">Responsibilities</h3>
                <ul className="flex flex-col gap-1.5 text-xs text-text-secondary">
                  {responsibilities.map((r, i) => (
                    <li key={i}>• {r}</li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-bold text-text-primary">Must-Have Skills</h3>
                <div className="flex flex-wrap gap-1.5">
                  {mustHaveSkills.map((s) => (
                    <SkillBadge key={s} name={s} verified />
                  ))}
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Stepper Navigation Controls */}
      <div className="flex items-center justify-between pt-6 border-t border-border">
        <Button
          type="button"
          variant="secondary"
          size="md"
          disabled={currentStep === 1}
          onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
        >
          Previous Step
        </Button>

        {currentStep < 5 ? (
          <Button
            type="button"
            variant="primary"
            size="md"
            rightIcon={<ArrowRight className="w-4 h-4" />}
            onClick={() => setCurrentStep((prev) => Math.min(5, prev + 1))}
          >
            Next: {steps[currentStep].name}
          </Button>
        ) : (
          <Button
            type="button"
            variant="primary"
            size="md"
            isLoading={isSubmitting}
            onClick={handlePublish}
            rightIcon={<Check className="w-4 h-4" />}
          >
            Publish Opportunity
          </Button>
        )}
      </div>
    </div>
  );
}
