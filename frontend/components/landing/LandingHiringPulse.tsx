"use client";

import React from "react";
import Link from "next/link";
import { TrendingUp, ArrowRight, Zap } from "lucide-react";

export function LandingHiringPulse() {
  const cities = [
    { name: "Bengaluru", roles: "520+ Roles", growth: "+18% this week", icon: "🏙️" },
    { name: "Gurgaon / NCR", roles: "380+ Roles", growth: "+14% this week", icon: "🏢" },
    { name: "Mumbai", roles: "290+ Roles", growth: "+12% this week", icon: "🌊" },
    { name: "Hyderabad", roles: "240+ Roles", growth: "+15% this week", icon: "🕌" },
    { name: "Remote India", roles: "450+ Roles", growth: "+22% this week", icon: "💻" },
  ];

  const featuredRoles = [
    {
      title: "Senior Full-Stack Engineer (Next.js & Node)",
      company: "WhiteTrack Technologies",
      location: "Bengaluru",
      ctc: "₹28 - ₹36 LPA",
      type: "Full-Time",
      skills: ["React 19", "Next.js", "Node.js", "PostgreSQL"],
      url: "https://www.whitetracktech.com",
    },
    {
      title: "Lead AI Systems Engineer (LLM & RAG)",
      company: "WhiteAurax",
      location: "Gurgaon / Remote",
      ctc: "₹38 - ₹50 LPA",
      type: "Full-Time",
      skills: ["Python", "PyTorch", "LangChain", "Vector DB"],
      url: "https://www.whiteaurax.com",
    },
    {
      title: "Staff Cloud Architect (Kubernetes & Go)",
      company: "Zynorix Global",
      location: "Mumbai",
      ctc: "₹42 - ₹60 LPA",
      type: "Full-Time",
      skills: ["Go", "AWS", "Kubernetes", "Microservices"],
      url: "https://zynorixglobal.com",
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-[#0F172A] text-white border-t border-indigo-900/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-950 border border-indigo-700 text-xs font-bold text-sky-400 mb-4">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>DAILY HIRING PULSE IN INDIA</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-4">
            Where tech hiring is <span className="text-sky-400">booming today</span>
          </h2>
          <p className="text-base sm:text-lg text-sky-200/80">
            Real-time insights on active openings, CTC spikes, and top hiring hotspots across India.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-16">
          {cities.map((city, idx) => (
            <Link
              key={idx}
              href={`/jobs?loc=${encodeURIComponent(city.name)}`}
              className="bg-[#1E293B] border border-indigo-800/80 p-4 rounded-2xl hover:border-sky-400 transition-all hover:scale-[1.02] text-left group"
            >
              <div className="text-2xl mb-2">{city.icon}</div>
              <div className="font-extrabold text-sm text-white group-hover:text-sky-300 transition-colors">
                {city.name}
              </div>
              <div className="text-xs font-bold text-sky-400 font-mono mt-1">{city.roles}</div>
              <div className="text-[10px] text-sky-300/60 mt-0.5">{city.growth}</div>
            </Link>
          ))}
        </div>

        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-extrabold text-white">Daily Featured Tech Roles</h3>
            <Link href="/jobs" className="text-xs font-bold text-sky-400 hover:underline flex items-center gap-1">
              View all 1,420+ roles <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {featuredRoles.map((role, idx) => (
              <div
                key={idx}
                className="bg-[#1E293B] border border-indigo-800 rounded-2xl p-6 hover:border-sky-400 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-950 text-sky-300 border border-indigo-800">
                      {role.type}
                    </span>
                    <span className="text-xs font-mono font-black text-sky-400">
                      {role.ctc}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-base text-white mb-1">{role.title}</h4>
                  <p className="text-xs text-sky-300 mb-4">{role.company} • {role.location}</p>

                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {role.skills.map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded text-[10px] bg-[#0F172A] border border-indigo-800 text-sky-200">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <Link href="/sign-up">
                  <button className="w-full py-2.5 rounded-xl font-bold text-xs bg-sky-400 hover:bg-sky-300 text-slate-950 shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Touch &amp; Go Apply</span>
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
