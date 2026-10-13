"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { CandidateProfile, Application } from "@/types";
import {
  FileText,
  Download,
  Eye,
  ExternalLink,
  Briefcase,
  GraduationCap,
  Award,
  CheckCircle2,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  Layers,
} from "lucide-react";

interface ResumePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateProfile?: CandidateProfile | null;
  application?: Application | null;
}

function escapePdf(str: string): string {
  return (str || "")
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function generateFallbackPdfBlob(
  name: string,
  headline: string,
  email: string,
  phone: string,
  location: string,
  summary: string,
  experiences: any[],
  education: any[],
  skills: any[]
): Blob {
  const contentLines: string[] = [];
  contentLines.push("BT");
  contentLines.push("/F1 20 Tf 50 740 Td (" + escapePdf(name) + ") Tj");
  contentLines.push("/F1 12 Tf 50 715 Td (" + escapePdf(headline) + ") Tj");
  contentLines.push(
    "/F1 10 Tf 50 695 Td (" +
      escapePdf(`Contact: ${email}  |  ${phone}  |  ${location}`) +
      ") Tj"
  );
  contentLines.push("ET");
  contentLines.push("0.2 0.4 0.8 RG 1.5 w 50 682 m 562 682 l S 0 0 0 RG");

  let y = 655;
  contentLines.push("BT");
  contentLines.push(`/F1 13 Tf 50 ${y} Td (EXECUTIVE SUMMARY) Tj`);
  y -= 18;
  const sumLines = (summary || "").match(/.{1,90}(\s|$)/g) || [summary];
  for (const sl of sumLines.slice(0, 3)) {
    contentLines.push(`/F1 10 Tf 50 ${y} Td (${escapePdf(sl.trim())}) Tj`);
    y -= 14;
  }
  y -= 8;

  contentLines.push(`/F1 13 Tf 50 ${y} Td (PROFESSIONAL WORK EXPERIENCE) Tj`);
  y -= 18;
  for (const exp of experiences.slice(0, 3)) {
    contentLines.push(
      `/F1 11 Tf 50 ${y} Td (${escapePdf(`${exp.title} - ${exp.company}`)}) Tj`
    );
    y -= 14;
    contentLines.push(
      `/F1 9 Tf 50 ${y} Td (${escapePdf(
        `${exp.startDate} to ${exp.current ? "Present" : exp.endDate || "N/A"}  |  ${exp.location}`
      )}) Tj`
    );
    y -= 14;
    if (exp.description) {
      const expDesc = exp.description.slice(0, 95);
      contentLines.push(`/F1 9 Tf 50 ${y} Td (${escapePdf(expDesc)}) Tj`);
      y -= 15;
    }
    if (exp.skillsUsed && exp.skillsUsed.length > 0) {
      contentLines.push(
        `/F1 8 Tf 50 ${y} Td (${escapePdf(`Skills: ${exp.skillsUsed.join(", ")}`)}) Tj`
      );
      y -= 14;
    }
    y -= 6;
  }

  contentLines.push(`/F1 13 Tf 50 ${y} Td (EDUCATION & CREDENTIALS) Tj`);
  y -= 18;
  for (const edu of education.slice(0, 2)) {
    contentLines.push(
      `/F1 10 Tf 50 ${y} Td (${escapePdf(
        `${edu.degree} in ${edu.fieldOfStudy} - ${edu.institution}`
      )}) Tj`
    );
    y -= 14;
    contentLines.push(
      `/F1 9 Tf 50 ${y} Td (${escapePdf(
        `${edu.startYear} - ${edu.endYear} ${edu.grade ? `| Grade: ${edu.grade}` : ""}`
      )}) Tj`
    );
    y -= 16;
  }

  contentLines.push(`/F1 13 Tf 50 ${y} Td (CORE SKILLS) Tj`);
  y -= 18;
  const skillsText = skills
    .map((s: any) => (typeof s === "string" ? s : s.name))
    .slice(0, 12)
    .join("   *   ");
  contentLines.push(`/F1 9 Tf 50 ${y} Td (${escapePdf(skillsText)}) Tj`);
  contentLines.push("ET");

  const stream = contentLines.join("\n");
  const streamLen = stream.length;

  const header = "%PDF-1.4\n";
  const obj1 = "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n";
  const obj2 = "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n";
  const obj3 =
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n";
  const obj4 =
    "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n";
  const obj5 = `5 0 obj\n<< /Length ${streamLen} >>\nstream\n${stream}\nendstream\nendobj\n`;

  const off1 = header.length;
  const off2 = off1 + obj1.length;
  const off3 = off2 + obj2.length;
  const off4 = off3 + obj3.length;
  const off5 = off4 + obj4.length;
  const xrefOffset = off5 + obj5.length;

  const pad = (n: number) => n.toString().padStart(10, "0");

  const xref = `xref
0 6
0000000000 65535 f 
${pad(off1)} 00000 n 
${pad(off2)} 00000 n 
${pad(off3)} 00000 n 
${pad(off4)} 00000 n 
${pad(off5)} 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
${xrefOffset}
%%EOF`;

  const fullPdf = header + obj1 + obj2 + obj3 + obj4 + obj5 + xref;
  return new Blob([fullPdf], { type: "application/pdf" });
}

export function ResumePreviewModal({
  isOpen,
  onClose,
  candidateProfile,
  application,
}: ResumePreviewModalProps) {
  const [viewFormat, setViewFormat] = useState<"pdf" | "ats">("pdf");
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string>("");

  const candidateName =
    candidateProfile?.fullName || application?.candidateName || "Candidate";
  const headline =
    candidateProfile?.headline ||
    application?.candidateHeadline ||
    "Software Engineer";
  const email =
    candidateProfile?.email || application?.candidateEmail || "candidate@example.com";
  const phone = candidateProfile?.phone || "+91 98450 12894";
  const location =
    candidateProfile?.location || application?.location || "Bengaluru, Karnataka";
  const fileName =
    application?.resumeFileName ||
    candidateProfile?.resumeFileName ||
    `${candidateName.replace(/[^a-zA-Z0-9]/g, "_")}_Resume.pdf`;

  const experiences = candidateProfile?.experiences || [];
  const education = candidateProfile?.education || [];
  const skills = candidateProfile?.skills || [];
  const certifications = candidateProfile?.certifications || [];
  const summary =
    candidateProfile?.summary ||
    "Product-focused professional with proven engineering expertise, criteria alignment, and demonstrable domain competencies.";

  // Resolve PDF URL
  useEffect(() => {
    if (!isOpen) return;

    let rawUrl =
      candidateProfile?.resumeFileUrl ||
      (application as any)?.resumeFileUrl ||
      "";

    // Lookup in localStorage if missing
    if (!rawUrl && typeof window !== "undefined") {
      try {
        const activeEmail = (email || "").trim().toLowerCase();
        if (activeEmail) {
          const stored = localStorage.getItem(`tag_candidate_resume_${activeEmail}`);
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.dataUrl) rawUrl = parsed.dataUrl;
          }
        }
        if (!rawUrl) {
          const gen = localStorage.getItem("tag_candidate_uploaded_resume");
          if (gen) {
            const parsed = JSON.parse(gen);
            if (parsed.dataUrl) rawUrl = parsed.dataUrl;
          }
        }
      } catch (e) {
        console.warn("Failed retrieving resume from localStorage:", e);
      }
    }

    if (rawUrl && (rawUrl.startsWith("data:application/pdf") || rawUrl.startsWith("blob:"))) {
      setPdfBlobUrl(rawUrl);
    } else {
      // Generate clean valid PDF blob
      const blob = generateFallbackPdfBlob(
        candidateName,
        headline,
        email,
        phone,
        location,
        summary,
        experiences,
        education,
        skills
      );
      const url = URL.createObjectURL(blob);
      setPdfBlobUrl(url);

      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [isOpen, candidateProfile, application, candidateName, headline, email, phone, location, summary, experiences, education, skills]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (pdfBlobUrl) {
      const link = document.createElement("a");
      link.href = pdfBlobUrl;
      link.download = fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }
  };

  const handleViewPdf = () => {
    if (viewFormat !== "pdf") {
      setViewFormat("pdf");
    } else if (pdfBlobUrl) {
      // If already on PDF view, open in full browser tab for convenience
      window.open(pdfBlobUrl, "_blank");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Resume: ${candidateName}`}
      description="Verified applicant credentials, ATS parsed structure, and professional experience."
      size="xl"
    >
      <div className="flex flex-col gap-5 text-xs max-h-[80vh] overflow-y-auto pr-1">
        {/* Top Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-100 text-[#0A66C2] flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-slate-900 truncate max-w-xs sm:max-w-md">
                {fileName}
              </span>
              <span className="text-[11px] text-slate-500">
                Verified Candidate Document • PDF Format
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View PDF Button (replaces Print) */}
            <Button
              type="button"
              variant={viewFormat === "pdf" ? "secondary" : "outline"}
              size="sm"
              leftIcon={<Eye className="w-3.5 h-3.5 text-[#0A66C2]" />}
              onClick={handleViewPdf}
              title={viewFormat === "pdf" ? "Click to open full PDF in new tab" : "Switch to PDF View"}
            >
              {viewFormat === "pdf" ? "Open Full PDF" : "View PDF"}
            </Button>

            {/* Download Button */}
            <Button
              type="button"
              variant="primary"
              size="sm"
              leftIcon={<Download className="w-3.5 h-3.5" />}
              onClick={handleDownload}
            >
              Download File
            </Button>
          </div>
        </div>

        {/* View Mode Switcher Pills */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setViewFormat("pdf")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewFormat === "pdf"
                  ? "bg-[#0A66C2] text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:text-slate-900"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>PDF Document Viewer</span>
            </button>

            <button
              type="button"
              onClick={() => setViewFormat("ats")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewFormat === "ats"
                  ? "bg-[#0A66C2] text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:text-slate-900"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>ATS Parsed Structure</span>
            </button>
          </div>

          {viewFormat === "pdf" && pdfBlobUrl && (
            <button
              type="button"
              onClick={() => window.open(pdfBlobUrl, "_blank")}
              className="text-xs font-semibold text-[#0A66C2] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Open in New Tab</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* VIEW FORMAT: EMBEDDED PDF VIEWER */}
        {viewFormat === "pdf" ? (
          <div className="w-full flex flex-col gap-2">
            <div className="w-full h-[620px] rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm relative">
              {pdfBlobUrl ? (
                <iframe
                  src={pdfBlobUrl}
                  className="w-full h-full border-0"
                  title={`PDF Resume - ${candidateName}`}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                  <FileText className="w-8 h-8" />
                  <span>Loading PDF document viewer...</span>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
              <span>Viewer: Native PDF Reader</span>
              <span>Document: {fileName}</span>
            </div>
          </div>
        ) : (
          /* VIEW FORMAT: ATS PARSED PROFILE */
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col gap-6 text-slate-900">
            {/* Header Block */}
            <div className="flex flex-col border-b border-slate-200 pb-5">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {candidateName}
              </h2>
              <p className="text-sm font-semibold text-[#0A66C2] mt-0.5">
                {headline}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-3 font-medium">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {phone}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {location}
                </span>
              </div>
            </div>

            {/* Professional Summary */}
            <div className="flex flex-col gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Professional Summary
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                {summary}
              </p>
            </div>

            {/* Work Experience */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-1">
                <Briefcase className="w-4 h-4 text-[#0A66C2]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Work Experience
                </h3>
              </div>

              {experiences.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {experiences.map((exp, idx) => (
                    <div key={idx} className="flex flex-col gap-1.5 text-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                        <span className="font-extrabold text-slate-900 text-sm">
                          {exp.title}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500">
                          {exp.startDate} – {exp.current ? "Present" : exp.endDate || "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 font-medium">
                        <span>{exp.company}</span>
                        <span>•</span>
                        <span>{exp.location}</span>
                      </div>
                      {exp.description && (
                        <p className="text-slate-600 leading-relaxed mt-1">
                          {exp.description}
                        </p>
                      )}
                      {exp.skillsUsed && exp.skillsUsed.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {exp.skillsUsed.map((sk, sIdx) => (
                            <span
                              key={sIdx}
                              className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold border border-slate-200"
                            >
                              {sk}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No formal employment entries listed.</p>
              )}
            </div>

            {/* Education */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-1">
                <GraduationCap className="w-4 h-4 text-[#0A66C2]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Education
                </h3>
              </div>

              {education.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {education.map((edu, idx) => (
                    <div key={idx} className="flex flex-col gap-0.5 text-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                        <span className="font-bold text-slate-900">
                          {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ""}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {edu.startYear} – {edu.endYear}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <span>{edu.institution}</span>
                        {edu.grade && (
                          <>
                            <span>•</span>
                            <span className="font-semibold text-slate-700">Grade: {edu.grade}</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No degree history listed.</p>
              )}
            </div>

            {/* Core Skills */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-1">
                <Sparkles className="w-4 h-4 text-[#0A66C2]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Skills & Technologies
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map((s, idx) => {
                  const sName = typeof s === "string" ? s : s.name;
                  return (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#0A66C2] text-xs font-bold border border-blue-200"
                    >
                      {sName}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Certifications */}
            {certifications.length > 0 && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-1">
                  <Award className="w-4 h-4 text-[#0A66C2]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Certifications & Credentials
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {certifications.map((c, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-0.5"
                    >
                      <span className="font-bold text-slate-900">{c.name}</span>
                      <span className="text-[11px] text-slate-500">
                        {c.issuingOrganization} • {c.issueDate}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
