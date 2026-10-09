"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles, Building2, UserCheck, ShieldCheck, Zap } from "lucide-react";

export function LandingCtaBanner() {
  return (
    <section className="py-16 sm:py-24 bg-slate-950 text-slate-100 relative overflow-hidden border-t border-slate-800/60">
      {/* Background Ambient Glows & Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-sky-500/20 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="relative rounded-3xl p-8 sm:p-14 lg:p-16 overflow-hidden bg-gradient-to-br from-indigo-900/90 via-slate-900/95 to-blue-950/90 border border-indigo-500/30 shadow-[0_20px_60px_-15px_rgba(79,70,229,0.3)] backdrop-blur-xl">
          
          {/* Decorative Corner Sheens */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-sky-400/20 via-indigo-500/10 to-transparent blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-indigo-600/20 via-purple-500/10 to-transparent blur-2xl pointer-events-none" />

          <div className="relative max-w-4xl mx-auto text-center">
            {/* Live Status Pill Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-indigo-500/15 border border-indigo-400/30 text-xs font-bold text-sky-300 mb-8 backdrop-blur-md shadow-inner">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span className="tracking-wide uppercase">Join The Touch &amp; Go Recruitment Revolution</span>
            </div>

            {/* Main Title */}
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-6 text-white leading-[1.15]">
              Ready for your{" "}
              <span className="bg-gradient-to-r from-sky-300 via-indigo-200 to-cyan-300 bg-clip-text text-transparent drop-shadow-sm">
                Touch And Go
              </span>{" "}
              career breakthrough?
            </h2>

            {/* Subtext */}
            <p className="text-base sm:text-xl text-slate-300 font-medium mb-10 max-w-2xl mx-auto leading-relaxed">
              Connect instantly with <strong className="text-white font-semibold">50,000+ top candidates</strong> and <strong className="text-white font-semibold">1,200+ verified tech employers</strong> across India building the future of hiring.
            </p>

            {/* CTA Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-lg mx-auto mb-12">
              <Link href="/sign-up?role=candidate" className="w-full sm:w-auto flex-1 group">
                <button className="w-full py-4 px-8 rounded-2xl bg-gradient-to-r from-white via-slate-100 to-indigo-50 hover:from-white hover:to-white text-indigo-950 font-extrabold text-base shadow-[0_10px_30px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_15px_35px_-5px_rgba(255,255,255,0.5)] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer border border-white/50">
                  <UserCheck className="w-5 h-5 text-indigo-700" />
                  <span>Create Free Profile</span>
                  <ArrowRight className="w-5 h-5 text-indigo-700 group-hover:translate-x-1.5 transition-transform duration-200" />
                </button>
              </Link>
              
              <Link href="/sign-up?role=employer" className="w-full sm:w-auto flex-1 group">
                <button className="w-full py-4 px-8 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-[0.98] text-white font-extrabold text-base border border-white/20 hover:border-white/40 backdrop-blur-md shadow-lg transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer">
                  <Building2 className="w-5 h-5 text-sky-300" />
                  <span>Hire Top Talent</span>
                  <ArrowRight className="w-5 h-5 text-sky-300/80 group-hover:translate-x-1.5 transition-transform duration-200" />
                </button>
              </Link>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-indigo-500/20 max-w-3xl mx-auto">
              <div className="flex items-center justify-center gap-2.5 py-2 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-semibold text-slate-200 backdrop-blur-xs">
                <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                <span>1-Touch Instant Apply</span>
              </div>
              <div className="flex items-center justify-center gap-2.5 py-2 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-semibold text-slate-200 backdrop-blur-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>100% Verified Employers</span>
              </div>
              <div className="flex items-center justify-center gap-2.5 py-2 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-semibold text-slate-200 backdrop-blur-xs">
                <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Zero Recruiter Spam</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

