"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  FileText,
  Eye,
  Download,
  UploadCloud,
  Trash2,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  FileEdit,
  ShieldCheck,
  Check,
  X,
  Clock,
  ArrowLeft,
  AlertCircle,
  RefreshCw,
  FileCheck,
  Layers,
  Search,
  ExternalLink,
  Info,
} from "lucide-react";
import { useCandidate } from "@/lib/candidate/context/CandidateContext";
import { UploadedResume } from "@/lib/candidate/types";
import { Modal } from "@/components/ui/Modal";
import { AtsDiagnosticsView, ATSAnalysisPayload } from "./AtsDiagnosticsView";
import { ATSScoreReport, ATSReportData } from "@/components/resume/ATSScoreReport";
import { cn } from "@/lib/utils";

// Fallback demo resume for new accounts or presentation state
const DEFAULT_DEMO_RESUME: UploadedResume = {
  id: "res_alen_william_cv",
  fileName: "Alen_William_CV.pdf",
  fileSize: 76800, // 75.0 KB
  fileType: "application/pdf",
  uploadedAt: "2026-10-10T09:30:00Z",
  atsScore: 88,
  dataUrl: "data:application/pdf;base64,JVBERi0xLjQKJ...",
  extractedText: `Alen William
Senior Frontend Engineer
Bengaluru, Karnataka • alenwilliam212@gmail.com • +91 98450 12894

Professional Summary:
Product-focused Frontend Engineer with 4.5+ years of experience engineering high-performance web applications, accessible design systems, and real-time interfaces. Proven track record scaling fintech and SaaS user interfaces across distributed teams.

Core Competencies:
• Languages & Frameworks: TypeScript, JavaScript (ESNext), React 19, Next.js (App Router), HTML5, CSS3/Tailwind
• State & Architecture: Redux Toolkit, Zustand, React Query, RESTful APIs, WebSockets
• Testing & Tooling: Jest, React Testing Library, Playwright, Vite, Webpack, Git, CI/CD Pipelines
• Performance: Core Web Vitals, SSR/SSG, code-splitting, memoization, lazy loading

Work Experience:
Senior Frontend Engineer | Razorwave Technologies (Jan 2024 - Present)
• Architected scalable web dashboards serving 120,000+ monthly active users using Next.js and TypeScript.
• Reduced Core Web Vitals LCP by 34% and bundle size by 28% through code-splitting and asset optimization.
• Mentored 4 junior engineers and conducted weekly design system code reviews.

Frontend Engineer | NexaCorp Solutions (Aug 2021 - Dec 2023)
• Developed 30+ reusable atomic UI components with 100% TypeScript type-safety and accessibility compliance.
• Integrated RESTful endpoints and WebSocket streams for live financial transaction tracking.

Education:
B.Tech in Computer Science & Engineering | National Institute of Technology (2017 - 2021)
• GPA: 8.8/10.0 • First Class with Distinction`,
};

export function ResumePage() {
  const {
    uploadedResume: contextResume,
    uploadResume,
    replaceResume,
    deleteResume,
    updateResumeScore,
  } = useCandidate();

  // Mode state: Document & Builder vs ATS Diagnostics
  const [activeTab, setActiveTab] = useState<"document" | "ats">("document");

  // Local active resume state (falls back to DEFAULT_DEMO_RESUME if none in context)
  const activeResume = contextResume || DEFAULT_DEMO_RESUME;

  // Analysis state for ATS Diagnostics
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisReport, setAnalysisReport] = useState<ATSReportData | null>(null);

  // Modals & User Feedback
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [previewTab, setPreviewTab] = useState<"document" | "text">("document");
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: "success" | "error" | "info";
  } | null>(null);

  // Hidden file inputs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  const showToast = (text: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  const formatUploadDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return `Uploaded ${d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`;
    } catch {
      return "Uploaded recently";
    }
  };

  // Direct client download handler
  const handleDownload = () => {
    if (!activeResume) return;
    try {
      showToast(`Downloading ${activeResume.fileName}...`, "info");
      const link = document.createElement("a");
      link.href =
        activeResume.dataUrl && activeResume.dataUrl.startsWith("data:")
          ? activeResume.dataUrl
          : "data:application/pdf;base64,JVBERi0xLjQKJ...";
      link.download = activeResume.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error("Download failed:", e);
      showToast("Download failed. Please try again.", "error");
    }
  };

  // Process file upload / replace
  const processUploadedFile = async (file: File, isReplacing = false) => {
    const fileName = file.name.toLowerCase();
    const allowed = [".pdf", ".docx", ".doc", ".txt"];
    const isValid = allowed.some((ext) => fileName.endsWith(ext));

    if (!isValid) {
      showToast("Please upload a supported format: PDF, DOCX, or TXT.", "error");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast("File size exceeds 10MB limit.", "error");
      return;
    }

    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      let extractedText = "";
      if (file.name.endsWith(".txt")) {
        try {
          extractedText = await file.text();
        } catch {
          extractedText = `Extracted text from ${file.name}`;
        }
      } else {
        extractedText = `Document: ${file.name}\nSize: ${(file.size / 1024).toFixed(1)} KB\nType: ${
          file.type || "Document"
        }\n\nSections parsed:\n• Contact Information & Credentials\n• Professional Summary & Work History\n• Core Technical Skills & Frameworks\n• Education & Certifications`;
      }

      const payload = {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type || "application/pdf",
        dataUrl,
        extractedText,
        atsScore: 88,
      };

      if (isReplacing) {
        replaceResume(payload);
        showToast(`Resume replaced successfully with "${file.name}"`, "success");
      } else {
        uploadResume(payload);
        showToast(`Resume "${file.name}" uploaded successfully`, "success");
      }
    } catch (err) {
      console.error("File processing error:", err);
      showToast("Failed to process file. Please try another document.", "error");
    }
  };

  const handleConfirmDelete = () => {
    deleteResume();
    setIsDeleteModalOpen(false);
    setIsViewModalOpen(false);
    showToast("Resume deleted from verified candidate profile.", "info");
  };

  // Run ATS Analysis Simulation
  const handleRunAnalysis = async (payload: ATSAnalysisPayload) => {
    setIsAnalyzing(true);
    setAnalysisReport(null);
    setActiveTab("ats");

    // Realistic smart ATS parser latency simulation
    await new Promise((r) => setTimeout(r, 1200));

    const textLength = payload.text?.length || 0;
    const hasMetrics = /\d+%|\$\d+|\b\d+\s+(users|clients|projects|ms|seconds|engineers)\b/i.test(
      payload.text || ""
    );
    const hasTypeScript = /typescript|ts/i.test(payload.text || "");
    const hasNext = /next\.?js|react/i.test(payload.text || "");

    let calculatedScore = 82;
    if (hasMetrics) calculatedScore += 4;
    if (hasTypeScript) calculatedScore += 2;
    if (hasNext) calculatedScore += 2;
    if (textLength > 400) calculatedScore += 2;
    calculatedScore = Math.min(94, Math.max(76, calculatedScore));

    updateResumeScore(calculatedScore);

    const grade = calculatedScore >= 90 ? "A" : calculatedScore >= 80 ? "B+" : "B";

    const report: ATSReportData = {
      overallScore: calculatedScore,
      grade,
      verdict:
        calculatedScore >= 85
          ? "Strong ATS Match • Ready for Direct Job Application"
          : "Good Foundation • Minor Keyword & Formatting Refinements Recommended",
      sourceName: payload.fileName || activeResume?.fileName || "Active Resume Document",
      breakdown: {
        contact: {
          score: 100,
          status: "good",
          notes: "Full Name, email, telephone number (+91), and LinkedIn handles parsed cleanly.",
        },
        experience: {
          score: hasMetrics ? 92 : 78,
          status: hasMetrics ? "good" : "warning",
          notes: hasMetrics
            ? "Strong quantifiable impact metrics detected across recent engineering roles."
            : "Include more quantifiable outcomes (e.g., % latency reduction, user scale).",
        },
        skills: {
          score: 88,
          status: "good",
          notes: "Recognized 18 core technical competencies and software engineering libraries.",
        },
        education: {
          score: 95,
          status: "good",
          notes: "Degree, university name, and graduation timeline mapped accurately.",
        },
        formatting: {
          score: 90,
          status: "good",
          notes: "Clean hierarchical headers. Parser traversed sections in a single pass without errors.",
        },
      },
      risks: [
        {
          title: "Quantifiable Performance Metrics",
          description:
            "A few bullet points describe routine duties rather than tangible business impact. Add percentage, speed, or team size figures.",
          severity: "medium",
        },
        {
          title: "Target Keyword Frequency",
          description:
            "Key engineering keywords like CI/CD, Unit Testing, and Cloud Architecture appeared only once in the parsed text.",
          severity: "low",
        },
        {
          title: "Parser Section Header Consistency",
          description:
            "Standard headings ('Work Experience', 'Skills', 'Education') ensure 100% traversal across legacy enterprise parsers.",
          severity: "low",
        },
      ],
      missingKeywords: [
        "CI/CD Pipelines",
        "System Design",
        "RESTful APIs",
        "Unit Testing (Jest)",
        "Docker",
        "Agile / Scrum",
        "State Management",
      ],
      rewrites: [
        {
          section: "Work Experience",
          original: "Worked on frontend features using React and improved page load times.",
          improved:
            "Architected high-velocity React & Next.js user interfaces, reducing core page load latency by 34% across 120,000 monthly active users.",
          rationale: "Introduces strong action verbs, quantifiable metrics, and verified user scale.",
        },
        {
          section: "Technical Leadership",
          original: "Collaborated with team members to ship new software products on schedule.",
          improved:
            "Partnered with cross-functional engineering and design squads to deliver 4 major product milestones ahead of sprint deadlines.",
          rationale: "Demonstrates proactive cross-functional collaboration and delivery velocity.",
        },
      ],
    };

    setAnalysisReport(report);
    setIsAnalyzing(false);
  };

  const handleScanActiveResume = () => {
    handleRunAnalysis({
      sourceType: "file",
      fileName: activeResume.fileName,
      fileSize: activeResume.fileSize,
      text: activeResume.extractedText || DEFAULT_DEMO_RESUME.extractedText || "",
    });
  };

  const handleResetAnalysis = () => {
    setAnalysisReport(null);
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Toast Feedback */}
      {toastMessage && (
        <div
          className={cn(
            "p-3 rounded-xl border text-xs font-semibold flex items-center justify-between gap-3 shadow-sm animate-in fade-in duration-200",
            toastMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : toastMessage.type === "error"
              ? "bg-red-50 text-red-800 border-red-200"
              : "bg-blue-50 text-blue-800 border-blue-200"
          )}
        >
          <div className="flex items-center gap-2">
            {toastMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : toastMessage.type === "error" ? (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            ) : (
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.doc,.txt"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            processUploadedFile(e.target.files[0], false);
            e.target.value = "";
          }
        }}
        className="hidden"
      />
      <input
        ref={replaceInputRef}
        type="file"
        accept=".pdf,.docx,.doc,.txt"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            processUploadedFile(e.target.files[0], true);
            e.target.value = "";
          }
        }}
        className="hidden"
      />

      {/* A. Unified Page Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Resume &amp; CV Studio
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your primary resume document, build tailored versions, or run ATS parser diagnostics.
          </p>
        </div>

        {/* Clean Segmented Control */}
        <div className="inline-flex self-start sm:self-auto items-center p-1 rounded-xl bg-slate-100 border border-slate-200/80 shadow-2xs">
          <button
            type="button"
            onClick={() => {
              setActiveTab("document");
              setAnalysisReport(null);
            }}
            className={cn(
              "px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
              activeTab === "document"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900 font-medium"
            )}
          >
            Document &amp; Builder
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("ats")}
            className={cn(
              "px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
              activeTab === "ats"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900 font-medium"
            )}
          >
            ATS Diagnostics
          </button>
        </div>
      </div>

      {/* MODE 1: DOCUMENT & BUILDER WORKSPACE */}
      {activeTab === "document" && (
        <div className="flex flex-col gap-6">
          {/* B. Primary Active Document Card */}
          {activeResume ? (
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
              {/* Left (File Info & Health) */}
              <div className="flex items-center gap-4 min-w-0">
                {/* PDF Icon Badge */}
                <div className="h-12 w-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 font-bold text-xs shrink-0 shadow-2xs">
                  <span className="font-black text-xs tracking-tight">PDF</span>
                </div>

                {/* Details */}
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-base font-bold text-slate-900 truncate">
                      {activeResume.fileName}
                    </span>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/70 text-xs px-2.5 py-0.5 rounded-full font-medium inline-flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active Resume
                    </span>
                  </div>

                  {/* Meta Row */}
                  <div className="flex items-center gap-2.5 text-xs text-slate-500 flex-wrap">
                    <span>{formatFileSize(activeResume.fileSize)}</span>
                    <span className="text-slate-300">•</span>
                    <span>{formatUploadDate(activeResume.uploadedAt)}</span>
                    <span className="text-slate-300">•</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                      <Sparkles className="w-3 h-3 text-blue-600" />
                      <span>ATS Score: {activeResume.atsScore || 88}/100 • Good</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Right (Compact Action Toolbar) */}
              <div className="flex items-center gap-2 flex-wrap lg:flex-nowrap shrink-0">
                {/* Preview */}
                <button
                  type="button"
                  onClick={() => setIsViewModalOpen(true)}
                  className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-2xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Preview document"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span>Preview</span>
                </button>

                {/* Download */}
                <button
                  type="button"
                  onClick={handleDownload}
                  className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-2xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Download file"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Download</span>
                </button>

                {/* Replace */}
                <button
                  type="button"
                  onClick={() => replaceInputRef.current?.click()}
                  className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-2xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Replace with new file"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Replace</span>
                </button>

                {/* Delete (Subtle icon-only button) */}
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="w-9 h-9 rounded-lg border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 shadow-2xs flex items-center justify-center transition-colors cursor-pointer"
                  title="Delete resume document"
                  aria-label="Delete resume document"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {/* Primary Action: Run ATS Scan */}
                <button
                  type="button"
                  onClick={handleScanActiveResume}
                  className="h-9 px-4 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer ml-1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                  <span>Run ATS Scan</span>
                </button>
              </div>
            </div>
          ) : (
            /* Empty Document State with Dropzone */
            <div
              onClick={() => fileInputRef.current?.click()}
              className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-8 text-center hover:border-blue-400 hover:bg-blue-50/20 transition-all cursor-pointer flex flex-col items-center justify-center gap-3"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Upload your Primary Resume</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Drag and drop your file here, or click to browse (PDF, DOCX, TXT up to 10MB)
                </p>
              </div>
              <button
                type="button"
                className="mt-1 h-9 px-4 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span>Select Resume File</span>
              </button>
            </div>
          )}

          {/* C. Resume Studio & ATS Tools Grid (2-Column Equal Height) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* Card 1: AI Resume Builder (Create New CV) */}
            <div className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs hover:border-slate-300 hover:shadow-md transition-all">
              <div>
                {/* Top row */}
                <div className="flex items-center justify-between">
                  <div className="h-11 w-11 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shadow-2xs">
                    <FileEdit className="w-5 h-5" />
                  </div>
                  <span className="bg-slate-100 text-slate-600 text-[11px] font-semibold px-2.5 py-0.5 rounded-md">
                    Start Fresh
                  </span>
                </div>

                {/* Title & Description */}
                <h2 className="text-lg font-bold text-slate-900 mt-4 tracking-tight">
                  Create New CV
                </h2>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                  Build a clean, structured ATS-compliant CV using guided section prompts, live A4 formatting, and pre-populated profile data.
                </p>

                {/* Feature list */}
                <ul className="text-xs text-slate-600 space-y-2.5 my-5">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Single &amp; two-column ATS-tested layouts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Live preview &amp; 1-click printable PDF</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Syncs directly with your candidate profile</span>
                  </li>
                </ul>
              </div>

              {/* CTA Button */}
              <div className="pt-2">
                <Link
                  href="/candidate/resume/builder"
                  className="h-10 w-full rounded-lg bg-slate-900 text-white hover:bg-slate-800 text-sm font-medium flex items-center justify-center gap-2 transition-colors shadow-2xs cursor-pointer"
                >
                  <span>Open Resume Builder</span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </Link>
              </div>
            </div>

            {/* Card 2: ATS Keyword & Parser Debugger (Import / Check ATS) */}
            <div className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs hover:border-slate-300 hover:shadow-md transition-all">
              <div>
                {/* Top row */}
                <div className="flex items-center justify-between">
                  <div className="h-11 w-11 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shadow-2xs">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span className="bg-indigo-50 text-indigo-700 text-[11px] font-semibold px-2.5 py-0.5 rounded-md">
                    ATS Engine v2.4
                  </span>
                </div>

                {/* Title & Description */}
                <h2 className="text-lg font-bold text-slate-900 mt-4 tracking-tight">
                  Import / Check ATS
                </h2>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                  Upload an existing PDF/DOCX or paste text to evaluate ATS compatibility, keyword match, and formatting risks.
                </p>

                {/* Feature list */}
                <ul className="text-xs text-slate-600 space-y-2.5 my-5">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Instant 0–100 ATS compatibility grade &amp; rubric</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Role keyword &amp; skill gap diagnosis</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Actionable rewrite recommendations</span>
                  </li>
                </ul>
              </div>

              {/* CTA Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("ats");
                    setAnalysisReport(null);
                  }}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-2xs cursor-pointer"
                >
                  <span>Launch ATS Diagnostics</span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>
          </div>

          {/* D. High-Value "ATS Parsing Readiness Checklist" Strip */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    ATS Parsing Readiness Checklist
                  </h3>
                  <p className="text-xs text-slate-500">
                    Verified against enterprise applicant tracking algorithms (Workday, Greenhouse, Lever, Ashby).
                  </p>
                </div>
              </div>

              <span className="self-start sm:self-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>All Checks Passed</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-slate-800">
                    Standard Font Encoding
                  </span>
                  <span className="text-[11px] text-slate-500 leading-snug">
                    Embedded vector fonts; no flattened images or raster artifacts.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-slate-800">
                    Contact Header Parsed
                  </span>
                  <span className="text-[11px] text-slate-500 leading-snug">
                    Verified extraction of email, telephone (+91), and LinkedIn.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-slate-800">
                    14 Technical Keywords
                  </span>
                  <span className="text-[11px] text-slate-500 leading-snug">
                    Indexed high-frequency engineering matches for your target roles.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-slate-800">
                    Linear Section Hierarchy
                  </span>
                  <span className="text-[11px] text-slate-500 leading-snug">
                    Structured headings mapped for 100% single-pass machine traversal.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: ATS DIAGNOSTICS WORKSPACE */}
      {activeTab === "ats" && (
        <div className="flex flex-col gap-6">
          {analysisReport ? (
            <ATSScoreReport report={analysisReport} onReset={handleResetAnalysis} />
          ) : (
            <AtsDiagnosticsView onAnalyze={handleRunAnalysis} isAnalyzing={isAnalyzing} />
          )}
        </div>
      )}

      {/* MODAL 1: VIEW RESUME PREVIEW */}
      {activeResume && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title={`Resume Preview: ${activeResume.fileName}`}
          description={`${formatFileSize(activeResume.fileSize)} • ${formatUploadDate(
            activeResume.uploadedAt
          )}`}
          size="xl"
          footer={
            <div className="flex flex-wrap items-center justify-between gap-3 w-full">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Document</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsViewModalOpen(false);
                    handleScanActiveResume();
                  }}
                  className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Run ATS Diagnostics</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
              >
                Close Preview
              </button>
            </div>
          }
        >
          <div className="flex flex-col gap-4">
            {/* View Switcher Tabs */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setPreviewTab("document")}
                  className={cn(
                    "px-3 py-1 rounded-md font-semibold transition-all cursor-pointer",
                    previewTab === "document"
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  Document View
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab("text")}
                  className={cn(
                    "px-3 py-1 rounded-md font-semibold transition-all cursor-pointer",
                    previewTab === "text"
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  Parsed Text
                </button>
              </div>

              <div className="text-[11px] text-slate-400">
                Format: {activeResume.fileName.split(".").pop()?.toUpperCase() || "PDF"}
              </div>
            </div>

            {/* Content Display */}
            {previewTab === "document" ? (
              <div className="w-full h-[480px] rounded-xl border border-slate-200 bg-slate-50 flex flex-col items-center justify-center p-6 text-center overflow-hidden">
                {activeResume.dataUrl &&
                activeResume.dataUrl.startsWith("data:application/pdf") ? (
                  <iframe
                    src={activeResume.dataUrl}
                    className="w-full h-full rounded-lg border border-slate-200"
                    title="PDF Viewer"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 max-w-sm">
                    <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center font-bold text-sm shadow-xs">
                      PDF
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {activeResume.fileName}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        High-resolution PDF verified for automated ATS traversal and candidate presentation.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleDownload}
                      className="mt-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download to View Full Document</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-[480px] rounded-xl border border-slate-200 bg-slate-900 p-4 font-mono text-xs text-slate-200 overflow-y-auto whitespace-pre-wrap leading-relaxed select-text">
                {activeResume.extractedText || DEFAULT_DEMO_RESUME.extractedText}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* MODAL 2: CONFIRM DELETE RESUME */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Candidate Resume"
        description="Are you sure you want to remove this resume from your verified candidate profile?"
        size="sm"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-medium cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors"
            >
              Confirm Delete
            </button>
          </div>
        }
      >
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-red-50 border border-red-100 text-xs text-red-900">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="font-bold">Permanent Deletion</span>
            <span className="text-red-700 leading-relaxed">
              Employers reviewing your active pipeline applications will not have access to this document until a new one is uploaded.
            </span>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default ResumePage;
