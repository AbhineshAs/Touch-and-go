"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import {
  Printer,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Eye,
  Edit3,
  RefreshCw,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  HelpCircle,
  Upload,
  Save,
  ShieldCheck,
} from "lucide-react";
import { useCandidate } from "@/lib/candidate/context/CandidateContext";
import { ResumeSectionId } from "@/lib/candidate/types";
import { cn } from "@/lib/utils";

export default function ResumeBuilderPage() {
  const {
    candidateRecord,
    resumeDraft,
    updateResumeDraft,
    syncResumeWithProfile,
    saveResumeToProfile,
    acknowledgeProfileChanges,
  } = useCandidate();

  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [isSavedNotice, setIsSavedNotice] = useState(false);
  const [isFactualSummaryOpen, setIsFactualSummaryOpen] = useState(false);
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState(0);

  // New item inputs
  const [newSkill, setNewSkill] = useState("");
  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");

  if (!candidateRecord || !resumeDraft) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
        <FileText className="w-12 h-12 text-primary" />
        <h2 className="text-xl font-bold text-text-primary">No Active Resume Draft</h2>
        <p className="text-xs text-text-muted">Complete profile onboarding to initialize your structured resume.</p>
        <Link href="/onboarding">
          <Button size="md" variant="primary">
            Go to Onboarding
          </Button>
        </Link>
      </div>
    );
  }

  const { profileRevision, profile, discovery } = candidateRecord;
  const isProfileOutOfSync =
    profileRevision > resumeDraft.sourceProfileRevision &&
    !resumeDraft.hasReviewedProfileChanges;

  const showSaveNotice = () => {
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2500);
  };

  // Section Reordering
  const moveSection = (index: number, direction: "up" | "down") => {
    const newOrder = [...resumeDraft.sectionOrder];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;
    updateResumeDraft({ sectionOrder: newOrder });
  };

  const toggleSectionVisibility = (sec: ResumeSectionId) => {
    const updated = {
      ...resumeDraft.visibleSections,
      [sec]: !resumeDraft.visibleSections[sec],
    };
    updateResumeDraft({ visibleSections: updated });
  };

  // Factual deterministic summary generators based ONLY on confirmed facts
  const factualSummaryTemplates = useMemo(() => {
    const stage = discovery?.careerStage ? discovery.careerStage.replace(/_/g, " ") : "technology professional";
    const roles = discovery?.targetRoles?.filter((r) => r.toLowerCase() !== "exploring").join(", ") || profile.headline;
    const topSkills = resumeDraft.skills.slice(0, 4).join(", ");
    const hasExp = resumeDraft.experience.length > 0;
    const recentOrg = hasExp ? resumeDraft.experience[0].company : "";

    return [
      `Dedicated ${stage} targeting ${roles || "engineering positions"}${
        topSkills ? ` with practical experience in ${topSkills}` : ""
      }${recentOrg ? `, previously at ${recentOrg}` : ""}. Committed to building clean, tested user experiences.`,

      `${profile.headline || "Software Engineer"} focused on building resilient web applications${
        topSkills ? ` utilizing ${topSkills}` : ""
      }. Strong focus on technical collaboration, code quality, and structured problem-solving.`,
    ];
  }, [discovery, profile, resumeDraft]);

  const handleApplyFactualSummary = (template: string) => {
    updateResumeDraft({ summary: template });
    setIsFactualSummaryOpen(false);
    showSaveNotice();
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    if (!resumeDraft.skills.includes(newSkill.trim())) {
      updateResumeDraft({ skills: [...resumeDraft.skills, newSkill.trim()] });
    }
    setNewSkill("");
    showSaveNotice();
  };

  const handleDeleteSkill = (skillToDelete: string) => {
    updateResumeDraft({
      skills: resumeDraft.skills.filter((s) => s !== skillToDelete),
    });
    showSaveNotice();
  };

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLinkTitle.trim() || !newLinkUrl.trim()) return;
    updateResumeDraft({
      links: [
        ...resumeDraft.links,
        { id: `lnk_${Date.now()}`, label: newLinkTitle.trim(), url: newLinkUrl.trim() },
      ],
    });
    setNewLinkTitle("");
    setNewLinkUrl("");
    showSaveNotice();
  };

  const handleDeleteLink = (id: string) => {
    updateResumeDraft({
      links: resumeDraft.links.filter((l) => l.id !== id),
    });
    showSaveNotice();
  };

  const handleSaveToProfile = () => {
    saveResumeToProfile({
      headline: resumeDraft.headline,
      summary: resumeDraft.summary,
      skills: resumeDraft.skills.map((s) => ({ name: s, level: "comfortable" })),
      links: resumeDraft.links,
    });
    showSaveNotice();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6 pb-20">
      {/* Top Save Confirmation Toast */}
      {isSavedNotice && (
        <div className="fixed top-4 right-4 z-50 p-3.5 rounded-xl bg-success text-white shadow-xl text-xs font-semibold flex items-center gap-2 print:hidden animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>Resume draft updated successfully.</span>
        </div>
      )}

      {/* Screen Header (Hidden in Print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border print:hidden">
        <div className="flex flex-col gap-1">
          <Link
            href="/candidate/profile"
            className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-primary transition-colors mb-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Profile</span>
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">
              Structured Resume Builder
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary-soft text-primary font-bold">
              Draft Revision {profileRevision}
            </span>
          </div>
          <p className="text-xs text-text-secondary">
            Single-column printable template populated from your verified profile facts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Tab Switcher */}
          <div className="flex items-center bg-border-subtle p-1 rounded-xl gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("edit")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5",
                activeTab === "edit" ? "bg-surface text-primary shadow-xs" : "text-text-muted hover:text-text-primary"
              )}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Sections</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5",
                activeTab === "preview" ? "bg-surface text-primary shadow-xs" : "text-text-muted hover:text-text-primary"
              )}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Print Preview</span>
            </button>
          </div>

          <Button
            size="sm"
            variant="primary"
            leftIcon={<Printer className="w-4 h-4" />}
            onClick={handlePrint}
            title="Open browser print dialog to save as clean PDF"
          >
            Print / Save as PDF
          </Button>
        </div>
      </div>

      {/* Revision Out-of-Sync Banner (Hidden in Print) */}
      {isProfileOutOfSync && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5 text-xs text-amber-900">
              <span className="font-bold text-sm">Profile updated — Review changes</span>
              <span>
                Your candidate profile was updated to Revision {profileRevision}. Review and sync before exporting your final resume.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={acknowledgeProfileChanges}
            >
              Keep Resume Wording
            </Button>
            <Button
              size="sm"
              variant="primary"
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              onClick={() => {
                syncResumeWithProfile();
                showSaveNotice();
              }}
            >
              Apply Profile Changes
            </Button>
          </div>
        </div>
      )}

      {/* EDIT MODE (Hidden in Print) */}
      {activeTab === "edit" && (
        <div className="flex flex-col gap-6 print:hidden">
          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-surface border border-border">
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span>Private discovery challenges and scores are never exported in your resume.</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="soft"
                leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                onClick={() => setIsFactualSummaryOpen(true)}
              >
                Suggest Summary
              </Button>

              <Button
                size="sm"
                variant="outline"
                leftIcon={<Save className="w-3.5 h-3.5" />}
                onClick={handleSaveToProfile}
              >
                Save to Profile
              </Button>
            </div>
          </div>

          {/* Contact Details Card */}
          <Card className="p-6 bg-surface border-border flex flex-col gap-4">
            <h2 className="text-base font-bold text-text-primary">Contact & Header</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={resumeDraft.contact.fullName}
                onChange={(e) =>
                  updateResumeDraft({
                    contact: { ...resumeDraft.contact, fullName: e.target.value },
                  })
                }
              />
              <Input
                label="Professional Headline"
                value={resumeDraft.headline}
                onChange={(e) => updateResumeDraft({ headline: e.target.value })}
              />
              <Input
                label="Email"
                value={resumeDraft.contact.email}
                onChange={(e) =>
                  updateResumeDraft({
                    contact: { ...resumeDraft.contact, email: e.target.value },
                  })
                }
              />
              <Input
                label="Phone & Location"
                value={`${resumeDraft.contact.phone} • ${resumeDraft.contact.location}`}
                onChange={(e) => {
                  const parts = e.target.value.split("•").map((s) => s.trim());
                  updateResumeDraft({
                    contact: {
                      ...resumeDraft.contact,
                      phone: parts[0] || "",
                      location: parts[1] || "",
                    },
                  });
                }}
              />
            </div>
          </Card>

          {/* Section Ordering & Visibility Controls */}
          <Card className="p-6 bg-surface border-border flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-text-primary">Section Hierarchy & Order</h2>
                <p className="text-xs text-text-muted">
                  Reorder sections or toggle them to match your career stage.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {resumeDraft.sectionOrder.map((sec, idx) => {
                const isVisible = resumeDraft.visibleSections[sec];
                return (
                  <div
                    key={sec}
                    className="p-3 rounded-xl border border-border-subtle bg-background flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isVisible}
                        onChange={() => toggleSectionVisibility(sec)}
                        className="w-4 h-4 rounded text-primary border-border focus:ring-primary cursor-pointer"
                      />
                      <span className={cn("font-bold capitalize", !isVisible && "text-text-muted line-through")}>
                        {sec}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveSection(idx, "up")}
                        className="p-1 rounded hover:bg-surface disabled:opacity-30 cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === resumeDraft.sectionOrder.length - 1}
                        onClick={() => moveSection(idx, "down")}
                        className="p-1 rounded hover:bg-surface disabled:opacity-30 cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Professional Summary */}
          <Card className="p-6 bg-surface border-border flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-text-primary">Professional Summary</h2>
              <Button
                size="sm"
                variant="soft"
                leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                onClick={() => setIsFactualSummaryOpen(true)}
              >
                Generate Factual Suggestion
              </Button>
            </div>
            <Textarea
              value={resumeDraft.summary}
              onChange={(e) => updateResumeDraft({ summary: e.target.value })}
              rows={4}
              placeholder="Provide a concise 2–3 line executive summary..."
            />
          </Card>

          {/* Technical Skills Editor */}
          <Card className="p-6 bg-surface border-border flex flex-col gap-4">
            <h2 className="text-base font-bold text-text-primary">Core Technical Skills</h2>
            <div className="flex flex-wrap gap-2">
              {resumeDraft.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-background border border-border text-xs font-medium"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteSkill(skill)}
                    className="hover:text-danger text-text-muted cursor-pointer"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>

            <form onSubmit={handleAddSkill} className="flex gap-2 max-w-sm mt-2">
              <Input
                placeholder="Add skill (e.g. Next.js, Docker)"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
              />
              <Button type="submit" size="md" variant="secondary" className="shrink-0">
                Add
              </Button>
            </form>
          </Card>

          {/* Portfolio & Professional Links */}
          <Card className="p-6 bg-surface border-border flex flex-col gap-4">
            <h2 className="text-base font-bold text-text-primary">Links & Profiles</h2>
            <div className="flex flex-col gap-2">
              {resumeDraft.links.map((link) => (
                <div
                  key={link.id}
                  className="p-3 rounded-lg border border-border-subtle flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-text-primary">{link.label}: </span>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {link.url}
                    </a>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteLink(link.id)}
                    className="p-1 text-text-muted hover:text-danger cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddLink} className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
              <Input
                placeholder="Label (e.g. GitHub)"
                value={newLinkTitle}
                onChange={(e) => setNewLinkTitle(e.target.value)}
              />
              <Input
                placeholder="URL (https://...)"
                value={newLinkUrl}
                onChange={(e) => setNewLinkUrl(e.target.value)}
              />
              <Button type="submit" size="md" variant="secondary" className="shrink-0">
                Add Link
              </Button>
            </form>
          </Card>
        </div>
      )}

      {/* PRINTABLE RESUME PREVIEW (Visible in preview tab AND always visible when printing) */}
      <div
        className={cn(
          "w-full bg-white text-gray-900 shadow-lg rounded-2xl p-8 sm:p-12 border border-gray-200 transition-all font-sans",
          activeTab === "edit" && "hidden print:block",
          "print:shadow-none print:border-none print:p-0 print:m-0 print:block print:w-full"
        )}
      >
        {/* Printable Header */}
        <div className="border-b-2 border-gray-800 pb-4 mb-6 flex flex-col gap-1">
          <h1 className="text-3xl font-black tracking-tight text-gray-950 uppercase">
            {resumeDraft.contact.fullName || "Candidate"}
          </h1>
          <p className="text-base font-bold text-gray-700">{resumeDraft.headline}</p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 mt-1 font-medium">
            {resumeDraft.contact.email && <span>{resumeDraft.contact.email}</span>}
            {resumeDraft.contact.phone && <span>• {resumeDraft.contact.phone}</span>}
            {resumeDraft.contact.location && <span>• {resumeDraft.contact.location}</span>}
            {resumeDraft.links.map((lnk) => (
              <span key={lnk.id}>
                • {lnk.label}: {lnk.url}
              </span>
            ))}
          </div>
        </div>

        {/* Dynamic Ordered Sections */}
        <div className="flex flex-col gap-6">
          {resumeDraft.sectionOrder.map((sectionId) => {
            if (!resumeDraft.visibleSections[sectionId]) return null;

            switch (sectionId) {
              case "summary":
                if (!resumeDraft.summary?.trim()) return null;
                return (
                  <div key="summary" className="flex flex-col gap-1.5 break-inside-avoid">
                    <h2 className="text-sm font-black uppercase tracking-wider text-gray-900 border-b border-gray-300 pb-1">
                      Professional Summary
                    </h2>
                    <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line pt-1">
                      {resumeDraft.summary}
                    </p>
                  </div>
                );

              case "skills":
                if (resumeDraft.skills.length === 0) return null;
                return (
                  <div key="skills" className="flex flex-col gap-1.5 break-inside-avoid">
                    <h2 className="text-sm font-black uppercase tracking-wider text-gray-900 border-b border-gray-300 pb-1">
                      Technical Skills
                    </h2>
                    <p className="text-xs text-gray-800 font-medium pt-1 leading-relaxed">
                      {resumeDraft.skills.join(" • ")}
                    </p>
                  </div>
                );

              case "experience":
                if (resumeDraft.experience.length === 0) return null;
                return (
                  <div key="experience" className="flex flex-col gap-3">
                    <h2 className="text-sm font-black uppercase tracking-wider text-gray-900 border-b border-gray-300 pb-1">
                      Work Experience
                    </h2>
                    <div className="flex flex-col gap-4">
                      {resumeDraft.experience.map((exp) => (
                        <div key={exp.id} className="flex flex-col gap-1 break-inside-avoid">
                          <div className="flex items-baseline justify-between text-xs">
                            <span className="font-bold text-gray-900 text-sm">{exp.title}</span>
                            <span className="text-gray-600 font-medium">
                              {exp.startDate} – {exp.current ? "Present" : exp.endDate}
                            </span>
                          </div>
                          <div className="text-xs font-semibold text-gray-700">
                            {exp.company} • {exp.location}
                          </div>
                          {exp.description && (
                            <p className="text-xs text-gray-700 leading-relaxed pt-0.5 whitespace-pre-line">
                              {exp.description}
                            </p>
                          )}
                          {exp.skillsUsed && exp.skillsUsed.length > 0 && (
                            <div className="text-[11px] text-gray-600 font-medium pt-0.5">
                              Technologies: {exp.skillsUsed.join(", ")}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );

              case "projects":
                if (resumeDraft.projects.length === 0) return null;
                return (
                  <div key="projects" className="flex flex-col gap-3">
                    <h2 className="text-sm font-black uppercase tracking-wider text-gray-900 border-b border-gray-300 pb-1">
                      Projects
                    </h2>
                    <div className="flex flex-col gap-4">
                      {resumeDraft.projects.map((proj) => (
                        <div key={proj.id} className="flex flex-col gap-1 break-inside-avoid">
                          <div className="flex items-baseline justify-between text-xs">
                            <span className="font-bold text-gray-900 text-sm">{proj.title}</span>
                            {proj.url && (
                              <span className="text-gray-600 text-[11px] underline">
                                {proj.url}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-700 leading-relaxed pt-0.5">
                            {proj.description}
                          </p>
                          {proj.technologies && proj.technologies.length > 0 && (
                            <div className="text-[11px] text-gray-600 font-medium">
                              Stack: {proj.technologies.join(", ")}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );

              case "education":
                if (resumeDraft.education.length === 0) return null;
                return (
                  <div key="education" className="flex flex-col gap-3">
                    <h2 className="text-sm font-black uppercase tracking-wider text-gray-900 border-b border-gray-300 pb-1">
                      Education
                    </h2>
                    <div className="flex flex-col gap-3">
                      {resumeDraft.education.map((edu) => (
                        <div key={edu.id} className="flex items-baseline justify-between text-xs break-inside-avoid">
                          <div>
                            <span className="font-bold text-gray-900">{edu.degree}</span>
                            <span className="text-gray-700">, {edu.institution}</span>
                            {edu.grade && <span className="text-gray-600"> ({edu.grade})</span>}
                          </div>
                          <span className="text-gray-600 font-medium">
                            {edu.startYear} – {edu.endYear}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );

              default:
                return null;
            }
          })}
        </div>
      </div>

      {/* FACTUAL SUMMARY MODAL */}
      <Modal
        isOpen={isFactualSummaryOpen}
        onClose={() => setIsFactualSummaryOpen(false)}
        title="Factual Summary Suggestions"
        description="Deterministic suggestions drafted strictly from your confirmed profile answers."
        size="md"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-2 p-3 rounded-xl bg-background border border-border text-xs text-text-muted">
            <HelpCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <span>
              TAG never invents unverified achievements, metrics, or years. Select a suggestion below to populate your summary.
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {factualSummaryTemplates.map((tmpl, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedTemplateIndex(idx)}
                className={cn(
                  "p-3.5 rounded-xl border text-xs cursor-pointer transition-colors flex flex-col gap-2",
                  selectedTemplateIndex === idx
                    ? "border-primary bg-primary-soft/30 text-text-primary"
                    : "border-border-subtle bg-surface hover:border-primary/40 text-text-secondary"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[11px] text-primary">Template {idx + 1}</span>
                  {selectedTemplateIndex === idx && (
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  )}
                </div>
                <p className="leading-relaxed">{tmpl}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsFactualSummaryOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => handleApplyFactualSummary(factualSummaryTemplates[selectedTemplateIndex])}
            >
              Insert Selected Summary
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
