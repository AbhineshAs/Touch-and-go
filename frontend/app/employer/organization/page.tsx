"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import {
  Camera,
  Building2,
  Globe,
  MapPin,
  Mail,
  Phone,
  ShieldCheck,
  ExternalLink,
  Save,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  LayoutDashboard,
  Check,
  X,
  ChevronDown,
} from "lucide-react";
import { OrganizationProfile } from "@/types/organization";
import {
  getOrganizationProfile,
  saveOrganizationProfile,
  updateOrganizationLogo,
  ORGANIZATION_INDUSTRIES,
} from "@/lib/organization/profileService";
import { updateOrganization } from "@/lib/api/employers";
import { LoadingState } from "@/components/ui/States";
import { useAuth } from "@/lib/auth/AuthContext";

export default function EmployerOrganizationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSetup = searchParams.get("setup") === "true";
  const { refreshAuth } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile State
  const [profile, setProfile] = useState<OrganizationProfile | null>(null);
  const [name, setName] = useState("");
  const [legalEntityName, setLegalEntityName] = useState("");
  const [tagline, setTagline] = useState("");
  const [about, setAbout] = useState("");
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [headquarters, setHeadquarters] = useState("");
  const [website, setWebsite] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  // UI Modals & Feedback
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [isSavedNotice, setIsSavedNotice] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    refreshAuth();
    async function load() {
      setIsLoading(true);
      const data = getOrganizationProfile("org_razorwave");
      setProfile(data);
      setName(data.name);
      setLegalEntityName(data.legalEntityName);
      setTagline(data.tagline);
      setAbout(data.about);
      setIndustry(data.industry);
      setCompanySize(data.companySize || "");
      setHeadquarters(data.headquarters);
      setWebsite(data.website);
      setContactEmail(data.contactEmail);
      setContactPhone(data.contactPhone);
      setLinkedinUrl(data.linkedinUrl || "");
      setTwitterUrl(data.twitterUrl || "");
      setLogoUrl(data.logoUrl);
      setIsLoading(false);
    }
    load();
  }, [refreshAuth]);

  // Close logo modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isLogoModalOpen) {
        setIsLogoModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLogoModalOpen]);

  const showSuccessFeedback = () => {
    setIsSavedNotice(true);
    setTimeout(() => {
      setIsSavedNotice(false);
    }, 3000);
  };

  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Company name is required";
    if (!legalEntityName.trim()) errs.legalEntityName = "Legal entity name is required";
    if (!headquarters.trim()) errs.headquarters = "Headquarters location is required";
    if (!contactEmail.trim()) {
      errs.contactEmail = "Official contact email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim())) {
      errs.contactEmail = "Please enter a valid email address";
    }
    if (website && !/^https?:\/\//i.test(website.trim())) {
      errs.website = "URL must start with http:// or https://";
    }
    if (linkedinUrl && !/^https?:\/\//i.test(linkedinUrl.trim())) {
      errs.linkedinUrl = "URL must start with http:// or https://";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!profile) return;
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const updatedProfile: OrganizationProfile = {
        ...profile,
        name: name.trim(),
        legalEntityName: legalEntityName.trim(),
        tagline: tagline.trim(),
        about: about.trim(),
        industry,
        companySize,
        headquarters: headquarters.trim(),
        website: website.trim(),
        contactEmail: contactEmail.trim(),
        contactPhone: contactPhone.trim(),
        linkedinUrl: linkedinUrl.trim() || undefined,
        twitterUrl: twitterUrl.trim() || undefined,
        logoUrl,
      };

      const saved = saveOrganizationProfile(updatedProfile);
      setProfile(saved);

      // Keep mock API in sync
      try {
        await updateOrganization(profile.id, {
          name: saved.name,
          tagline: saved.tagline,
          about: saved.about,
          industry: saved.industry,
          companySize: saved.companySize,
          headquarters: saved.headquarters,
          website: saved.website,
          logo: saved.logoUrl || "",
        });
      } catch (err) {
        console.warn("Syncing to mock API:", err);
      }

      showSuccessFeedback();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveAndContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    await handleSave();
    refreshAuth();
    router.push("/employer/dashboard");
  };

  // Logo Upload Handlers
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file (PNG, JPEG, WebP, or SVG)");
      return;
    }

    if (logoUrl && logoUrl.startsWith("blob:")) {
      URL.revokeObjectURL(logoUrl);
    }

    const previewUrl = URL.createObjectURL(file);
    setLogoUrl(previewUrl);
    setIsLogoModalOpen(false);

    // Save as Data URL for session persistence
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string" && profile) {
        updateOrganizationLogo(profile.id, reader.result);
        setLogoUrl(reader.result);
        showSuccessFeedback();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    if (logoUrl && logoUrl.startsWith("blob:")) {
      URL.revokeObjectURL(logoUrl);
    }
    setLogoUrl(null);
    if (profile) {
      updateOrganizationLogo(profile.id, null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setIsLogoModalOpen(false);
    showSuccessFeedback();
  };

  if (isLoading || !profile) {
    return <LoadingState message="Loading organization profile..." />;
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 pb-20">
      {/* Toast Notice */}
      {isSavedNotice && (
        <div className="fixed top-5 right-5 z-50 p-4 rounded-xl bg-slate-900 text-white shadow-2xl text-xs font-semibold flex items-center gap-2.5 animate-in slide-in-from-top-2 duration-200 border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-[#818CF8]" />
          <span>Organization profile updated successfully.</span>
        </div>
      )}

      {/* Onboarding Welcome Banner for new employers */}
      {isSetup && (
        <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#4F46E5] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="text-sm font-bold text-slate-900">
                Account Created • Step 2 of 2: Organization Profile
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Confirm your company branding and verified contact details below before accessing candidate pipelines.
              </p>
            </div>
          </div>

          <Link href="/employer/dashboard" className="shrink-0 self-end sm:self-center">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Skip to Dashboard
            </Button>
          </Link>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Organization Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage your company branding, legal identification, and official contact details displayed on TAG.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link href="/employer/dashboard" className="shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900 font-semibold"
              leftIcon={<LayoutDashboard className="w-3.5 h-3.5" />}
            >
              Dashboard
            </Button>
          </Link>
          <a
            href={`/companies/${profile.id === "org_razorwave" ? "whitetrack-technologies" : profile.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0"
          >
            <Button
              variant="secondary"
              size="sm"
              className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs font-semibold"
              leftIcon={<ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />}
            >
              Public View
            </Button>
          </a>
          <Button
            type="button"
            size="sm"
            variant="primary"
            onClick={() => handleSave()}
            isLoading={isSubmitting}
            className="shadow-xs shrink-0 font-semibold"
            leftIcon={<Save className="w-3.5 h-3.5" />}
          >
            Save Changes
          </Button>
        </div>
      </div>

      {/* Hero Header Card with Interactive Logo Trigger */}
      <Card className="p-6 sm:p-7 bg-white border border-slate-200/80 rounded-2xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-6">
        {/* Interactive Logo Avatar Box with Quick Action Badge */}
        <div className="relative shrink-0 group">
          <div
            role="button"
            tabIndex={0}
            onClick={() => setIsLogoModalOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setIsLogoModalOpen(true);
              }
            }}
            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100/60 border border-indigo-200/80 flex items-center justify-center shrink-0 shadow-xs overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-2 transition group-hover:border-[#4F46E5]/40"
            aria-label="Change company logo"
            title="Click to change company logo"
          >
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={name || "Company Logo"}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-[#4F46E5]">
                <Building2 className="w-8 h-8" />
              </div>
            )}

            {/* Hover Dark Overlay with Camera Icon */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
              <Camera className="w-5 h-5 drop-shadow-sm" />
              <span className="text-[10px] font-semibold mt-0.5 tracking-tight">Change</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsLogoModalOpen(true)}
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-[#4F46E5] hover:border-[#4F46E5]/40 flex items-center justify-center shadow-xs transition cursor-pointer"
            title="Change logo"
            aria-label="Change logo"
          >
            <Camera className="w-3 h-3" />
          </button>
        </div>

        {/* Hidden File Input for Logo Upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/webp, image/svg+xml"
          className="hidden"
          onChange={handleLogoUpload}
        />

        {/* Company Identity Summary */}
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight truncate">
              {name || "Your Company Name"}
            </h2>
            {profile.isVerified && (
              <span className="text-xs font-semibold text-[#4F46E5] bg-[#EEF2FF] px-2.5 py-0.5 rounded-full border border-[#4F46E5]/30 flex items-center gap-1.5 shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Entity</span>
              </span>
            )}
          </div>

          <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed line-clamp-1">
            {tagline || "Add an impactful tagline describing your mission & engineering domain."}
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>{legalEntityName || "Legal Entity Unregistered"}</span>
            </span>
            <span className="text-slate-300">•</span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4F46E5]" />
              <span>{industry || "Technology & Software"}</span>
            </span>
            {headquarters && (
              <>
                <span className="text-slate-300">•</span>
                <span className="inline-flex items-center gap-1.5 text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{headquarters}</span>
                </span>
              </>
            )}
          </div>
        </div>
      </Card>

      <form onSubmit={isSetup ? handleSaveAndContinue : handleSave} className="flex flex-col gap-6">
        {/* Section 1: Company Information Card */}
        <Card className="p-6 sm:p-7 bg-white border border-slate-200/80 rounded-2xl shadow-xs flex flex-col gap-5">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#4F46E5]" />
                <span>Company Information</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Branding details displayed across candidate job descriptions, recruiter headers, and search listings.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5">
            <Input
              label="Company Display Name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors({ ...errors, name: "" });
              }}
              error={errors.name}
              placeholder="e.g. RazorWave Technologies"
              leftIcon={<Building2 className="w-4 h-4" />}
              required
            />

            <Input
              label="Legal Registered Entity Name"
              value={legalEntityName}
              onChange={(e) => {
                setLegalEntityName(e.target.value);
                if (errors.legalEntityName) setErrors({ ...errors, legalEntityName: "" });
              }}
              error={errors.legalEntityName}
              placeholder="e.g. RazorWave Technologies Private Limited"
              helperText="Must match your Certificate of Incorporation or GST registration."
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5">
            <Input
              label="Company Tagline / Value Proposition"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g. Enterprise Cloud, Full-Stack Architecture & High-Performance Distributed Systems"
              helperText="A concise summary of your core domain and technology focus."
            />

            <div className="flex flex-col gap-1.5">
              <label htmlFor="industry-select" className="text-xs font-semibold text-slate-700 select-none">
                Industry Sector <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <select
                  id="industry-select"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full h-10 rounded-lg bg-white border border-slate-200 pl-3.5 pr-9 text-xs font-medium text-slate-900 transition-colors duration-150 focus:border-[#4F46E5] focus:outline-none focus:ring-1 focus:ring-[#4F46E5]/20 appearance-none cursor-pointer"
                >
                  {ORGANIZATION_INDUSTRIES.map((ind) => (
                    <option key={ind} value={ind}>
                      {ind}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 pointer-events-none text-slate-400 flex items-center justify-center">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          <Textarea
            label="About the Organization"
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            rows={4}
            placeholder="Describe your company culture, engineering philosophy, flagship products, and growth trajectory..."
            helperText="Provides candidates context on team dynamics, technology stacks, and business impact."
          />
        </Card>

        {/* Section 2: Contact Details & Web Presence Card */}
        <Card className="p-6 sm:p-7 bg-white border border-slate-200/80 rounded-2xl shadow-xs flex flex-col gap-5">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#4F46E5]" />
                <span>Contact Details & Web Presence</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Official physical headquarters, direct recruiter communications, and verified digital channels.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5">
            <Input
              label="Headquarters Location"
              value={headquarters}
              onChange={(e) => {
                setHeadquarters(e.target.value);
                if (errors.headquarters) setErrors({ ...errors, headquarters: "" });
              }}
              error={errors.headquarters}
              placeholder="e.g. Bengaluru, Karnataka, India"
              leftIcon={<MapPin className="w-4 h-4" />}
              required
            />

            <Input
              label="Official Website"
              value={website}
              onChange={(e) => {
                setWebsite(e.target.value);
                if (errors.website) setErrors({ ...errors, website: "" });
              }}
              error={errors.website}
              placeholder="https://www.company.com"
              leftIcon={<Globe className="w-4 h-4" />}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5">
            <Input
              label="Official Recruitment Email"
              type="email"
              value={contactEmail}
              onChange={(e) => {
                setContactEmail(e.target.value);
                if (errors.contactEmail) setErrors({ ...errors, contactEmail: "" });
              }}
              error={errors.contactEmail}
              placeholder="careers@company.com"
              leftIcon={<Mail className="w-4 h-4" />}
              helperText="Receives confidential candidate match and interview confirmations."
              required
            />

            <Input
              label="Contact Phone Number"
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="+91 80 4123 4567"
              leftIcon={<Phone className="w-4 h-4" />}
              helperText="Used strictly for high-priority hiring escalation & account security."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5">
            <Input
              label="Company LinkedIn Profile"
              value={linkedinUrl}
              onChange={(e) => {
                setLinkedinUrl(e.target.value);
                if (errors.linkedinUrl) setErrors({ ...errors, linkedinUrl: "" });
              }}
              error={errors.linkedinUrl}
              placeholder="https://www.linkedin.com/company/yourcompany"
              leftIcon={<ExternalLink className="w-4 h-4" />}
            />

            <Input
              label="Company Twitter / X Handle or URL"
              value={twitterUrl}
              onChange={(e) => setTwitterUrl(e.target.value)}
              placeholder="https://twitter.com/yourcompany"
              leftIcon={<Globe className="w-4 h-4" />}
            />
          </div>
        </Card>

        {/* Form Actions Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200/80">
          <Link href="/employer/dashboard">
            <Button variant="ghost" size="md" className="text-slate-500 hover:text-slate-800 font-medium">
              Cancel &amp; Discard
            </Button>
          </Link>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {isSetup ? (
              <Button
                type="submit"
                size="md"
                variant="primary"
                isLoading={isSubmitting}
                disabled={isSubmitting}
                className="font-semibold shadow-xs"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Save &amp; Continue to Dashboard
              </Button>
            ) : (
              <Button
                type="submit"
                size="md"
                variant="primary"
                isLoading={isSubmitting}
                disabled={isSubmitting}
                className="font-semibold shadow-xs"
                leftIcon={<Save className="w-4 h-4" />}
              >
                Save Changes
              </Button>
            )}
          </div>
        </div>
      </form>

      {/* "Change Company Logo" Interactive Modal Dialog */}
      {isLogoModalOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setIsLogoModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="change-logo-dialog-title"
        >
          <div
            className="max-w-sm w-full bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden text-center animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-100 flex flex-col items-center gap-1.5 relative">
              <button
                type="button"
                onClick={() => setIsLogoModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="w-11 h-11 rounded-full bg-indigo-50 text-[#4F46E5] flex items-center justify-center mb-0.5">
                <Camera className="w-5 h-5" />
              </div>
              <h3
                id="change-logo-dialog-title"
                className="text-slate-900 text-base font-bold"
              >
                Change Company Logo
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
                Upload a crisp square logo (PNG, JPEG, WebP, or SVG). Max size 5MB.
              </p>
            </div>

            <div className="flex flex-col divide-y divide-slate-100">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full text-[#4F46E5] hover:bg-indigo-50/60 font-semibold text-sm py-3.5 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4" />
                <span>Upload New Logo</span>
              </button>
              {logoUrl && (
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="w-full text-red-600 hover:bg-red-50/60 font-semibold text-sm py-3.5 transition cursor-pointer"
                >
                  Remove Current Logo
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsLogoModalOpen(false)}
                className="w-full text-slate-600 hover:bg-slate-50 font-medium text-sm py-3.5 transition cursor-pointer"
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
