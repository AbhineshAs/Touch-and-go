"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Job, JobStatus, WorkMode, EmploymentType, ExperienceLevel } from "@/types";
import { getJobById, updateJob, deleteJob } from "@/lib/api/jobs";
import { Card } from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { LoadingState, EmptyState } from "@/components/ui/States";
import {
  ArrowLeft,
  Save,
  Trash2,
  AlertTriangle,
  Plus,
  X,
  CheckCircle2,
} from "lucide-react";

export default function EmployerEditJobPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = (params?.id as string) || "";

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [job, setJob] = useState<Job | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [employmentType, setEmploymentType] = useState<EmploymentType>("Full-time");
  const [location, setLocation] = useState("");
  const [workMode, setWorkMode] = useState<WorkMode>("Hybrid");
  const [minSalary, setMinSalary] = useState("");
  const [maxSalary, setMaxSalary] = useState("");
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>("Mid (3-5 yrs)");
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState<JobStatus>("Published");
  const [summary, setSummary] = useState("");
  const [responsibilities, setResponsibilities] = useState<string[]>([]);
  const [newResp, setNewResp] = useState("");
  const [mustHaveSkills, setMustHaveSkills] = useState<string[]>([]);
  const [newMustSkill, setNewMustSkill] = useState("");
  const [preferredSkills, setPreferredSkills] = useState<string[]>([]);
  const [newPrefSkill, setNewPrefSkill] = useState("");

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      if (jobId) {
        const found = await getJobById(jobId);
        if (found) {
          setJob(found);
          setTitle(found.title);
          setDepartment(found.department);
          setEmploymentType(found.employmentType);
          setLocation(found.location);
          setWorkMode(found.workMode);
          setMinSalary(found.minSalaryINR?.toString() || "");
          setMaxSalary(found.maxSalaryINR?.toString() || "");
          setExperienceLevel(found.experienceLevel);
          setDeadline(found.deadline || "");
          setStatus(found.status);
          setSummary(found.summary);
          setResponsibilities(found.responsibilities || []);
          setMustHaveSkills(found.mustHaveSkills || []);
          setPreferredSkills(found.preferredSkills || []);
        }
      }
      setIsLoading(false);
    }
    load();
  }, [jobId]);

  const handleAddResp = () => {
    if (!newResp.trim()) return;
    setResponsibilities([...responsibilities, newResp.trim()]);
    setNewResp("");
  };

  const handleAddMustSkill = () => {
    if (!newMustSkill.trim()) return;
    if (!mustHaveSkills.includes(newMustSkill.trim())) {
      setMustHaveSkills([...mustHaveSkills, newMustSkill.trim()]);
    }
    setNewMustSkill("");
  };

  const handleAddPrefSkill = () => {
    if (!newPrefSkill.trim()) return;
    if (!preferredSkills.includes(newPrefSkill.trim())) {
      setPreferredSkills([...preferredSkills, newPrefSkill.trim()]);
    }
    setNewPrefSkill("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;

    setIsSubmitting(true);
    await updateJob(job.id, {
      title,
      department,
      employmentType,
      location,
      workMode,
      minSalaryINR: parseInt(minSalary) || undefined,
      maxSalaryINR: parseInt(maxSalary) || undefined,
      experienceLevel,
      deadline: deadline || undefined,
      status,
      summary,
      responsibilities,
      mustHaveSkills,
      preferredSkills,
    });

    setIsSubmitting(false);
    router.push(`/employer/jobs/${job.id}`);
  };

  const handleDelete = async () => {
    if (!job) return;
    setIsDeleting(true);
    await deleteJob(job.id);
    setShowDeleteModal(false);
    router.push("/employer/jobs");
  };

  if (isLoading) {
    return <LoadingState message="Loading job details for editing..." />;
  }

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <EmptyState
          title="Job listing not found"
          description="The requested job listing could not be found."
          action={{
            label: "Return to Job Listings",
            onClick: () => router.push("/employer/jobs"),
          }}
        />
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="max-w-4xl mx-auto flex flex-col gap-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex flex-col gap-1">
          <Link
            href={`/employer/jobs/${job.id}`}
            className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Cancel & Back to Job Details</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Edit Job: {job.title}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link href={`/employer/jobs/${job.id}`}>
            <Button variant="outline" size="sm" type="button">
              Cancel
            </Button>
          </Link>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            isLoading={isSubmitting}
            leftIcon={<Save className="w-3.5 h-3.5" />}
          >
            Save Changes
          </Button>
        </div>
      </div>

      {/* 1. Job Basics & Metadata Card */}
      <Card className="p-6 bg-surface border-border flex flex-col gap-5">
        <h2 className="text-base font-bold text-text-primary border-b border-border pb-3">
          1. Role Basics & Classification
        </h2>

        <Input
          label="Job Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Senior Frontend Engineer"
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder="e.g. Core Engineering"
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary">Job Type (Employment)</label>
            <select
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
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
            label="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Bengaluru, Karnataka"
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary">Work Mode</label>
            <select
              value={workMode}
              onChange={(e) => setWorkMode(e.target.value as WorkMode)}
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary">Experience Required</label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
              className="rounded-lg border border-border bg-surface p-2 text-xs text-text-primary focus:border-primary"
            >
              <option value="Entry (0-2 yrs)">Entry (0-2 yrs)</option>
              <option value="Mid (3-5 yrs)">Mid (3-5 yrs)</option>
              <option value="Senior (6-8 yrs)">Senior (6-8 yrs)</option>
              <option value="Lead (8+ yrs)">Lead (8+ yrs)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary">Application Deadline</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="rounded-lg border border-border bg-surface p-2 text-xs text-text-primary focus:border-primary"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary">Listing Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as JobStatus)}
              className="rounded-lg border border-border bg-surface p-2 text-xs text-text-primary focus:border-primary font-semibold"
            >
              <option value="Published">Published (Active)</option>
              <option value="Draft">Draft</option>
              <option value="Paused">Paused</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>
      </Card>

      {/* 2. Role Description Card */}
      <Card className="p-6 bg-surface border-border flex flex-col gap-5">
        <h2 className="text-base font-bold text-text-primary border-b border-border pb-3">
          2. Role Description & Responsibilities
        </h2>

        <Textarea
          label="Role Overview & Objective"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={4}
          placeholder="Detailed role overview..."
          required
        />

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-text-secondary">Key Responsibilities</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newResp}
              onChange={(e) => setNewResp(e.target.value)}
              placeholder="Add another responsibility..."
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
                  className="text-text-muted hover:text-danger p-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* 3. Skills Card */}
      <Card className="p-6 bg-surface border-border flex flex-col gap-5">
        <h2 className="text-base font-bold text-text-primary border-b border-border pb-3">
          3. Technical Skills
        </h2>

        {/* Must-Have Skills */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-text-secondary">
            Must-Have Required Skills
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newMustSkill}
              onChange={(e) => setNewMustSkill(e.target.value)}
              placeholder="e.g. React 19, TypeScript..."
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
                  className="text-text-muted hover:text-danger cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Preferred Skills */}
        <div className="flex flex-col gap-2 pt-3 border-t border-border-subtle">
          <label className="text-xs font-semibold text-text-secondary">
            Preferred / Bonus Skills
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newPrefSkill}
              onChange={(e) => setNewPrefSkill(e.target.value)}
              placeholder="e.g. Docker, AWS..."
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
                  className="text-text-muted hover:text-danger cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="p-6 bg-red-50/50 border border-red-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-red-900">Delete this Job Listing</h3>
          <p className="text-xs text-red-700 mt-0.5">
            Permanently remove this job opportunity and all corresponding applications.
          </p>
        </div>

        <Button
          type="button"
          variant="danger"
          size="sm"
          onClick={() => setShowDeleteModal(true)}
          leftIcon={<Trash2 className="w-3.5 h-3.5" />}
        >
          Delete Job
        </Button>
      </Card>

      {/* Form Submission Bar */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
        <Link href={`/employer/jobs/${job.id}`}>
          <Button variant="outline" size="md" type="button">
            Cancel
          </Button>
        </Link>
        <Button
          variant="primary"
          size="md"
          type="submit"
          isLoading={isSubmitting}
          leftIcon={<Save className="w-4 h-4" />}
        >
          Save Changes
        </Button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Delete Job Listing</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete <strong className="text-slate-900">"{job.title}"</strong>?
              This will permanently remove the listing from Touch-and-Go.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                type="button"
                onClick={handleDelete}
                isLoading={isDeleting}
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
