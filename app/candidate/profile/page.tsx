"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge, SkillBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { LoadingState } from "@/components/ui/States";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  GraduationCap,
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  Upload,
  Eye,
  CheckCircle2,
  FileText,
  Briefcase,
  Layers,
} from "lucide-react";
import { CandidateProfile, CandidateExperience, SkillItem } from "@/types";
import { getCandidateProfile, updateCandidateProfile } from "@/lib/api/candidate";
import { formatSalaryRange } from "@/lib/utils";

export default function CandidateProfilePage() {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  // Edit Personal Info Modal
  const [isPersonalModalOpen, setIsPersonalModalOpen] = useState(false);
  const [headline, setHeadline] = useState("");
  const [summary, setSummary] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");

  // Add Experience Modal
  const [isExpModalOpen, setIsExpModalOpen] = useState(false);
  const [expTitle, setExpTitle] = useState("");
  const [expCompany, setExpCompany] = useState("");
  const [expLocation, setExpLocation] = useState("");
  const [expDescription, setExpDescription] = useState("");

  // Add Skill Modal
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillYears, setNewSkillYears] = useState("3");

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const p = await getCandidateProfile();
      setProfile(p);
      setHeadline(p.headline);
      setSummary(p.summary);
      setLocation(p.location);
      setPhone(p.phone);
      setIsLoading(false);
    }
    load();
  }, []);

  const handleSavePersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    const updated = await updateCandidateProfile({
      headline,
      summary,
      location,
      phone,
    });
    setProfile(updated);
    setIsPersonalModalOpen(false);
    showNotice();
  };

  const handleAddExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    const newExp: CandidateExperience = {
      id: `exp_${Date.now()}`,
      title: expTitle,
      company: expCompany,
      location: expLocation,
      startDate: "2024-01-01",
      current: true,
      description: expDescription,
      skillsUsed: ["React", "TypeScript"],
    };
    const updated = await updateCandidateProfile({
      experiences: [newExp, ...profile.experiences],
    });
    setProfile(updated);
    setIsExpModalOpen(false);
    setExpTitle("");
    setExpCompany("");
    setExpLocation("");
    setExpDescription("");
    showNotice();
  };

  const handleDeleteExperience = async (expId: string) => {
    if (!profile) return;
    const updated = await updateCandidateProfile({
      experiences: profile.experiences.filter((e) => e.id !== expId),
    });
    setProfile(updated);
    showNotice();
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !newSkillName.trim()) return;
    const newSkill: SkillItem = {
      id: `sk_${Date.now()}`,
      name: newSkillName.trim(),
      category: "Technical",
      yearsOfExperience: parseFloat(newSkillYears) || 1,
      verified: false,
    };
    const updated = await updateCandidateProfile({
      skills: [...profile.skills, newSkill],
    });
    setProfile(updated);
    setIsSkillModalOpen(false);
    setNewSkillName("");
    showNotice();
  };

  const handleDeleteSkill = async (skillId: string) => {
    if (!profile) return;
    const updated = await updateCandidateProfile({
      skills: profile.skills.filter((s) => s.id !== skillId),
    });
    setProfile(updated);
    showNotice();
  };

  const showNotice = () => {
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2500);
  };

  if (isLoading || !profile) {
    return <LoadingState message="Loading your candidate profile..." />;
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 pb-16">
      {/* Notice Banner */}
      {isSavedNotice && (
        <div className="fixed top-4 right-4 z-50 p-3.5 rounded-xl bg-success text-white shadow-xl text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>Profile changes saved successfully.</span>
        </div>
      )}

      {/* Header & Personal Info Card */}
      <Card className="p-6 sm:p-8 bg-surface border-border shadow-xs flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="flex items-start gap-5">
            <img
              src={profile.avatarUrl}
              alt={profile.fullName}
              className="w-20 h-20 rounded-2xl object-cover border border-border shrink-0"
            />
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-text-primary">
                  {profile.fullName}
                </h1>
                <span className="text-[11px] font-semibold text-primary bg-primary-soft px-2.5 py-0.5 rounded-full border border-primary/20">
                  {profile.completionPercentage}% Complete
                </span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-text-secondary">
                {profile.headline}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted mt-2">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-text-muted" />
                  {profile.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-text-muted" />
                  {profile.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-text-muted" />
                  {profile.phone}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Edit2 className="w-3.5 h-3.5" />}
              onClick={() => setIsPersonalModalOpen(true)}
            >
              Edit Details
            </Button>
            <Link href="/candidate/profile/resume">
              <Button size="sm" variant="primary" leftIcon={<Upload className="w-3.5 h-3.5" />}>
                Re-upload Resume
              </Button>
            </Link>
          </div>
        </div>

        {/* Visibility Setting indicator */}
        <div className="p-3 rounded-xl bg-background border border-border-subtle flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-primary" />
            <span className="text-text-secondary">Profile Visibility:</span>
            <strong className="text-text-primary uppercase text-[11px] tracking-wider">
              {profile.visibility.replace(/_/g, " ")}
            </strong>
          </div>
          <Link href="/candidate/settings" className="text-primary hover:underline font-semibold">
            Change in Settings
          </Link>
        </div>
      </Card>

      {/* Professional Summary */}
      <Card className="p-6 bg-surface border-border flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-text-primary">Professional Summary</h2>
          <button
            onClick={() => setIsPersonalModalOpen(true)}
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Edit2 className="w-3 h-3" />
            <span>Edit</span>
          </button>
        </div>
        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed whitespace-pre-line">
          {profile.summary}
        </p>
      </Card>

      {/* Experience Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-text-primary">
            Experience ({profile.experiences.length})
          </h2>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsExpModalOpen(true)}
          >
            Add Experience
          </Button>
        </div>

        <div className="flex flex-col gap-4">
          {profile.experiences.map((exp) => (
            <Card key={exp.id} className="p-6 bg-surface border-border flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center shrink-0 font-bold">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-base font-bold text-text-primary">{exp.title}</h3>
                    <span className="text-xs font-semibold text-text-secondary">
                      {exp.company} • {exp.location}
                    </span>
                    <span className="text-[11px] text-text-muted mt-0.5">
                      {exp.startDate} – {exp.current ? "Present" : exp.endDate}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteExperience(exp.id)}
                  className="p-1.5 text-text-muted hover:text-danger rounded-lg hover:bg-background transition-colors cursor-pointer"
                  title="Delete experience"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed pt-1">
                {exp.description}
              </p>

              <div className="flex flex-wrap gap-1.5 pt-2">
                {exp.skillsUsed.map((sk) => (
                  <span
                    key={sk}
                    className="text-[11px] px-2 py-0.5 rounded bg-background border border-border text-text-secondary"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Skills Section */}
      <Card className="p-6 bg-surface border-border flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-text-primary">
            Technical & Domain Skills ({profile.skills.length})
          </h2>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsSkillModalOpen(true)}
          >
            Add Skill
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {profile.skills.map((skill) => (
            <div
              key={skill.id}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md bg-background border border-border group"
            >
              <span>{skill.name}</span>
              {skill.yearsOfExperience && (
                <span className="text-text-muted font-normal text-[11px]">
                  ({skill.yearsOfExperience}y)
                </span>
              )}
              {skill.verified && (
                <span title="Verified via work history">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                </span>
              )}
              <button
                type="button"
                onClick={() => handleDeleteSkill(skill.id)}
                className="hover:text-danger text-text-muted ml-0.5 cursor-pointer"
                aria-label={`Remove ${skill.name}`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Education & Certifications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Education */}
        <Card className="p-6 bg-surface border-border flex flex-col gap-4">
          <h2 className="text-base font-bold text-text-primary">Education</h2>
          {profile.education.map((edu) => (
            <div key={edu.id} className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary-soft text-primary flex items-center justify-center shrink-0">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-xs font-bold text-text-primary">{edu.degree}</h3>
                <span className="text-xs text-text-secondary">{edu.institution}</span>
                <span className="text-[11px] text-text-muted">
                  {edu.startYear} – {edu.endYear} • {edu.grade}
                </span>
              </div>
            </div>
          ))}
        </Card>

        {/* Certifications */}
        <Card className="p-6 bg-surface border-border flex flex-col gap-4">
          <h2 className="text-base font-bold text-text-primary">Certifications</h2>
          {profile.certifications.map((cert) => (
            <div key={cert.id} className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-success-soft text-success flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-xs font-bold text-text-primary">{cert.name}</h3>
                <span className="text-xs text-text-secondary">{cert.issuingOrganization}</span>
                <span className="text-[11px] text-text-muted">Issued {cert.issueDate}</span>
              </div>
            </div>
          ))}
        </Card>
      </div>

      {/* Job Preferences Card */}
      <Card className="p-6 bg-surface border-border flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-text-primary">Job Preferences</h2>
          <Link href="/candidate/settings">
            <Button size="sm" variant="outline">
              Edit Preferences
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 rounded-lg bg-background border border-border-subtle flex flex-col gap-1">
            <span className="text-text-muted">Desired Locations</span>
            <span className="font-semibold text-text-primary">
              {profile.preferences.preferredLocations.join(", ")}
            </span>
          </div>
          <div className="p-3 rounded-lg bg-background border border-border-subtle flex flex-col gap-1">
            <span className="text-text-muted">Minimum Expected Salary</span>
            <span className="font-semibold text-text-primary">
              {formatSalaryRange(profile.preferences.minimumSalaryINR, undefined, "year")}
            </span>
          </div>
          <div className="p-3 rounded-lg bg-background border border-border-subtle flex flex-col gap-1">
            <span className="text-text-muted">Notice Period</span>
            <span className="font-semibold text-text-primary">
              {profile.preferences.noticePeriodDays} Days
            </span>
          </div>
        </div>
      </Card>

      {/* EDIT PERSONAL INFO MODAL */}
      <Modal
        isOpen={isPersonalModalOpen}
        onClose={() => setIsPersonalModalOpen(false)}
        title="Edit Personal Information"
        description="Keep your contact and headline up to date."
        size="md"
      >
        <form onSubmit={handleSavePersonal} className="flex flex-col gap-4">
          <Input
            label="Professional Headline"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            required
          />
          <Textarea
            label="Professional Summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={4}
            required
          />
          <Input
            label="Current Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
          <Input
            label="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsPersonalModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* ADD EXPERIENCE MODAL */}
      <Modal
        isOpen={isExpModalOpen}
        onClose={() => setIsExpModalOpen(false)}
        title="Add Commercial Experience"
        size="md"
      >
        <form onSubmit={handleAddExperience} className="flex flex-col gap-4">
          <Input
            label="Job Title"
            placeholder="e.g. Senior Frontend Engineer"
            value={expTitle}
            onChange={(e) => setExpTitle(e.target.value)}
            required
          />
          <Input
            label="Company Name"
            placeholder="e.g. RazorWave Technologies"
            value={expCompany}
            onChange={(e) => setExpCompany(e.target.value)}
            required
          />
          <Input
            label="Location"
            placeholder="e.g. Bengaluru, Karnataka (Hybrid)"
            value={expLocation}
            onChange={(e) => setExpLocation(e.target.value)}
            required
          />
          <Textarea
            label="Responsibilities & Achievements"
            placeholder="Briefly describe key accomplishments, architectures designed, and metrics improved."
            value={expDescription}
            onChange={(e) => setExpDescription(e.target.value)}
            rows={3}
            required
          />
          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsExpModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Add Position
            </Button>
          </div>
        </form>
      </Modal>

      {/* ADD SKILL MODAL */}
      <Modal
        isOpen={isSkillModalOpen}
        onClose={() => setIsSkillModalOpen(false)}
        title="Add Technical Skill"
        size="sm"
      >
        <form onSubmit={handleAddSkill} className="flex flex-col gap-4">
          <Input
            label="Skill Name"
            placeholder="e.g. Docker, GraphQL, Kubernetes"
            value={newSkillName}
            onChange={(e) => setNewSkillName(e.target.value)}
            required
          />
          <Input
            label="Commercial Years of Experience"
            type="number"
            min="0.5"
            step="0.5"
            value={newSkillYears}
            onChange={(e) => setNewSkillYears(e.target.value)}
            required
          />
          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsSkillModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Add Skill
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
