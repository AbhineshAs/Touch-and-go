"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Globe,
  EyeOff,
  CheckCircle2,
  Circle,
  Building2,
  MapPin,
  IndianRupee,
  Clock,
  Briefcase,
  Sliders,
  RotateCcw,
  Check,
  Plus,
  X,
  Lock,
  Download,
  AlertCircle,
  Shield,
  Laptop,
} from "lucide-react";
import { getCandidateProfile, updateCandidateProfile } from "@/lib/api/candidate";
import { CandidateProfile, WorkMode } from "@/types";
import { LoadingState } from "@/components/ui/States";
import { cn } from "@/lib/utils";

// Preset configurations
const NOTICE_PERIOD_OPTIONS = [
  { days: 0, label: "Immediate (0d)" },
  { days: 15, label: "15 Days" },
  { days: 30, label: "30 Days" },
  { days: 60, label: "60 Days" },
  { days: 90, label: "90 Days" },
];

const POPULAR_LOCATIONS = [
  "Bengaluru",
  "Remote",
  "Kochi",
  "Thiruvananthapuram",
  "Hyderabad",
  "Pune",
  "Mumbai",
  "Delhi NCR",
];

const SALARY_PRESETS = [
  { val: 1200000, label: "₹12 LPA" },
  { val: 1800000, label: "₹18 LPA" },
  { val: 2400000, label: "₹24 LPA" },
  { val: 3000000, label: "₹30 LPA" },
  { val: 4000000, label: "₹40 LPA" },
];

const WORK_MODE_OPTIONS: { id: WorkMode; label: string }[] = [
  { id: "Remote", label: "Remote" },
  { id: "Hybrid", label: "Hybrid" },
  { id: "On-site", label: "On-site" },
];

const STORAGE_BLOCKED_COMPANIES_KEY = "tag_candidate_blocked_companies";
const STORAGE_HIDE_EMPLOYER_KEY = "tag_candidate_hide_current_employer";

export function SettingsPrivacyPage() {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form states
  const [visibility, setVisibility] = useState<"public" | "verified_employers_only" | "private">("verified_employers_only");
  const [minSalary, setMinSalary] = useState<number>(1800000);
  const [salaryFormatted, setSalaryFormatted] = useState<string>("18,00,000");
  const [noticePeriod, setNoticePeriod] = useState<number>(30);
  const [preferredLocations, setPreferredLocations] = useState<string[]>(["Bengaluru", "Remote"]);
  const [locationInput, setLocationInput] = useState<string>("");
  const [workModes, setWorkModes] = useState<WorkMode[]>(["Hybrid", "Remote"]);
  const [hideFromCurrentEmployer, setHideFromCurrentEmployer] = useState<boolean>(true);
  const [blockedCompanies, setBlockedCompanies] = useState<string[]>(["Current Employer Technologies"]);
  const [newCompanyInput, setNewCompanyInput] = useState<string>("");

  // Initial reference to detect unsaved changes or reset
  const [initialState, setInitialState] = useState<{
    visibility: "public" | "verified_employers_only" | "private";
    minSalary: number;
    noticePeriod: number;
    preferredLocations: string[];
    workModes: WorkMode[];
  } | null>(null);

  // Load candidate profile and settings
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const p = await getCandidateProfile();
        setProfile(p);
        setVisibility(p.visibility || "verified_employers_only");

        const salary = p.preferences?.minimumSalaryINR || 1800000;
        setMinSalary(salary);
        setSalaryFormatted(new Intl.NumberFormat("en-IN").format(salary));

        const notice = p.preferences?.noticePeriodDays ?? 30;
        setNoticePeriod(notice);

        const locs = p.preferences?.preferredLocations?.length
          ? p.preferences.preferredLocations
          : ["Bengaluru", "Remote"];
        setPreferredLocations(locs);

        const modes = (p.preferences?.desiredWorkModes as WorkMode[]) || ["Hybrid", "Remote"];
        setWorkModes(modes);

        // Load blocked companies from localStorage if present
        if (typeof window !== "undefined") {
          try {
            const storedBlocked = localStorage.getItem(STORAGE_BLOCKED_COMPANIES_KEY);
            if (storedBlocked) {
              setBlockedCompanies(JSON.parse(storedBlocked));
            }
            const storedHide = localStorage.getItem(STORAGE_HIDE_EMPLOYER_KEY);
            if (storedHide !== null) {
              setHideFromCurrentEmployer(storedHide === "true");
            }
          } catch {}
        }

        setInitialState({
          visibility: p.visibility || "verified_employers_only",
          minSalary: salary,
          noticePeriod: notice,
          preferredLocations: locs,
          workModes: modes,
        });
      } catch (err) {
        console.warn("Could not load candidate settings:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Salary input handlers
  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, "");
    const num = parseInt(rawVal, 10);
    if (isNaN(num)) {
      setMinSalary(0);
      setSalaryFormatted("");
    } else {
      setMinSalary(num);
      setSalaryFormatted(new Intl.NumberFormat("en-IN").format(num));
    }
  };

  const handleSalaryPreset = (val: number) => {
    setMinSalary(val);
    setSalaryFormatted(new Intl.NumberFormat("en-IN").format(val));
  };

  // Live LPA calculation badge
  const liveLPA = useMemo(() => {
    if (!minSalary || isNaN(minSalary)) return "₹0.0 LPA";
    const lpa = minSalary / 100000;
    return `₹${lpa % 1 === 0 ? lpa.toFixed(0) : lpa.toFixed(1)} LPA`;
  }, [minSalary]);

  // Preferred locations handlers
  const handleAddLocation = (locToAdd: string) => {
    const trimmed = locToAdd.trim();
    if (!trimmed) return;
    const exists = preferredLocations.some((l) => l.toLowerCase() === trimmed.toLowerCase());
    if (!exists) {
      setPreferredLocations([...preferredLocations, trimmed]);
    }
    setLocationInput("");
  };

  const handleRemoveLocation = (locToRemove: string) => {
    setPreferredLocations(preferredLocations.filter((l) => l !== locToRemove));
  };

  const handleLocationKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddLocation(locationInput);
    }
  };

  // Work modes handler
  const handleToggleWorkMode = (mode: WorkMode) => {
    if (workModes.includes(mode)) {
      if (workModes.length === 1) return; // Keep at least one
      setWorkModes(workModes.filter((m) => m !== mode));
    } else {
      setWorkModes([...workModes, mode]);
    }
  };

  // Blocked company handlers
  const handleAddBlockedCompany = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newCompanyInput.trim();
    if (!trimmed) return;
    const exists = blockedCompanies.some((c) => c.toLowerCase() === trimmed.toLowerCase());
    if (!exists) {
      const updated = [...blockedCompanies, trimmed];
      setBlockedCompanies(updated);
      try {
        localStorage.setItem(STORAGE_BLOCKED_COMPANIES_KEY, JSON.stringify(updated));
      } catch {}
      showToast(`Blocked ${trimmed} from discovering your profile.`);
    }
    setNewCompanyInput("");
  };

  const handleRemoveBlockedCompany = (comp: string) => {
    const updated = blockedCompanies.filter((c) => c !== comp);
    setBlockedCompanies(updated);
    try {
      localStorage.setItem(STORAGE_BLOCKED_COMPANIES_KEY, JSON.stringify(updated));
    } catch {}
    showToast(`Removed ${comp} from blocked list.`);
  };

  const handleToggleHideCurrentEmployer = (checked: boolean) => {
    setHideFromCurrentEmployer(checked);
    try {
      localStorage.setItem(STORAGE_HIDE_EMPLOYER_KEY, String(checked));
    } catch {}
    showToast(checked ? "Current employer visibility blocked." : "Employer block disabled.");
  };

  // Reset form handler
  const handleReset = () => {
    if (!initialState) return;
    setVisibility(initialState.visibility);
    setMinSalary(initialState.minSalary);
    setSalaryFormatted(new Intl.NumberFormat("en-IN").format(initialState.minSalary));
    setNoticePeriod(initialState.noticePeriod);
    setPreferredLocations(initialState.preferredLocations);
    setWorkModes(initialState.workModes);
    showToast("Preferences reset to last saved state.");
  };

  // Save form handler
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setIsSaving(true);

    try {
      await updateCandidateProfile({
        visibility,
        preferences: {
          ...profile.preferences,
          minimumSalaryINR: minSalary || 1800000,
          noticePeriodDays: noticePeriod,
          preferredLocations,
          desiredWorkModes: workModes,
        },
      });

      setInitialState({
        visibility,
        minSalary,
        noticePeriod,
        preferredLocations,
        workModes,
      });

      showToast("Settings and privacy preferences saved successfully.");
    } catch (err) {
      console.warn("Failed updating candidate settings:", err);
      showToast("Error saving preferences. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Export candidate profile data JSON
  const handleExportData = () => {
    if (!profile) return;
    const exportPayload = {
      profile,
      preferences: {
        visibility,
        minimumSalaryINR: minSalary,
        noticePeriodDays: noticePeriod,
        preferredLocations,
        desiredWorkModes: workModes,
        blockedCompanies,
      },
      exportedAt: new Date().toISOString(),
      platform: "Touch and Go (TAG) Verified Candidate Network",
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `candidate_profile_${profile.fullName.replace(/\s+/g, "_")}_settings.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("Candidate profile JSON exported.");
  };

  if (isLoading || !profile) {
    return <LoadingState message="Loading candidate settings..." />;
  }

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* 1. Page Header (Left-aligned with Candidate Workspace > Settings breadcrumb) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Settings &amp; Privacy
            </h1>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              Verified Profile
            </span>
          </div>
          <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">
            Control marketplace discovery, compensation minimums, notice periods, and employer confidentiality.
          </p>
        </div>

        {/* Header Action Button */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleExportData}
            className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            title="Download profile archive as structured JSON"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Data</span>
          </button>
        </div>
      </div>

      {/* Floating Notice Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-medium px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 2. Main Two-Pane 12-Column Grid */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Core Preferences (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Card A: Profile Visibility Selector */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <ShieldCheck className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Profile Visibility</h2>
                  <p className="text-xs text-slate-500">
                    Determine which companies can discover your criteria and invite you to interview.
                  </p>
                </div>
              </div>
            </div>

            {/* 3-Column Radio Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
              {[
                {
                  id: "verified_employers_only",
                  title: "Verified Employers",
                  recommended: true,
                  icon: <ShieldCheck className="w-4.5 h-4.5 text-blue-600" />,
                  desc: "Visible only to legally verified tech employers with active job postings.",
                  subnote: "Direct phone & email stay masked until you accept an invite.",
                },
                {
                  id: "public",
                  title: "Public Marketplace",
                  recommended: false,
                  icon: <Globe className="w-4.5 h-4.5 text-emerald-600" />,
                  desc: "Discoverable by all registered companies and verified hiring partners.",
                  subnote: "Maximum inbound opportunities and instant match routing.",
                },
                {
                  id: "private",
                  title: "Private / Stealth",
                  recommended: false,
                  icon: <EyeOff className="w-4.5 h-4.5 text-slate-500" />,
                  desc: "Stealth mode. Your profile is invisible to open searches.",
                  subnote: "Only companies you explicitly submit applications to can view your profile.",
                },
              ].map((opt) => {
                const isSelected = visibility === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setVisibility(opt.id as any)}
                    className={cn(
                      "p-4 rounded-xl border flex flex-col justify-between gap-3 cursor-pointer transition-all select-none relative",
                      isSelected
                        ? "border-blue-600 bg-blue-50/25 ring-2 ring-blue-500/10 shadow-xs"
                        : "border-slate-200/90 hover:border-slate-300 bg-white shadow-2xs hover:shadow-xs"
                    )}
                  >
                    <div className="flex flex-col gap-2">
                      {/* Top Row: Icon + Radio Indicator */}
                      <div className="flex items-center justify-between">
                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 shrink-0">
                          {opt.icon}
                        </div>
                        {isSelected ? (
                          <CheckCircle2 className="w-5 h-5 text-blue-600 fill-blue-50 shrink-0" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-300 shrink-0" />
                        )}
                      </div>

                      {/* Title + Recommended Badge */}
                      <div className="flex items-center gap-1.5 flex-wrap mt-1">
                        <span className="font-bold text-xs text-slate-900">{opt.title}</span>
                        {opt.recommended && (
                          <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
                            Recommended
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-[11px] text-slate-600 leading-relaxed font-normal">
                        {opt.desc}
                      </p>
                    </div>

                    <span className="text-[10px] text-slate-400 font-medium border-t border-slate-100 pt-2 leading-tight">
                      {opt.subnote}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card B: Compensation & Notice Period */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs flex flex-col gap-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <IndianRupee className="w-4.5 h-4.5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Compensation &amp; Availability</h2>
                <p className="text-xs text-slate-500">
                  Set your base financial threshold and realistic transition timeline.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
              {/* Field 1: Minimum Base Salary Expected */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-800 flex items-center justify-between">
                  <span>Minimum Annual Base Salary (INR)</span>
                  <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60">
                    = {liveLPA}
                  </span>
                </label>

                {/* Input with ₹ Addon */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-semibold text-sm">
                    ₹
                  </div>
                  <input
                    type="text"
                    value={salaryFormatted}
                    onChange={handleSalaryChange}
                    placeholder="e.g. 18,00,000"
                    className="h-10 w-full pl-8 pr-3.5 bg-slate-50/70 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 font-mono font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                    required
                  />
                </div>

                {/* Quick Preset Pills */}
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                  <span className="text-[11px] text-slate-400">Presets:</span>
                  {SALARY_PRESETS.map((preset) => (
                    <button
                      key={preset.val}
                      type="button"
                      onClick={() => handleSalaryPreset(preset.val)}
                      className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer",
                        minSalary === preset.val
                          ? "bg-blue-600 text-white font-semibold"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      )}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Roles offering below this threshold will not trigger direct interview invitations.
                </p>
              </div>

              {/* Field 2: Notice Period Segmented Pills */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-800 flex items-center justify-between">
                  <span>Notice Period &amp; Joining Timeline</span>
                  <span className="text-[11px] text-slate-500 font-normal">
                    {noticePeriod === 0 ? "Immediately available" : `${noticePeriod} calendar days`}
                  </span>
                </label>

                {/* Segmented Pill Selector */}
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                  {NOTICE_PERIOD_OPTIONS.map((opt) => {
                    const isSelected = noticePeriod === opt.days;
                    return (
                      <button
                        key={opt.days}
                        type="button"
                        onClick={() => setNoticePeriod(opt.days)}
                        className={cn(
                          "py-2 px-1 text-center rounded-lg text-xs transition-all cursor-pointer",
                          isSelected
                            ? "bg-blue-50 text-blue-700 border border-blue-200/80 font-bold shadow-2xs"
                            : "bg-slate-50/70 text-slate-600 border border-slate-200/80 hover:bg-slate-100 hover:text-slate-900 font-medium"
                        )}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>

                <p className="text-[11px] text-slate-400 leading-tight pt-1">
                  Candidates with ≤ 30 days notice receive up to 3.4x more interview invitations.
                </p>
              </div>
            </div>
          </div>

          {/* Card C: Location & Work Mode Preferences */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs flex flex-col gap-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <MapPin className="w-4.5 h-4.5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Location &amp; Work Arrangements</h2>
                <p className="text-xs text-slate-500">
                  Target job recommendations by tech hubs, remote compatibility, and office expectations.
                </p>
              </div>
            </div>

            {/* Location Tag Container */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-800">
                Target Cities &amp; Locations
              </label>

              {/* Tag Box */}
              <div className="min-h-11 p-2 rounded-xl border border-slate-200 bg-slate-50/60 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all flex flex-wrap items-center gap-1.5">
                {preferredLocations.map((loc) => (
                  <span
                    key={loc}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white text-slate-800 border border-slate-200/90 shadow-2xs"
                  >
                    <span>{loc}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveLocation(loc)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-0.5 rounded cursor-pointer"
                      title={`Remove ${loc}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                <input
                  type="text"
                  placeholder={
                    preferredLocations.length === 0
                      ? "Type location and press Enter..."
                      : "+ Add location..."
                  }
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  onKeyDown={handleLocationKeyDown}
                  className="bg-transparent border-none text-xs text-slate-900 placeholder-slate-400 outline-none flex-1 min-w-[130px] px-1 py-0.5"
                />
              </div>

              {/* Quick Add Popular Locations */}
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                <span className="text-[11px] text-slate-400">Popular Hubs:</span>
                {POPULAR_LOCATIONS.map((hub) => {
                  const isAdded = preferredLocations.some(
                    (l) => l.toLowerCase() === hub.toLowerCase()
                  );
                  return (
                    <button
                      key={hub}
                      type="button"
                      disabled={isAdded}
                      onClick={() => handleAddLocation(hub)}
                      className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-medium transition-colors flex items-center gap-1",
                        isAdded
                          ? "bg-slate-100 text-slate-400 cursor-default opacity-60"
                          : "bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer"
                      )}
                    >
                      <Plus className="w-2.5 h-2.5" />
                      <span>{hub}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Work Mode Multi-Select */}
            <div className="flex flex-col gap-2 pt-1 border-t border-slate-100">
              <label className="text-xs font-semibold text-slate-800">
                Work Mode Flexibility
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {WORK_MODE_OPTIONS.map((mode) => {
                  const isChecked = workModes.includes(mode.id);
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => handleToggleWorkMode(mode.id)}
                      className={cn(
                        "h-8 px-3.5 rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1.5 cursor-pointer",
                        isChecked
                          ? "bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs"
                          : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900 font-medium"
                      )}
                    >
                      {isChecked ? (
                        <Check className="w-3.5 h-3.5 text-blue-600" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-slate-300" />
                      )}
                      <span>{mode.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Card D: Integrated Action Footer */}
          <div className="rounded-2xl border border-slate-200/90 bg-white px-6 py-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="rounded-lg border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold px-3.5 py-2 inline-flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset Changes</span>
            </button>

            <div className="flex items-center gap-3">
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                Preferences sync across recruiter searches automatically
              </span>
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-5 py-2 shadow-2xs transition-colors inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>Save Preferences</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Confidentiality & Account Controls (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Card R1: Privacy & Current Employer Blocking */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-700" />
              <h3 className="text-sm font-bold text-slate-900">Employer Confidentiality</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed -mt-2">
              Prevent current managers or selected organizations from accessing your candidate profile.
            </p>

            {/* Toggle: Hide from current employer */}
            <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/70 flex items-center justify-between gap-3">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-800">
                  Hide from current company
                </span>
                <span className="text-[11px] text-slate-400">
                  Auto-blocks verified corporate accounts
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleToggleHideCurrentEmployer(!hideFromCurrentEmployer)}
                className={cn(
                  "w-9 h-5 rounded-full transition-colors relative cursor-pointer shrink-0",
                  hideFromCurrentEmployer ? "bg-blue-600" : "bg-slate-200"
                )}
              >
                <span
                  className={cn(
                    "w-3.5 h-3.5 bg-white rounded-full absolute top-0.75 transition-transform",
                    hideFromCurrentEmployer ? "right-1" : "left-1"
                  )}
                />
              </button>
            </div>

            {/* Custom Blocked Companies Input */}
            <div className="flex flex-col gap-2 pt-1 border-t border-slate-100">
              <span className="text-xs font-semibold text-slate-800">
                Blocked Company List
              </span>

              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder="Add company name..."
                  value={newCompanyInput}
                  onChange={(e) => setNewCompanyInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddBlockedCompany();
                    }
                  }}
                  className="h-8 flex-1 pl-3 pr-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddBlockedCompany}
                  className="h-8 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Block
                </button>
              </div>

              {/* Blocked Company Chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {blockedCompanies.length === 0 ? (
                  <span className="text-[11px] text-slate-400 italic">No companies currently blocked.</span>
                ) : (
                  blockedCompanies.map((comp) => (
                    <span
                      key={comp}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200"
                    >
                      <Building2 className="w-3 h-3 text-slate-400" />
                      <span>{comp}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveBlockedCompany(comp)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-0.5 ml-0.5"
                        title="Unblock"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Card R2: Marketplace Discovery Summary */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Marketplace Status
              </span>
              {visibility === "private" ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Stealth Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live on Network
                </span>
              )}
            </div>

            <div className="flex flex-col divide-y divide-slate-100 text-xs">
              <div className="py-2 flex items-center justify-between">
                <span className="text-slate-500">Visibility Mode</span>
                <span className="font-semibold text-slate-800 capitalize">
                  {visibility.replace(/_/g, " ")}
                </span>
              </div>
              <div className="py-2 flex items-center justify-between">
                <span className="text-slate-500">Base Threshold</span>
                <span className="font-mono font-semibold text-slate-800">{liveLPA}</span>
              </div>
              <div className="py-2 flex items-center justify-between">
                <span className="text-slate-500">Availability</span>
                <span className="font-semibold text-slate-800">
                  {noticePeriod === 0 ? "Immediate" : `${noticePeriod} Days Notice`}
                </span>
              </div>
              <div className="py-2 flex items-center justify-between">
                <span className="text-slate-500">Locations</span>
                <span className="font-semibold text-slate-800">
                  {preferredLocations.length} Selected
                </span>
              </div>
            </div>
          </div>

          {/* Card R3: Data & Security Controls */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Account Data &amp; Safety
            </span>
            <p className="text-xs text-slate-500 leading-relaxed -mt-1">
              Your profile data is strictly protected under TAG Zero-Spam Recruiter Verification standards.
            </p>

            <div className="flex flex-col gap-2 pt-1 text-xs">
              <button
                type="button"
                onClick={handleExportData}
                className="w-full py-2 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export Profile JSON Archive</span>
              </button>

              <Link
                href="/candidate/profile"
                className="text-center text-xs text-blue-600 hover:text-blue-700 font-semibold py-1 transition-colors"
              >
                Edit Public Bio &amp; Tech Stack →
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
