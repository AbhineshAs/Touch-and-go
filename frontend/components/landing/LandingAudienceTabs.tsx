"use client";

import React, { useState } from "react";
import Link from "next/link";
import { UserCheck, Building2, CheckCircle2, Zap, ArrowRight } from "lucide-react";

export function LandingAudienceTabs() {
  const [tab, setTab] = useState<"candidate" | "employer">("candidate");

  const candidateFeatures = [
    {
      title: "1-Click Touch & Go Applications",
      description:
        "No redundant forms. Create your structured candidate profile once and apply to top tech roles in India with a single tap.",
      badge: "ZERO FRICTION",
    },
    {
      title: "Transparent AI Match Scores",
      description:
        "Understand exactly why you match with a position (Skill overlap, salary expectations, tech stack alignment) before you apply.",
      badge: "EXPLAINABLE AI",
    },
    {
      title: "Guaranteed Recruiter Feedback",
      description:
        "Say goodbye to ghosting. Employers on TAG operate under a 24-hour SLA to review and respond to qualified candidate matches.",
      badge: "NO GHOSTING SLA",
    },
    {
      title: "Verified Salary Transparency",
      description:
        "Every job posting includes guaranteed CTC compensation ranges (e.g. ₹24 - ₹36 LPA) so you never waste time guessing.",
      badge: "FULL CTC DISCLOSURE",
    },
  ];

  const employerFeatures = [
    {
      title: "Pre-Vetted Engineering Talent Pool",
      description:
        "Access verified senior developers, DevOps specialists, and product managers across Bengaluru, NCR, Mumbai, and Remote India.",
      badge: "TOP 5% TALENT",
    },
    {
      title: "Automated AI Candidate Shortlisting",
      description:
        "Save 20+ recruiter hours per week. Our AI algorithms evaluate candidate profiles against your criteria and score matches instantly.",
      badge: "AI SHORTLISTING",
    },
    {
      title: "24-Hour Time to First Interview",
      description:
        "Schedule technical interviews directly with interested candidates without intermediate phone tag delays.",
      badge: "RAPID PIPELINE",
    },
    {
      title: "Collaborative Hiring & Verification",
      description:
        "Share applicant evaluation scorecards, conduct structured feedback sessions, and verify employer badges with your team.",
      badge: "TEAM SHELL",
    },
  ];

  const currentFeatures = tab === "candidate" ? candidateFeatures : employerFeatures;

  return (
    <section id="features" className="py-20 lg:py-28 bg-[#0F172A] text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-950 border border-indigo-700 text-xs font-bold text-sky-400 mb-4">
            <Zap className="w-3.5 h-3.5" />
            <span>THE RECRUITMENT REVOLUTION</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-4">
            Built for <span className="text-sky-400">both sides</span> of tech hiring
          </h2>
          <p className="text-base sm:text-lg text-sky-200/80">
            Whether you&apos;re looking for your next career breakthrough or building an engineering team, Touch And Go makes hiring fast, transparent, and seamless.
          </p>
        </div>

        <div className="flex justify-center mb-12">
          <div className="inline-flex p-1.5 rounded-2xl bg-[#0B0F19] border border-indigo-800">
            <button
              onClick={() => setTab("candidate")}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-extrabold text-sm transition-all cursor-pointer ${
                tab === "candidate"
                  ? "bg-sky-400 text-slate-950 shadow-lg shadow-sky-400/20"
                  : "text-sky-200 hover:text-white"
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>For Job Seekers &amp; Candidates</span>
            </button>
            <button
              onClick={() => setTab("employer")}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-extrabold text-sm transition-all cursor-pointer ${
                tab === "employer"
                  ? "bg-sky-400 text-slate-950 shadow-lg shadow-sky-400/20"
                  : "text-sky-200 hover:text-white"
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>For Hiring Companies &amp; Recruiters</span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {currentFeatures.map((item, idx) => (
            <div
              key={idx}
              className="bg-[#1E293B] border border-indigo-800/80 rounded-3xl p-8 hover:border-sky-400/50 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-md bg-indigo-950 text-sky-300 border border-indigo-800">
                    {item.badge}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-indigo-900 text-sky-300 flex items-center justify-center font-bold text-xs">
                    0{idx + 1}
                  </div>
                </div>

                <h3 className="text-xl font-extrabold text-white mb-3 group-hover:text-sky-300 transition-colors">
                  {item.title}
                </h3>
                <p className="text-sky-100/80 text-sm leading-relaxed mb-6">
                  {item.description}
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-sky-400 pt-4 border-t border-indigo-900">
                <CheckCircle2 className="w-4 h-4" />
                <span>Verified TAG Feature</span>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link href={tab === "candidate" ? "/jobs" : "/sign-up?role=employer"}>
            <button className="px-8 py-4 rounded-2xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-extrabold text-base shadow-xl inline-flex items-center gap-2 transition-all cursor-pointer">
              <span>{tab === "candidate" ? "Explore Jobs & Get Matched" : "Publish a Role on TAG"}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
