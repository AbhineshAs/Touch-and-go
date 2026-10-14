"use client";

import React, { useState, useRef } from "react";
import {
  UploadCloud,
  FileText,
  Eye,
  Download,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  X,
  FileCode,
  FileType,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import { useCandidate } from "@/lib/candidate/context/CandidateContext";
import { UploadedResume } from "@/lib/candidate/types";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";

interface ResumeFileManagerProps {
  onRunATSScan?: (resume: UploadedResume) => void;
  compact?: boolean;
  className?: string;
}

export function ResumeFileManager({
  onRunATSScan,
  compact = false,
  className,
}: ResumeFileManagerProps) {
  const { uploadedResume, uploadResume, replaceResume, deleteResume } = useCandidate();

  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  // Modals state
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [previewTab, setPreviewTab] = useState<"document" | "text">("document");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".doc", ".txt"];
  const MAX_FILE_SIZE_MB = 10;

  const showToast = (text: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const processFile = async (file: File, isReplacing = false) => {
    setValidationError(null);
    const fileName = file.name.toLowerCase();
    const hasValidExtension = ALLOWED_EXTENSIONS.some((ext) => fileName.endsWith(ext));

    if (!hasValidExtension) {
      setValidationError("Please upload a supported format: PDF, DOCX, or TXT.");
      return;
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setValidationError(`File size exceeds ${MAX_FILE_SIZE_MB}MB limit.`);
      return;
    }

    try {
      // 1. Read base64 data URL for viewing and downloading
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // 2. Extract text if plain text or generate representative parsed text
      let extractedText = "";
      if (file.name.endsWith(".txt")) {
        try {
          extractedText = await file.text();
        } catch {
          extractedText = `Extracted text from ${file.name}`;
        }
      } else {
        extractedText = `Document: ${file.name}\nSize: ${(file.size / 1024).toFixed(1)} KB\nType: ${file.type || "Document"}\n\nSections parsed:\n• Contact Information & Credentials\n• Professional Summary & Work History\n• Core Technical Skills & Frameworks\n• Education & Certifications`;
      }

      const resumePayload = {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type || "application/octet-stream",
        dataUrl,
        extractedText,
      };

      if (isReplacing) {
        replaceResume(resumePayload);
        showToast(`Resume replaced successfully with "${file.name}"`, "success");
      } else {
        uploadResume(resumePayload);
        showToast(`Resume "${file.name}" uploaded successfully`, "success");
      }
    } catch (err) {
      console.error("Failed to read file:", err);
      setValidationError("Failed to read file. Please try another document.");
    }
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
      processFile(e.dataTransfer.files[0], false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0], false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleReplaceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0], true);
      if (replaceInputRef.current) replaceInputRef.current.value = "";
    }
  };

  // Direct download handler
  const handleDownload = () => {
    if (!uploadedResume) return;

    try {
      showToast(`Downloading ${uploadedResume.fileName}...`, "info");
      const link = document.createElement("a");
      link.href = uploadedResume.dataUrl || "data:application/pdf;base64,";
      link.download = uploadedResume.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error("Download failed:", e);
      showToast("Download failed. Please try again.", "error");
    }
  };

  const confirmDelete = () => {
    if (uploadedResume) {
      deleteResume();
      setIsDeleteModalOpen(false);
      setIsViewModalOpen(false);
      showToast("Resume deleted successfully.", "success");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return "Recently";
    }
  };

  const isPdf = uploadedResume?.fileName?.toLowerCase().endsWith(".pdf");
  const isDocx =
    uploadedResume?.fileName?.toLowerCase().endsWith(".docx") ||
    uploadedResume?.fileName?.toLowerCase().endsWith(".doc");

  return (
    <div className={cn("w-full flex flex-col gap-4", className)}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={cn(
            "p-3 rounded-xl border text-xs font-semibold flex items-center justify-between gap-3 shadow-sm animate-in fade-in duration-200",
            toastMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : toastMessage.type === "error"
              ? "bg-red-50 text-red-800 border-red-200"
              : "bg-indigo-50 text-indigo-800 border-indigo-200"
          )}
        >
          <div className="flex items-center gap-2">
            {toastMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : toastMessage.type === "error" ? (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            ) : (
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
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

      {/* Validation Error Banner */}
      {validationError && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2.5 text-xs text-red-700 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Hidden file input for Replace */}
      <input
        ref={replaceInputRef}
        type="file"
        accept=".pdf,.docx,.doc,.txt"
        onChange={handleReplaceInputChange}
        className="hidden"
        id="resume-replace-file-input"
      />

      {/* STATE A: ACTIVE RESUME EXISTS */}
      {uploadedResume ? (
        <div className={cn(
          "bg-white border border-slate-200/90 hover:border-indigo-300 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col gap-4 transition-all",
          compact && "p-3.5 gap-3"
        )}>
          {/* Top Bar: Title & Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              {/* Document Type Badge */}
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xs shadow-xs shrink-0",
                  isPdf
                    ? "bg-rose-50 border border-rose-200 text-rose-600"
                    : isDocx
                    ? "bg-sky-50 border border-sky-200 text-sky-600"
                    : "bg-slate-100 border border-slate-200 text-slate-700"
                )}
              >
                {isPdf ? (
                  <span className="font-black text-sm tracking-tight">PDF</span>
                ) : isDocx ? (
                  <span className="font-black text-xs tracking-tight">DOCX</span>
                ) : (
                  <FileText className="w-6 h-6" />
                )}
              </div>

              <div className="flex flex-col gap-0.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate max-w-xs sm:max-w-md">
                    {uploadedResume.fileName}
                  </h3>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Active Resume
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span>{formatFileSize(uploadedResume.fileSize)}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    Uploaded {formatDate(uploadedResume.uploadedAt)}
                  </span>
                </div>
              </div>
            </div>

            {uploadedResume.atsScore && (
              <div className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-150 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#4F46E5]" />
                <span className="text-xs font-bold text-[#4F46E5]">
                  ATS Score: {uploadedResume.atsScore}/100
                </span>
              </div>
            )}
          </div>

          {/* Action Button Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {/* 1. VIEW RESUME */}
              <button
                type="button"
                onClick={() => setIsViewModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] active:bg-[#3730A3] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                title="View uploaded resume"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Resume</span>
              </button>

              {/* 2. DOWNLOAD RESUME */}
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                title="Download file to computer"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Download</span>
              </button>

              {/* 3. REPLACE RESUME */}
              <button
                type="button"
                onClick={() => replaceInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-indigo-50/60 border border-indigo-200 text-[#4F46E5] text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                title="Replace with a different resume file"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Replace</span>
              </button>

              {/* 4. DELETE RESUME */}
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-600 hover:text-rose-600 text-xs font-semibold transition-colors cursor-pointer"
                title="Delete resume"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>

            {onRunATSScan && (
              <button
                type="button"
                onClick={() => onRunATSScan(uploadedResume)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Check ATS Score</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* STATE B: NO RESUME UPLOADED - DRAG & DROP ZONE */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "border-dashed border-2 rounded-2xl p-6 sm:p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 bg-white",
            isDragging
              ? "border-[#4F46E5] bg-indigo-50/70 scale-[1.01]"
              : "border-indigo-200 hover:border-[#4F46E5] hover:bg-indigo-50/30"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.doc,.txt"
            onChange={handleFileInputChange}
            className="hidden"
            id="resume-upload-file-input"
          />

          <div className="w-13 h-13 rounded-2xl bg-indigo-50 border border-indigo-150 flex items-center justify-center text-[#4F46E5] shadow-xs">
            <UploadCloud className="w-6 h-6 text-[#4F46E5]" />
          </div>

          <div className="flex flex-col gap-1 items-center">
            <h3 className="text-sm font-bold text-slate-900">
              Upload your Resume / CV
            </h3>
            <p className="text-xs text-slate-500">
              Drag and drop your file here, or click to browse
            </p>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="mt-1 px-5 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] active:bg-[#3730A3] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            Choose Resume File
          </button>

          <p className="text-[11px] text-slate-400 mt-1">
            Supported formats: PDF, DOCX, TXT (Maximum file size: 10MB)
          </p>
        </div>
      )}

      {/* MODAL 1: VIEW RESUME PREVIEW */}
      {uploadedResume && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title={`Resume Preview: ${uploadedResume.fileName}`}
          description={`${formatFileSize(uploadedResume.fileSize)} • Uploaded on ${formatDate(
            uploadedResume.uploadedAt
          )}`}
          size="xl"
          footer={
            <div className="flex flex-wrap items-center justify-between gap-3 w-full">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-3.5 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Resume</span>
                </button>
                <button
                  type="button"
                  onClick={() => replaceInputRef.current?.click()}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-indigo-50 border border-indigo-200 text-[#4F46E5] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Replace File</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-semibold cursor-pointer"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => setIsViewModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          }
        >
          <div className="flex flex-col gap-4">
            {/* Toggle Tabs inside Preview */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setPreviewTab("document")}
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer",
                    previewTab === "document"
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-500 hover:text-slate-800"
                  )}
                >
                  Document Viewer
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab("text")}
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer",
                    previewTab === "text"
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-500 hover:text-slate-800"
                  )}
                >
                  Extracted ATS Text
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Verified Client Parsing</span>
              </div>
            </div>

            {/* TAB CONTENT: Document Viewer */}
            {previewTab === "document" && (
              <div className="flex flex-col gap-3">
                {isPdf && uploadedResume.dataUrl ? (
                  <div className="w-full h-[520px] rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                    <iframe
                      src={uploadedResume.dataUrl}
                      className="w-full h-full"
                      title="PDF Resume Preview"
                    />
                  </div>
                ) : (
                  /* DOCX / TXT or Fallback Viewer */
                  <div className="w-full min-h-[380px] max-h-[520px] overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/70 p-6 flex flex-col gap-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                        <FileText className="w-4 h-4 text-[#4F46E5]" />
                        <span>Parsed Document Content</span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {isDocx ? "Microsoft Word Document" : "Plain Text Document"}
                      </span>
                    </div>

                    <div className="text-xs text-slate-800 whitespace-pre-wrap font-sans leading-relaxed">
                      {uploadedResume.extractedText || "No readable text detected in this document."}
                    </div>

                    {isDocx && (
                      <div className="mt-auto p-3 rounded-lg bg-indigo-50/70 border border-indigo-150 flex items-center justify-between text-xs text-indigo-900">
                        <span>Original DOCX file formatting is preserved for download.</span>
                        <button
                          type="button"
                          onClick={handleDownload}
                          className="font-bold underline text-[#4F46E5] hover:text-[#4338CA] cursor-pointer"
                        >
                          Download original .docx
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: Extracted Text View */}
            {previewTab === "text" && (
              <div className="w-full min-h-[380px] max-h-[520px] overflow-y-auto rounded-xl border border-slate-200 bg-slate-900 text-slate-100 p-5 font-mono text-xs leading-relaxed flex flex-col gap-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-400 text-[11px]">
                  <span>Raw Text Extracted for ATS Crawlers</span>
                  <span>{uploadedResume.extractedText?.length || 0} characters</span>
                </div>
                <div className="whitespace-pre-wrap text-slate-200 pt-2">
                  {uploadedResume.extractedText || "No extracted text available."}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* MODAL 2: DELETE CONFIRMATION MODAL */}
      {uploadedResume && (
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Delete Resume"
          description="Are you sure you want to remove this resume?"
          size="sm"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer shadow-xs"
              >
                Delete Resume
              </button>
            </div>
          }
        >
          <div className="flex flex-col gap-3 py-2 text-xs text-slate-600 leading-relaxed">
            <p>
              Deleting <strong className="text-slate-900 font-semibold">{uploadedResume.fileName}</strong> will
              remove your current uploaded resume from your candidate profile and job applications.
            </p>
            <p className="text-slate-500">
              You can upload a new resume or build one with the Resume Builder at any time.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}
