"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { ShieldCheck, Building2, MapPin, Globe, CheckCircle2, ArrowRight, Sparkles, LayoutDashboard } from "lucide-react";
import { Organization } from "@/types";
import { getOrganization, updateOrganization } from "@/lib/api/employers";
import { LoadingState } from "@/components/ui/States";
import { useAuth } from "@/lib/auth/AuthContext";

export default function EmployerOrganizationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSetup = searchParams.get("setup") === "true";
  const { refreshAuth } = useAuth();

  const [org, setOrg] = useState<Organization | null>(null);
  const [tagline, setTagline] = useState("");
  const [about, setAbout] = useState("");
  const [headquarters, setHeadquarters] = useState("");
  const [website, setWebsite] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    refreshAuth();
    async function load() {
      setIsLoading(true);
      const data = await getOrganization("org_razorwave");
      if (data) {
        setOrg(data);
        setTagline(data.tagline);
        setAbout(data.about);
        setHeadquarters(data.headquarters);
        setWebsite(data.website);
      }
      setIsLoading(false);
    }
    load();
  }, [refreshAuth]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!org) return;
    setIsSubmitting(true);
    try {
      const updated = await updateOrganization(org.id, {
        tagline,
        about,
        headquarters,
        website,
      });
      setOrg(updated);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveAndContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!org) return;
    setIsSubmitting(true);
    try {
      const updated = await updateOrganization(org.id, {
        tagline,
        about,
        headquarters,
        website,
      });
      setOrg(updated);
      refreshAuth();
      router.push("/employer/dashboard");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !org) {
    return <LoadingState message="Loading organization profile..." />;
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 pb-16">
      {/* Onboarding Welcome Banner for new employers */}
      {isSetup && (
        <div className="p-4 sm:p-5 rounded-2xl bg-primary-soft/50 border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="text-sm font-bold text-text-primary">
                Account Created • Step 2 of 2: Organization Profile
              </h2>
              <p className="text-xs text-text-secondary leading-relaxed">
                Confirm your company details below. When you click <strong>Save & Continue to Dashboard</strong>, you will go straight to your Recruiter Dashboard.
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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Organization Profile
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary">
            Manage your company profile displayed to verified job seekers on TAG.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/employer/dashboard">
            <Button variant="outline" size="sm" leftIcon={<LayoutDashboard className="w-3.5 h-3.5" />}>
              Go to Dashboard
            </Button>
          </Link>
          <Link href={`/companies/${org.slug}`} target="_blank">
            <Button variant="secondary" size="sm">
              View Public Page
            </Button>
          </Link>
        </div>
      </div>

      {isSaved && (
        <div className="p-3.5 rounded-xl bg-success text-white text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Organization profile updated successfully.</span>
        </div>
      )}

      {/* Header card with verification banner */}
      <Card className="p-6 bg-surface border-border flex items-start gap-5">
        <img
          src={org.logo}
          alt={org.name}
          className="w-16 h-16 rounded-2xl object-cover border border-border shrink-0"
        />
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-text-primary">{org.name}</h2>
            <span className="text-xs font-semibold text-success bg-success-soft px-2.5 py-0.5 rounded-full border border-success/20 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified Entity
            </span>
          </div>
          <span className="text-xs text-text-muted mt-0.5">{org.industry} • {org.companySize}</span>
          <span className="text-xs text-text-secondary mt-1">{org.verification.registeredEntityName}</span>
        </div>
      </Card>

      <form onSubmit={handleSaveAndContinue} className="flex flex-col gap-6">
        <Card className="p-6 bg-surface border-border flex flex-col gap-4">
          <h3 className="text-base font-bold text-text-primary">Public Information</h3>

          <Input
            label="Company Tagline"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            required
          />

          <Textarea
            label="About the Organization"
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            rows={4}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Headquarters"
              value={headquarters}
              onChange={(e) => setHeadquarters(e.target.value)}
              required
            />
            <Input
              label="Official Website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              required
            />
          </div>
        </Card>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <Link href="/employer/dashboard">
            <Button variant="ghost" size="md">
              Cancel
            </Button>
          </Link>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Button
              type="button"
              size="md"
              variant="outline"
              onClick={handleSave}
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              Save Changes
            </Button>

            <Button
              type="submit"
              size="md"
              variant="primary"
              isLoading={isSubmitting}
              disabled={isSubmitting}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Save & Continue to Dashboard
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
