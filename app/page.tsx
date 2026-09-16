"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Badge, MatchBadge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import {
  Search,
  MapPin,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Building2,
  ArrowRight,
  TrendingUp,
  FileSearch,
  Scale,
  Lock,
  Compass,
  Code2,
  Briefcase,
  HelpCircle,
  Zap,
} from "lucide-react";
import { MOCK_JOBS } from "@/lib/mocks/data";
import { formatSalaryRange, formatRelativeTime } from "@/lib/utils";

export default function HomePage() {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");

  // Interactive Live Match Simulator State
  const [activeProfileDemo, setActiveProfileDemo] = useState<"ananya" | "rahul">("ananya");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword) params.set("q", keyword);
    if (location) params.set("location", location);
    router.push(`/jobs?${params.toString()}`);
  };

  const featuredJobs = MOCK_JOBS.slice(0, 4);

  const techHubs = [
    { name: "Bengaluru", count: 580, tag: "Silicon Valley of India", avg: "₹28L - ₹45L", color: "from-teal-500/10 to-emerald-500/5" },
    { name: "Hyderabad", count: 340, tag: "Cyberabad Enterprise", avg: "₹24L - ₹38L", color: "from-sky-500/10 to-teal-500/5" },
    { name: "Pune", count: 220, tag: "SaaS & Core Product", avg: "₹20L - ₹34L", color: "from-indigo-500/10 to-purple-500/5" },
    { name: "Remote", count: 410, tag: "Pan-India & Global", avg: "₹26L - ₹50L", color: "from-emerald-500/10 to-teal-500/5" },
    { name: "Kerala & South Hubs", count: 160, tag: "Kochi, TVM & Nagercoil", avg: "₹18L - ₹30L", color: "from-amber-500/10 to-emerald-500/5" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-text-primary">
      <PublicNavbar />

      {/* HERO SECTION WITH AMBIENT MESH GLOW */}
      <section className="relative pt-20 pb-20 lg:pt-28 lg:pb-32 overflow-hidden border-b border-border/80 bg-mesh-glow">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-grid-pattern opacity-60 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center relative z-10">
          {/* Eyebrow Trust Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface border border-primary/25 text-primary-dark text-xs font-semibold shadow-[0_2px_8px_-2px_rgba(22,107,92,0.15)] mb-8 animate-in fade-in duration-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
            </span>
            <span>INDIA&apos;S VERIFIED TECH RECRUITMENT MARKETPLACE</span>
          </div>

          {/* Bold Editorial Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-text-primary max-w-4xl leading-[1.08]">
            Find work that fits. <br />
            <span className="bg-gradient-to-r from-[#197B69] via-[#12584B] to-[#0A3C34] bg-clip-text text-transparent">
              Hire talent with evidence.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-text-secondary max-w-2xl leading-relaxed font-normal">
            TAG connects high-signal engineers with verified technology employers through
            structured profiles, published criteria, and transparent, explainable matching.{" "}
            <span className="font-semibold text-text-primary">
              No black boxes. No keyword guesswork.
            </span>
          </p>

          {/* Machined Double-Bezel Search Console */}
          <div className="w-full max-w-3xl mt-10 bezel-outer">
            <form
              onSubmit={handleSearch}
              className="bezel-inner p-2 sm:p-2.5 flex flex-col sm:flex-row items-center gap-2"
            >
              <div className="flex-1 w-full flex items-center gap-3 px-3 py-1.5 border-b sm:border-b-0 sm:border-r border-border/80">
                <Search className="w-5 h-5 text-primary shrink-0" />
                <input
                  type="text"
                  placeholder="Job title, tech stack (e.g. React, Go, SOC, Python)"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="w-full bg-transparent text-sm font-medium text-text-primary placeholder:text-text-muted focus:outline-none py-2"
                />
              </div>

              <div className="flex-1 w-full flex items-center gap-3 px-3 py-1.5">
                <MapPin className="w-5 h-5 text-text-muted shrink-0" />
                <input
                  type="text"
                  placeholder="City or Remote (e.g. Bengaluru, Pune, Kochi)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-transparent text-sm font-medium text-text-primary placeholder:text-text-muted focus:outline-none py-2"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full sm:w-auto shrink-0 px-7 shadow-md"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Search Jobs
              </Button>
            </form>
          </div>

          {/* Quick Filter Suggestion Chips */}
          <div className="flex items-center flex-wrap justify-center gap-2 mt-5 text-xs text-text-muted">
            <span className="font-semibold text-text-secondary">Trending roles:</span>
            {[
              "Lead Frontend Engineer",
              "Go Distributed Systems",
              "Cyber Defense SOC",
              "FastAPI Backend",
              "Remote First",
            ].map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => router.push(`/jobs?q=${encodeURIComponent(term)}`)}
                className="px-3 py-1 rounded-full bg-surface/90 border border-border hover:border-primary hover:text-primary transition-all duration-150 cursor-pointer shadow-2xs font-medium"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* INTERACTIVE DEMO WIDGET: THE EXPLAINABLE AI MATCH SIMULATOR */}
      <section className="py-12 bg-surface border-b border-border/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-border bg-gradient-to-b from-background-alt/30 to-surface p-6 sm:p-9 shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border">
              <div className="flex flex-col gap-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>Interactive Engine Preview</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary">
                  See how TAG explains every match in real-time
                </h3>
                <p className="text-xs sm:text-sm text-text-secondary max-w-xl">
                  Toggle between candidates below to see how our explainable engine compares
                  candidate credentials against published criteria without opaque scoring.
                </p>
              </div>

              {/* Candidate Switcher Pills */}
              <div className="flex items-center gap-2 bg-background p-1.5 rounded-2xl border border-border shrink-0 self-start md:self-auto">
                <button
                  type="button"
                  onClick={() => setActiveProfileDemo("ananya")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${activeProfileDemo === "ananya"
                      ? "bg-primary text-white shadow-xs"
                      : "text-text-secondary hover:text-text-primary"
                    }`}
                >
                  Candidate A: Ananya (Frontend Lead)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveProfileDemo("rahul")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${activeProfileDemo === "rahul"
                      ? "bg-primary text-white shadow-xs"
                      : "text-text-secondary hover:text-text-primary"
                    }`}
                >
                  Candidate B: Rahul (DevOps Specialist)
                </button>
              </div>
            </div>

            {/* Target Job Requisition Context */}
            <div className="pt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Job Context */}
              <div className="lg:col-span-4 p-5 rounded-2xl bg-surface border border-border/80 flex flex-col gap-3 shadow-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                  TARGET REQUISITION
                </span>
                <div>
                  <h4 className="font-bold text-base text-text-primary">
                    Lead Frontend Architect
                  </h4>
                  <p className="text-xs text-text-secondary">RazorWave Technologies • Bengaluru (Hybrid)</p>
                  <p className="text-xs font-semibold text-primary mt-1">₹32,00,000 - ₹42,00,000 / yr</p>
                </div>
                <div className="border-t border-border-subtle pt-3 flex flex-col gap-1.5">
                  <span className="text-[11px] font-semibold text-text-secondary">Published Criteria:</span>
                  <div className="flex flex-wrap gap-1">
                    {["React 19", "TypeScript", "Micro-frontends", "Design Systems", "Team Leadership"].map(
                      (s) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 rounded bg-background border border-border text-[11px] text-text-secondary"
                        >
                          {s}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Dynamic Explainable Match Output */}
              <div className="lg:col-span-8 flex flex-col gap-4">
                {activeProfileDemo === "ananya" ? (
                  <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                    <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg">
                          88%
                        </div>
                        <div>
                          <span className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
                            HIGH CRITERIA ALIGNMENT
                          </span>
                          <p className="text-xs text-emerald-800">
                            Strong verified overlap on React, TypeScript, and large-scale UI performance.
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-emerald-900 bg-white px-3 py-1 rounded-full border border-emerald-200">
                        Verified Evidence
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3.5 rounded-xl bg-emerald-50/40 border border-emerald-200/80 flex flex-col gap-1">
                        <span className="text-[10px] font-extrabold uppercase text-emerald-800">
                          MATCHED (4 CRITERIA)
                        </span>
                        <p className="text-xs text-text-secondary">
                          5+ yrs React, Design Tokens, Micro-frontends verified at PhonePe.
                        </p>
                      </div>
                      <div className="p-3.5 rounded-xl bg-amber-50/40 border border-amber-200/80 flex flex-col gap-1">
                        <span className="text-[10px] font-extrabold uppercase text-amber-800">
                          MISSING (1 CRITERION)
                        </span>
                        <p className="text-xs text-text-secondary">
                          Formal WebGL 3D experience not found in verified history.
                        </p>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-1">
                        <span className="text-[10px] font-extrabold uppercase text-slate-700">
                          UNKNOWN (NOT PENALIZED)
                        </span>
                        <p className="text-xs text-text-secondary">
                          Open-source contributions unverified; does not reduce match score.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                    <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-amber-600 text-white flex items-center justify-center font-black text-lg">
                          42%
                        </div>
                        <div>
                          <span className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                            LOW CRITERIA ALIGNMENT
                          </span>
                          <p className="text-xs text-amber-800">
                            Candidate background is focused in Kubernetes and Cloud Ops, not Frontend Architecture.
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-amber-900 bg-white px-3 py-1 rounded-full border border-amber-200">
                        Transparent Diagnosis
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3.5 rounded-xl bg-emerald-50/40 border border-emerald-200/80 flex flex-col gap-1">
                        <span className="text-[10px] font-extrabold uppercase text-emerald-800">
                          MATCHED (1 CRITERION)
                        </span>
                        <p className="text-xs text-text-secondary">
                          Commercial TypeScript & Node.js services verified.
                        </p>
                      </div>
                      <div className="p-3.5 rounded-xl bg-amber-50/40 border border-amber-200/80 flex flex-col gap-1">
                        <span className="text-[10px] font-extrabold uppercase text-amber-800">
                          MISSING (4 CRITERIA)
                        </span>
                        <p className="text-xs text-text-secondary">
                          No evidence of React 19, CSS architectures, or UI leadership.
                        </p>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-1">
                        <span className="text-[10px] font-extrabold uppercase text-slate-700">
                          UNKNOWN (NOT PENALIZED)
                        </span>
                        <p className="text-xs text-text-secondary">
                          Information on side projects unconfirmed.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INDIA TECH HUBS BENTO SECTION */}
      <section className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="eyebrow-pill mb-2">GEOGRAPHIC DIVERSITY</span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
              Explore India&apos;s High-Growth Engineering Hubs
            </h2>
            <p className="text-sm text-text-secondary mt-1 max-w-xl">
              From Tier-1 innovation capitals to thriving Tier-2 tech corridors, discover opportunities
              with transparent INR compensation.
            </p>
          </div>
          <Link href="/jobs">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Browse All Cities
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {techHubs.map((hub, idx) => (
            <div
              key={hub.name}
              onClick={() => router.push(`/jobs?location=${encodeURIComponent(hub.name)}`)}
              className={`p-6 rounded-2xl border border-border/80 bg-gradient-to-br ${hub.color} hover:border-primary/50 hover:-translate-y-1 transition-all duration-200 cursor-pointer shadow-xs flex flex-col justify-between`}
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-text-primary">{hub.name}</span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-surface text-primary border border-primary/20">
                    {hub.count}+ Openings
                  </span>
                </div>
                <span className="text-xs font-medium text-text-secondary">{hub.tag}</span>
              </div>
              <div className="pt-4 mt-4 border-t border-border-subtle/80 flex items-center justify-between text-xs">
                <span className="text-text-muted">Typical Range:</span>
                <span className="font-bold text-text-primary">{hub.avg}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED OPPORTUNITIES */}
      <section className="py-16 lg:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full border-t border-border/80">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="eyebrow-pill mb-2">VERIFIED REQUISITIONS</span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
              Featured Engineering Roles
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              Active openings with verified MCA corporate credentials and transparent criteria.
            </p>
          </div>
          <Link href="/jobs">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
              View All Openings
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featuredJobs.map((job) => (
            <Card key={job.id} hoverable className="p-6 flex flex-col justify-between">
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={job.organizationLogo}
                      alt={job.organizationName}
                      className="w-12 h-12 rounded-xl object-cover border border-border shadow-2xs"
                    />
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-text-secondary">
                          {job.organizationName}
                        </span>
                        {job.organizationVerified && (
                          <span title="MCA Verified Employer" className="inline-flex">
                            <ShieldCheck className="w-3.5 h-3.5 text-success" />
                          </span>
                        )}
                      </div>
                      <Link href={`/jobs/${job.slug}`}>
                        <h3 className="text-base font-bold text-text-primary hover:text-primary transition-colors leading-snug mt-0.5">
                          {job.title}
                        </h3>
                      </Link>
                    </div>
                  </div>

                  {job.matchScore && <MatchBadge score={job.matchScore} size="sm" />}
                </div>

                <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                  {job.summary}
                </p>

                <div className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
                  <span className="font-bold text-text-primary">
                    {formatSalaryRange(job.minSalaryINR, job.maxSalaryINR, job.salaryPeriod)}
                  </span>
                  <span>•</span>
                  <span>{job.location}</span>
                  <span>•</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-background-alt text-[11px] font-semibold border border-border">
                    {job.workMode}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {job.mustHaveSkills.slice(0, 4).map((skill) => (
                    <span
                      key={skill}
                      className="text-[11px] font-medium px-2.5 py-0.5 rounded-md bg-surface border border-border text-text-secondary"
                    >
                      {skill}
                    </span>
                  ))}
                  {job.mustHaveSkills.length > 4 && (
                    <span className="text-[11px] text-text-muted px-1.5 py-0.5">
                      +{job.mustHaveSkills.length - 4} more
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-5 mt-5 border-t border-border-subtle flex items-center justify-between">
                <span className="text-[11px] text-text-muted">
                  Posted {formatRelativeTime(job.publishedAt)}
                </span>
                <Link href={`/jobs/${job.slug}`}>
                  <Button size="sm" variant="primary">
                    Explore Match
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ARCHITECTURAL PILLARS */}
      <section id="how-it-works" className="py-20 bg-surface border-y border-border/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="eyebrow-pill mb-2">THE THREE PILLARS</span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-text-primary mt-2">
              Explainable matching. Zero guesswork.
            </h2>
            <p className="text-sm text-text-secondary mt-3 leading-relaxed">
              Traditional job portals rely on crude keyword filters or opaque ranking algorithms. TAG
              structures every skill requirement and citation into verifiable evidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-7 rounded-3xl bg-background border border-border flex flex-col gap-4 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-primary-soft text-primary flex items-center justify-center font-bold">
                <FileSearch className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-text-primary">1. Structured Candidate Profiles</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Upload your resume in seconds. Our parsing engine extracts your experience into verified blocks.
                You retain 100% control to review, edit, or reject extracted fields before saving.
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-background border border-border flex flex-col gap-4 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-primary-soft text-primary flex items-center justify-center font-bold">
                <Scale className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-text-primary">2. Explainable Evidence Breakdown</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                See exact criteria alignment across Matched, Missing, and Unknown criteria. Unknown is never
                treated as failure. You always know why an opportunity fits.
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-background border border-border flex flex-col gap-4 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-primary-soft text-primary flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-text-primary">3. Verified Employer Pipelines</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Every employer is legally verified with MCA registration and GST certificates. Directly collaborate
                with hiring managers without staffing agencies or recruiter spam.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST & RESPONSIBLE AUTOMATION DARK BANNER */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-[#0A241F] text-white p-8 sm:p-12 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-10 shadow-2xl border border-white/10">
          <div className="flex flex-col gap-4 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 text-emerald-400 text-xs font-semibold border border-slate-700 w-fit">
              <Lock className="w-3.5 h-3.5" />
              <span>Responsible AI Governance</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              AI should assist, never make unilateral hiring decisions.
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              TAG adheres to strict responsible AI principles: explainable match evidence citations,
              candidate consent on extracted profile data, and mandatory human accountability in recruiter
              shortlists.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center gap-2 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>No automated rejections</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Immutable audit logs</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Strict candidate privacy</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0">
            <Link href="/sign-up?role=candidate">
              <Button size="lg" className="w-full sm:w-auto shadow-lg">
                Candidate Sign Up
              </Button>
            </Link>
            <Link href="/sign-up?role=employer">
              <Button
                size="lg"
                variant="secondary"
                className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white border-slate-700 shadow-lg"
              >
                Employer Onboarding
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
