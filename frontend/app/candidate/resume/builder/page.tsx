"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Printer,
  Save,
  CheckCircle2,
  Plus,
  Trash2,
  FileText,
  Eye,
  Edit3,
  Sparkles,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { useCandidate } from "@/lib/candidate/context/CandidateContext";
import { cn } from "@/lib/utils";

interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  duration: string;
  bullets: string[];
}

interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  year: string;
}

interface ProjectItem {
  id: string;
  title: string;
  tools: string;
  description: string;
}

export default function ResumeBuilderEditorPage() {
  const { candidateRecord, resumeDraft, updateResumeDraft } = useCandidate();

  // Basic Details
  const [fullName, setFullName] = useState(
    candidateRecord?.identity.fullName || "Alen William"
  );
  const [targetRole, setTargetRole] = useState(
    candidateRecord?.profile?.headline ||
      candidateRecord?.resumeDraft?.headline ||
      "Senior Frontend & Full Stack Engineer"
  );
  const [email, setEmail] = useState(
    candidateRecord?.identity.email || "alenwilliam92@gmail.com"
  );
  const [phone, setPhone] = useState(
    candidateRecord?.identity.phone || "+91 98765 43210"
  );
  const [location, setLocation] = useState(
    candidateRecord?.profile?.location ||
      candidateRecord?.resumeDraft?.contact?.location ||
      "Bengaluru, India (Remote / Hybrid)"
  );
  const [portfolioUrl, setPortfolioUrl] = useState("https://alenwilliam.dev");
  const [linkedinUrl, setLinkedinUrl] = useState("https://linkedin.com/in/alenwilliam");

  // Summary
  const [summary, setSummary] = useState(
    candidateRecord?.profile?.summary ||
      candidateRecord?.resumeDraft?.summary ||
      "Impact-focused Software Engineer with 4+ years of experience architecting high-performance web applications, scalable component systems, and real-time frontend services using TypeScript, Next.js, and modern cloud technologies."
  );

  // Skills
  const [skills, setSkills] = useState<string[]>(
    candidateRecord?.resumeDraft?.skills && candidateRecord.resumeDraft.skills.length > 0
      ? candidateRecord.resumeDraft.skills
      : candidateRecord?.profile?.skills && candidateRecord.profile.skills.length > 0
        ? candidateRecord.profile.skills.map((s) => (typeof s === "string" ? s : s.name))
        : [
            "React",
            "Next.js",
            "TypeScript",
            "JavaScript (ES6+)",
            "Tailwind CSS",
            "Node.js",
            "REST APIs",
            "GraphQL",
            "Git & CI/CD",
            "Jest & Testing",
            "System Design",
            "Performance Optimization",
          ]
  );
  const [newSkillInput, setNewSkillInput] = useState("");

  // Experience
  const [experiences, setExperiences] = useState<ExperienceItem[]>([
    {
      id: "exp-1",
      company: "TechNova Solutions",
      role: "Senior Frontend Engineer",
      duration: "2023 – Present",
      bullets: [
        "Spearheaded redesign of core checkout flow, improving page conversion by 28% and reducing bundle size by 42%.",
        "Engineered shared design system components adopted by 14 cross-functional development squads.",
        "Mentored 4 junior engineers on TypeScript best practices, unit testing patterns, and code review standards.",
      ],
    },
    {
      id: "exp-2",
      company: "Zynorix Global Systems",
      role: "Frontend Developer",
      duration: "2021 – 2023",
      bullets: [
        "Built responsive client portals handling 85,000+ monthly active enterprise users with 99.9% uptime.",
        "Integrated real-time analytics streaming pipelines using WebSockets and REST APIs.",
        "Reduced Lighthouse first-contentful-paint (FCP) latency from 2.8s to 0.9s across all core dashboards.",
      ],
    },
  ]);

  // Education
  const [education, setEducation] = useState<EducationItem[]>([
    {
      id: "edu-1",
      institution: "National Institute of Technology",
      degree: "B.Tech in Computer Science & Engineering",
      year: "2017 – 2021",
    },
  ]);

  // Projects
  const [projects, setProjects] = useState<ProjectItem[]>([
    {
      id: "proj-1",
      title: "Touch And Go (TAG) Candidate Ecosystem",
      tools: "Next.js, TypeScript, Tailwind CSS, TanStack Query",
      description:
        "High-performance candidate discovery and matching portal featuring 1-touch matched opportunities, automated profile scoring, and intelligent ATS resume analysis.",
    },
  ]);

  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [isSaved, setIsSaved] = useState(false);

  const handleAddSkill = () => {
    if (!newSkillInput.trim()) return;
    if (!skills.includes(newSkillInput.trim())) {
      setSkills([...skills, newSkillInput.trim()]);
    }
    setNewSkillInput("");
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleAddExperience = () => {
    const newExp: ExperienceItem = {
      id: `exp-${Date.now()}`,
      company: "Company Name",
      role: "Job Title",
      duration: "2022 – Present",
      bullets: ["Describe quantifiable impact and key technologies used."],
    };
    setExperiences([...experiences, newExp]);
  };

  const handleUpdateExperience = (
    id: string,
    field: keyof ExperienceItem,
    val: any
  ) => {
    setExperiences(
      experiences.map((exp) => (exp.id === id ? { ...exp, [field]: val } : exp))
    );
  };

  const handleAddBullet = (expId: string) => {
    setExperiences(
      experiences.map((exp) =>
        exp.id === expId
          ? { ...exp, bullets: [...exp.bullets, "New outcome or responsibility."] }
          : exp
      )
    );
  };

  const handleUpdateBullet = (
    expId: string,
    bulletIdx: number,
    val: string
  ) => {
    setExperiences(
      experiences.map((exp) => {
        if (exp.id !== expId) return exp;
        const newBullets = [...exp.bullets];
        newBullets[bulletIdx] = val;
        return { ...exp, bullets: newBullets };
      })
    );
  };

  const handleRemoveBullet = (expId: string, bulletIdx: number) => {
    setExperiences(
      experiences.map((exp) => {
        if (exp.id !== expId) return exp;
        return {
          ...exp,
          bullets: exp.bullets.filter((_, idx) => idx !== bulletIdx),
        };
      })
    );
  };

  const handleRemoveExperience = (id: string) => {
    setExperiences(experiences.filter((exp) => exp.id !== id));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveDraft = () => {
    if (updateResumeDraft) {
      updateResumeDraft({
        headline: targetRole,
        summary,
        skills,
      });
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-8 py-6 sm:py-8 bg-[#F8FAFC]">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
          <div className="flex items-center gap-3">
            <Link
              href="/candidate/resume"
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-2xs transition-colors cursor-pointer"
              aria-label="Back to Resume Overview"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  ATS Resume Builder
                </h1>
                <span className="text-[11px] font-bold text-[#4F46E5] bg-[#EEF2FF] px-2.5 py-0.5 rounded-full border border-indigo-200">
                  ATS-Clean Template
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Single-column, high-parser-compliance layout tested for enterprise hiring systems.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* View Switcher (Desktop/Mobile) */}
            <div className="flex items-center p-1 bg-white border border-slate-200 rounded-xl shadow-2xs lg:hidden">
              <button
                type="button"
                onClick={() => setActiveTab("edit")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                  activeTab === "edit"
                    ? "bg-indigo-50 text-[#4F46E5]"
                    : "text-slate-600"
                )}
              >
                <Edit3 className="w-3.5 h-3.5 inline mr-1" />
                Edit
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                  activeTab === "preview"
                    ? "bg-indigo-50 text-[#4F46E5]"
                    : "text-slate-600"
                )}
              >
                <Eye className="w-3.5 h-3.5 inline mr-1" />
                Preview
              </button>
            </div>

            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {isSaved ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#4F46E5]" />
                  <span className="text-[#4F46E5] font-bold">Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Draft</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-xs shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Download PDF</span>
            </button>
          </div>
        </div>

        {/* 2-Column Responsive Workspace: Editor (Left) & Realtime A4 Preview (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: FORM EDITORS (7 cols) */}
          <div
            className={cn(
              "lg:col-span-6 xl:col-span-7 flex flex-col gap-6",
              activeTab === "preview" && "hidden lg:flex"
            )}
          >
            {/* Section 1: Personal Details */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] flex flex-col gap-4">
              <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span>1. Personal &amp; Contact Details</span>
                <span className="text-[11px] font-normal text-slate-400">Header info</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-900 focus:border-[#4F46E5] focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">Target Role Title</label>
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-900 focus:border-[#4F46E5] focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-900 focus:border-[#4F46E5] focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-900 focus:border-[#4F46E5] focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1 sm:col-span-2">
                  <label className="font-semibold text-slate-700">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-900 focus:border-[#4F46E5] focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">Portfolio / Website</label>
                  <input
                    type="url"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    className="h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-900 focus:border-[#4F46E5] focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">LinkedIn Profile</label>
                  <input
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    className="h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-900 focus:border-[#4F46E5] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Summary */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] flex flex-col gap-3">
              <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span>2. Professional Summary</span>
                <span className="text-[11px] font-normal text-slate-400">3-4 lines recommended</span>
              </h2>
              <textarea
                rows={4}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="p-3 rounded-xl border border-slate-200 text-xs text-slate-900 focus:border-[#4F46E5] focus:outline-none leading-relaxed"
              />
            </div>

            {/* Section 3: Skills */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] flex flex-col gap-3">
              <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span>3. Core Skills &amp; Competencies</span>
                <span className="text-[11px] font-normal text-slate-400">{skills.length} skills listed</span>
              </h2>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSkill())}
                  placeholder="e.g. Docker, GraphQL, Kubernetes..."
                  className="flex-1 h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-900 focus:border-[#4F46E5] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-3.5 h-9 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Section 4: Work Experience */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-900">4. Work Experience</h2>
                <button
                  type="button"
                  onClick={handleAddExperience}
                  className="px-3 py-1.5 rounded-lg bg-indigo-50 text-[#4F46E5] hover:bg-indigo-100 font-semibold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Role</span>
                </button>
              </div>

              <div className="flex flex-col gap-5">
                {experiences.map((exp, expIdx) => (
                  <div
                    key={exp.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col gap-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">
                        Role #{expIdx + 1}
                      </span>
                      {experiences.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveExperience(exp.id)}
                          className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                      <input
                        type="text"
                        placeholder="Company Name"
                        value={exp.company}
                        onChange={(e) =>
                          handleUpdateExperience(exp.id, "company", e.target.value)
                        }
                        className="h-8.5 px-2.5 rounded-lg border border-slate-200 bg-white font-medium"
                      />
                      <input
                        type="text"
                        placeholder="Job Title / Role"
                        value={exp.role}
                        onChange={(e) =>
                          handleUpdateExperience(exp.id, "role", e.target.value)
                        }
                        className="h-8.5 px-2.5 rounded-lg border border-slate-200 bg-white font-medium"
                      />
                      <input
                        type="text"
                        placeholder="Duration (e.g. 2022 - Present)"
                        value={exp.duration}
                        onChange={(e) =>
                          handleUpdateExperience(exp.id, "duration", e.target.value)
                        }
                        className="h-8.5 px-2.5 rounded-lg border border-slate-200 bg-white font-medium"
                      />
                    </div>

                    {/* Bullet Points */}
                    <div className="flex flex-col gap-2 pt-1">
                      <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                        Bullet Points &amp; Outcomes
                      </label>
                      {exp.bullets.map((bullet, bIdx) => (
                        <div key={bIdx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={bullet}
                            onChange={(e) =>
                              handleUpdateBullet(exp.id, bIdx, e.target.value)
                            }
                            className="flex-1 h-8.5 px-2.5 rounded-lg border border-slate-200 bg-white text-xs"
                          />
                          {exp.bullets.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveBullet(exp.id, bIdx)}
                              className="text-slate-400 hover:text-red-600 cursor-pointer p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => handleAddBullet(exp.id)}
                        className="self-start text-[11px] font-semibold text-[#4F46E5] hover:underline cursor-pointer pt-1"
                      >
                        + Add Bullet Point
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 5: Education */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] flex flex-col gap-4">
              <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
                5. Education
              </h2>
              {education.map((edu) => (
                <div key={edu.id} className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) =>
                      setEducation(
                        education.map((ed) =>
                          ed.id === edu.id ? { ...ed, degree: e.target.value } : ed
                        )
                      )
                    }
                    placeholder="Degree / Program"
                    className="h-8.5 px-2.5 rounded-lg border border-slate-200"
                  />
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) =>
                      setEducation(
                        education.map((ed) =>
                          ed.id === edu.id ? { ...ed, institution: e.target.value } : ed
                        )
                      )
                    }
                    placeholder="Institution"
                    className="h-8.5 px-2.5 rounded-lg border border-slate-200"
                  />
                  <input
                    type="text"
                    value={edu.year}
                    onChange={(e) =>
                      setEducation(
                        education.map((ed) =>
                          ed.id === edu.id ? { ...ed, year: e.target.value } : ed
                        )
                      )
                    }
                    placeholder="Graduation Year"
                    className="h-8.5 px-2.5 rounded-lg border border-slate-200"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: REALTIME A4 DOCUMENT PREVIEW (5-6 cols) */}
          <div
            className={cn(
              "lg:col-span-6 xl:col-span-5 sticky top-6",
              activeTab === "edit" && "hidden lg:block"
            )}
          >
            <div className="bg-white border border-slate-300 rounded-2xl p-6 sm:p-8 shadow-md text-slate-900 font-sans print:shadow-none print:border-none print:m-0 print:p-0">
              {/* Resume Document Header */}
              <div className="flex flex-col items-center text-center pb-4 border-b-2 border-slate-900">
                <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-slate-900">
                  {fullName}
                </h1>
                <p className="text-xs font-semibold text-[#4F46E5] uppercase tracking-wide mt-0.5">
                  {targetRole}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-[11px] text-slate-600 mt-2">
                  <span>{email}</span>
                  <span>•</span>
                  <span>{phone}</span>
                  <span>•</span>
                  <span>{location}</span>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-x-2 text-[11px] text-[#4F46E5] mt-1">
                  {portfolioUrl && <span>{portfolioUrl}</span>}
                  {linkedinUrl && (
                    <>
                      <span>•</span>
                      <span>{linkedinUrl}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Summary */}
              {summary && (
                <div className="py-3 border-b border-slate-200">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-1">
                    Professional Summary
                  </h2>
                  <p className="text-[11px] text-slate-700 leading-relaxed">{summary}</p>
                </div>
              )}

              {/* Skills */}
              {skills.length > 0 && (
                <div className="py-3 border-b border-slate-200">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-1">
                    Core Technical Skills
                  </h2>
                  <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
                    {skills.join(" • ")}
                  </p>
                </div>
              )}

              {/* Work Experience */}
              {experiences.length > 0 && (
                <div className="py-3 border-b border-slate-200">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">
                    Work Experience
                  </h2>
                  <div className="flex flex-col gap-3">
                    {experiences.map((exp) => (
                      <div key={exp.id} className="flex flex-col">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-900">{exp.role}</span>
                          <span className="text-[11px] font-semibold text-slate-500">
                            {exp.duration}
                          </span>
                        </div>
                        <span className="text-[11px] font-semibold text-[#4F46E5]">
                          {exp.company}
                        </span>
                        <ul className="list-disc list-inside mt-1 flex flex-col gap-1 text-[11px] text-slate-700 leading-relaxed">
                          {exp.bullets.map((b, idx) => (
                            <li key={idx}>{b}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {education.length > 0 && (
                <div className="py-3 border-b border-slate-200">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-1.5">
                    Education
                  </h2>
                  {education.map((edu) => (
                    <div key={edu.id} className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900">{edu.degree}</span>
                        <span className="text-slate-600"> — {edu.institution}</span>
                      </div>
                      <span className="text-[11px] text-slate-500">{edu.year}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Projects */}
              {projects.length > 0 && (
                <div className="pt-3">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-1.5">
                    Key Projects
                  </h2>
                  {projects.map((proj) => (
                    <div key={proj.id} className="flex flex-col text-xs mb-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{proj.title}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {proj.tools}
                      </span>
                      <p className="text-[11px] text-slate-700 mt-0.5 leading-relaxed">
                        {proj.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
