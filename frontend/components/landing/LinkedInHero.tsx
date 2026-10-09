"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Users,
  BookOpen,
  Building2,
  MapPin,
  ArrowRight,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Zap,
} from "lucide-react";

export function LinkedInHero() {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("Bengaluru");
  const [activeTab, setActiveTab] = useState<"job" | "people" | "learn" | "post">("job");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = `/jobs?q=${encodeURIComponent(searchQuery)}&loc=${encodeURIComponent(location)}`;
  };

  return (
    <section className="bg-white pt-10 pb-16 lg:pt-14 lg:pb-24 border-b border-black/10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Welcome & Action Pills */}
          <div className="lg:col-span-6 space-y-8">
            <h1 className="text-4xl sm:text-5xl font-normal text-[#8F5849] tracking-tight leading-[1.15]">
              Welcome to your{" "}
              <span className="font-extrabold text-[#0A66C2]">professional community</span>
            </h1>

            {/* LinkedIn-style Pill Action Buttons */}
            <div className="flex flex-col gap-3 max-w-md">
              <button
                onClick={() => setActiveTab("job")}
                className={`flex items-center justify-between p-4 rounded-xl border font-semibold text-base transition-all cursor-pointer text-left ${
                  activeTab === "job"
                    ? "bg-[#EDF3F8] border-[#0A66C2] text-[#0A66C2] shadow-xs"
                    : "bg-white border-black/15 text-slate-800 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Search className="w-5 h-5 text-[#0A66C2]" />
                  <span>Search for a job</span>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </button>

              <button
                onClick={() => setActiveTab("people")}
                className={`flex items-center justify-between p-4 rounded-xl border font-semibold text-base transition-all cursor-pointer text-left ${
                  activeTab === "people"
                    ? "bg-[#EDF3F8] border-[#0A66C2] text-[#0A66C2] shadow-xs"
                    : "bg-white border-black/15 text-slate-800 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-[#0A66C2]" />
                  <span>Find people you know</span>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </button>

              <button
                onClick={() => setActiveTab("learn")}
                className={`flex items-center justify-between p-4 rounded-xl border font-semibold text-base transition-all cursor-pointer text-left ${
                  activeTab === "learn"
                    ? "bg-[#EDF3F8] border-[#0A66C2] text-[#0A66C2] shadow-xs"
                    : "bg-white border-black/15 text-slate-800 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-[#0A66C2]" />
                  <span>Learn a new tech skill</span>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </button>

              <button
                onClick={() => setActiveTab("post")}
                className={`flex items-center justify-between p-4 rounded-xl border font-semibold text-base transition-all cursor-pointer text-left ${
                  activeTab === "post"
                    ? "bg-[#EDF3F8] border-[#0A66C2] text-[#0A66C2] shadow-xs"
                    : "bg-white border-black/15 text-slate-800 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-[#0A66C2]" />
                  <span>Post your job for free</span>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Direct Search Bar Box */}
            <form
              onSubmit={handleSearch}
              className="p-3 bg-[#F4F2EE] border border-black/15 rounded-2xl flex flex-col sm:flex-row items-center gap-2 max-w-xl shadow-xs"
            >
              <div className="flex-1 flex items-center gap-2.5 px-3 py-2 w-full">
                <Search className="w-4 h-4 text-slate-500 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Job title, skill, or company..."
                  className="w-full bg-transparent text-slate-900 placeholder:text-slate-500 focus:outline-hidden font-medium text-sm"
                />
              </div>

              <div className="h-6 w-px bg-black/15 hidden sm:block" />

              <div className="flex items-center gap-2 px-3 py-2 w-full sm:w-auto shrink-0">
                <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="bg-transparent text-slate-900 font-semibold text-xs focus:outline-hidden cursor-pointer"
                >
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Gurgaon / NCR">Gurgaon / NCR</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#0A66C2] hover:bg-[#004182] text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                <span>Search</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="flex items-center gap-6 text-xs text-slate-600 font-semibold">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#0A66C2]" />
                <span>1,420+ Verified Roles</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[#0A66C2]" />
                <span>24-Hour Recruiter SLA</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Professional Graphic */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-black/10 aspect-4/3 group">
              <Image
                src="/images/linkedin_hero.jpg"
                alt="LinkedIn Professional Community TAG"
                fill
                priority
                className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
              />

              {/* Live Profile AI Match Floating Card Overlay */}
              <div className="absolute bottom-6 left-6 right-6 bg-white/95 border border-black/15 p-4 rounded-2xl shadow-2xl backdrop-blur-md flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0A66C2] text-white flex items-center justify-center font-bold text-sm">
                    AS
                  </div>
                  <div>
                    <div className="font-extrabold text-sm text-slate-900">Ananya Sharma</div>
                    <div className="text-xs text-slate-600">Senior Full-Stack Engineer • Bengaluru</div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block px-2.5 py-1 rounded-full bg-[#EDF3F8] text-[#0A66C2] font-mono font-extrabold text-xs border border-[#0A66C2]/20">
                    96% AI Match
                  </span>
                  <div className="text-[10px] text-slate-500 mt-0.5">Razorwave Tech</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
