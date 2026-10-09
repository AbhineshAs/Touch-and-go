"use client";

import React, { useState, useRef, useEffect } from "react";
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
  Upload,
  Eye,
  CheckCircle2,
  FileText,
  Briefcase,
  Layers,
  FolderGit2,
  ArrowLeft,
  Calendar,
  Camera,
  Award,
  ExternalLink,
  Wrench,
  Check,
} from "lucide-react";
import { useCandidate } from "@/lib/candidate/context/CandidateContext";
import { formatSalaryRange } from "@/lib/utils";
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

export default function CandidateProfilePage() {
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
  } = useCandidate();

  const [isSavedNotice, setIsSavedNotice] = useState(false);

  // Profile Photo State & Management Modal
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync photoUrl with localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedPhoto = localStorage.getItem("tag_candidate_avatar");
      if (savedPhoto) {
        setPhotoUrl(savedPhoto);
      }
    }
  }, []);

  // Close photo modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isModalOpen) {
        setIsModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

  // Clean up object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (photoUrl && photoUrl.startsWith("blob:")) {
        URL.revokeObjectURL(photoUrl);
      }
    };
  }, [photoUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file (PNG, JPEG, or WebP).");
      return;
    }

    if (photoUrl && photoUrl.startsWith("blob:")) {
      URL.revokeObjectURL(photoUrl);
    }

    const previewUrl = URL.createObjectURL(file);
    setPhotoUrl(previewUrl);
    setIsModalOpen(false);

    // Save as Data URL in localStorage for session persistence & sidebar sync
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        try {
          localStorage.setItem("tag_candidate_avatar", reader.result);
          window.dispatchEvent(new Event("storage"));
        } catch (err) {
          console.warn("Could not save avatar to localStorage:", err);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    if (photoUrl && photoUrl.startsWith("blob:")) {
      URL.revokeObjectURL(photoUrl);
    }
    setPhotoUrl(null);
    try {
      localStorage.removeItem("tag_candidate_avatar");
      window.dispatchEvent(new Event("storage"));
    } catch (err) {
      console.warn("Could not remove avatar from localStorage:", err);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setIsModalOpen(false);
  };

  // Edit Personal Info Modal
  const [isPersonalModalOpen, setIsPersonalModalOpen] = useState(false);
  const [headline, setHeadline] = useState("");
  const [summary, setSummary] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");

  // Work Experience CRUD Modal State
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

  // Education CRUD Modal State
  const [isEduModalOpen, setIsEduModalOpen] = useState(false);
  const [editingEduId, setEditingEduId] = useState<string | null>(null);
  const [eduSchool, setEduSchool] = useState("");
  const [eduDegree, setEduDegree] = useState("");
  const [eduField, setEduField] = useState("");
  const [eduStartDate, setEduStartDate] = useState("");
  const [eduEndDate, setEduEndDate] = useState("");
  const [eduGrade, setEduGrade] = useState("");
  const [eduDescription, setEduDescription] = useState("");

  // Certifications CRUD Modal State
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [editingCertId, setEditingCertId] = useState<string | null>(null);
  const [certName, setCertName] = useState("");
  const [certOrganization, setCertOrganization] = useState("");
  const [certIssueDate, setCertIssueDate] = useState("");
  const [certExpirationDate, setCertExpirationDate] = useState("");
  const [certCredentialId, setCertCredentialId] = useState("");
  const [certCredentialUrl, setCertCredentialUrl] = useState("");

  // Skills CRUD Modal State
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [editingSkillKey, setEditingSkillKey] = useState<string | null>(null);
  const [skillName, setSkillName] = useState("");
  const [skillProficiency, setSkillProficiency] = useState<Skill["proficiency"]>("Comfortable");

  // Add Project Modal State
  const [isProjModalOpen, setIsProjModalOpen] = useState(false);
  const [projTitle, setProjTitle] = useState("");
  const [projDescription, setProjDescription] = useState("");
  const [projTech, setProjTech] = useState("");
  const [projUrl, setProjUrl] = useState("");

  // Edit Preferences Modal
  const [isPrefsModalOpen, setIsPrefsModalOpen] = useState(false);
  const [prefWorkMode, setPrefWorkMode] = useState<"remote" | "hybrid" | "onsite" | "any">("any");
  const [prefJobType, setPrefJobType] = useState<"full_time" | "internship" | "contract" | "any">("any");
  const [prefAvailability, setPrefAvailability] = useState<"immediate" | "1_month" | "3_months" | "exploring" | "unsure">("immediate");
  const [prefSalaryINR, setPrefSalaryINR] = useState("");

  const showNotice = () => {
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2500);
  };

  if (!candidateRecord) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
        <h2 className="text-xl font-bold text-text-primary">No Active Candidate Record</h2>
        <p className="text-xs text-text-muted">Complete onboarding to create your structured profile.</p>
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

  // Personal Info
  const handleOpenPersonalModal = () => {
    setHeadline(profile?.headline || "");
    setSummary(profile?.summary || "");
    setLocation(profile?.location || "India");
    setPhone(profile?.phone || identity?.phone || "");
    setIsPersonalModalOpen(true);
  };

  const handleSavePersonal = (e: React.FormEvent) => {
    e.preventDefault();
    updateCandidateProfile({
      headline,
      summary,
      location,
      phone,
    });
    setIsPersonalModalOpen(false);
    showNotice();
  };

  // Work Experience Handlers
  const handleOpenAddExperience = () => {
    setEditingExpId(null);
    setExpTitle("");
    setExpCompany("");
    setExpEmploymentType("Full-time");
    setExpLocation("");
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
    showNotice();
  };

  // Education Handlers
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
    showNotice();
  };

  // Certifications Handlers
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
    showNotice();
  };

  // Skills Handlers
  const handleOpenAddSkill = () => {
    setEditingSkillKey(null);
    setSkillName("");
    setSkillProficiency("Comfortable");
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
    showNotice();
  };

  const handleDeleteSkill = (name: string) => {
    deleteSkill(name);
    showNotice();
  };

  // Project Handlers
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
    showNotice();
  };

  // Preferences Handlers
  const handleOpenPrefsModal = () => {
    setPrefWorkMode(profile?.jobPreferences?.desiredWorkModes?.[0] || "any");
    setPrefJobType(profile?.jobPreferences?.employmentTypes?.[0] || "any");
    setPrefAvailability(profile?.jobPreferences?.availability || "immediate");
    setPrefSalaryINR(
      profile?.jobPreferences?.minimumSalaryINR ? String(profile.jobPreferences.minimumSalaryINR) : ""
    );
    setIsPrefsModalOpen(true);
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    updatePreferences({
      desiredWorkModes: [prefWorkMode],
      employmentTypes: [prefJobType],
      availability: prefAvailability,
      minimumSalaryINR: prefSalaryINR ? parseInt(prefSalaryINR, 10) : undefined,
    });
    setIsPrefsModalOpen(false);
    showNotice();
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 pb-16">
      {/* Notice Banner */}
      {isSavedNotice && (
        <div className="fixed top-4 right-4 z-50 p-3.5 rounded-xl bg-success text-white shadow-xl text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>Profile changes saved successfully. (Revision {candidateRecord.profileRevision})</span>
        </div>
      )}

      {/* Header & Personal Info Card */}
      <Card className="p-6 sm:p-8 bg-white border border-slate-200/80 rounded-2xl shadow-sm flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="flex items-start gap-5">
            {/* Squircle Avatar Element with Hover State & Click Handler */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setIsModalOpen(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setIsModalOpen(true);
                }
              }}
              className="relative group w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white flex items-center justify-center font-black text-2xl shrink-0 shadow-sm overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition"
              aria-label="Change profile photo"
              title="Change profile photo"
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

              {/* Hover Dark Overlay with Camera Icon */}
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity flex items-center justify-center text-white">
                <Camera className="w-6 h-6 drop-shadow-sm" />
              </div>
            </div>

            {/* Hidden File Input for Avatar Upload */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  {fullName}
                </h1>
                <span className="text-[11px] font-semibold text-primary bg-primary-soft px-2.5 py-0.5 rounded-full border border-primary/20">
                  {completeness.score}% Complete
                </span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-slate-600">
                {profile?.headline || "Technology Candidate"}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {profile?.location || "India"}
                </span>
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {identity?.email || "candidate@tagjobs.in"}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {profile?.phone || identity?.phone || "+91 98765 43210"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Edit2 className="w-3.5 h-3.5" />}
              onClick={handleOpenPersonalModal}
            >
              Edit Details
            </Button>
            <Link href="/candidate/resume">
              <Button size="sm" variant="primary" leftIcon={<FileText className="w-3.5 h-3.5" />}>
                Resume
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Professional Summary */}
      <Card className="p-6 sm:p-7 bg-white border border-slate-200/80 rounded-2xl shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Professional Summary</h2>
          <button
            onClick={handleOpenPersonalModal}
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Edit2 className="w-3 h-3" />
            <span>Edit</span>
          </button>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
          {profile?.summary || "No professional summary added yet."}
        </p>
      </Card>

      {/* 1. Work Experience Section */}
      <Card className="p-6 sm:p-7 bg-white border border-slate-200/80 rounded-2xl shadow-sm flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Work Experience ({profile?.experience?.length || 0})
            </h2>
          </div>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={handleOpenAddExperience}
          >
            Add Experience
          </Button>
        </div>

        {!profile?.experience || profile.experience.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
              <Briefcase className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-800">No work experience added yet</p>
            <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
              Add prior roles, internships, or freelance projects to showcase your commercial experience.
            </p>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={handleOpenAddExperience}
            >
              Add Experience
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 flex flex-col">
            {profile.experience.map((exp) => (
              <div
                key={exp.id}
                className="py-5 first:pt-0 last:pb-0 flex items-start justify-between gap-4 group"
              >
                <div className="flex items-start gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200/80 text-slate-800 flex items-center justify-center font-bold text-base shrink-0 shadow-2xs">
                    {exp.company ? exp.company.charAt(0).toUpperCase() : <Briefcase className="w-5 h-5 text-indigo-600" />}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {exp.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-0.5">
                      <span className="text-sm font-semibold text-slate-700">
                        {exp.company}
                      </span>
                      {exp.employmentType && (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60">
                          {exp.employmentType}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {exp.startDate} – {exp.current || exp.isCurrent ? "Present" : exp.endDate || "Present"}
                      </span>
                      {exp.location && (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {exp.location}
                          {exp.locationType && (
                            <span className="text-slate-400 font-normal">({exp.locationType})</span>
                          )}
                        </span>
                      )}
                    </div>
                    {exp.description && (
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-2.5 whitespace-pre-line">
                        {exp.description}
                      </p>
                    )}
                    {(exp.skills && exp.skills.length > 0 ? exp.skills : exp.skillsUsed) && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {(exp.skills && exp.skills.length > 0 ? exp.skills : exp.skillsUsed).map((sk) => (
                          <span
                            key={sk}
                            className="text-[11px] font-medium px-2.5 py-0.5 rounded-md bg-slate-50 text-slate-700 border border-slate-200/80"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => handleOpenEditExperience(exp)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    title="Edit Experience"
                    aria-label="Edit Experience"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteExperience(exp.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete Experience"
                    aria-label="Delete Experience"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 2. Education Section */}
      <Card className="p-6 sm:p-7 bg-white border border-slate-200/80 rounded-2xl shadow-sm flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Education ({profile?.education?.length || 0})
            </h2>
          </div>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={handleOpenAddEducation}
          >
            Add Education
          </Button>
        </div>

        {!profile?.education || profile.education.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
              <GraduationCap className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-800">No education entries added yet</p>
            <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
              Add your university degrees, diplomas, or academic coursework to demonstrate foundation.
            </p>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={handleOpenAddEducation}
            >
              Add Education
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 flex flex-col">
            {profile.education.map((edu) => (
              <div
                key={edu.id}
                className="py-5 first:pt-0 last:pb-0 flex items-start justify-between gap-4 group"
              >
                <div className="flex items-start gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-base shrink-0 shadow-2xs">
                    <GraduationCap className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {edu.school || edu.institution}
                    </h3>
                    <p className="text-sm font-semibold text-slate-700 mt-0.5">
                      {edu.degree} {edu.fieldOfStudy ? `• ${edu.fieldOfStudy}` : ""}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {edu.startDate || edu.startYear} – {edu.endDate || edu.endYear}
                      </span>
                      {edu.grade && (
                        <span className="font-semibold text-indigo-600">
                          Grade: {edu.grade}
                        </span>
                      )}
                    </div>
                    {edu.description && (
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-2 whitespace-pre-line">
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
                    aria-label="Edit Education"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteEducation(edu.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete Education"
                    aria-label="Delete Education"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 3. Certifications & Licenses Section */}
      <Card className="p-6 sm:p-7 bg-white border border-slate-200/80 rounded-2xl shadow-sm flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Certifications &amp; Licenses ({profile?.certifications?.length || 0})
            </h2>
          </div>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={handleOpenAddCertification}
          >
            Add Certification
          </Button>
        </div>

        {!profile?.certifications || profile.certifications.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
              <Award className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-800">No certifications added yet</p>
            <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
              Add recognized vendor credentials (e.g., AWS, Meta, Google, Microsoft) to enhance your credibility.
            </p>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={handleOpenAddCertification}
            >
              Add Certification
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 flex flex-col">
            {profile.certifications.map((cert) => (
              <div
                key={cert.id}
                className="py-5 first:pt-0 last:pb-0 flex items-start justify-between gap-4 group"
              >
                <div className="flex items-start gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200/70 text-amber-800 flex items-center justify-center font-bold text-base shrink-0 shadow-2xs">
                    <Award className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                      {cert.name}
                    </h3>
                    <p className="text-sm font-semibold text-slate-700 mt-0.5">
                      {cert.issuingOrganization || cert.issuer}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Issued {cert.issueDate}
                        {(cert.expirationDate || cert.expiryDate) && (
                          <span>• Expires {cert.expirationDate || cert.expiryDate}</span>
                        )}
                      </span>
                      {cert.credentialId && (
                        <span className="font-mono text-slate-500">
                          Credential ID: {cert.credentialId}
                        </span>
                      )}
                    </div>
                    {cert.credentialUrl && (
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline mt-2.5 w-fit"
                      >
                        <span>Show credential</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => handleOpenEditCertification(cert)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    title="Edit Certification"
                    aria-label="Edit Certification"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteCertification(cert.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete Certification"
                    aria-label="Delete Certification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 4. Technical & Domain Skills Section */}
      <Card className="p-6 sm:p-7 bg-white border border-slate-200/80 rounded-2xl shadow-sm flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Technical &amp; Domain Skills ({profile?.skills?.length || 0})
            </h2>
          </div>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={handleOpenAddSkill}
          >
            Add Skill
          </Button>
        </div>

        {!profile?.skills || profile.skills.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <Wrench className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-800">No skills added yet</p>
            <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
              Add your programming languages, frameworks, developer tools, and domain proficiencies.
            </p>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={handleOpenAddSkill}
            >
              Add Skill
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {profile.skills.map((skill) => {
              const prof: Skill["proficiency"] =
                skill.proficiency ||
                (skill.level === "expert"
                  ? "Expert"
                  : skill.level === "confident"
                  ? "Advanced"
                  : skill.level === "comfortable"
                  ? "Comfortable"
                  : "Beginner");

              const profBadgeColor =
                prof === "Expert"
                  ? "bg-purple-50 text-purple-700 border-purple-200"
                  : prof === "Advanced"
                  ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                  : prof === "Comfortable"
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : "bg-slate-100 text-slate-700 border-slate-200";

              return (
                <div
                  key={skill.name}
                  className="p-3.5 rounded-xl bg-white border border-slate-200/90 hover:border-indigo-300 shadow-2xs flex items-center justify-between gap-3 group transition-all"
                >
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs sm:text-sm font-semibold text-slate-800 truncate">
                      {skill.name}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border w-fit mt-1 ${profBadgeColor}`}
                    >
                      {prof}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => handleOpenEditSkill(skill)}
                      className="p-1 text-slate-400 hover:text-indigo-600 rounded-md hover:bg-slate-100 transition cursor-pointer"
                      title={`Edit ${skill.name}`}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSkill(skill.name)}
                      className="p-1 text-slate-400 hover:text-red-500 rounded-md hover:bg-red-50 transition cursor-pointer"
                      title={`Delete ${skill.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Projects Section */}
      <Card className="p-6 sm:p-7 bg-white border border-slate-200/80 rounded-2xl shadow-sm flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-[#4F46E5] flex items-center justify-center">
              <FolderGit2 className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Projects ({profile?.projects?.length || 0})
            </h2>
          </div>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsProjModalOpen(true)}
          >
            Add Project
          </Button>
        </div>

        {profile?.projects && profile.projects.length > 0 ? (
          <div className="divide-y divide-slate-100 flex flex-col">
            {profile.projects.map((proj) => (
              <div key={proj.id} className="py-5 first:pt-0 last:pb-0 flex items-start justify-between gap-4 group">
                <div className="flex items-start gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-[#4F46E5] flex items-center justify-center font-bold text-base shrink-0 shadow-2xs">
                    <FolderGit2 className="w-5 h-5 text-[#4F46E5]" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <h3 className="text-base font-bold text-slate-900">{proj.title}</h3>
                    {proj.url && (
                      <a
                        href={proj.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline mt-1"
                      >
                        <span>{proj.url}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-2 whitespace-pre-line">
                      {proj.description}
                    </p>
                    {proj.technologies && proj.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {proj.technologies.map((t) => (
                          <span
                            key={t}
                            className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-50 text-slate-700 border border-slate-200/80"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    deleteProject(proj.id);
                    showNotice();
                  }}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                  title="Delete project"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center mb-3">
              <FolderGit2 className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-800">No projects added yet</p>
            <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
              Adding a portfolio project provides tangible, verifiable proof of your practical engineering skills.
            </p>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setIsProjModalOpen(true)}
            >
              Add Project
            </Button>
          </div>
        )}
      </Card>

      {/* Job Preferences Card */}
      <Card className="p-6 sm:p-7 bg-white border border-slate-200/80 rounded-2xl shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Job Preferences</h2>
          <Button size="sm" variant="outline" onClick={handleOpenPrefsModal}>
            Edit Preferences
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex flex-col gap-1">
            <span className="text-slate-500">Work Mode</span>
            <span className="font-semibold text-slate-900 capitalize">
              {profile?.jobPreferences?.desiredWorkModes?.join(", ") || "Any"}
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex flex-col gap-1">
            <span className="text-slate-500">Job Type</span>
            <span className="font-semibold text-slate-900 capitalize">
              {profile?.jobPreferences?.employmentTypes?.join(", ") || "Any"}
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex flex-col gap-1">
            <span className="text-slate-500">Availability</span>
            <span className="font-semibold text-slate-900 capitalize">
              {profile?.jobPreferences?.availability?.replace(/_/g, " ") || "Immediate"}
            </span>
          </div>
        </div>
      </Card>

      {/* MODAL: EDIT PERSONAL INFO */}
      <Modal
        isOpen={isPersonalModalOpen}
        onClose={() => setIsPersonalModalOpen(false)}
        title="Edit Personal Information"
        description="Update your contact, location, and professional headline."
        size="md"
      >
        <form onSubmit={handleSavePersonal} className="flex flex-col gap-4">
          <Input
            label="Professional Headline"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            required
          />
          <Textarea
            label="Professional Summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={4}
            required
          />
          <Input
            label="Current Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
          <Input
            label="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsPersonalModalOpen(false)}>
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
        description="Highlight your role, company, timeline, and core competencies."
        size="lg"
      >
        <form onSubmit={handleSaveExperience} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Job Title *"
              placeholder="e.g. Senior Frontend Engineer"
              value={expTitle}
              onChange={(e) => setExpTitle(e.target.value)}
              required
            />
            <Input
              label="Company Name *"
              placeholder="e.g. Google"
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
                className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Internship">Internship</option>
                <option value="Contract">Contract</option>
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
                className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="On-site">On-site</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Remote">Remote</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="expCurrentRole"
              checked={expCurrent}
              onChange={(e) => setExpCurrent(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
            />
            <label htmlFor="expCurrentRole" className="text-xs font-medium text-slate-800 cursor-pointer">
              I am currently working in this role
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Start Date *"
              placeholder="e.g. Jun 2024"
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
            label="Description"
            placeholder="Describe your core accomplishments, team size, products launched, or systems built."
            value={expDescription}
            onChange={(e) => setExpDescription(e.target.value)}
            rows={3}
          />

          <Input
            label="Skills Used (comma-separated)"
            placeholder="e.g. React, Next.js, TypeScript, Tailwind CSS"
            value={expSkills}
            onChange={(e) => setExpSkills(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsExpModalOpen(false)}>
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
        description="Detail your university, degree, coursework, and grades."
        size="lg"
      >
        <form onSubmit={handleSaveEducation} className="flex flex-col gap-4">
          <Input
            label="School / University *"
            placeholder="e.g. National Institute of Technology"
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
              placeholder="e.g. Sep 2022 or 2022"
              value={eduStartDate}
              onChange={(e) => setEduStartDate(e.target.value)}
              required
            />
            <Input
              label="End Date / Year *"
              placeholder="e.g. May 2026 or 2026"
              value={eduEndDate}
              onChange={(e) => setEduEndDate(e.target.value)}
              required
            />
          </div>

          <Input
            label="Grade / CGPA (Optional)"
            placeholder="e.g. 8.9 CGPA or 3.8 / 4.0"
            value={eduGrade}
            onChange={(e) => setEduGrade(e.target.value)}
          />

          <Textarea
            label="Activities & Description (Optional)"
            placeholder="Notable coursework, student leadership, societies, or awards."
            value={eduDescription}
            onChange={(e) => setEduDescription(e.target.value)}
            rows={2}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsEduModalOpen(false)}>
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
        description="Add recognized professional licenses, certifications, and credentials."
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
              placeholder="e.g. Mar 2026"
              value={certIssueDate}
              onChange={(e) => setCertIssueDate(e.target.value)}
              required
            />
            <Input
              label="Expiration Date (Optional)"
              placeholder="e.g. Mar 2029"
              value={certExpirationDate}
              onChange={(e) => setCertExpirationDate(e.target.value)}
            />
          </div>

          <Input
            label="Credential ID (Optional)"
            placeholder="e.g. AWS-SAA-84920"
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
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsCertModalOpen(false)}>
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
        title={editingSkillKey ? "Edit Skill" : "Add Skill"}
        description="Declare your competency level across key technical and domain capabilities."
        size="md"
      >
        <form onSubmit={handleSaveSkill} className="flex flex-col gap-4">
          <Input
            label="Skill Name *"
            placeholder="e.g. TypeScript, React, Docker"
            value={skillName}
            onChange={(e) => setSkillName(e.target.value)}
            required
          />

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-800">Proficiency Level *</label>
            <select
              value={skillProficiency}
              onChange={(e) => setSkillProficiency(e.target.value as any)}
              className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Beginner">Beginner (Foundational understanding)</option>
              <option value="Comfortable">Comfortable (Can build independently)</option>
              <option value="Advanced">Advanced (Production experience)</option>
              <option value="Expert">Expert (Subject matter authority)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsSkillModalOpen(false)}>
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
        title="Add Project"
        size="md"
      >
        <form onSubmit={handleAddProject} className="flex flex-col gap-4">
          <Input
            label="Project Title *"
            placeholder="e.g. Real-Time Chat Platform"
            value={projTitle}
            onChange={(e) => setProjTitle(e.target.value)}
            required
          />
          <Textarea
            label="Project Description *"
            placeholder="Explain the purpose of the project, your contribution, and architecture."
            value={projDescription}
            onChange={(e) => setProjDescription(e.target.value)}
            rows={3}
            required
          />
          <Input
            label="Technologies (comma separated)"
            placeholder="e.g. React, WebSockets, Tailwind CSS"
            value={projTech}
            onChange={(e) => setProjTech(e.target.value)}
          />
          <Input
            label="Project URL / GitHub Link (Optional)"
            placeholder="https://github.com/username/project"
            value={projUrl}
            onChange={(e) => setProjUrl(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsProjModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Add Project
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: EDIT PREFERENCES */}
      <Modal
        isOpen={isPrefsModalOpen}
        onClose={() => setIsPrefsModalOpen(false)}
        title="Edit Job Preferences"
        size="md"
      >
        <form onSubmit={handleSavePreferences} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-text-primary">Work Mode</label>
            <select
              value={prefWorkMode}
              onChange={(e) => setPrefWorkMode(e.target.value as any)}
              className="h-10 px-3 rounded-xl border border-border bg-surface text-xs text-text-primary"
            >
              <option value="any">Any work mode</option>
              <option value="remote">Remote only</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">On-site</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-text-primary">Employment Type</label>
            <select
              value={prefJobType}
              onChange={(e) => setPrefJobType(e.target.value as any)}
              className="h-10 px-3 rounded-xl border border-border bg-surface text-xs text-text-primary"
            >
              <option value="any">Any job type</option>
              <option value="full_time">Full-time</option>
              <option value="internship">Internship</option>
              <option value="contract">Contract</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-text-primary">Availability Timeline</label>
            <select
              value={prefAvailability}
              onChange={(e) => setPrefAvailability(e.target.value as any)}
              className="h-10 px-3 rounded-xl border border-border bg-surface text-xs text-text-primary"
            >
              <option value="immediate">Immediate</option>
              <option value="1_month">Within 1 Month</option>
              <option value="3_months">Within 3 Months</option>
              <option value="exploring">Exploring / Casually Open</option>
            </select>
          </div>

          <Input
            label="Minimum Target Salary (INR / year) - Optional"
            placeholder="e.g. 1200000"
            type="number"
            value={prefSalaryINR}
            onChange={(e) => setPrefSalaryINR(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsPrefsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Preferences
            </Button>
          </div>
        </form>
      </Modal>

      {/* "Change Profile Photo" Modal Dialog */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setIsModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="change-photo-dialog-title"
        >
          <div
            className="max-w-sm w-full bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden text-center animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              id="change-photo-dialog-title"
              className="text-slate-800 text-base font-semibold py-4 border-b border-slate-100"
            >
              Change Profile Photo
            </h3>
            <div className="flex flex-col divide-y divide-slate-100">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full text-blue-600 font-semibold text-sm py-3.5 hover:bg-blue-50/50 transition cursor-pointer"
              >
                Upload Photo
              </button>
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="w-full text-red-500 font-semibold text-sm py-3.5 hover:bg-red-50/50 transition cursor-pointer"
              >
                Remove Current Photo
              </button>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-full text-slate-700 font-medium text-sm py-3.5 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
