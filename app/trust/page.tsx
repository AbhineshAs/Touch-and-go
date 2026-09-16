import React from "react";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { ShieldCheck, Lock, Eye, FileCheck, AlertCircle, Sparkles } from "lucide-react";

export default function TrustPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-text-primary">
      <PublicNavbar />

      <section className="py-16 lg:py-20 bg-surface border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center flex flex-col items-center gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success-soft text-success font-semibold text-xs border border-success/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Trust, Safety & Governance</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
            Our Responsible Marketplace Charter
          </h1>
          <p className="text-sm sm:text-base text-text-secondary max-w-2xl leading-relaxed mt-1">
            How TAG safeguards candidate privacy, eliminates scam job listings, enforces corporate verification, and guarantees explainable automation.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 flex flex-col gap-10 flex-1">
        {/* Principles Grid */}
        <div className="flex flex-col gap-6">
          <Card className="p-6 flex flex-col gap-3">
            <div className="flex items-center gap-3 text-primary font-bold text-base">
              <Sparkles className="w-5 h-5" />
              <span>1. Responsible AI & Explainable Matching</span>
            </div>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              We categorically reject black-box hiring algorithms that produce opaque scores like &quot;86% probability of hiring success&quot;. On TAG, every match percentage reflects criteria alignment against published job specifications, split into Matched, Missing, and Unknown evidence blocks.
            </p>
            <div className="p-3 bg-background rounded-lg border border-border-subtle text-xs text-text-muted">
              <strong>Core Rule:</strong> Unknown evidence is never treated as a penalty or failure. It simply represents unconfirmed data points.
            </div>
          </Card>

          <Card className="p-6 flex flex-col gap-3">
            <div className="flex items-center gap-3 text-primary font-bold text-base">
              <ShieldCheck className="w-5 h-5" />
              <span>2. Mandatory Employer Verification</span>
            </div>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              To publish a job or access candidate profiles, every employer must submit government registration documentation (Certificate of Incorporation, GSTIN) and verify corporate domain ownership. Unverified accounts cannot message candidates or receive unmasked resumes.
            </p>
          </Card>

          <Card className="p-6 flex flex-col gap-3">
            <div className="flex items-center gap-3 text-primary font-bold text-base">
              <Lock className="w-5 h-5" />
              <span>3. Candidate Privacy & Consent by Design</span>
            </div>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              Resumes uploaded to TAG are parsed into structured data for candidate review. No information extracted from a resume becomes part of your public profile without your explicit confirmation. Candidates can choose between Public, Verified Employers Only, or Private visibility.
            </p>
          </Card>

          <Card className="p-6 flex flex-col gap-3">
            <div className="flex items-center gap-3 text-primary font-bold text-base">
              <FileCheck className="w-5 h-5" />
              <span>4. Immutable Audit Logs & Anti-Scraping</span>
            </div>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              Every administrative review, employer status change, and candidate stage movement is recorded in an append-only audit trail. Aggressive rate-limiting prevents scraping bots from harvesting Indian developer identities.
            </p>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
