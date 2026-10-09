"use client";

import React from "react";
import Link from "next/link";
import {
  Zap,
  Lock,
  MessageCircle,
  TrendingUp,
  Sliders,
  Check,
  ShieldCheck,
  ArrowUpRight,
  Briefcase,
  Sparkles,
} from "lucide-react";

export function ProductBentoGrid() {
  return (
    <section className="py-20 lg:py-28 bg-[#F8FAFC] text-slate-900 border-b border-slate-200/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-xs font-extrabold text-blue-700 mb-4 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>PRODUCT ADVANTAGES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            Why tech professionals choose <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">Touch &amp; Go</span>
          </h2>
          <p className="text-slate-600 font-medium text-base sm:text-lg mt-4 leading-relaxed">
            Built from the ground up to solve broken recruitment portals in India. Built for speed, transparency, and candidate privacy.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* Bento Card 1: Explainable Match Vector (Spans 2 cols) */}
          <div className="md:col-span-2 bento-card p-6 sm:p-8 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold shadow-2xs mb-6 group-hover:scale-110 transition-transform">
                <Sliders className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono font-bold text-blue-600 uppercase tracking-wider">Explainable AI</span>
              <h3 className="text-2xl font-black text-slate-900 mt-1 mb-3">Explainable Criteria Matching</h3>
              <p className="text-slate-600 text-sm font-medium leading-relaxed mb-6">
                Never guess why you were rejected or matched. Our multi-vector matching engine scores alignment across technical stack, target CTC, notice period, and preferred work arrangement.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/90 text-xs font-bold text-slate-700 space-y-2.5">
              <div className="flex items-center justify-between">
                <span>Tech Stack Vector Fit</span>
                <span className="text-blue-600 font-mono">98% Match</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600" style={{ width: "98%" }} />
              </div>
              <div className="flex items-center justify-between pt-1">
                <span>CTC Expectation Alignment</span>
                <span className="text-[#4F46E5] font-mono">100% Fit</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-[#4F46E5]" style={{ width: "100%" }} />
              </div>
            </div>
          </div>

          {/* Bento Card 2: 1-Touch Instant Apply */}
          <div className="bento-card p-6 sm:p-8 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center font-bold shadow-2xs mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono font-bold text-amber-600 uppercase tracking-wider">Zero Friction</span>
              <h3 className="text-xl font-black text-slate-900 mt-1 mb-2">1-Touch Apply</h3>
              <p className="text-slate-600 text-xs font-medium leading-relaxed mb-4">
                No repeated 20-page forms or resume re-uploads. Apply instantly with your verified structured profile.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 bg-amber-50/60 p-3 rounded-xl border border-amber-200">
              <Check className="w-4 h-4 text-amber-600" />
              <span>Applied in 0.8 seconds</span>
            </div>
          </div>

          {/* Bento Card 3: Privacy Control */}
          <div className="bento-card p-6 sm:p-8 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 text-[#4F46E5] flex items-center justify-center font-bold shadow-2xs mb-6 group-hover:scale-110 transition-transform">
                <Lock className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono font-bold text-[#4F46E5] uppercase tracking-wider">Candidate Security</span>
              <h3 className="text-xl font-black text-slate-900 mt-1 mb-2">Stealth Mode</h3>
              <p className="text-slate-600 text-xs font-medium leading-relaxed mb-4">
                Block your existing employer and hide personal contact details until you explicitly accept a recruiter request.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 bg-indigo-50/60 p-3 rounded-xl border border-indigo-200">
              <ShieldCheck className="w-4 h-4 text-[#4F46E5]" />
              <span>Current Company Auto-Blocked</span>
            </div>
          </div>

          {/* Bento Card 4: Direct Founder Outreach */}
          <div className="bento-card p-6 sm:p-8 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center font-bold shadow-2xs mb-6 group-hover:scale-110 transition-transform">
                <MessageCircle className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono font-bold text-indigo-600 uppercase tracking-wider">Direct Access</span>
              <h3 className="text-xl font-black text-slate-900 mt-1 mb-2">Direct Founder Chat</h3>
              <p className="text-slate-600 text-xs font-medium leading-relaxed mb-4">
                Connect directly with Engineering Directors, VPs of Tech, and Founders. Skip automated recruiter gatekeepers.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 bg-indigo-50/60 p-3 rounded-xl border border-indigo-200">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
              <span>Direct Messenger Enabled</span>
            </div>
          </div>

          {/* Bento Card 5: Real-Time CTC Benchmarks (Spans 3 cols) */}
          <div className="md:col-span-2 lg:col-span-3 bento-card p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 group">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-sky-600 uppercase mb-2">
                <TrendingUp className="w-4 h-4" />
                <span>Salaries &amp; Compensation Transparency</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Real-Time CTC Market Percentiles</h3>
              <p className="text-slate-600 text-sm font-medium leading-relaxed max-w-xl">
                Benchmark your compensation against verified offers in Bengaluru, NCR, Remote, and Mumbai. Employers list non-negotiable salary ranges upfront.
              </p>
            </div>

            <Link
              href="/jobs"
              className="px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs sm:text-sm shadow-md flex items-center gap-2 transition-all shrink-0 cursor-pointer"
            >
              <span>Explore Salary Data</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
