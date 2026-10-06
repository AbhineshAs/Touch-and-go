"use client";

import React from "react";
import Link from "next/link";
import { Briefcase, MapPin, Zap, ArrowRight, Clock } from "lucide-react";

export function NaukriJobGrid() {
  const jobs = [
    {
      title: "Senior Full-Stack Engineer (Next.js 16 & Node)",
      company: "WhiteTrack Technologies",
      url: "https://www.whitetracktech.com",
      location: "Bengaluru, KA",
      ctc: "₹28,00,000 - ₹36,00,000 / yr",
      exp: "4-7 Yrs",
      posted: "1 day ago",
      tags: ["React 19", "Next.js", "Node.js", "PostgreSQL"],
    },
    {
      title: "Lead AI & LLM Systems Engineer",
      company: "WhiteAurax",
      url: "https://www.whiteaurax.com",
      location: "Gurgaon / Remote",
      ctc: "₹38,00,000 - ₹50,00,000 / yr",
      exp: "5-9 Yrs",
      posted: "2 hours ago",
      tags: ["Python", "PyTorch", "LangChain", "Vector DB"],
    },
    {
      title: "Staff Cloud Architect (Kubernetes & Go)",
      company: "Zynorix Global",
      url: "https://zynorixglobal.com",
      location: "Mumbai, MH",
      ctc: "₹42,00,000 - ₹60,00,000 / yr",
      exp: "8+ Yrs",
      posted: "3 hours ago",
      tags: ["Go", "AWS", "Kubernetes", "Microservices"],
    },
    {
      title: "Backend Microservices Specialist",
      company: "Techcy Routes",
      url: "https://www.whitetracktech.com",
      location: "Bengaluru / Remote",
      ctc: "₹22,00,000 - ₹32,00,000 / yr",
      exp: "3-6 Yrs",
      posted: "Today",
      tags: ["Node.js", "PostgreSQL", "Kafka", "Docker"],
    },
  ];

  return (
    <section className="py-16 lg:py-24 bg-[#F8FAFC] text-slate-900 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700 mb-3 shadow-xs">
              <Zap className="w-3.5 h-3.5 text-blue-600" />
              <span>DAILY FEATURED ROLES</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Recommended jobs <span className="text-blue-600">for you</span>
            </h2>
          </div>
          <Link href="/jobs" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
            View all 1,420+ active jobs <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {jobs.map((j, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200/90 rounded-2xl p-6 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between shadow-2xs"
            >
              <div>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h3 className="font-extrabold text-base sm:text-lg text-slate-900 mb-1 hover:text-blue-600 transition-colors">
                      {j.title}
                    </h3>
                    <a
                      href={j.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-blue-600 hover:underline inline-block"
                    >
                      {j.company} ↗
                    </a>
                  </div>
                  <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 shrink-0">
                    {j.ctc}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 mb-4 font-medium">
                  <div className="flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                    <span>{j.exp}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <span>{j.location}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400 font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{j.posted}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-6">
                  {j.tags.map((t) => (
                    <span key={t} className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-semibold text-slate-700">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-mono text-blue-700 font-semibold">100% Verified Employer</span>
                <Link href="/sign-up?role=candidate">
                  <button className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer">
                    <Zap className="w-3.5 h-3.5" />
                    <span>1-Touch Apply</span>
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
