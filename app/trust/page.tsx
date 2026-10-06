import React from "react";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Footer } from "@/components/layout/Footer";
import { ShieldCheck, Lock, FileCheck, Award } from "lucide-react";

export default function TrustPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 font-sans">
      <PublicNavbar />

      <section className="py-16 lg:py-20 bg-white border-b border-slate-200/90 shadow-2xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center flex flex-col items-center gap-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>TRUST, SAFETY &amp; GOVERNANCE CHARTER</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900">
            Our Responsible <span className="text-blue-600">Marketplace Charter</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed mt-1 font-medium">
            How Touch And Go safeguards candidate privacy, eliminates scam job listings, enforces corporate verification, and guarantees transparent recruitment in India.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 flex flex-col gap-6 flex-1">
        {/* Principle 1 */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-2xs hover:shadow-md hover:border-blue-400 transition-all flex flex-col gap-3">
          <div className="flex items-center gap-3 text-blue-700 font-extrabold text-base">
            <Award className="w-5 h-5 text-blue-600" />
            <span>1. Transparent Criteria Alignment &amp; Explainable Matching</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
            We categorically reject black-box hiring algorithms that produce opaque scores. On TAG, every match percentage reflects real criteria alignment against published job specifications, split into Matched, Missing, and Verified evidence blocks.
          </p>
          <div className="p-3.5 bg-blue-50/80 rounded-xl border border-blue-200 text-xs text-blue-900 font-medium">
            <strong className="font-bold text-blue-700">Core Rule:</strong> Unconfirmed data points are never treated as a penalty. They simply represent items pending verification.
          </div>
        </div>

        {/* Principle 2 */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-2xs hover:shadow-md hover:border-blue-400 transition-all flex flex-col gap-3">
          <div className="flex items-center gap-3 text-blue-700 font-extrabold text-base">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <span>2. Mandatory Corporate Domain &amp; Identity Verification</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
            To publish a job or connect with candidates, every employer must submit government registration documentation (Certificate of Incorporation, GSTIN) and verify corporate domain ownership. Unverified accounts cannot message candidates or view unmasked candidate data.
          </p>
        </div>

        {/* Principle 3 */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-2xs hover:shadow-md hover:border-blue-400 transition-all flex flex-col gap-3">
          <div className="flex items-center gap-3 text-blue-700 font-extrabold text-base">
            <Lock className="w-5 h-5 text-blue-600" />
            <span>3. Candidate Privacy &amp; Consent by Design</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
            Resumes uploaded to TAG are parsed into structured data for candidate review. No information extracted from a resume becomes part of your active profile without your explicit confirmation. Candidates maintain full control over profile visibility.
          </p>
        </div>

        {/* Principle 4 */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-2xs hover:shadow-md hover:border-blue-400 transition-all flex flex-col gap-3">
          <div className="flex items-center gap-3 text-blue-700 font-extrabold text-base">
            <FileCheck className="w-5 h-5 text-blue-600" />
            <span>4. Immutable Audit Logs &amp; Anti-Scraping Defenses</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
            Every status change, employer verification, and application movement is recorded in an append-only audit log. Aggressive rate-limiting and anti-scraping defenses prevent bots from harvesting developer identities across India.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
