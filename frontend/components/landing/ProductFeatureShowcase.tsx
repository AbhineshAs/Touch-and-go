"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Zap,
  ShieldCheck,
  Building2,
  Sliders,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Cpu,
  EyeOff,
  UserCheck,
  MessageSquare,
  Lock,
} from "lucide-react";

export function ProductFeatureShowcase() {
  const [activeTab, setActiveTab] = useState<"match" | "dashboard" | "privacy" | "employer">("match");

  // Interactive Match Simulator State
  const [skillWeight, setSkillWeight] = useState(90);
  const [ctcExpectation, setCtcExpectation] = useState(32);
  const [experience, setExperience] = useState(4);
  const [targetLocation, setTargetLocation] = useState("Bengaluru");

  // Dynamic match calculation logic
  const calculateMatchScore = () => {
    const base = 75;
    const skillBonus = (skillWeight - 70) * 0.4;
    const ctcAdjustment = ctcExpectation <= 35 ? 10 : 3;
    const expAdjustment = experience >= 3 ? 8 : 4;
    return Math.min(99, Math.max(68, Math.round(base + skillBonus + ctcAdjustment + expAdjustment)));
  };

  const calculatedScore = calculateMatchScore();

  return (
    <section id="product-showcase" className="py-20 lg:py-28 bg-white text-slate-900 border-b border-slate-200/80 relative overflow-hidden">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-400/10 via-indigo-400/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-sky-400/10 via-blue-400/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-xs font-extrabold text-blue-700 mb-4 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
            <span>INTERACTIVE PRODUCT EXPERIENCE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            Engineered for <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">zero-friction matching</span>
          </h2>
          <p className="text-slate-600 font-medium text-base sm:text-lg mt-4 leading-relaxed">
            Experience how Touch And Go replaces outdated resume portals with explainable match scoring, verified talent profiles, and 1-click recruiter connections.
          </p>
        </div>

        {/* Product Navigation Tabs */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-100/90 border border-slate-200 rounded-2xl shadow-inner max-w-full overflow-x-auto">
            <button
              onClick={() => setActiveTab("match")}
              className={`px-5 py-3 rounded-xl font-extrabold text-xs sm:text-sm flex items-center gap-2.5 transition-all cursor-pointer ${
                activeTab === "match"
                  ? "bg-white text-blue-600 shadow-md border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              <Zap className="w-4 h-4 text-blue-600" />
              <span>1-Touch Match Engine</span>
            </button>

            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-5 py-3 rounded-xl font-extrabold text-xs sm:text-sm flex items-center gap-2.5 transition-all cursor-pointer ${
                activeTab === "dashboard"
                  ? "bg-white text-blue-600 shadow-md border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              <Cpu className="w-4 h-4 text-indigo-600" />
              <span>Product Interface</span>
            </button>

            <button
              onClick={() => setActiveTab("privacy")}
              className={`px-5 py-3 rounded-xl font-extrabold text-xs sm:text-sm flex items-center gap-2.5 transition-all cursor-pointer ${
                activeTab === "privacy"
                  ? "bg-white text-blue-600 shadow-md border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Privacy &amp; Salary Benchmarks</span>
            </button>

            <button
              onClick={() => setActiveTab("employer")}
              className={`px-5 py-3 rounded-xl font-extrabold text-xs sm:text-sm flex items-center gap-2.5 transition-all cursor-pointer ${
                activeTab === "employer"
                  ? "bg-white text-blue-600 shadow-md border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              <Building2 className="w-4 h-4 text-sky-600" />
              <span>Employer Console</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Interactive Match Simulator */}
        {activeTab === "match" && (
          <div className="bento-card p-6 sm:p-8 lg:p-10 border border-slate-200/90 shadow-xl bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30">
            <div className="grid lg:grid-cols-12 gap-8 items-center">
              {/* Controls Column */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-600/30">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900">Live Match Criteria Tuning</h3>
                    <p className="text-xs text-slate-500 font-medium">Adjust candidate parameters to see instant explainable match calculations</p>
                  </div>
                </div>

                {/* Slider 1: Skill Alignment */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-700 flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-blue-600" />
                      Core Tech Stack Match (React 19, Next.js, Node, System Design)
                    </span>
                    <span className="text-blue-600 font-mono font-extrabold">{skillWeight}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={skillWeight}
                    onChange={(e) => setSkillWeight(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                {/* Slider 2: Target CTC */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-700 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                      Target CTC Expectation (India Hubs)
                    </span>
                    <span className="text-emerald-700 font-mono font-extrabold">₹{ctcExpectation} LPA</span>
                  </div>
                  <input
                    type="range"
                    min="12"
                    max="60"
                    value={ctcExpectation}
                    onChange={(e) => setCtcExpectation(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                </div>

                {/* Select 3: Experience & Location */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700">Experience Level</label>
                    <select
                      value={experience}
                      onChange={(e) => setExperience(Number(e.target.value))}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value={1}>1 - 2 Years (Junior)</option>
                      <option value={4}>3 - 6 Years (Mid / Senior)</option>
                      <option value={8}>7 - 10 Years (Lead / Principal)</option>
                    </select>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700">Preferred Hub</label>
                    <select
                      value={targetLocation}
                      onChange={(e) => setTargetLocation(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="Bengaluru">Bengaluru (KA)</option>
                      <option value="NCR">Gurgaon / NCR</option>
                      <option value="Remote">Remote (India)</option>
                      <option value="Mumbai">Mumbai (MH)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Real-Time Live Result Display */}
              <div className="lg:col-span-5 bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Match Score Breakdown</span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      Live AI Calculated
                    </span>
                  </div>

                  {/* Score Gauge */}
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-6xl font-black tracking-tight text-white font-mono">{calculatedScore}%</span>
                    <span className="text-sm font-bold text-blue-400">Overlapping Fit Score</span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-medium mb-6">
                    Candidate profile demonstrates <span className="text-white font-bold">{calculatedScore}% compatibility</span> with pre-vetted Techcy Routes &amp; WhiteTrack hiring criteria in {targetLocation}.
                  </p>

                  {/* Breakdown Bars */}
                  <div className="flex flex-col gap-3 text-xs mb-8">
                    <div>
                      <div className="flex justify-between text-slate-400 mb-1 font-semibold">
                        <span>Technical Skills Vector</span>
                        <span className="text-blue-400 font-bold">{skillWeight}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${skillWeight}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-400 mb-1 font-semibold">
                        <span>Salary Benchmark Fit</span>
                        <span className="text-emerald-400 font-bold">{ctcExpectation <= 35 ? "100% Market Match" : "88% Stretch"}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: ctcExpectation <= 35 ? "100%" : "88%" }} />
                      </div>
                    </div>
                  </div>
                </div>

                <Link
                  href="/sign-up?role=candidate"
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Zap className="w-4 h-4" />
                  <span>1-Touch Apply to Matches</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Product Dashboard Image Showcase */}
        {activeTab === "dashboard" && (
          <div className="bento-card p-4 sm:p-6 lg:p-8 border border-slate-200/90 shadow-2xl bg-slate-900 text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider">Candidate &amp; Recruiter Talent Hub</span>
                <h3 className="text-xl font-extrabold text-white mt-1">Real-time candidate profile &amp; hiring analytics view</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Full Match Transparency</span>
                </span>
              </div>
            </div>

            {/* Generated Product Dashboard Mockup Image */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl group">
              <img
                src="/product-dashboard-preview.jpg"
                alt="Touch And Go Talent Hub Dashboard Interface"
                className="w-full h-auto object-cover rounded-2xl transition-transform duration-500 group-hover:scale-[1.01]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

              <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-center justify-between gap-4 pointer-events-auto">
                <div className="bg-slate-900/90 backdrop-blur-md p-3 px-4 rounded-xl border border-slate-700/80 text-xs font-bold text-white flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>Interactive Talent Dashboard View</span>
                </div>
                <Link
                  href="/candidate/dashboard"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold shadow-md flex items-center gap-1.5 transition-all"
                >
                  <span>Explore Candidate Console</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Privacy & Salary Benchmarks */}
        {activeTab === "privacy" && (
          <div className="bento-card p-6 sm:p-8 lg:p-10 border border-slate-200/90 shadow-xl bg-white">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center font-bold shadow-xs mb-4">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-3">Anonymous Candidate Privacy Control</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6 font-medium">
                  Keep your current employer unaware of your active search. Your profile stays completely anonymous until you approve a recruiter&apos;s direct match request.
                </p>

                <div className="space-y-4 text-xs font-bold text-slate-800">
                  <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                    <EyeOff className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>Auto-block your current company domain from viewing profile</span>
                  </div>
                  <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                    <Lock className="w-5 h-5 text-blue-600 shrink-0" />
                    <span>Mask full name, email &amp; phone until 1-touch consent</span>
                  </div>
                  <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                    <TrendingUp className="w-5 h-5 text-indigo-600 shrink-0" />
                    <span>Real-time market salary benchmark comparison across Indian tech hubs</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col gap-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <span className="text-xs font-bold uppercase text-slate-400">Bengaluru Senior Full-Stack CTC Distribution</span>
                  <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">95th Percentile</span>
                </div>

                {/* Salary Bars */}
                <div className="space-y-4 text-xs">
                  <div>
                    <div className="flex justify-between text-slate-400 mb-1 font-semibold">
                      <span>Market Average (3-6 yrs)</span>
                      <span className="text-white font-bold">₹22 LPA</span>
                    </div>
                    <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-600" style={{ width: "55%" }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-400 mb-1 font-semibold">
                      <span>Touch And Go Verified Matches</span>
                      <span className="text-emerald-400 font-extrabold">₹34 - ₹42 LPA</span>
                    </div>
                    <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-400" style={{ width: "90%" }} />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 text-xs text-slate-300 font-medium">
                  💡 <span className="font-bold text-white">Salary Guarantee:</span> Employers on Touch And Go pledge non-negotiable transparent CTC benchmarks upfront.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Employer Console */}
        {activeTab === "employer" && (
          <div className="bento-card p-6 sm:p-8 lg:p-10 border border-slate-200/90 shadow-xl bg-white">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center font-bold shadow-xs mb-4">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-3">Recruiter &amp; Hiring Manager Console</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6 font-medium">
                  Cut time-to-hire by 75%. Post structured job requirements and receive pre-filtered candidate matches ranked by explainable match vectors.
                </p>

                <div className="space-y-3.5 text-xs font-bold text-slate-800">
                  <div className="flex items-center gap-3">
                    <UserCheck className="w-4 h-4 text-sky-600 shrink-0" />
                    <span>Instant candidate shortlisting without manual resume scanning</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Direct chat &amp; 1-click interview scheduling</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Verified corporate domain onboarding for employers</span>
                  </div>
                </div>

                <div className="mt-8">
                  <Link
                    href="/sign-up?role=employer"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
                  >
                    <span>Post Job &amp; Access Candidates</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/90 shadow-inner flex flex-col gap-4">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Employer Shortlist Pipeline</span>
                  <span className="text-sky-600 font-mono">14 Active Candidates</span>
                </div>

                {/* Candidate Mock Cards */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-black text-sm flex items-center justify-center">
                      AK
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Arjun K. • Staff Engineer</div>
                      <div className="text-[11px] text-slate-500 font-medium">8 yrs exp • React, Next.js, Go</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-mono font-bold text-xs border border-blue-200">
                    98% Match
                  </span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-black text-sm flex items-center justify-center">
                      PS
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Pooja S. • AI Lead</div>
                      <div className="text-[11px] text-slate-500 font-medium">6 yrs exp • Python, LLMs, RAG</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-mono font-bold text-xs border border-emerald-200">
                    95% Match
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
