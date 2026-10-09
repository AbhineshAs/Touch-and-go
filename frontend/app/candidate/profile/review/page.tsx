"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge, SkillBadge } from "@/components/ui/Badge";
import {
  CheckCircle2,
  Edit2,
  Trash2,
  Plus,
  ArrowRight,
  ShieldCheck,
  Building2,
  GraduationCap,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { updateCandidateProfile } from "@/lib/api/candidate";

export default function ResumeReviewPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  // Extracted data state that user can edit/remove
  const [summary, setSummary] = useState(
    "Product-focused Frontend Engineer with 4.5+ years of experience engineering high-performance web applications, accessible design systems, and real-time interfaces."
  );

  const [experiences, setExperiences] = useState([
    {
      id: "exp_rev_1",
      title: "Senior Software Engineer (Frontend)",
      company: "KiteFlow Tech",
      location: "Bengaluru, India",
      dates: "Apr 2023 – Present",
      description:
        "Architected core merchant dashboard serving 40,000+ daily active businesses. Reduced LCP from 3.2s to 1.1s through granular code-splitting.",
    },
    {
      id: "exp_rev_2",
      title: "Frontend Engineer",
      company: "ZetaPay Solutions",
      location: "Bengaluru, India",
      dates: "Jul 2021 – Mar 2023",
      description:
        "Developed consumer checkout flow and responsive payment widget SDK embedded across 500+ Indian merchant storefronts.",
    },
  ]);

  const [education, setEducation] = useState([
    {
      id: "edu_rev_1",
      degree: "B.Tech in Computer Science and Engineering",
      institution: "National Institute of Technology Karnataka (NITK), Surathkal",
      years: "2017 – 2021",
      grade: "8.84 CGPA",
    },
  ]);

  const [skills, setSkills] = useState([
    "React",
    "Next.js",
    "TypeScript",
    "Tailwind CSS",
    "Design Systems",
    "Web Performance & Core Vitals",
    "TanStack Query",
  ]);

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleRemoveExperience = (id: string) => {
    setExperiences(experiences.filter((e) => e.id !== id));
  };

  const handleConfirmProfile = async () => {
    setIsSaving(true);
    await updateCandidateProfile({
      summary,
      completionPercentage: 92,
      resumeFileName: "Ananya_Sharma_Senior_Frontend_2026.pdf",
    });
    setIsSaving(false);
    router.push("/candidate/dashboard?verified=true");
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 pb-16">
      {/* Banner */}
      <div className="flex flex-col gap-2 pb-5 border-b border-border">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-soft text-primary-dark font-semibold text-xs border border-primary/20 w-fit">
          <ShieldCheck className="w-3.5 h-3.5 text-primary" />
          <span>Candidate Control Mandatory Gate</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
          Review your information
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-2xl">
          We&apos;ve organized the information extracted from your resume. Please review, edit, or remove any item before it becomes part of your TAG profile.
        </p>
      </div>

      {/* 1. Professional Summary Card */}
      <Card className="p-6 bg-surface border-border flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-text-primary">Professional Summary</h2>
          <span className="text-[11px] text-text-muted">Extracted from resume</span>
        </div>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={3}
          className="w-full p-3 rounded-lg border border-border bg-background text-xs sm:text-sm text-text-primary focus:outline-none focus:border-primary"
        />
      </Card>

      {/* 2. Extracted Experience */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-text-primary">
            Extracted Experience ({experiences.length})
          </h2>
          <span className="text-xs text-text-muted">Confirmed commercial roles</span>
        </div>

        <div className="flex flex-col gap-3">
          {experiences.map((exp) => (
            <Card key={exp.id} className="p-5 bg-surface border-border flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary-soft text-primary flex items-center justify-center shrink-0 font-bold">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-sm font-bold text-text-primary">{exp.title}</h3>
                    <span className="text-xs font-medium text-text-secondary">
                      {exp.company} • {exp.location}
                    </span>
                    <span className="text-[11px] text-text-muted mt-0.5">{exp.dates}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleRemoveExperience(exp.id)}
                    className="p-1.5 text-text-muted hover:text-danger rounded-lg hover:bg-background transition-colors cursor-pointer"
                    title="Remove experience"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-text-secondary leading-relaxed bg-background p-3 rounded-lg border border-border-subtle">
                {exp.description}
              </p>
            </Card>
          ))}
        </div>
      </div>

      {/* 3. Extracted Skills */}
      <Card className="p-6 bg-surface border-border flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h2 className="text-sm font-bold text-text-primary">Extracted Technical Skills ({skills.length})</h2>
            <p className="text-xs text-text-muted">Click &apos;✕&apos; to remove any inaccurate skill keyword.</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-md bg-primary-soft text-primary-dark border border-primary/20"
            >
              <span>{skill}</span>
              <button
                type="button"
                onClick={() => handleRemoveSkill(skill)}
                className="hover:text-danger text-text-muted p-0.5 rounded cursor-pointer"
                aria-label={`Remove ${skill}`}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      </Card>

      {/* 4. Extracted Education */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-bold text-text-primary">Extracted Education ({education.length})</h2>
        {education.map((edu) => (
          <Card key={edu.id} className="p-5 bg-surface border-border flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary-soft text-primary flex items-center justify-center shrink-0">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-sm font-bold text-text-primary">{edu.degree}</h3>
                <span className="text-xs text-text-secondary">{edu.institution}</span>
                <span className="text-[11px] text-text-muted mt-0.5">
                  {edu.years} • {edu.grade}
                </span>
              </div>
            </div>
            <span className="text-[11px] text-success font-semibold bg-success-soft px-2 py-0.5 rounded">
              Verified
            </span>
          </Card>
        ))}
      </div>

      {/* Sticky Bottom Confirmation Action */}
      <div className="sticky bottom-4 z-20 p-4 rounded-2xl bg-surface border border-border shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
          <p className="text-xs text-text-secondary leading-snug">
            By confirming, these structured fields will update your searchable profile and criteria match model.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
          <Link href="/candidate/profile" className="w-full sm:w-auto">
            <Button variant="secondary" size="md" className="w-full">
              Cancel
            </Button>
          </Link>
          <Button
            variant="primary"
            size="md"
            className="w-full sm:w-auto"
            isLoading={isSaving}
            onClick={handleConfirmProfile}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Confirm Profile
          </Button>
        </div>
      </div>
    </div>
  );
}
