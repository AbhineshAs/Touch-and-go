"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { CheckCircle2, ShieldCheck, Eye, Lock } from "lucide-react";
import { getCandidateProfile, updateCandidateProfile } from "@/lib/api/candidate";
import { CandidateProfile } from "@/types";
import { LoadingState } from "@/components/ui/States";

export default function CandidateSettingsPage() {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [visibility, setVisibility] = useState<"public" | "verified_employers_only" | "private">("verified_employers_only");
  const [minSalary, setMinSalary] = useState("2200000");
  const [noticePeriod, setNoticePeriod] = useState("30");
  const [locations, setLocations] = useState("Bengaluru, Hyderabad, Remote");
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const p = await getCandidateProfile();
      setProfile(p);
      setVisibility(p.visibility);
      setMinSalary(p.preferences.minimumSalaryINR.toString());
      setNoticePeriod(p.preferences.noticePeriodDays.toString());
      setLocations(p.preferences.preferredLocations.join(", "));
      setIsLoading(false);
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    await updateCandidateProfile({
      visibility,
      preferences: {
        ...profile.preferences,
        minimumSalaryINR: parseInt(minSalary) || 2000000,
        noticePeriodDays: parseInt(noticePeriod) || 30,
        preferredLocations: locations.split(",").map((s) => s.trim()),
      },
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  if (isLoading || !profile) {
    return <LoadingState message="Loading settings..." />;
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <div className="flex flex-col gap-1 pb-4 border-b border-border">
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          Settings & Privacy
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary">
          Manage your marketplace visibility, compensation thresholds, and preferences.
        </p>
      </div>

      {isSaved && (
        <div className="p-3.5 rounded-xl bg-success text-white text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Preferences updated successfully.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        {/* Profile Visibility Controls */}
        <Card className="p-6 bg-surface border-border flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-text-primary">Profile Visibility</h2>
          </div>
          <p className="text-xs text-text-muted leading-relaxed">
            Control who can discover your structured profile and initiate contact.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: "verified_employers_only",
                label: "Verified Employers",
                desc: "Visible only to legally verified tech employers. (Recommended)",
              },
              {
                id: "public",
                label: "Public",
                desc: "Discoverable by all registered companies.",
              },
              {
                id: "private",
                label: "Private / Stealth",
                desc: "Only visible to jobs you explicitly apply to.",
              },
            ].map((opt) => (
              <label
                key={opt.id}
                className={`p-4 rounded-xl border flex flex-col gap-2 cursor-pointer transition-all ${
                  visibility === opt.id
                    ? "border-primary bg-primary-soft/20 text-primary"
                    : "border-border hover:border-border-strong bg-background"
                }`}
              >
                <input
                  type="radio"
                  name="visibility"
                  value={opt.id}
                  checked={visibility === opt.id}
                  onChange={() => setVisibility(opt.id as any)}
                  className="sr-only"
                />
                <span className="font-bold text-xs text-text-primary">{opt.label}</span>
                <span className="text-[11px] text-text-muted leading-snug">{opt.desc}</span>
              </label>
            ))}
          </div>
        </Card>

        {/* Compensation & Notice */}
        <Card className="p-6 bg-surface border-border flex flex-col gap-4">
          <h2 className="text-sm font-bold text-text-primary">Job Search Preferences</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Minimum Base Salary Expected (INR / year)"
              type="number"
              value={minSalary}
              onChange={(e) => setMinSalary(e.target.value)}
              helperText="e.g. 2400000 for ₹24 LPA"
              required
            />
            <Input
              label="Notice Period (Days)"
              type="number"
              value={noticePeriod}
              onChange={(e) => setNoticePeriod(e.target.value)}
              helperText="e.g. 30, 60, or 0 if immediate"
              required
            />
          </div>

          <Input
            label="Preferred Locations (Comma separated)"
            value={locations}
            onChange={(e) => setLocations(e.target.value)}
            helperText="e.g. Bengaluru, Hyderabad, Remote, Kochi"
            required
          />
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="md" variant="primary">
            Save Preferences
          </Button>
        </div>
      </form>
    </div>
  );
}
