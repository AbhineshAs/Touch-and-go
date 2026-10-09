"use client";

import React from "react";
import Link from "next/link";
import { UserCheck, Building2, ShieldCheck, Zap, ArrowRight } from "lucide-react";

export function LinkedInSplitCards() {
  return (
    <section className="py-16 lg:py-24 bg-[#F4F2EE] text-slate-900 border-b border-black/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Card 1: Open to Work */}
          <div className="bg-[#EDF3F8] border border-[#0A66C2]/30 rounded-2xl p-8 flex flex-col justify-between shadow-xs">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-[#0A66C2] border border-[#0A66C2]/30 text-xs font-bold mb-4">
                <UserCheck className="w-3.5 h-3.5" />
                <span>OPEN TO WORK FEATURE</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3">
                Let the right companies know you&apos;re <span className="text-[#0A66C2]">Open to Work</span>
              </h3>

              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                With TAG&apos;s Open to Work profile signal, you can privately notify 1,200+ verified tech hiring teams across India that you&apos;re open to new roles—without alerting your current employer.
              </p>
            </div>

            <Link href="/sign-up?role=candidate">
              <button className="linkedin-pill-button linkedin-pill-button-filled text-xs py-3 px-6 inline-flex items-center gap-2 cursor-pointer">
                <span>Enable Open To Work Profile</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>

          {/* Card 2: Employer Job Posting */}
          <div className="bg-white border border-black/15 rounded-2xl p-8 flex flex-col justify-between shadow-xs">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold mb-4">
                <Building2 className="w-3.5 h-3.5" />
                <span>FOR HIRING MANAGERS</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3">
                Post your job for <span className="text-emerald-700">top 5% tech talent</span>
              </h3>

              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                Skip traditional phone screens. Receive pre-evaluated candidate matches with 95%+ criteria overlap in 24 hours.
              </p>
            </div>

            <Link href="/sign-up?role=employer">
              <button className="linkedin-pill-button linkedin-pill-button-outline text-xs py-3 px-6 inline-flex items-center gap-2 cursor-pointer">
                <span>Post a Job for Free</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
