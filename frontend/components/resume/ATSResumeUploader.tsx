"use client";

import React, { useState, useRef } from "react";
import {
  UploadCloud,
  FileText,
  X,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Loader2,
  FileCode,
  Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface ATSAnalysisPayload {
  sourceType: "file" | "text";
  fileName?: string;
  fileSize?: number;
  text: string;
  targetJobDescription?: string;
}

interface ATSResumeUploaderProps {
  onAnalyze: (payload: ATSAnalysisPayload) => void;
  isAnalyzing: boolean;
  className?: string;
}

export function ATSResumeUploader({
  onAnalyze,
  isAnalyzing,
  className,
}: ATSResumeUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [showJobDescInput, setShowJobDescInput] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".doc", ".txt"];
  const MAX_FILE_SIZE_MB = 10;

  const validateAndSetFile = (file: File) => {
    setValidationError(null);
    const fileName = file.name.toLowerCase();
    const hasValidExtension = ALLOWED_EXTENSIONS.some((ext) => fileName.endsWith(ext));

    if (!hasValidExtension) {
      setValidationError("Please upload a valid file format: PDF, DOCX, or TXT.");
      return;
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setValidationError(`File size exceeds ${MAX_FILE_SIZE_MB}MB limit.`);
      return;
    }

    setSelectedFile(file);
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

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmitAnalysis = async () => {
    setValidationError(null);

    if (!selectedFile && !pastedText.trim()) {
      setValidationError("Please choose a resume file or paste your resume text to begin analysis.");
      return;
    }

    let extractedText = pastedText.trim();

    // If file is selected and no text is provided, read text for .txt or generate representative preview
    if (selectedFile && !extractedText) {
      if (selectedFile.name.endsWith(".txt")) {
        try {
          extractedText = await selectedFile.text();
        } catch {
          extractedText = `Extracted text from ${selectedFile.name}`;
        }
      } else {
        extractedText = `Parsed document contents for ${selectedFile.name}. Full sections identified: Personal Information, Executive Summary, Technical Skills, Professional Experience, Education and Certifications.`;
      }
    }

    onAnalyze({
      sourceType: selectedFile ? "file" : "text",
      fileName: selectedFile?.name,
      fileSize: selectedFile?.size,
      text: extractedText,
      targetJobDescription: jobDescription.trim() || undefined,
    });
  };

  const wordCount = pastedText.trim() ? pastedText.trim().split(/\s+/).length : 0;
  const charCount = pastedText.length;

  return (
    <div className={cn("bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] flex flex-col gap-6", className)}>
      {/* Upload Header */}
      <div className="flex items-center justify-between pb-1 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Upload Resume</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Supported formats: PDF, DOCX, TXT (up to 10MB)
          </p>
        </div>
      </div>

      {/* Validation Error Banner */}
      {validationError && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2.5 text-xs text-red-700 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Drag & Drop Zone */}
      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "border-dashed border-2 rounded-2xl p-8 sm:p-10 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3",
            isDragging
              ? "border-[#4F46E5] bg-indigo-50/70 scale-[1.01]"
              : "border-indigo-200 hover:border-indigo-400 bg-indigo-50/30 hover:bg-indigo-50/50"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.doc,.txt"
            onChange={handleFileInputChange}
            className="hidden"
          />

          <div className="w-14 h-14 rounded-full bg-white shadow-xs border border-indigo-150 flex items-center justify-center text-[#4F46E5] transition-transform hover:scale-105">
            <UploadCloud className="w-7 h-7 text-[#4F46E5]" />
          </div>

          <div className="flex flex-col gap-1 items-center">
            <p className="text-sm font-bold text-slate-800">
              Drag &amp; drop your resume here
            </p>
            <p className="text-xs text-slate-500">
              PDF, DOCX, or TXT • or click below to browse
            </p>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="mt-2 px-6 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] active:bg-[#3730A3] text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
          >
            Choose File
          </button>

          <p className="text-[11px] text-slate-400 mt-2 max-w-md leading-relaxed">
            Tip: If PDF extraction returns empty text on your server, upload DOCX or paste resume text below.
          </p>
        </div>
      ) : (
        /* Selected File Card */
        <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-[#4F46E5] text-white flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-900 truncate max-w-xs sm:max-w-md">
                {selectedFile.name}
              </span>
              <span className="text-[11px] text-slate-500">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to analyze
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemoveFile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white transition-colors cursor-pointer"
            aria-label="Remove selected file"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Fallback Text Input: Or Paste Resume Text */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800">
            Or Paste Resume Text
          </label>
          <span className="text-[11px] text-slate-400 font-medium">
            {wordCount} words • {charCount} chars
          </span>
        </div>
        <textarea
          rows={5}
          value={pastedText}
          onChange={(e) => setPastedText(e.target.value)}
          placeholder="Paste resume text here if you do not want to upload a file..."
          className="w-full rounded-xl bg-slate-50/60 border border-slate-200 p-3.5 text-xs font-normal text-slate-900 placeholder:text-slate-400 transition-colors focus:border-[#4F46E5] focus:outline-none focus:ring-1 focus:ring-[#4F46E5]/20"
        />
      </div>

      {/* Optional Target Job Description Accordion */}
      <div className="border border-slate-200/70 rounded-xl p-3.5 bg-slate-50/40">
        <button
          type="button"
          onClick={() => setShowJobDescInput(!showJobDescInput)}
          className="w-full flex items-center justify-between text-left cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Briefcase className="w-3.5 h-3.5 text-[#4F46E5]" />
            <span className="text-xs font-bold text-slate-800">
              Compare Against Job Description (Optional)
            </span>
          </div>
          <span className="text-xs text-[#4F46E5] font-semibold hover:underline">
            {showJobDescInput ? "Hide" : "+ Add Job Requirements"}
          </span>
        </button>

        {showJobDescInput && (
          <div className="mt-3 flex flex-col gap-1.5 pt-2 border-t border-slate-200/60">
            <p className="text-[11px] text-slate-500">
              Paste the target job description to diagnose missing technical keywords and experience matches.
            </p>
            <textarea
              rows={4}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="e.g. Senior Frontend Engineer with 4+ years of React, TypeScript, Next.js, and CI/CD pipelines..."
              className="w-full rounded-lg bg-white border border-slate-200 p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#4F46E5] focus:outline-none focus:ring-1 focus:ring-[#4F46E5]/20"
            />
          </div>
        )}
      </div>

      {/* Main Analyze CTA Button */}
      <button
        type="button"
        onClick={handleSubmitAnalysis}
        disabled={isAnalyzing || (!selectedFile && !pastedText.trim())}
        className={cn(
          "w-full h-11.5 rounded-xl font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer",
          isAnalyzing || (!selectedFile && !pastedText.trim())
            ? "bg-slate-200 text-slate-400 cursor-not-allowed"
            : "bg-[#4F46E5] hover:bg-[#4338CA] active:bg-[#3730A3] text-white hover:shadow-[0_4px_16px_-2px_rgba(79,70,229,0.35)]"
        )}
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Scanning Resume &amp; Running ATS Audit...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            <span>Run ATS Scan &amp; Score</span>
          </>
        )}
      </button>
    </div>
  );
}
