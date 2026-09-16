"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ArrowRight,
  RefreshCw,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";
import { parseResumeFile } from "@/lib/api/candidate";
import { cn } from "@/lib/utils";

type ProcessingStage = "idle" | "Uploading" | "Scanning" | "Extracting" | "Structuring" | "Ready for review" | "error";

export default function ResumeUploadPage() {
  const router = useRouter();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [stage, setStage] = useState<ProcessingStage>("idle");
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const stagesList = ["Uploading", "Scanning", "Extracting", "Structuring", "Ready for review"];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];
    if (!validTypes.includes(file.type) && !file.name.endsWith(".pdf") && !file.name.endsWith(".docx")) {
      setErrorMessage("Please upload a PDF (.pdf) or Word document (.docx).");
      return;
    }

    setErrorMessage(null);
    setSelectedFile(file);

    try {
      await parseResumeFile(file.name, (currentStage) => {
        setStage(currentStage);
        if (currentStage === "Uploading") setProgress(20);
        else if (currentStage === "Scanning") setProgress(40);
        else if (currentStage === "Extracting") setProgress(65);
        else if (currentStage === "Structuring") setProgress(85);
        else if (currentStage === "Ready for review") setProgress(100);
      });
    } catch (err: any) {
      setStage("error");
      setErrorMessage("Failed to process document. Please retry or check file format.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div className="flex flex-col gap-1">
          <Link
            href="/candidate/profile"
            className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-primary transition-colors mb-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Profile</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Upload & Structure Resume
          </h1>
          <p className="text-xs text-text-secondary">
            TAG parses and organizes your experience, education, and technical skills with candidate confirmation.
          </p>
        </div>
      </div>

      {/* Uploader Card */}
      <Card className="p-8 bg-surface border-border flex flex-col gap-6">
        {stage === "idle" && (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={cn(
              "rounded-2xl border-2 border-dashed p-10 flex flex-col items-center justify-center text-center gap-3 transition-colors cursor-pointer",
              dragActive
                ? "border-primary bg-primary-soft/30"
                : "border-border hover:border-primary/50 hover:bg-background"
            )}
            onClick={() => document.getElementById("resume-input")?.click()}
          >
            <input
              id="resume-input"
              type="file"
              accept=".pdf,.docx,.doc"
              onChange={handleFileInput}
              className="hidden"
            />
            <div className="w-16 h-16 rounded-full bg-primary-soft text-primary flex items-center justify-center">
              <UploadCloud className="w-8 h-8" />
            </div>

            <div className="flex flex-col gap-1">
              <h3 className="text-base font-bold text-text-primary">
                Drag and drop your resume here, or{" "}
                <span className="text-primary hover:underline">browse files</span>
              </h3>
              <p className="text-xs text-text-muted">
                Supports PDF (.pdf) and Microsoft Word (.docx) up to 10MB
              </p>
            </div>

            <div className="flex items-center gap-2 mt-4 text-[11px] font-medium text-text-secondary bg-border-subtle px-3 py-1 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5 text-success" />
              <span>You will review and approve all extracted data before saving</span>
            </div>
          </div>
        )}

        {/* Processing State with 5 stages */}
        {stage !== "idle" && stage !== "error" && (
          <div className="flex flex-col gap-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-sm text-text-primary">
                    {selectedFile?.name || "Candidate_Resume_2026.pdf"}
                  </span>
                  <span className="text-xs text-primary font-semibold flex items-center gap-1.5">
                    {stage === "Ready for review" ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                    ) : (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    )}
                    <span>Current Stage: {stage}</span>
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold text-text-primary">{progress}%</span>
            </div>

            {/* Overall Progress Bar */}
            <div className="w-full h-2 rounded-full bg-border overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* 5-step horizontal indicator */}
            <div className="grid grid-cols-5 gap-2 pt-2">
              {stagesList.map((stg, idx) => {
                const currentIndex = stagesList.indexOf(stage);
                const isPassed = idx < currentIndex || stage === "Ready for review";
                const isCurrent = stg === stage;

                return (
                  <div key={stg} className="flex flex-col items-center text-center gap-1.5">
                    <div
                      className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                        isPassed
                          ? "bg-success text-white"
                          : isCurrent
                          ? "bg-primary text-white"
                          : "bg-border-subtle text-text-muted"
                      )}
                    >
                      {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>
                    <span
                      className={cn(
                        "text-[10px] font-medium leading-tight",
                        isCurrent ? "text-primary font-bold" : isPassed ? "text-text-primary" : "text-text-muted"
                      )}
                    >
                      {stg}
                    </span>
                  </div>
                );
              })}
            </div>

            {stage === "Ready for review" && (
              <div className="p-4 rounded-xl bg-success-soft/40 border border-success/30 flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-success shrink-0" />
                  <div className="flex flex-col">
                    <h4 className="font-bold text-sm text-text-primary">Extraction Complete</h4>
                    <p className="text-xs text-text-secondary">
                      Structured 2 positions, 1 degree, and 7 core technologies. Please review before committing.
                    </p>
                  </div>
                </div>

                <Button
                  size="md"
                  variant="primary"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  onClick={() => router.push("/candidate/profile/review")}
                >
                  Review Information
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Error State */}
        {stage === "error" && (
          <div className="p-6 rounded-2xl bg-danger-soft/40 border border-danger/20 flex flex-col items-center text-center gap-3">
            <AlertTriangle className="w-8 h-8 text-danger" />
            <h4 className="font-bold text-sm text-text-primary">Resume Processing Failed</h4>
            <p className="text-xs text-text-muted max-w-sm">{errorMessage}</p>
            <Button
              size="sm"
              variant="secondary"
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              onClick={() => {
                setStage("idle");
                setSelectedFile(null);
              }}
            >
              Try Again
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
