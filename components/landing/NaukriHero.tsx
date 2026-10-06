"use client";

import React, { useState } from "react";
import { Search, MapPin, Briefcase, ArrowRight, Compass } from "lucide-react";
import { Hero3DBackground } from "@/components/landing/Hero3DBackground";

export function NaukriHero() {
  const [keyword, setKeyword] = useState("");
  const [experience, setExperience] = useState("3");
  const [location, setLocation] = useState("Bengaluru");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = `/jobs?q=${encodeURIComponent(keyword)}&exp=${experience}&loc=${encodeURIComponent(location)}`;
  };

  const trendingSearches = [
    "Full-Stack Engineer",
    "React 19 & Next.js",
    "AI / LLM Architect",
    "Node.js Microservices",
    "Cloud & DevOps",
    "Data Scientist",
  ];

  return (
    <section className="relative bg-[#F8FAFC] text-slate-900 pt-12 pb-16 lg:pt-16 lg:pb-24 overflow-hidden border-b border-slate-200/80">
      {/* Ambient Premium Radial Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-blue-400/10 via-indigo-400/10 to-sky-400/10 blur-3xl pointer-events-none rounded-full" />

      {/* 3D WebGL Canvas Background */}
      <Hero3DBackground />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        {/* Top Eyebrow Signal Pill */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/95 border border-blue-200/80 text-xs font-bold text-slate-800 shadow-xs backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600" />
            </span>
            <span className="bg-gradient-to-r from-blue-700 via-blue-600 to-sky-600 bg-clip-text text-transparent">
              India&apos;s Premier AI Recruitment Marketplace
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-700 font-mono text-[11px] font-bold">1,420+ Active Roles</span>
          </div>
        </div>

        {/* Hero Main Headline */}
        <div className="text-center max-w-4xl mx-auto mb-10">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight mb-5 text-slate-900">
            Find your <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">dream tech job</span> in a Touch &amp; Go.
          </h1>
          <p className="text-base sm:text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
            Connect directly with top pre-vetted tech employers across India with transparent CTC benchmarks, criteria match scores, and 1-click applications.
          </p>
        </div>

        {/* Prominent Naukri Search Widget Box */}
        <div className="max-w-4xl mx-auto bg-white/95 border border-slate-200/90 p-4 sm:p-5 rounded-3xl shadow-xl shadow-blue-600/5 backdrop-blur-2xl">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-center gap-3">
            {/* 1. Skill / Designation Input */}
            <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-slate-50/90 rounded-2xl border border-slate-200/90 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:bg-white transition-all w-full">
              <Search className="w-5 h-5 text-blue-600 shrink-0" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Enter skills / designations / companies (e.g. React, Node, AI)..."
                className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none font-semibold text-sm"
              />
            </div>

            {/* 2. Experience Selector */}
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-50/90 rounded-2xl border border-slate-200/90 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:bg-white transition-all w-full md:w-52 shrink-0">
              <Briefcase className="w-4 h-4 text-blue-600 shrink-0" />
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full bg-transparent text-slate-900 font-bold text-xs focus:outline-none cursor-pointer"
              >
                <option value="0" className="bg-white text-slate-900">Freshers (0 Yrs)</option>
                <option value="2" className="bg-white text-slate-900">1 - 3 Years Exp</option>
                <option value="5" className="bg-white text-slate-900">3 - 6 Years Exp</option>
                <option value="8" className="bg-white text-slate-900">6 - 10 Years Exp</option>
                <option value="12" className="bg-white text-slate-900">10+ Years (Lead)</option>
              </select>
            </div>

            {/* 3. Location Dropdown */}
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-50/90 rounded-2xl border border-slate-200/90 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:bg-white transition-all w-full md:w-48 shrink-0">
              <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-transparent text-slate-900 font-bold text-xs focus:outline-none cursor-pointer"
              >
                <option value="Bengaluru" className="bg-white text-slate-900">Bengaluru (KA)</option>
                <option value="Gurgaon / NCR" className="bg-white text-slate-900">Gurgaon / NCR</option>
                <option value="Mumbai" className="bg-white text-slate-900">Mumbai (MH)</option>
                <option value="Hyderabad" className="bg-white text-slate-900">Hyderabad (TS)</option>
                <option value="Remote" className="bg-white text-slate-900">Remote (India)</option>
              </select>
            </div>

            {/* Search Button */}
            <button
              type="submit"
              className="w-full md:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#1E40AF] text-white font-extrabold text-sm shadow-md shadow-blue-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer shrink-0"
            >
              <span>Search Jobs</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Trending Searches */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-500 font-extrabold flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-blue-600" />
              <span>Trending:</span>
            </span>
            {trendingSearches.map((term) => (
              <button
                key={term}
                onClick={() => setKeyword(term)}
                className="px-3 py-1 rounded-lg bg-slate-100/80 hover:bg-blue-50 border border-slate-200/80 text-[11px] font-bold text-slate-700 hover:text-blue-700 hover:border-blue-300 transition-all cursor-pointer"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
