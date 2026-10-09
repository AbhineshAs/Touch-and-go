"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FileEdit, Sparkles, Send, X, CheckCircle2, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";

interface ATSQuickActionsProps {
  className?: string;
  onOpenCoverLetter?: () => void;
}

export function ATSQuickActions({ className }: ATSQuickActionsProps) {
  const [isCoverLetterModalOpen, setIsCoverLetterModalOpen] = useState(false);
  const [targetCompany, setTargetCompany] = useState("");
  const [targetRole, setTargetRole] = useState("Full Stack Software Engineer");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerateCoverLetter = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    await new Promise((r) => setTimeout(r, 650));
    setIsGenerating(false);

    const letter = `Dear Hiring Team at ${targetCompany || "the company"},

I am writing to express my strong interest in the ${targetRole} position. With a solid foundation in modern web engineering, clean architecture, and performance-focused application design, I have built and delivered high-velocity digital products matching rigorous technical specifications.

In my recent projects, I focused on building high-conversion experiences, integrating RESTful services, and optimizing frontend performance. My experience aligns well with your team's mission to drive scalable product growth and delightful user experiences.

I welcome the opportunity to discuss how my technical skills and work ethic can support your goals. Thank you for your time and consideration.

Sincerely,
Candidate (Touch And Go Verified)`;

    setGeneratedLetter(letter);
  };

  const handleCopy = () => {
    if (!generatedLetter) return;
    navigator.clipboard.writeText(generatedLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div
        className={cn(
          "bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] flex flex-col gap-4",
          className
        )}
      >
        <div className="flex flex-col gap-1">
          <h3 className="text-base font-bold text-slate-900">Quick Action</h3>
          <p className="text-xs text-slate-500 font-normal">
            Create a professional Resume and cover letter Now
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-1">
          {/* Action 1: Update Resume (Coral / Red Accent) */}
          <Link
            href="/candidate/resume/builder"
            className="w-full py-3 px-4 rounded-xl bg-[#F43F5E] hover:bg-[#E11D48] active:bg-[#BE123C] text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer hover:shadow-[0_4px_16px_-2px_rgba(244,63,94,0.35)]"
          >
            <FileEdit className="w-4 h-4" />
            <span>Update Resume</span>
          </Link>

          {/* Action 2: Create Cover Letter (Primary Indigo Accent) */}
          <button
            type="button"
            onClick={() => setIsCoverLetterModalOpen(true)}
            className="w-full py-3 px-4 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] active:bg-[#3730A3] text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer hover:shadow-[0_4px_16px_-2px_rgba(79,70,229,0.35)]"
          >
            <Sparkles className="w-4 h-4" />
            <span>Create Cover letter</span>
          </button>
        </div>
      </div>

      {/* Cover Letter Modal */}
      {isCoverLetterModalOpen && (
        <Modal
          isOpen={isCoverLetterModalOpen}
          onClose={() => {
            setIsCoverLetterModalOpen(false);
            setGeneratedLetter(null);
          }}
          title="Instant Cover Letter Generator"
          description="Generate an ATS-tailored cover letter aligned with your resume experience"
          size="lg"
        >
          <div className="flex flex-col gap-4 text-xs">
            {!generatedLetter ? (
              <form onSubmit={handleGenerateCoverLetter} className="flex flex-col gap-3.5">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-800">Target Role Title</label>
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    required
                    className="h-10 px-3 rounded-lg border border-slate-200 text-xs text-slate-900 focus:border-[#4F46E5] focus:outline-none focus:ring-1 focus:ring-[#4F46E5]/20"
                    placeholder="e.g. Senior Frontend Developer"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-800">Company Name (Optional)</label>
                  <input
                    type="text"
                    value={targetCompany}
                    onChange={(e) => setTargetCompany(e.target.value)}
                    className="h-10 px-3 rounded-lg border border-slate-200 text-xs text-slate-900 focus:border-[#4F46E5] focus:outline-none focus:ring-1 focus:ring-[#4F46E5]/20"
                    placeholder="e.g. Acme Tech Global"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full h-10 mt-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isGenerating ? "Drafting Cover Letter..." : "Generate Tailored Letter"}</span>
                </button>
              </form>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px] leading-relaxed text-slate-800 whitespace-pre-wrap max-h-72 overflow-y-auto">
                  {generatedLetter}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setGeneratedLetter(null)}
                    className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    ← Edit Details
                  </button>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="px-4 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
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
    </>
  );
}
