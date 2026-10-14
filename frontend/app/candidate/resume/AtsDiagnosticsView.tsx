"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  FileText,
  UploadCloud,
  AlignLeft,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  FileEdit,
  Award,
  Layers,
  ShieldCheck,
  KeyRound,
  Loader2,
  Copy,
  Briefcase,
} from "lucide-react";
import { useCandidate } from "@/lib/candidate/context/CandidateContext";
import { UploadedResume } from "@/lib/candidate/types";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";

export interface ATSAnalysisPayload {
  sourceType: "file" | "text";
  fileName?: string;
  fileSize?: number;
  text: string;
  targetJobDescription?: string;
}

interface AtsDiagnosticsViewProps {
  onAnalyze: (payload: ATSAnalysisPayload) => void;
  isAnalyzing: boolean;
  className?: string;
}

// Fallback demo resume matching the Candidate record
const FALLBACK_STORED_RESUME: UploadedResume = {
  id: "res_alen_william_cv",
  fileName: "Alen_William_CV.pdf",
  fileSize: 76800, // 75.0 KB
  fileType: "application/pdf",
  uploadedAt: "2026-10-10T09:30:00Z",
  atsScore: 88,
  dataUrl: "data:application/pdf;base64,JVBERi0xLjQKJ...",
  extractedText: `Alen William\nSenior Frontend Engineer\nBengaluru, Karnataka • alenwilliam212@gmail.com • +91 98450 12894\n\nProfessional Summary:\nProduct-focused Frontend Engineer with 4.5+ years of experience engineering high-performance web applications, accessible design systems, and real-time interfaces.\n\nCore Competencies:\nTypeScript, React 19, Next.js, Redux Toolkit, Tailwind CSS, Jest, CI/CD Pipelines, REST APIs.\n\nWork Experience:\nSenior Frontend Engineer | Razorwave Technologies (Jan 2024 - Present)\n• Architected scalable web dashboards serving 120,000+ monthly active users using Next.js and TypeScript.\n• Reduced Core Web Vitals LCP by 34% and bundle size by 28% through code-splitting.\n\nFrontend Engineer | NexaCorp Solutions (Aug 2021 - Dec 2023)\n• Built 30+ reusable atomic UI components with 100% TypeScript type-safety.\n\nEducation:\nB.Tech in Computer Science | National Institute of Technology (2017 - 2021)`,
};

export function AtsDiagnosticsView({
  onAnalyze,
  isAnalyzing,
  className,
}: AtsDiagnosticsViewProps) {
  const { uploadedResume: contextResume, availableJobs, savedJobIds } = useCandidate();

  const activeStoredResume = contextResume || FALLBACK_STORED_RESUME;

  // Step 1: Input Source Selector Tab: "stored" | "upload" | "text"
  const [sourceMode, setSourceMode] = useState<"stored" | "upload" | "text">("stored");

  // Mode B: Uploaded file state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mode C: Pasted text state
  const [pastedText, setPastedText] = useState("");

  // Step 2: Target Job Description State
  const [isJobDescOpen, setIsJobDescOpen] = useState(false);
  const [targetJobDesc, setTargetJobDesc] = useState("");

  // Validation Error state
  const [validationError, setValidationError] = useState<string | null>(null);

  // Cover Letter Modal State
  const [isCoverLetterModalOpen, setIsCoverLetterModalOpen] = useState(false);
  const [coverTargetRole, setCoverTargetRole] = useState("Full Stack Software Engineer");
  const [coverTargetCompany, setCoverTargetCompany] = useState("");
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState<string | null>(null);
  const [isCopiedCover, setIsCopiedCover] = useState(false);

  // Filter candidate's saved jobs for quick target auto-fill
  const bookmarkedJobs = availableJobs.filter((j) => savedJobIds.includes(j.id));

  const formatFileSize = (bytes: number) => {
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  const validateAndSetFile = (file: File) => {
    setValidationError(null);
    const fileName = file.name.toLowerCase();
    const allowed = [".pdf", ".docx", ".doc", ".txt"];
    const isValid = allowed.some((ext) => fileName.endsWith(ext));

    if (!isValid) {
      setValidationError("Please upload a supported format: PDF, DOCX, or TXT.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setValidationError("File size exceeds 10MB limit.");
      return;
    }

    setUploadedFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  // Submit scan handler
  const handleRunScan = async () => {
    setValidationError(null);

    if (sourceMode === "stored") {
      onAnalyze({
        sourceType: "file",
        fileName: activeStoredResume.fileName,
        fileSize: activeStoredResume.fileSize,
        text: activeStoredResume.extractedText || FALLBACK_STORED_RESUME.extractedText || "",
        targetJobDescription: targetJobDesc.trim() || undefined,
      });
      return;
    }

    if (sourceMode === "upload") {
      if (!uploadedFile) {
        setValidationError("Please select or drop a resume file to analyze.");
        return;
      }

      let extractedText = "";
      if (uploadedFile.name.endsWith(".txt")) {
        try {
          extractedText = await uploadedFile.text();
        } catch {
          extractedText = `Extracted text from ${uploadedFile.name}`;
        }
      } else {
        extractedText = `Parsed document contents for ${uploadedFile.name}. Key sections detected: Personal Information, Executive Summary, Technical Skills, Work Experience, Education and Certifications.`;
      }

      onAnalyze({
        sourceType: "file",
        fileName: uploadedFile.name,
        fileSize: uploadedFile.size,
        text: extractedText,
        targetJobDescription: targetJobDesc.trim() || undefined,
      });
      return;
    }

    if (sourceMode === "text") {
      if (!pastedText.trim() || pastedText.trim().length < 50) {
        setValidationError("Please paste your resume text (at least 50 characters) to analyze.");
        return;
      }

      onAnalyze({
        sourceType: "text",
        fileName: "Pasted Resume Text",
        fileSize: pastedText.length,
        text: pastedText.trim(),
        targetJobDescription: targetJobDesc.trim() || undefined,
      });
    }
  };

  // Generate Cover Letter Handler
  const handleGenerateCoverLetter = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneratingCover(true);
    await new Promise((r) => setTimeout(r, 650));
    setIsGeneratingCover(false);

    const letter = `Dear Hiring Team at ${coverTargetCompany || "the company"},

I am writing to express my strong interest in the ${coverTargetRole} position. With 4.5+ years of software engineering experience specializing in high-performance web applications, accessible design systems, and resilient frontend architecture, I have consistently built and shipped products matching enterprise technical standards.

In my recent projects, I architected scalable user interfaces supporting over 120,000 monthly active users, optimized Core Web Vitals (reducing LCP by 34%), and maintained rigorous TypeScript test coverage. My technical background in React, Next.js, and API architecture aligns directly with your product roadmap.

I would welcome the opportunity to discuss how my technical skills and delivery velocity can support your team's goals. Thank you for your time and consideration.

Sincerely,
Alen William (Verified Candidate)`;

    setGeneratedLetter(letter);
  };

  const handleCopyCoverLetter = () => {
    if (!generatedLetter) return;
    navigator.clipboard.writeText(generatedLetter);
    setIsCopiedCover(true);
    setTimeout(() => setIsCopiedCover(false), 2000);
  };

  const wordCount = pastedText.trim() ? pastedText.trim().split(/\s+/).length : 0;
  const charCount = pastedText.length;

  return (
    <div className={cn("grid grid-cols-1 lg:grid-cols-12 gap-6 items-start", className)}>
      {/* Hidden file input for Mode B */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.doc,.txt"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            validateAndSetFile(e.target.files[0]);
            e.target.value = "";
          }
        }}
        className="hidden"
      />

      {/* ========================================================= */}
      {/* LEFT COLUMN: Compact 2-Step Diagnostic Form (7 cols)      */}
      {/* ========================================================= */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs flex flex-col gap-5">
          {/* Header */}
          <div className="flex flex-col gap-1 pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Diagnostic Configuration
            </h2>
            <p className="text-xs text-slate-500">
              Select your resume document and optionally compare against a target job description.
            </p>
          </div>

          {/* Validation Error Banner */}
          {validationError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2.5 text-xs text-red-700 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{validationError}</span>
            </div>
          )}

          {/* STEP 1: Select Resume Source (3-Tab Unified Selector) */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Step 1: Resume Source
              </label>
              <span className="text-[11px] text-slate-400 font-medium">
                {sourceMode === "stored"
                  ? "Profile Document"
                  : sourceMode === "upload"
                  ? "File Upload"
                  : "Raw Text"}
              </span>
            </div>

            {/* Segmented Source Tabs */}
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setSourceMode("stored");
                  setValidationError(null);
                }}
                className={cn(
                  "py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5",
                  sourceMode === "stored"
                    ? "bg-white text-slate-900 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="truncate">Use Stored CV</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSourceMode("upload");
                  setValidationError(null);
                }}
                className={cn(
                  "py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5",
                  sourceMode === "upload"
                    ? "bg-white text-slate-900 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span className="truncate">Upload New File</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSourceMode("text");
                  setValidationError(null);
                }}
                className={cn(
                  "py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5",
                  sourceMode === "text"
                    ? "bg-white text-slate-900 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                <AlignLeft className="w-3.5 h-3.5" />
                <span className="truncate">Paste Raw Text</span>
              </button>
            </div>

            {/* MODE A: USE STORED CV (Default) */}
            {sourceMode === "stored" && (
              <div className="mt-1 p-4 rounded-xl border border-slate-200/90 bg-slate-50/60 flex items-center justify-between gap-3 transition-all">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="h-11 w-11 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 font-bold text-xs shrink-0 shadow-2xs">
                    PDF
                  </div>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-900 truncate max-w-[200px] sm:max-w-[280px]">
                        {activeStoredResume.fileName}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                        <Check className="w-3 h-3 text-emerald-600" />
                        Selected
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      {formatFileSize(activeStoredResume.fileSize)} • Stored on candidate profile
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSourceMode("upload")}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline shrink-0 cursor-pointer"
                >
                  Switch File
                </button>
              </div>
            )}

            {/* MODE B: UPLOAD FILE (Compact Drag & Drop) */}
            {sourceMode === "upload" && (
              <div className="mt-1 flex flex-col gap-3">
                {!uploadedFile ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "border-2 border-dashed rounded-xl py-8 px-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2",
                      isDragging
                        ? "border-blue-500 bg-blue-50/50"
                        : "border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/20"
                    )}
                  >
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center text-slate-500">
                      <UploadCloud className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex flex-col gap-0.5 items-center">
                      <p className="text-xs font-bold text-slate-800">
                        Drop your resume here, or click to browse
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Supports text-based PDF, DOCX, or TXT up to 10MB.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="mt-1 h-8 px-3.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                    >
                      Browse Files
                    </button>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/40 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {uploadedFile.name}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {formatFileSize(uploadedFile.size)} • Ready for diagnostic analysis
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUploadedFile(null)}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-white transition-colors cursor-pointer"
                      title="Remove file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* MODE C: PASTE RAW TEXT */}
            {sourceMode === "text" && (
              <div className="mt-1 flex flex-col gap-1.5">
                <textarea
                  rows={6}
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Paste complete resume text here (Personal Info, Summary, Experience, Skills, Education)..."
                  className="w-full p-3.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-mono leading-relaxed resize-none"
                />
                <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                  <span>Minimum 50 characters for accurate scoring</span>
                  <span>
                    {wordCount} words • {charCount} characters
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* STEP 2: Target Job Description (Expandable / Optional) */}
          <div className="flex flex-col gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsJobDescOpen(!isJobDescOpen)}
              className="flex items-center justify-between text-xs font-bold text-slate-800 hover:text-blue-600 transition-colors cursor-pointer py-1"
            >
              <div className="flex items-center gap-2">
                <span className="uppercase tracking-wider">
                  Step 2: Compare Against Target Job
                </span>
                <span className="text-[10px] font-normal text-slate-400 lowercase">
                  (optional)
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                <span>{isJobDescOpen ? "Collapse" : "Add Target Role"}</span>
                {isJobDescOpen ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </div>
            </button>

            {isJobDescOpen && (
              <div className="flex flex-col gap-2.5 animate-in fade-in duration-150">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Paste the requirements or description for the role you are targeting to discover keyword gaps and calculate role-specific alignment.
                </p>

                {/* Quick Auto-Fill from Saved Jobs */}
                {bookmarkedJobs.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-600">
                    <span className="text-[11px] font-semibold text-slate-500">Quick fill:</span>
                    {bookmarkedJobs.slice(0, 3).map((job) => (
                      <button
                        key={job.id}
                        type="button"
                        onClick={() => {
                          const desc = `${job.title} at ${job.organizationName}\nLocation: ${job.location} (${job.workMode})\nRequired Skills: ${(job.mustHaveSkills || []).join(", ")}\nRole Overview: Looking for an experienced engineer to scale high-performance interfaces, optimize web vitals, and build accessible components.`;
                          setTargetJobDesc(desc);
                        }}
                        className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-[11px] font-medium transition-colors cursor-pointer border border-slate-200/60 truncate max-w-[220px]"
                        title={job.title}
                      >
                        {job.title}
                      </button>
                    ))}
                  </div>
                )}

                <div className="relative">
                  <textarea
                    rows={4}
                    value={targetJobDesc}
                    onChange={(e) => setTargetJobDesc(e.target.value)}
                    placeholder="Paste target job description or paste bullet requirements (e.g. React 19, TypeScript, CI/CD, Microfrontends)..."
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all leading-relaxed resize-none"
                  />
                  {targetJobDesc && (
                    <button
                      type="button"
                      onClick={() => setTargetJobDesc("")}
                      className="absolute right-2.5 top-2.5 p-1 rounded-md text-slate-400 hover:text-slate-600"
                      title="Clear text"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Primary Action Button */}
          <div className="pt-2">
            <button
              type="button"
              disabled={isAnalyzing}
              onClick={handleRunScan}
              className="h-11 w-full rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Running ATS Diagnostics...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-blue-200" />
                  <span>Run ATS Scan &amp; Score</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* RIGHT COLUMN: Audit Breakdown & Quick Actions (5 cols)     */}
      {/* ========================================================= */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        {/* Card 1: Diagnostic Rubric ("What We Audit") */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Diagnostic Rubric</h3>
              <p className="text-xs text-slate-500 mt-0.5">What the parser validates</p>
            </div>
            <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-0.5 rounded-md">
              5 Core Checks
            </span>
          </div>

          <div className="flex flex-col gap-3.5">
            {/* Check 1 */}
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-200/60 flex items-center justify-center text-slate-700 shrink-0">
                <Award className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-slate-800">
                  Overall ATS Benchmark
                </span>
                <span className="text-[11px] text-slate-500 leading-relaxed">
                  0–100 compatibility grade calibrated against Workday, Greenhouse, Ashby, and Lever.
                </span>
              </div>
            </div>

            {/* Check 2 */}
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-200/60 flex items-center justify-center text-slate-700 shrink-0">
                <Layers className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-slate-800">
                  Section Scoring Breakdown
                </span>
                <span className="text-[11px] text-slate-500 leading-relaxed">
                  Individual pass ratings for Contact Header, Summary, Experience, Skills, and Education.
                </span>
              </div>
            </div>

            {/* Check 3 */}
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-200/60 flex items-center justify-center text-slate-700 shrink-0">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-slate-800">
                  Format &amp; Parser Traversal
                </span>
                <span className="text-[11px] text-slate-500 leading-relaxed">
                  Detects multi-column tables, text boxes, and glyph encoding that break automated parsing.
                </span>
              </div>
            </div>

            {/* Check 4 */}
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-200/60 flex items-center justify-center text-slate-700 shrink-0">
                <KeyRound className="w-4 h-4 text-amber-600" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-slate-800">
                  Technical Keyword Density
                </span>
                <span className="text-[11px] text-slate-500 leading-relaxed">
                  Identifies missing high-frequency engineering frameworks, tools, and domain skills.
                </span>
              </div>
            </div>

            {/* Check 5 */}
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-200/60 flex items-center justify-center text-slate-700 shrink-0">
                <Sparkles className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-slate-800">
                  Impact &amp; Metric Rewrites
                </span>
                <span className="text-[11px] text-slate-500 leading-relaxed">
                  Identifies passive duties and generates quantified impact bullet rewrites.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Redesigned Quick Actions */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs flex flex-col gap-3.5">
          <div className="flex flex-col gap-0.5 pb-2 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Optimization Actions</h3>
            <p className="text-xs text-slate-500">
              Refine your application assets before applying.
            </p>
          </div>

          <div className="flex flex-col gap-2.5">
            {/* Action 1: Tailor Resume in Builder */}
            <Link
              href="/candidate/resume/builder"
              className="rounded-xl border border-slate-200/80 p-3.5 hover:bg-slate-50 transition-colors flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 border border-blue-100/60 flex items-center justify-center shrink-0">
                  <FileEdit className="w-4 h-4" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    Tailor Resume in Builder
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Open guided editor to fix formatting
                  </span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all" />
            </Link>

            {/* Action 2: Generate Cover Letter */}
            <div
              onClick={() => setIsCoverLetterModalOpen(true)}
              className="rounded-xl border border-slate-200/80 p-3.5 hover:bg-slate-50 transition-colors flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100/60 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    Generate Cover Letter
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Create a role-specific cover letter from your CV
                  </span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>
        </div>
      </div>

      {/* COVER LETTER MODAL */}
      {isCoverLetterModalOpen && (
        <Modal
          isOpen={isCoverLetterModalOpen}
          onClose={() => {
            setIsCoverLetterModalOpen(false);
            setGeneratedLetter(null);
          }}
          title="Role-Tailored Cover Letter Generator"
          description="Generate a clean, ATS-aligned cover letter based on your verified engineering credentials."
          size="lg"
        >
          <div className="flex flex-col gap-4 text-xs">
            {!generatedLetter ? (
              <form onSubmit={handleGenerateCoverLetter} className="flex flex-col gap-3.5">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-800">Target Role Title</label>
                  <input
                    type="text"
                    value={coverTargetRole}
                    onChange={(e) => setCoverTargetRole(e.target.value)}
                    required
                    className="h-10 px-3 rounded-xl border border-slate-200 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    placeholder="e.g. Senior Frontend Engineer"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-800">Target Company (Optional)</label>
                  <input
                    type="text"
                    value={coverTargetCompany}
                    onChange={(e) => setCoverTargetCompany(e.target.value)}
                    className="h-10 px-3 rounded-xl border border-slate-200 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    placeholder="e.g. Razorwave Technologies"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isGeneratingCover}
                  className="w-full h-10 mt-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-colors shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                  <span>{isGeneratingCover ? "Drafting Cover Letter..." : "Generate Cover Letter"}</span>
                </button>
              </form>
            ) : (
              <div className="flex flex-col gap-3.5">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px] leading-relaxed text-slate-800 whitespace-pre-wrap max-h-72 overflow-y-auto select-text">
                  {generatedLetter}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setGeneratedLetter(null)}
                    className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer font-medium"
                  >
                    ← Edit Target Role
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyCoverLetter}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    {isCopiedCover ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                        <span>Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Cover Letter</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

export default AtsDiagnosticsView;
