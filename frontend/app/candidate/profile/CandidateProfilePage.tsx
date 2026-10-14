"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  GraduationCap,
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  UploadCloud,
  Eye,
  CheckCircle2,
  FileText,
  Briefcase,
  FolderGit2,
  ArrowRight,
  Calendar,
  Camera,
  Award,
  ExternalLink,
  Wrench,
  Check,
  Download,
  RefreshCw,
  X,
  ShieldCheck,
  Globe,
  Clock,
  Layers,
  ChevronRight,
  AlertCircle,
  Share2,
} from "lucide-react";
import { useCandidate } from "@/lib/candidate/context/CandidateContext";
import { cn } from "@/lib/utils";
import {
  CandidateSkill,
  SkillLevel,
  CandidateExperienceItem,
  CandidateEducation,
  CandidateCertification,
} from "@/lib/candidate/types";
import {
  WorkExperience,
  Education,
  Certification,
  Skill,
} from "@/types/profile";

export function CandidateProfilePage() {
  const {
    candidateRecord,
    completeness,
    updateCandidateProfile,
    addEducation,
    updateEducation,
    deleteEducation,
    addExperience,
    updateExperience,
    deleteExperience,
    addProject,
    deleteProject,
    addSkill,
    updateSkill,
    deleteSkill,
    addCertification,
    updateCertification,
    deleteCertification,
    updatePreferences,
    uploadedResume,
    uploadResume,
    replaceResume,
    deleteResume,
  } = useCandidate();

  const [isSavedNotice, setIsSavedNotice] = useState(false);
  const [noticeText, setNoticeText] = useState("Profile changes saved successfully.");

  // Profile Photo State & Modal
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Resume File Upload/Replace Input Ref
  const resumeFileInputRef = useRef<HTMLInputElement>(null);
  const [isResumePreviewOpen, setIsResumePreviewOpen] = useState(false);
  const [isResumeDeleteOpen, setIsResumeDeleteOpen] = useState(false);
  const [resumePreviewTab, setResumePreviewTab] = useState<"document" | "text">("document");

  // Public Profile Preview Modal
  const [isPublicPreviewOpen, setIsPublicPreviewOpen] = useState(false);

  // Completeness Breakdown Popover/Modal
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);

  // Sync photoUrl with localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedPhoto = localStorage.getItem("tag_candidate_avatar");
      if (savedPhoto) {
        setPhotoUrl(savedPhoto);
      }
    }
  }, []);

  // Handle Photo File Upload
  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file (PNG, JPEG, or WebP).");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        try {
          localStorage.setItem("tag_candidate_avatar", reader.result);
          setPhotoUrl(reader.result);
          window.dispatchEvent(new Event("storage"));
          showNotice("Profile photo updated.");
        } catch (err) {
          console.warn("Could not save avatar to localStorage:", err);
        }
      }
    };
    reader.readAsDataURL(file);
    setIsPhotoModalOpen(false);
  };

  const handleRemovePhoto = () => {
    setPhotoUrl(null);
    try {
      localStorage.removeItem("tag_candidate_avatar");
      window.dispatchEvent(new Event("storage"));
      showNotice("Profile photo removed.");
    } catch (err) {
      console.warn("Could not remove avatar from localStorage:", err);
    }
    if (avatarInputRef.current) {
      avatarInputRef.current.value = "";
    }
    setIsPhotoModalOpen(false);
  };

  // Resume File Upload & Replace
  const handleResumeFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = [".pdf", ".docx", ".doc", ".txt"];
    const fileNameLower = file.name.toLowerCase();
    const isValid = allowed.some((ext) => fileNameLower.endsWith(ext));

    if (!isValid) {
      alert("Please upload a PDF, DOCX, or TXT resume.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("File size exceeds 10MB limit.");
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
        extractedText = `Document: ${file.name}\nSize: ${(file.size / 1024).toFixed(1)} KB\nType: ${file.type || "Document"}\n\nSections parsed:\n• Contact & Coordinates\n• Professional Engineering Summary\n• Work History & Core Contributions\n• Education & Technical Proficiencies`;
      }

      const payload = {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type || "application/pdf",
        dataUrl,
        extractedText,
        atsScore: uploadedResume?.atsScore || 85,
      };

      if (uploadedResume) {
        replaceResume(payload);
        showNotice("Resume file replaced successfully.");
      } else {
        uploadResume(payload);
        showNotice("Resume uploaded successfully.");
      }
    } catch (err) {
      console.error("Resume file processing failed:", err);
      alert("Failed to process resume file.");
    }

    if (e.target) {
      e.target.value = "";
    }
  };

  const handleDownloadResume = () => {
    if (!uploadedResume?.dataUrl) {
      alert("No downloadable file URL available.");
      return;
    }
    const a = document.createElement("a");
    a.href = uploadedResume.dataUrl;
    a.download = uploadedResume.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleConfirmDeleteResume = () => {
    deleteResume();
    setIsResumeDeleteOpen(false);
    showNotice("Resume removed from profile.");
  };

  // Modals States
  const [isPersonalModalOpen, setIsPersonalModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [headline, setHeadline] = useState("");
  const [summary, setSummary] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");

  const [isExpModalOpen, setIsExpModalOpen] = useState(false);
  const [editingExpId, setEditingExpId] = useState<string | null>(null);
  const [expTitle, setExpTitle] = useState("");
  const [expCompany, setExpCompany] = useState("");
  const [expEmploymentType, setExpEmploymentType] = useState<WorkExperience["employmentType"]>("Full-time");
  const [expLocation, setExpLocation] = useState("");
  const [expLocationType, setExpLocationType] = useState<NonNullable<WorkExperience["locationType"]>>("Hybrid");
  const [expStartDate, setExpStartDate] = useState("");
  const [expEndDate, setExpEndDate] = useState("");
  const [expCurrent, setExpCurrent] = useState(false);
  const [expDescription, setExpDescription] = useState("");
  const [expSkills, setExpSkills] = useState("");

  const [isEduModalOpen, setIsEduModalOpen] = useState(false);
  const [editingEduId, setEditingEduId] = useState<string | null>(null);
  const [eduSchool, setEduSchool] = useState("");
  const [eduDegree, setEduDegree] = useState("");
  const [eduField, setEduField] = useState("");
  const [eduStartDate, setEduStartDate] = useState("");
  const [eduEndDate, setEduEndDate] = useState("");
  const [eduGrade, setEduGrade] = useState("");
  const [eduDescription, setEduDescription] = useState("");

  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [editingCertId, setEditingCertId] = useState<string | null>(null);
  const [certName, setCertName] = useState("");
  const [certOrganization, setCertOrganization] = useState("");
  const [certIssueDate, setCertIssueDate] = useState("");
  const [certExpirationDate, setCertExpirationDate] = useState("");
  const [certCredentialId, setCertCredentialId] = useState("");
  const [certCredentialUrl, setCertCredentialUrl] = useState("");

  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [editingSkillKey, setEditingSkillKey] = useState<string | null>(null);
  const [skillName, setSkillName] = useState("");
  const [skillProficiency, setSkillProficiency] = useState<Skill["proficiency"]>("Advanced");

  const [isProjModalOpen, setIsProjModalOpen] = useState(false);
  const [projTitle, setProjTitle] = useState("");
  const [projDescription, setProjDescription] = useState("");
  const [projTech, setProjTech] = useState("");
  const [projUrl, setProjUrl] = useState("");

  const [isPrefsModalOpen, setIsPrefsModalOpen] = useState(false);
  const [prefWorkMode, setPrefWorkMode] = useState<"remote" | "hybrid" | "onsite" | "any">("any");
  const [prefJobType, setPrefJobType] = useState<"full_time" | "internship" | "contract" | "any">("any");
  const [prefAvailability, setPrefAvailability] = useState<"immediate" | "1_month" | "3_months" | "exploring" | "unsure">("immediate");
  const [prefSalaryINR, setPrefSalaryINR] = useState("");
  const [prefLocations, setPrefLocations] = useState("");

  const showNotice = (msg = "Profile changes saved successfully.") => {
    setNoticeText(msg);
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2500);
  };

  if (!candidateRecord) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
          <User className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">No Active Candidate Record</h2>
        <p className="text-sm text-slate-500 max-w-sm">
          Complete onboarding to establish your structured engineering profile.
        </p>
        <Link href="/onboarding">
          <Button size="md" variant="primary">
            Start Onboarding
          </Button>
        </Link>
      </div>
    );
  }

  const { identity, profile } = candidateRecord;
  const fullName = identity?.fullName || "Candidate";
  const displayHeadline = profile?.headline || "Python Full-Stack & Backend Engineer";
  const displayLocation = profile?.location || "Kazhakoottam, Kerala, India";
  const displayEmail = identity?.email || "candidate@tagjobs.in";
  const displayPhone = profile?.phone || identity?.phone || "+91 98765 43210";

  // Multi-factor honest completeness calculation to fix the contradiction
  const completenessDetails = useMemo(() => {
    const checks = [
      {
        id: "contact",
        label: "Contact & Coordinates",
        weight: 15,
        complete: Boolean(
          identity?.fullName?.trim() &&
          identity?.email?.trim() &&
          (identity?.phone?.trim() || profile?.phone?.trim())
        ),
        action: () => handleOpenPersonalModal(),
        actionLabel: "Verify Contact",
      },
      {
        id: "headline_summary",
        label: "Professional Pitch",
        weight: 15,
        complete: Boolean(
          profile?.headline?.trim() &&
          profile.headline.toLowerCase() !== "candidate" &&
          profile?.summary?.trim()
        ),
        action: () => handleOpenPersonalModal(),
        actionLabel: "Add Pitch",
      },
      {
        id: "experience",
        label: "Commercial Work Experience",
        weight: 20,
        complete: Boolean(profile?.experience && profile.experience.length > 0),
        action: () => handleOpenAddExperience(),
        actionLabel: "Add Role",
      },
      {
        id: "education",
        label: "Academic Background",
        weight: 15,
        complete: Boolean(profile?.education && profile.education.length > 0),
        action: () => handleOpenAddEducation(),
        actionLabel: "Add Degree",
      },
      {
        id: "skills",
        label: "Core Technical Skills (3+)",
        weight: 15,
        complete: Boolean(profile?.skills && profile.skills.length >= 3),
        action: () => handleOpenAddSkill(),
        actionLabel: "Add Skills",
      },
      {
        id: "projects",
        label: "Featured Project Showcase",
        weight: 10,
        complete: Boolean(profile?.projects && profile.projects.length > 0),
        action: () => setIsProjModalOpen(true),
        actionLabel: "Add Project",
      },
      {
        id: "resume",
        label: "Active Resume File",
        weight: 10,
        complete: Boolean(uploadedResume),
        action: () => resumeFileInputRef.current?.click(),
        actionLabel: "Upload File",
      },
    ];

    const completedWeight = checks.reduce((sum, c) => (c.complete ? sum + c.weight : sum), 0);
    const missingChecks = checks.filter((c) => !c.complete);

    return {
      score: completedWeight,
      checks,
      missingChecks,
    };
  }, [identity, profile, uploadedResume]);

  // Handlers for Personal Modal
  const handleOpenPersonalModal = () => {
    setName(identity?.fullName || "");
    setHeadline(profile?.headline || "");
    setSummary(profile?.summary || "");
    setLocation(profile?.location || "Kazhakoottam, Kerala, India");
    setPhone(profile?.phone || identity?.phone || "");
    setPortfolioUrl(profile?.links?.[0]?.url || "");
    setIsPersonalModalOpen(true);
  };

  const handleSavePersonal = (e: React.FormEvent) => {
    e.preventDefault();
    updateCandidateProfile({
      fullName: name.trim() || undefined,
      headline: headline.trim(),
      summary: summary.trim(),
      location: location.trim(),
      phone: phone.trim(),
      links: portfolioUrl.trim()
        ? [{ id: "link_portfolio", label: "Portfolio / GitHub", url: portfolioUrl.trim() }]
        : profile?.links || [],
    });
    setIsPersonalModalOpen(false);
    showNotice("Profile details saved successfully.");
  };

  // Handlers for Experience Modal
  const handleOpenAddExperience = () => {
    setEditingExpId(null);
    setExpTitle("");
    setExpCompany("");
    setExpEmploymentType("Full-time");
    setExpLocation(location || "India");
    setExpLocationType("Hybrid");
    setExpStartDate("");
    setExpEndDate("");
    setExpCurrent(false);
    setExpDescription("");
    setExpSkills("");
    setIsExpModalOpen(true);
  };

  const handleOpenEditExperience = (exp: CandidateExperienceItem) => {
    setEditingExpId(exp.id);
    setExpTitle(exp.title || "");
    setExpCompany(exp.company || "");
    setExpEmploymentType(exp.employmentType || "Full-time");
    setExpLocation(exp.location || "");
    setExpLocationType(exp.locationType || "Hybrid");
    setExpStartDate(exp.startDate || "");
    setExpEndDate(exp.endDate || "");
    setExpCurrent(Boolean(exp.current || exp.isCurrent));
    setExpDescription(exp.description || "");
    const skillsList = exp.skills || exp.skillsUsed || [];
    setExpSkills(skillsList.join(", "));
    setIsExpModalOpen(true);
  };

  const handleSaveExperience = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expTitle.trim() || !expCompany.trim()) return;

    const parsedSkills = expSkills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const expPayload = {
      title: expTitle.trim(),
      company: expCompany.trim(),
      employmentType: expEmploymentType,
      location: expLocation.trim() || "India",
      locationType: expLocationType,
      startDate: expStartDate.trim() || "Present",
      endDate: expCurrent ? undefined : (expEndDate.trim() || undefined),
      current: expCurrent,
      isCurrent: expCurrent,
      description: expDescription.trim(),
      skillsUsed: parsedSkills,
      skills: parsedSkills,
    };

    if (editingExpId) {
      updateExperience(editingExpId, expPayload);
    } else {
      addExperience(expPayload);
    }

    setIsExpModalOpen(false);
    showNotice();
  };

  const handleDeleteExperience = (id: string) => {
    deleteExperience(id);
    showNotice("Experience entry removed.");
  };

  // Handlers for Education Modal
  const handleOpenAddEducation = () => {
    setEditingEduId(null);
    setEduSchool("");
    setEduDegree("");
    setEduField("");
    setEduStartDate("");
    setEduEndDate("");
    setEduGrade("");
    setEduDescription("");
    setIsEduModalOpen(true);
  };

  const handleOpenEditEducation = (edu: CandidateEducation) => {
    setEditingEduId(edu.id);
    setEduSchool(edu.school || edu.institution || "");
    setEduDegree(edu.degree || "");
    setEduField(edu.fieldOfStudy || "");
    setEduStartDate(edu.startDate || edu.startYear || "");
    setEduEndDate(edu.endDate || edu.endYear || "");
    setEduGrade(edu.grade || "");
    setEduDescription(edu.description || "");
    setIsEduModalOpen(true);
  };

  const handleSaveEducation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eduSchool.trim() || !eduDegree.trim()) return;

    const eduPayload = {
      school: eduSchool.trim(),
      institution: eduSchool.trim(),
      degree: eduDegree.trim(),
      fieldOfStudy: eduField.trim() || "General",
      startDate: eduStartDate.trim() || "2022",
      endDate: eduEndDate.trim() || "2026",
      startYear: eduStartDate.trim() || "2022",
      endYear: eduEndDate.trim() || "2026",
      grade: eduGrade.trim() || undefined,
      description: eduDescription.trim() || undefined,
    };

    if (editingEduId) {
      updateEducation(editingEduId, eduPayload);
    } else {
      addEducation(eduPayload);
    }

    setIsEduModalOpen(false);
    showNotice();
  };

  const handleDeleteEducation = (id: string) => {
    deleteEducation(id);
    showNotice("Education record removed.");
  };

  // Handlers for Certification Modal
  const handleOpenAddCertification = () => {
    setEditingCertId(null);
    setCertName("");
    setCertOrganization("");
    setCertIssueDate("");
    setCertExpirationDate("");
    setCertCredentialId("");
    setCertCredentialUrl("");
    setIsCertModalOpen(true);
  };

  const handleOpenEditCertification = (cert: CandidateCertification) => {
    setEditingCertId(cert.id);
    setCertName(cert.name || "");
    setCertOrganization(cert.issuingOrganization || cert.issuer || "");
    setCertIssueDate(cert.issueDate || "");
    setCertExpirationDate(cert.expirationDate || cert.expiryDate || "");
    setCertCredentialId(cert.credentialId || "");
    setCertCredentialUrl(cert.credentialUrl || "");
    setIsCertModalOpen(true);
  };

  const handleSaveCertification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certName.trim() || !certOrganization.trim()) return;

    const certPayload = {
      name: certName.trim(),
      issuingOrganization: certOrganization.trim(),
      issuer: certOrganization.trim(),
      issueDate: certIssueDate.trim() || new Date().getFullYear().toString(),
      expirationDate: certExpirationDate.trim() || undefined,
      expiryDate: certExpirationDate.trim() || undefined,
      credentialId: certCredentialId.trim() || undefined,
      credentialUrl: certCredentialUrl.trim() || undefined,
    };

    if (editingCertId) {
      updateCertification(editingCertId, certPayload);
    } else {
      addCertification(certPayload);
    }

    setIsCertModalOpen(false);
    showNotice();
  };

  const handleDeleteCertification = (id: string) => {
    deleteCertification(id);
    showNotice("Certification removed.");
  };

  // Handlers for Skills Modal
  const handleOpenAddSkill = () => {
    setEditingSkillKey(null);
    setSkillName("");
    setSkillProficiency("Advanced");
    setIsSkillModalOpen(true);
  };

  const handleOpenEditSkill = (skill: CandidateSkill) => {
    setEditingSkillKey(skill.id || skill.name);
    setSkillName(skill.name);
    const prof: Skill["proficiency"] =
      skill.proficiency ||
      (skill.level === "expert"
        ? "Expert"
        : skill.level === "confident"
        ? "Advanced"
        : skill.level === "comfortable"
        ? "Comfortable"
        : "Beginner");
    setSkillProficiency(prof);
    setIsSkillModalOpen(true);
  };

  const handleSaveSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillName.trim()) return;

    const levelMap: Record<Skill["proficiency"], SkillLevel> = {
      Beginner: "learning",
      Comfortable: "comfortable",
      Advanced: "confident",
      Expert: "expert",
    };

    const skillPayload: CandidateSkill = {
      id: editingSkillKey || `skill_${Date.now()}`,
      name: skillName.trim(),
      proficiency: skillProficiency,
      level: levelMap[skillProficiency],
    };

    if (editingSkillKey) {
      updateSkill(editingSkillKey, skillPayload);
    } else {
      addSkill(skillPayload);
    }

    setIsSkillModalOpen(false);
    showNotice("Skill inventory updated.");
  };

  const handleDeleteSkill = (name: string) => {
    deleteSkill(name);
    showNotice("Skill deleted.");
  };

  // Handlers for Project Modal
  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projTitle.trim() || !projDescription.trim()) return;
    addProject({
      title: projTitle.trim(),
      description: projDescription.trim(),
      technologies: projTech
        ? projTech.split(",").map((t) => t.trim()).filter(Boolean)
        : [],
      url: projUrl.trim() || undefined,
    });
    setIsProjModalOpen(false);
    setProjTitle("");
    setProjDescription("");
    setProjTech("");
    setProjUrl("");
    showNotice("Project added.");
  };

  // Handlers for Preferences Modal
  const handleOpenPrefsModal = () => {
    setPrefWorkMode(profile?.jobPreferences?.desiredWorkModes?.[0] || "any");
    setPrefJobType(profile?.jobPreferences?.employmentTypes?.[0] || "any");
    setPrefAvailability(profile?.jobPreferences?.availability || "immediate");
    setPrefSalaryINR(
      profile?.jobPreferences?.minimumSalaryINR ? String(profile.jobPreferences.minimumSalaryINR) : ""
    );
    setPrefLocations(profile?.jobPreferences?.preferredLocations?.join(", ") || displayLocation);
    setIsPrefsModalOpen(true);
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    const locs = prefLocations
      .split(",")
      .map((l) => l.trim())
      .filter(Boolean);

    updatePreferences({
      desiredWorkModes: [prefWorkMode],
      employmentTypes: [prefJobType],
      availability: prefAvailability,
      preferredLocations: locs.length > 0 ? locs : undefined,
      minimumSalaryINR: prefSalaryINR ? parseInt(prefSalaryINR, 10) : undefined,
    });
    setIsPrefsModalOpen(false);
    showNotice("Job preferences updated.");
  };

  const isPdf = uploadedResume?.fileName?.toLowerCase().endsWith(".pdf");
  const isDocx = uploadedResume?.fileName?.toLowerCase().endsWith(".docx");

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "0 KB";
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return "Recently";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return "Recently";
    }
  };

  const experiences = profile?.experience || [];
  const educations = profile?.education || [];
  const certifications = profile?.certifications || [];
  const projects = profile?.projects || [];
  const skills = profile?.skills || [];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-20 font-sans">
      {/* Toast Notice */}
      {isSavedNotice && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-xl bg-slate-900 text-white shadow-2xl text-xs font-semibold flex items-center gap-2.5 animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{noticeText}</span>
        </div>
      )}

      {/* Hidden File Inputs */}
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
        onChange={handlePhotoFileChange}
      />
      <input
        ref={resumeFileInputRef}
        type="file"
        accept=".pdf,.docx,.doc,.txt"
        className="hidden"
        onChange={handleResumeFileSelected}
      />

      {/* 12-Column Two-Pane Grid Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================= */}
        {/* TOP HERO PROFILE HEADER CARD (lg:col-span-12) */}
        {/* ========================================================= */}
        <section className="lg:col-span-12">
          <Card className="p-6 sm:p-7 bg-white border border-slate-200/90 rounded-2xl shadow-xs transition-all">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              {/* Left Side: Avatar & Identity Metadata */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-5 min-w-0">
                {/* Interactive Avatar */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setIsPhotoModalOpen(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setIsPhotoModalOpen(true);
                    }
                  }}
                  className="relative group w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-2xl shrink-0 shadow-xs overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
                  aria-label="Change profile photo"
                  title="Click to change profile photo"
                >
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt={fullName}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <span>{fullName.charAt(0).toUpperCase()}</span>
                  )}
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <Camera className="w-5 h-5 drop-shadow-sm" />
                  </div>
                </div>

                {/* Name, Headline & Metadata Pills */}
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 truncate">
                      {fullName}
                    </h1>

                    {/* Dynamic Completion Badge - Honest score display */}
                    <button
                      type="button"
                      onClick={() => setIsBreakdownOpen(true)}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer",
                        completenessDetails.score === 100
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100/60"
                          : completenessDetails.score >= 70
                          ? "bg-blue-50 text-blue-700 border-blue-200/80 hover:bg-blue-100/60"
                          : "bg-amber-50 text-amber-700 border-amber-200/80 hover:bg-amber-100/60"
                      )}
                      title="Click to view completion checklist"
                    >
                      <span
                        className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          completenessDetails.score === 100
                            ? "bg-emerald-500"
                            : completenessDetails.score >= 70
                            ? "bg-blue-500"
                            : "bg-amber-500"
                        )}
                      />
                      <span>
                        {completenessDetails.score === 100
                          ? "100% Complete • Verified"
                          : `${completenessDetails.score}% Complete`}
                      </span>
                    </button>
                  </div>

                  <p className="text-sm font-medium text-slate-600 truncate max-w-xl">
                    {displayHeadline}
                  </p>

                  {/* Metadata Pills */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 mt-2">
                    <span className="flex items-center gap-1.5 font-medium text-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{displayLocation}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{displayEmail}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{displayPhone}</span>
                    </span>
                    {profile?.links?.[0]?.url && (
                      <a
                        href={profile.links[0].url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:underline font-medium"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span>Portfolio / Code</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Action Group: Preview Public Profile + Edit Profile */}
              <div className="flex items-center gap-2.5 shrink-0 self-start md:self-center">
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Eye className="w-3.5 h-3.5" />}
                  onClick={() => setIsPublicPreviewOpen(true)}
                  className="rounded-lg text-slate-700 border-slate-200 hover:bg-slate-50 font-semibold"
                >
                  Preview Public Profile
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                  onClick={handleOpenPersonalModal}
                  className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  Edit Profile
                </Button>
              </div>
            </div>
          </Card>
        </section>

        {/* ========================================================= */}
        {/* LEFT MAIN COLUMN (lg:col-span-8 space-y-6) */}
        {/* ========================================================= */}
        <main className="lg:col-span-8 space-y-6">
          {/* 1. Professional Summary Card */}
          <Card className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                  <User className="w-3.5 h-3.5" />
                </div>
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                  Professional Summary
                </h2>
              </div>
              <button
                type="button"
                onClick={handleOpenPersonalModal}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                <Edit2 className="w-3 h-3" />
                <span>Edit Pitch</span>
              </button>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {profile?.summary ||
                "Motivated software engineer with deep interest in backend architecture, microservices, and distributed web applications. Add your professional summary to highlight your specific technical strengths and career focus."}
            </p>
          </Card>

          {/* 2. Work Experience Card (Timeline Layout) */}
          <Card className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-xs flex flex-col gap-5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Briefcase className="w-3.5 h-3.5" />
                </div>
                <h2 className="text-sm font-bold text-slate-900">
                  Work Experience ({experiences.length})
                </h2>
              </div>
              {experiences.length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  onClick={handleOpenAddExperience}
                  className="rounded-lg text-xs"
                >
                  Add Experience
                </Button>
              )}
            </div>

            {experiences.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">No work experience added yet</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Add previous roles, internships, or commercial contract projects.
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  onClick={handleOpenAddExperience}
                  className="shrink-0 rounded-lg text-xs"
                >
                  Add Experience
                </Button>
              </div>
            ) : (
              <div className="relative pl-6 sm:pl-7 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {experiences.map((exp) => (
                  <div key={exp.id} className="relative group">
                    {/* Timeline Node Dot */}
                    <div className="absolute -left-6 sm:-left-7 top-1.5 w-5 h-5 rounded-full bg-white border-2 border-blue-600 flex items-center justify-center shadow-2xs">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    </div>

                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {exp.title}
                          </h3>
                          {exp.employmentType && (
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/80">
                              {exp.employmentType}
                            </span>
                          )}
                          {(exp.current || exp.isCurrent) && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Present Role
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 mt-1">
                          <span className="font-semibold text-slate-800">{exp.company}</span>
                          <span className="text-slate-300">•</span>
                          <span className="flex items-center gap-1 text-slate-500">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {exp.startDate} – {exp.current || exp.isCurrent ? "Present" : exp.endDate || "Present"}
                          </span>
                          {exp.location && (
                            <>
                              <span className="text-slate-300">•</span>
                              <span className="flex items-center gap-1 text-slate-500">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                {exp.location} {exp.locationType ? `(${exp.locationType})` : ""}
                              </span>
                            </>
                          )}
                        </div>

                        {exp.description && (
                          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-2.5 whitespace-pre-line">
                            {exp.description}
                          </p>
                        )}

                        {(exp.skills && exp.skills.length > 0 ? exp.skills : exp.skillsUsed) && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {(exp.skills && exp.skills.length > 0 ? exp.skills : exp.skillsUsed)?.map((sk) => (
                              <span
                                key={sk}
                                className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-50 text-slate-700 border border-slate-200/80"
                              >
                                {sk}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Action icons */}
                      <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleOpenEditExperience(exp)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit Experience"
                          aria-label="Edit Experience"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteExperience(exp.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Experience"
                          aria-label="Delete Experience"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* 3. Featured Projects Card */}
          <Card className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-xs flex flex-col gap-5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <FolderGit2 className="w-3.5 h-3.5" />
                </div>
                <h2 className="text-sm font-bold text-slate-900">
                  Featured Projects ({projects.length})
                </h2>
              </div>
              {projects.length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  onClick={() => setIsProjModalOpen(true)}
                  className="rounded-lg text-xs"
                >
                  Add Project
                </Button>
              )}
            </div>

            {projects.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <FolderGit2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">No projects added yet</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Add systems, web apps, or open-source repositories to provide tangible engineering proof.
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  onClick={() => setIsProjModalOpen(true)}
                  className="shrink-0 rounded-lg text-xs"
                >
                  Add Project
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {projects.map((proj) => (
                  <div
                    key={proj.id}
                    className="p-4 rounded-xl border border-slate-200/90 bg-white hover:border-indigo-300 transition-all flex flex-col justify-between gap-3 group shadow-2xs"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {proj.title}
                        </h3>
                        <div className="flex items-center gap-1 shrink-0">
                          {proj.url && (
                            <a
                              href={proj.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 text-slate-400 hover:text-indigo-600 rounded-md transition-colors"
                              title="Open Project Link"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              deleteProject(proj.id);
                              showNotice("Project removed.");
                            }}
                            className="p-1 text-slate-400 hover:text-red-500 rounded-md transition-colors cursor-pointer"
                            title="Delete Project"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-3 mt-1.5 leading-relaxed">
                        {proj.description}
                      </p>
                    </div>

                    {proj.technologies && proj.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
                        {proj.technologies.map((t) => (
                          <span
                            key={t}
                            className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-50 text-slate-600 border border-slate-200/80"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* 4. Education Card */}
          <Card className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-xs flex flex-col gap-5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <GraduationCap className="w-3.5 h-3.5" />
                </div>
                <h2 className="text-sm font-bold text-slate-900">
                  Education ({educations.length})
                </h2>
              </div>
              {educations.length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  onClick={handleOpenAddEducation}
                  className="rounded-lg text-xs"
                >
                  Add Education
                </Button>
              )}
            </div>

            {educations.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">No education entries added yet</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Add university degrees, diplomas, or academic coursework.
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  onClick={handleOpenAddEducation}
                  className="shrink-0 rounded-lg text-xs"
                >
                  Add Education
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 flex flex-col">
                {educations.map((edu) => (
                  <div
                    key={edu.id}
                    className="py-4 first:pt-0 last:pb-0 flex items-start justify-between gap-4 group"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {edu.school || edu.institution}
                        </h3>
                        <p className="text-xs font-semibold text-slate-700 mt-0.5">
                          {edu.degree} {edu.fieldOfStudy ? `• ${edu.fieldOfStudy}` : ""}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
                          <span>
                            {edu.startDate || edu.startYear} – {edu.endDate || edu.endYear}
                          </span>
                          {edu.grade && (
                            <span className="font-semibold text-indigo-600">
                              Grade: {edu.grade}
                            </span>
                          )}
                        </div>
                        {edu.description && (
                          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                            {edu.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => handleOpenEditEducation(edu)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Edit Education"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteEducation(edu.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Education"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* 5. Certifications & Licenses Card */}
          <Card className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-xs flex flex-col gap-5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Award className="w-3.5 h-3.5" />
                </div>
                <h2 className="text-sm font-bold text-slate-900">
                  Certifications &amp; Licenses ({certifications.length})
                </h2>
              </div>
              {certifications.length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  onClick={handleOpenAddCertification}
                  className="rounded-lg text-xs"
                >
                  Add Certification
                </Button>
              )}
            </div>

            {certifications.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">No certifications added yet</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Add cloud, backend, or professional licenses (e.g. AWS, Meta, Google).
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  onClick={handleOpenAddCertification}
                  className="shrink-0 rounded-lg text-xs"
                >
                  Add Certification
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 flex flex-col">
                {certifications.map((cert) => (
                  <div
                    key={cert.id}
                    className="py-4 first:pt-0 last:pb-0 flex items-start justify-between gap-4 group"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Award className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                          {cert.name}
                        </h3>
                        <p className="text-xs font-semibold text-slate-700 mt-0.5">
                          {cert.issuingOrganization || cert.issuer}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
                          <span>
                            Issued {cert.issueDate}
                            {(cert.expirationDate || cert.expiryDate) && (
                              <span> • Expires {cert.expirationDate || cert.expiryDate}</span>
                            )}
                          </span>
                          {cert.credentialId && (
                            <span className="font-mono text-slate-400">
                              ID: {cert.credentialId}
                            </span>
                          )}
                        </div>
                        {cert.credentialUrl && (
                          <a
                            href={cert.credentialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline mt-1.5"
                          >
                            <span>Show credential</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => handleOpenEditCertification(cert)}
                        className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Edit Certification"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCertification(cert.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Certification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </main>

        {/* ========================================================= */}
        {/* RIGHT STICKY SIDEBAR COLUMN (lg:col-span-4 space-y-6) */}
        {/* ========================================================= */}
        <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">
          {/* 1. Active Resume Widget (NO BLACK BORDER) */}
          <Card className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs flex flex-col gap-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Active Resume</h3>
              </div>
              <Link
                href="/candidate/resume"
                className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Studio</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            {uploadedResume ? (
              <div className="border border-slate-200/90 bg-slate-50/60 rounded-xl p-3.5 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs",
                      isPdf
                        ? "bg-rose-50 text-rose-600 border border-rose-200"
                        : isDocx
                        ? "bg-sky-50 text-sky-600 border border-sky-200"
                        : "bg-slate-100 text-slate-700 border border-slate-200"
                    )}
                  >
                    {isPdf ? "PDF" : isDocx ? "DOCX" : <FileText className="w-5 h-5" />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate" title={uploadedResume.fileName}>
                      {uploadedResume.fileName}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {formatFileSize(uploadedResume.fileSize)} • {formatDate(uploadedResume.uploadedAt)}
                    </p>
                  </div>

                  {uploadedResume.atsScore && (
                    <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      ATS {uploadedResume.atsScore}
                    </span>
                  )}
                </div>

                {/* Quick Icon Actions */}
                <div className="flex items-center justify-between pt-2.5 border-t border-slate-200/70 text-xs">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsResumePreviewOpen(true)}
                      className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs transition-colors cursor-pointer"
                      title="Preview Resume"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadResume}
                      className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs transition-colors cursor-pointer"
                      title="Download Resume"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => resumeFileInputRef.current?.click()}
                      className="p-1.5 rounded-lg bg-white hover:bg-blue-50 text-blue-600 border border-blue-200 shadow-2xs transition-colors cursor-pointer"
                      title="Replace Resume File"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsResumeDeleteOpen(true)}
                      className="p-1.5 rounded-lg bg-white hover:bg-red-50 text-slate-500 hover:text-red-600 border border-slate-200 hover:border-red-200 shadow-2xs transition-colors cursor-pointer"
                      title="Delete Resume"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <Link
                    href="/candidate/resume"
                    className="text-[11px] font-semibold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <span>Run ATS Scan</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ) : (
              <div
                onClick={() => resumeFileInputRef.current?.click()}
                className="border border-dashed border-slate-300 hover:border-blue-400 bg-slate-50/60 hover:bg-blue-50/30 rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <UploadCloud className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800">Upload Active Resume</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">PDF or DOCX up to 10MB</p>
                </div>
              </div>
            )}
          </Card>

          {/* 2. Technical & Domain Skills (Compact Badge Cloud) */}
          <Card className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs flex flex-col gap-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Wrench className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  Technical Skills ({skills.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={handleOpenAddSkill}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Skill</span>
              </button>
            </div>

            {skills.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-4 text-center">
                <p className="text-xs text-slate-500">No skills added yet</p>
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  onClick={handleOpenAddSkill}
                  className="mt-2 text-xs"
                >
                  Add Skill
                </Button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => {
                  const prof: Skill["proficiency"] =
                    skill.proficiency ||
                    (skill.level === "expert"
                      ? "Expert"
                      : skill.level === "confident"
                      ? "Advanced"
                      : skill.level === "comfortable"
                      ? "Comfortable"
                      : "Beginner");

                  const profColor =
                    prof === "Expert"
                      ? "bg-purple-50 text-purple-700 border-purple-200/90"
                      : prof === "Advanced"
                      ? "bg-indigo-50 text-indigo-700 border-indigo-200/90"
                      : prof === "Comfortable"
                      ? "bg-blue-50 text-blue-700 border-blue-200/90"
                      : "bg-slate-100 text-slate-700 border-slate-200/90";

                  return (
                    <div
                      key={skill.name}
                      onClick={() => handleOpenEditSkill(skill)}
                      className={cn(
                        "group relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium cursor-pointer transition-all hover:scale-[1.02] shadow-2xs",
                        profColor
                      )}
                      title={`Click to edit proficiency for ${skill.name}`}
                    >
                      <span className="font-semibold">{skill.name}</span>
                      <span className="opacity-60 text-[10px]">•</span>
                      <span className="text-[10px] font-bold opacity-90">{prof}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSkill(skill.name);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 ml-0.5 hover:text-red-600 rounded transition-opacity"
                        title="Delete skill"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* 3. Job Preferences Summary Card */}
          <Card className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs flex flex-col gap-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Briefcase className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Job Preferences</h3>
              </div>
              <button
                type="button"
                onClick={handleOpenPrefsModal}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                <Edit2 className="w-3 h-3" />
                <span>Edit</span>
              </button>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-2 first:pt-0 flex items-center justify-between gap-2">
                <span className="text-slate-500">Work Mode</span>
                <span className="font-semibold text-slate-800 capitalize">
                  {profile?.jobPreferences?.desiredWorkModes?.join(", ") || "Any"}
                </span>
              </div>
              <div className="py-2 flex items-center justify-between gap-2">
                <span className="text-slate-500">Job Type</span>
                <span className="font-semibold text-slate-800 capitalize">
                  {profile?.jobPreferences?.employmentTypes?.join(", ") || "Full-time"}
                </span>
              </div>
              <div className="py-2 flex items-center justify-between gap-2">
                <span className="text-slate-500">Availability</span>
                <span className="font-semibold text-slate-800 capitalize">
                  {profile?.jobPreferences?.availability?.replace(/_/g, " ") || "Immediate"}
                </span>
              </div>
              <div className="py-2 flex items-center justify-between gap-2">
                <span className="text-slate-500">Preferred Locations</span>
                <span className="font-semibold text-slate-800 truncate max-w-[170px] text-right">
                  {profile?.jobPreferences?.preferredLocations?.length
                    ? profile.jobPreferences.preferredLocations.join(", ")
                    : displayLocation}
                </span>
              </div>
              {profile?.jobPreferences?.minimumSalaryINR && (
                <div className="py-2 last:pb-0 flex items-center justify-between gap-2">
                  <span className="text-slate-500">Target Salary</span>
                  <span className="font-semibold text-slate-800">
                    ₹{profile.jobPreferences.minimumSalaryINR.toLocaleString("en-IN")}/yr
                  </span>
                </div>
              )}
            </div>
          </Card>

          {/* 4. Profile Health / Completeness Helper Widget */}
          <Card className="p-5 bg-gradient-to-br from-slate-50 to-blue-50/40 border border-slate-200/90 rounded-2xl shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-bold text-slate-800">Profile Health</h4>
              </div>
              <span className="text-xs font-mono font-bold text-blue-600">
                {completenessDetails.score}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${completenessDetails.score}%` }}
              />
            </div>

            {completenessDetails.missingChecks.length > 0 ? (
              <div className="flex flex-col gap-2 mt-1">
                <p className="text-[11px] text-slate-500">
                  {completenessDetails.missingChecks.length} item
                  {completenessDetails.missingChecks.length > 1 ? "s" : ""} pending for 100% verification:
                </p>
                <div className="flex flex-col gap-1.5">
                  {completenessDetails.missingChecks.slice(0, 3).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={item.action}
                      className="w-full text-left p-2 rounded-lg bg-white border border-slate-200/80 hover:border-blue-300 text-[11px] flex items-center justify-between text-slate-700 hover:text-blue-600 transition-colors cursor-pointer group shadow-2xs"
                    >
                      <span className="font-medium truncate">{item.label}</span>
                      <span className="text-blue-600 font-semibold flex items-center gap-0.5 shrink-0 group-hover:translate-x-0.5 transition-transform">
                        <span>+{item.weight}%</span>
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                All engineering milestones verified. Profile is recruiter-ready!
              </p>
            )}
          </Card>
        </aside>
      </div>

      {/* ========================================================= */}
      {/* MODALS */}
      {/* ========================================================= */}

      {/* MODAL: EDIT PERSONAL INFO */}
      <Modal
        isOpen={isPersonalModalOpen}
        onClose={() => setIsPersonalModalOpen(false)}
        title="Edit Engineering Profile"
        description="Update your contact, location, professional headline, and summary."
        size="md"
      >
        <form onSubmit={handleSavePersonal} className="flex flex-col gap-4">
          <Input
            label="Full Name *"
            placeholder="e.g. Alen William"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Professional Headline *"
            placeholder="e.g. Python Full-Stack & Backend Engineer"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            required
          />
          <Textarea
            label="Professional Summary"
            placeholder="Highlight your systems, frameworks, architecture experience, and business impact..."
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={4}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Location"
              placeholder="e.g. Kazhakoottam, Kerala, India"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
            <Input
              label="Phone Number"
              placeholder="e.g. +91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <Input
            label="Portfolio or GitHub URL"
            placeholder="https://github.com/username or https://portfolio.dev"
            value={portfolioUrl}
            onChange={(e) => setPortfolioUrl(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsPersonalModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: ADD / EDIT WORK EXPERIENCE */}
      <Modal
        isOpen={isExpModalOpen}
        onClose={() => setIsExpModalOpen(false)}
        title={editingExpId ? "Edit Work Experience" : "Add Work Experience"}
        description="Detail your engineering position, company, timeline, and impact."
        size="lg"
      >
        <form onSubmit={handleSaveExperience} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Job Title *"
              placeholder="e.g. Senior Backend Engineer"
              value={expTitle}
              onChange={(e) => setExpTitle(e.target.value)}
              required
            />
            <Input
              label="Company Name *"
              placeholder="e.g. Stripe, Razorpay, TechCorp"
              value={expCompany}
              onChange={(e) => setExpCompany(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-800">Employment Type *</label>
              <select
                value={expEmploymentType}
                onChange={(e) => setExpEmploymentType(e.target.value as any)}
                className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
                <option value="Freelance">Freelance</option>
              </select>
            </div>

            <Input
              label="Location"
              placeholder="e.g. Bengaluru, India"
              value={expLocation}
              onChange={(e) => setExpLocation(e.target.value)}
            />

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-800">Location Type</label>
              <select
                value={expLocationType}
                onChange={(e) => setExpLocationType(e.target.value as any)}
                className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Hybrid">Hybrid</option>
                <option value="Remote">Remote</option>
                <option value="On-site">On-site</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="expCurrentRole"
              checked={expCurrent}
              onChange={(e) => setExpCurrent(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="expCurrentRole" className="text-xs font-medium text-slate-800 cursor-pointer">
              I am currently working in this role
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Start Date *"
              placeholder="e.g. Jun 2023"
              value={expStartDate}
              onChange={(e) => setExpStartDate(e.target.value)}
              required
            />
            <Input
              label="End Date"
              placeholder="e.g. Present or Nov 2026"
              disabled={expCurrent}
              value={expCurrent ? "Present" : expEndDate}
              onChange={(e) => setExpEndDate(e.target.value)}
            />
          </div>

          <Textarea
            label="Key Responsibilities & Achievements"
            placeholder="Engineered high-throughput event queues, reduced API latency by 45%, led cloud migrations..."
            value={expDescription}
            onChange={(e) => setExpDescription(e.target.value)}
            rows={3}
          />

          <Input
            label="Technologies & Skills Used (comma separated)"
            placeholder="e.g. Python, Django, PostgreSQL, Docker, Redis"
            value={expSkills}
            onChange={(e) => setExpSkills(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsExpModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              {editingExpId ? "Save Changes" : "Add Experience"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: ADD / EDIT EDUCATION */}
      <Modal
        isOpen={isEduModalOpen}
        onClose={() => setIsEduModalOpen(false)}
        title={editingEduId ? "Edit Education" : "Add Education"}
        description="Detail your university degree, field of study, and academic background."
        size="lg"
      >
        <form onSubmit={handleSaveEducation} className="flex flex-col gap-4">
          <Input
            label="School / University *"
            placeholder="e.g. National Institute of Technology, Calicut"
            value={eduSchool}
            onChange={(e) => setEduSchool(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Degree *"
              placeholder="e.g. Bachelor of Technology (B.Tech)"
              value={eduDegree}
              onChange={(e) => setEduDegree(e.target.value)}
              required
            />
            <Input
              label="Field of Study *"
              placeholder="e.g. Computer Science & Engineering"
              value={eduField}
              onChange={(e) => setEduField(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Start Date / Year *"
              placeholder="e.g. Sep 2020 or 2020"
              value={eduStartDate}
              onChange={(e) => setEduStartDate(e.target.value)}
              required
            />
            <Input
              label="End Date / Year *"
              placeholder="e.g. May 2024 or 2024"
              value={eduEndDate}
              onChange={(e) => setEduEndDate(e.target.value)}
              required
            />
          </div>

          <Input
            label="Grade / CGPA (Optional)"
            placeholder="e.g. 8.6 / 10 CGPA"
            value={eduGrade}
            onChange={(e) => setEduGrade(e.target.value)}
          />

          <Textarea
            label="Activities & Description (Optional)"
            placeholder="Algorithms club lead, published paper in distributed systems..."
            value={eduDescription}
            onChange={(e) => setEduDescription(e.target.value)}
            rows={2}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsEduModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              {editingEduId ? "Save Changes" : "Add Education"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: ADD / EDIT CERTIFICATION */}
      <Modal
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
        title={editingCertId ? "Edit Certification" : "Add Certification"}
        description="Add recognized professional credentials and licenses."
        size="lg"
      >
        <form onSubmit={handleSaveCertification} className="flex flex-col gap-4">
          <Input
            label="Certification Name *"
            placeholder="e.g. AWS Certified Solutions Architect"
            value={certName}
            onChange={(e) => setCertName(e.target.value)}
            required
          />

          <Input
            label="Issuing Organization *"
            placeholder="e.g. Amazon Web Services (AWS)"
            value={certOrganization}
            onChange={(e) => setCertOrganization(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Issue Date *"
              placeholder="e.g. Jan 2025"
              value={certIssueDate}
              onChange={(e) => setCertIssueDate(e.target.value)}
              required
            />
            <Input
              label="Expiration Date (Optional)"
              placeholder="e.g. Jan 2028"
              value={certExpirationDate}
              onChange={(e) => setCertExpirationDate(e.target.value)}
            />
          </div>

          <Input
            label="Credential ID (Optional)"
            placeholder="e.g. AWS-SAA-92841"
            value={certCredentialId}
            onChange={(e) => setCertCredentialId(e.target.value)}
          />

          <Input
            label="Credential URL (Optional)"
            placeholder="https://www.credly.com/badges/..."
            value={certCredentialUrl}
            onChange={(e) => setCertCredentialUrl(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsCertModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              {editingCertId ? "Save Changes" : "Add Certification"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: ADD / EDIT SKILL */}
      <Modal
        isOpen={isSkillModalOpen}
        onClose={() => setIsSkillModalOpen(false)}
        title={editingSkillKey ? "Edit Skill" : "Add Technical Skill"}
        description="Declare your competency level across key technical and domain capabilities."
        size="md"
      >
        <form onSubmit={handleSaveSkill} className="flex flex-col gap-4">
          <Input
            label="Skill Name *"
            placeholder="e.g. Python, Next.js, Django, Docker"
            value={skillName}
            onChange={(e) => setSkillName(e.target.value)}
            required
          />

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-800">Proficiency Level *</label>
            <select
              value={skillProficiency}
              onChange={(e) => setSkillProficiency(e.target.value as any)}
              className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Beginner">Beginner (Foundational)</option>
              <option value="Comfortable">Comfortable (Can build independently)</option>
              <option value="Advanced">Advanced (Production experience)</option>
              <option value="Expert">Expert (Subject matter authority)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsSkillModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              {editingSkillKey ? "Save Changes" : "Add Skill"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: ADD PROJECT */}
      <Modal
        isOpen={isProjModalOpen}
        onClose={() => setIsProjModalOpen(false)}
        title="Add Featured Project"
        description="Showcase an engineering project, architecture, or open source system."
        size="md"
      >
        <form onSubmit={handleAddProject} className="flex flex-col gap-4">
          <Input
            label="Project Title *"
            placeholder="e.g. Real-Time Distributed Task Queue"
            value={projTitle}
            onChange={(e) => setProjTitle(e.target.value)}
            required
          />
          <Textarea
            label="Project Description *"
            placeholder="Explain architecture, throughput, your role, and key problems solved..."
            value={projDescription}
            onChange={(e) => setProjDescription(e.target.value)}
            rows={3}
            required
          />
          <Input
            label="Technologies Used (comma separated)"
            placeholder="e.g. Python, FastAPI, Redis, Docker, Celery"
            value={projTech}
            onChange={(e) => setProjTech(e.target.value)}
          />
          <Input
            label="Repository or Live URL (Optional)"
            placeholder="https://github.com/username/project"
            value={projUrl}
            onChange={(e) => setProjUrl(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsProjModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Add Project
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: EDIT JOB PREFERENCES */}
      <Modal
        isOpen={isPrefsModalOpen}
        onClose={() => setIsPrefsModalOpen(false)}
        title="Edit Job Preferences"
        description="Configure your work mode, availability timeline, and target compensation."
        size="md"
      >
        <form onSubmit={handleSavePreferences} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-800">Work Mode</label>
            <select
              value={prefWorkMode}
              onChange={(e) => setPrefWorkMode(e.target.value as any)}
              className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="any">Any work mode</option>
              <option value="remote">Remote only</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">On-site</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-800">Employment Type</label>
            <select
              value={prefJobType}
              onChange={(e) => setPrefJobType(e.target.value as any)}
              className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="any">Any job type</option>
              <option value="full_time">Full-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-800">Availability Timeline</label>
            <select
              value={prefAvailability}
              onChange={(e) => setPrefAvailability(e.target.value as any)}
              className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="immediate">Immediate</option>
              <option value="1_month">Within 1 Month</option>
              <option value="3_months">Within 3 Months</option>
              <option value="exploring">Casually Exploring</option>
            </select>
          </div>

          <Input
            label="Preferred Locations (comma separated)"
            placeholder="e.g. Kazhakoottam, Bengaluru, Remote"
            value={prefLocations}
            onChange={(e) => setPrefLocations(e.target.value)}
          />

          <Input
            label="Minimum Target Salary (INR / year) - Optional"
            placeholder="e.g. 1200000"
            type="number"
            value={prefSalaryINR}
            onChange={(e) => setPrefSalaryINR(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsPrefsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Preferences
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: PROFILE PHOTO ACTIONS */}
      {isPhotoModalOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setIsPhotoModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="max-w-sm w-full bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden text-center animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-slate-800 text-sm font-bold py-4 border-b border-slate-100">
              Profile Photo
            </h3>
            <div className="flex flex-col divide-y divide-slate-100">
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="w-full text-blue-600 font-semibold text-xs py-3.5 hover:bg-blue-50/60 transition cursor-pointer"
              >
                Upload New Photo
              </button>
              {photoUrl && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="w-full text-red-600 font-semibold text-xs py-3.5 hover:bg-red-50/60 transition cursor-pointer"
                >
                  Remove Photo
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsPhotoModalOpen(false)}
                className="w-full text-slate-600 font-medium text-xs py-3.5 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: RESUME PREVIEW */}
      {isResumePreviewOpen && uploadedResume && (
        <Modal
          isOpen={isResumePreviewOpen}
          onClose={() => setIsResumePreviewOpen(false)}
          title={`Resume Preview: ${uploadedResume.fileName}`}
          description={`Size: ${formatFileSize(uploadedResume.fileSize)} • Uploaded: ${formatDate(uploadedResume.uploadedAt)}`}
          size="lg"
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setResumePreviewTab("document")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                    resumePreviewTab === "document"
                      ? "bg-blue-50 text-blue-600 border border-blue-200"
                      : "text-slate-600 hover:bg-slate-100"
                  )}
                >
                  Document View
                </button>
                <button
                  type="button"
                  onClick={() => setResumePreviewTab("text")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                    resumePreviewTab === "text"
                      ? "bg-blue-50 text-blue-600 border border-blue-200"
                      : "text-slate-600 hover:bg-slate-100"
                  )}
                >
                  Parsed Text
                </button>
              </div>

              <Button
                size="sm"
                variant="outline"
                leftIcon={<Download className="w-3.5 h-3.5" />}
                onClick={handleDownloadResume}
                className="text-xs"
              >
                Download
              </Button>
            </div>

            {resumePreviewTab === "document" ? (
              <div className="w-full h-96 rounded-xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center overflow-hidden">
                {uploadedResume.dataUrl && isPdf ? (
                  <iframe
                    src={uploadedResume.dataUrl}
                    className="w-full h-full"
                    title="Resume Document"
                  />
                ) : (
                  <div className="p-8 text-center flex flex-col items-center gap-3">
                    <FileText className="w-12 h-12 text-slate-400" />
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {uploadedResume.fileName}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Direct in-browser visual preview is active for PDF files. Click Download to open DOCX files locally.
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="primary"
                      leftIcon={<Download className="w-3.5 h-3.5" />}
                      onClick={handleDownloadResume}
                    >
                      Download File
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-96 rounded-xl bg-slate-900 text-slate-200 p-4 font-mono text-xs overflow-y-auto whitespace-pre-wrap leading-relaxed border border-slate-800">
                {uploadedResume.extractedText || "No parsed text available."}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* MODAL: RESUME DELETE CONFIRMATION */}
      {isResumeDeleteOpen && (
        <Modal
          isOpen={isResumeDeleteOpen}
          onClose={() => setIsResumeDeleteOpen(false)}
          title="Delete Active Resume?"
          description="Are you sure you want to delete your active resume file? This document will be detached from your 1-click applications."
          size="sm"
        >
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsResumeDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleConfirmDeleteResume}
            >
              Delete Resume
            </Button>
          </div>
        </Modal>
      )}

      {/* MODAL: PUBLIC PROFILE PREVIEW (Linear / Wellfound style) */}
      {isPublicPreviewOpen && (
        <Modal
          isOpen={isPublicPreviewOpen}
          onClose={() => setIsPublicPreviewOpen(false)}
          title="Public Profile Preview"
          description="This is how hiring managers and engineering leads see your candidate profile."
          size="lg"
        >
          <div className="flex flex-col gap-5 pt-2">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-2xl shrink-0 overflow-hidden">
                    {photoUrl ? (
                      <img src={photoUrl} alt={fullName} className="w-full h-full object-cover" />
                    ) : (
                      <span>{fullName.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-slate-900">{fullName}</h2>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Verified Candidate
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-600 mt-0.5">
                      {displayHeadline}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {displayLocation}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                  About
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {profile?.summary || "No professional summary provided."}
                </p>
              </div>

              {skills.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                    Key Competencies
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {skills.map((s) => (
                      <span
                        key={s.name}
                        className="text-[11px] font-medium px-2.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700"
                      >
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <span className="text-slate-500">
                Shareable link visible to verified employers only.
              </span>
              <div className="flex items-center gap-2">
                <Link href="/candidate/profile/review" target="_blank">
                  <Button size="sm" variant="outline" rightIcon={<ExternalLink className="w-3 h-3" />}>
                    Open Dedicated Review Page
                  </Button>
                </Link>
                <Button size="sm" variant="primary" onClick={() => setIsPublicPreviewOpen(false)}>
                  Done
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: HONEST COMPLETION BREAKDOWN */}
      {isBreakdownOpen && (
        <Modal
          isOpen={isBreakdownOpen}
          onClose={() => setIsBreakdownOpen(false)}
          title="Engineering Profile Completion"
          description="Your transparent scorecard across all core engineering dimensions."
          size="md"
        >
          <div className="flex flex-col gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-slate-500">Overall Score</span>
                <p className="text-2xl font-black text-slate-900">
                  {completenessDetails.score}%
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-medium text-slate-500">Status</span>
                <p className="text-xs font-bold text-blue-600 mt-1">
                  {completenessDetails.score === 100
                    ? "Verified Candidate"
                    : `${completenessDetails.missingChecks.length} Missing Sections`}
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100 flex flex-col">
              {completenessDetails.checks.map((check) => (
                <div
                  key={check.id}
                  className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    {check.complete ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                    )}
                    <div>
                      <p className={cn("font-semibold", check.complete ? "text-slate-800" : "text-slate-500")}>
                        {check.label}
                      </p>
                      <span className="text-[10px] text-slate-400">
                        Weight: {check.weight}%
                      </span>
                    </div>
                  </div>

                  {!check.complete && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsBreakdownOpen(false);
                        check.action();
                      }}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 font-semibold text-[11px] transition-colors cursor-pointer"
                    >
                      {check.actionLabel}
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <Button size="sm" variant="secondary" onClick={() => setIsBreakdownOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default CandidateProfilePage;
