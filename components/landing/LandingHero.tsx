"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Hero3DBackground } from "@/components/landing/Hero3DBackground";
import {
  Sparkles,
  ArrowRight,
  Search,
  MapPin,
  CheckCircle2,
  TrendingUp,
  Zap,
  Building2,
  UserCheck,
  ShieldCheck,
  Star,
} from "lucide-react";

export function LandingHero() {
  const [mode, setMode] = useState<"candidate" | "employer">("candidate");
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("Bengaluru");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "candidate") {
      window.location.href = `/jobs?q=${encodeURIComponent(searchQuery)}&loc=${encodeURIComponent(location)}`;
    } else {
      window.location.href = `/sign-up?role=employer&redirect=%2Femployer%2Fdashboard`;
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#0F172A] via-[#1E1B4B] to-[#0F172A] text-white pt-12 pb-20 lg:pt-16 lg:pb-28">
      {/* Interactive 3D Canvas Mesh */}
      <Hero3DBackground />

      {/* Background Lighting Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-40 right-10 w-80 h-80 bg-sky-400/15 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(99,102,241,0.15)_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Live Signal Eyebrow */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/90 border border-sky-400/40 text-xs font-semibold text-sky-300 shadow-xl">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-400" />
            </span>
            <span>1,420+ Verified Tech Roles Active in India Today</span>
            <span className="hidden sm:inline text-sky-200/70">• 1-Touch Matching</span>
          </div>
        </div>

        {/* Hero Title & Description */}
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] mb-6">
            Hire &amp; Get Hired in a{" "}
            <span className="bg-gradient-to-r from-sky-300 via-indigo-300 to-white bg-clip-text text-transparent">
              Touch And Go.
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-sky-100/90 font-normal leading-relaxed mb-8 max-w-2xl mx-auto">
            India&apos;s AI-assisted recruitment marketplace. Connect instantly with pre-vetted tech companies or top 5% engineering talent with explainable criteria matching.
          </p>

          {/* Mode Toggle Switcher */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex p-1.5 rounded-2xl bg-[#0F172A]/90 border border-indigo-800/80">
              <button
                onClick={() => setMode("candidate")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                  mode === "candidate"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                    : "text-sky-200/80 hover:text-white"
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>For Job Seekers</span>
              </button>
              <button
                onClick={() => setMode("employer")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                  mode === "employer"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                    : "text-sky-200/80 hover:text-white"
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>For Employers / Companies</span>
              </button>
            </div>
          </div>

          {/* Search CTA Box */}
          <form
            onSubmit={handleSearch}
            className="bg-[#1E293B]/90 border border-indigo-700/60 p-2.5 rounded-2xl shadow-2xl backdrop-blur-md max-w-3xl mx-auto mb-6 flex flex-col sm:flex-row items-center gap-2"
          >
            <div className="flex-1 flex items-center gap-3 px-3 py-2 w-full">
              <Search className="w-5 h-5 text-sky-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  mode === "candidate"
                    ? "Role or Skill (e.g. Senior Full Stack, React 19, Python, AI Agent)..."
                    : "Job Title or Role to Hire (e.g. Frontend Lead, ML Engineer)..."
                }
                className="w-full bg-transparent text-white placeholder:text-sky-300/60 focus:outline-hidden font-medium text-sm sm:text-base"
              />
            </div>

            <div className="h-8 w-px bg-indigo-800/80 hidden sm:block" />

            <div className="flex items-center gap-2 px-3 py-2 w-full sm:w-auto shrink-0">
              <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="bg-transparent text-white font-semibold text-xs sm:text-sm focus:outline-hidden cursor-pointer"
              >
                <option value="Bengaluru" className="bg-[#0F172A] text-white">Bengaluru</option>
                <option value="Gurgaon / NCR" className="bg-[#0F172A] text-white">Gurgaon / NCR</option>
                <option value="Mumbai" className="bg-[#0F172A] text-white">Mumbai</option>
                <option value="Hyderabad" className="bg-[#0F172A] text-white">Hyderabad</option>
                <option value="Remote" className="bg-[#0F172A] text-white">Remote (India)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-extrabold text-sm shadow-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] cursor-pointer shrink-0"
            >
              <span>{mode === "candidate" ? "Touch & Go Match" : "Post Job Now"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Micro Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-semibold text-sky-200/80 mb-12">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-sky-400" />
              <span>100% Verified Employers</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-sky-400" />
              <span>Transparent AI Match Scores</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-sky-400" />
              <span>Zero Recruiter Spam / Fast Response</span>
            </div>
          </div>
        </div>

        {/* Hero Interactive Match Preview Visual */}
        <div className="relative max-w-5xl mx-auto">
          <div className="rounded-3xl p-3 sm:p-5 bg-gradient-to-b from-indigo-900/40 to-slate-900/90 border border-indigo-700/60 shadow-2xl backdrop-blur-md">
            {/* Window Top Bar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#0A0F1D] rounded-t-2xl border-b border-indigo-900 text-xs font-mono text-sky-400">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-indigo-500/80 inline-block" />
                <span className="ml-2 font-medium text-sky-300 hidden sm:inline-block">
                  tag.market / ai-matching-engine
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-indigo-900/90 px-2.5 py-0.5 rounded text-[10px] text-sky-300 font-bold tracking-wider">
                  REAL-TIME MATCH VERIFIED
                </span>
              </div>
            </div>

            {/* Content Mockup Card Grid */}
            <div className="p-6 sm:p-8 bg-[#0F172A] rounded-b-2xl grid md:grid-cols-12 gap-6 items-center">
              {/* Candidate Info */}
              <div className="md:col-span-7 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-500 text-white flex items-center justify-center font-black text-xl shadow-md">
                    AS
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-lg text-white">Ananya Sharma</h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-950 text-sky-300 border border-indigo-700">
                        Senior Full-Stack Engineer
                      </span>
                    </div>
                    <p className="text-xs text-sky-300/80">Bengaluru, KA • 5 Years Exp • Notice: 15 Days</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#1E293B] border border-indigo-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-sky-200">AI Criteria Overlap</span>
                    <span className="font-mono font-extrabold text-sky-400">96% High Match</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-sky-400 w-[96%]" />
                  </div>
                  <p className="text-[11px] text-sky-200/80">
                    Matches 5/5 core requirements for WhiteTrack Technologies (Next.js 16, Node.js microservices, System Architecture).
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {["React 19", "TypeScript", "Next.js 16", "Node.js", "PostgreSQL", "AWS"].map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-lg bg-[#1E293B] border border-indigo-800 text-[11px] font-semibold text-sky-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Company Match Side Badge */}
              <div className="md:col-span-5 bg-[#1E293B] border border-indigo-800 p-5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-sky-500 text-white flex items-center justify-center font-bold text-xs shadow-md">
                      WT
                    </div>
                    <div>
                      <a href="https://www.whitetracktech.com" target="_blank" rel="noopener noreferrer" className="font-bold text-xs text-white hover:text-sky-300 flex items-center gap-1">
                        WhiteTrack Technologies
                      </a>
                      <div className="text-[10px] text-sky-400">Official Sponsor • Enterprise Cloud</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono text-sky-300 bg-indigo-950 border border-indigo-800">
                    Verified Sponsor
                  </span>
                </div>

                <div className="border-t border-indigo-900/80 pt-3 space-y-1">
                  <div className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">
                    Offered Compensation
                  </div>
                  <div className="text-2xl font-black text-white font-mono">
                    ₹28,00,000 - ₹34,00,000 <span className="text-xs text-sky-300 font-sans">/ year</span>
                  </div>
                </div>

                <Link href="/sign-up">
                  <button className="w-full py-3 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-extrabold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer">
                    <Zap className="w-4 h-4" />
                    <span>Touch &amp; Go Instant Apply</span>
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom Accent Bar */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-indigo-950/60 border border-indigo-800 text-xs font-medium text-sky-200">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              <span>Verified Salary Transparency (No CTC hidden)</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-sky-400" />
              <span>Average Employer Response in &lt; 24 Hours</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-sky-400 fill-sky-400" />
              <span>4.9/5 Rating by 25,000+ Indian Developers</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
