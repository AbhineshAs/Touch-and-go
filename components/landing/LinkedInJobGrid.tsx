"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, MapPin, Briefcase, Zap } from "lucide-react";

export function LinkedInJobGrid() {
  const cities = [
    { name: "Bengaluru", roles: "520+ Roles", growth: "+18% active" },
    { name: "Gurgaon / NCR", roles: "380+ Roles", growth: "+14% active" },
    { name: "Mumbai", roles: "290+ Roles", growth: "+12% active" },
    { name: "Hyderabad", roles: "240+ Roles", growth: "+15% active" },
    { name: "Remote India", roles: "450+ Roles", growth: "+22% active" },
  ];

  const featuredRoles = [
    {
      title: "Senior Full-Stack Engineer (Next.js & Node)",
      company: "Razorwave Technologies",
      location: "Bengaluru",
      ctc: "₹28 - ₹36 LPA",
      type: "Full-Time",
      skills: ["React 19", "Next.js", "Node.js", "PostgreSQL"],
    },
    {
      title: "Lead AI Systems Engineer (LLM & RAG)",
      company: "CloudScale AI",
      location: "Gurgaon / Remote",
      ctc: "₹38 - ₹50 LPA",
      type: "Full-Time",
      skills: ["Python", "PyTorch", "LangChain", "Vector DB"],
    },
    {
      title: "Staff Cloud Architect (Kubernetes & Go)",
      company: "BharatData Systems",
      location: "Mumbai",
      ctc: "₹42 - ₹60 LPA",
      type: "Full-Time",
      skills: ["Go", "AWS", "Kubernetes", "Microservices"],
    },
  ];

  return (
    <section className="py-16 lg:py-24 bg-white text-slate-900 border-b border-black/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Suggested Job Searches &amp; Hiring Hubs in India
            </h2>
            <p className="text-sm text-slate-600 mt-1">Explore trending opportunities updated daily</p>
          </div>
          <Link href="/jobs" className="text-xs font-bold text-[#0A66C2] hover:underline flex items-center gap-1">
            <span>View all 1,420+ roles</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* City Hotspots */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
          {cities.map((city, idx) => (
            <Link
              key={idx}
              href={`/jobs?loc=${encodeURIComponent(city.name)}`}
              className="p-4 rounded-xl bg-slate-50 border border-black/10 hover:border-[#0A66C2] hover:bg-[#EDF3F8] transition-all group"
            >
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                <MapPin className="w-3.5 h-3.5 text-[#0A66C2]" />
                <span>India Hub</span>
              </div>
              <div className="font-bold text-sm text-slate-900 group-hover:text-[#0A66C2] transition-colors">
                {city.name}
              </div>
              <div className="text-xs font-semibold text-[#0A66C2] mt-1 font-mono">{city.roles}</div>
            </Link>
          ))}
        </div>

        {/* Featured Openings Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {featuredRoles.map((role, idx) => (
            <div
              key={idx}
              className="linkedin-card p-6 flex flex-col justify-between hover:border-[#0A66C2]/60 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#EDF3F8] text-[#0A66C2] border border-[#0A66C2]/20">
                    {role.type}
                  </span>
                  <span className="text-xs font-mono font-extrabold text-slate-900">
                    {role.ctc}
                  </span>
                </div>

                <h4 className="font-extrabold text-base text-slate-900 mb-1">{role.title}</h4>
                <p className="text-xs text-slate-600 mb-4">{role.company} • {role.location}</p>

                <div className="flex flex-wrap gap-1.5 mb-6">
                  {role.skills.map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 border border-black/10 font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <Link href="/sign-up">
                <button className="linkedin-pill-button linkedin-pill-button-filled w-full text-xs py-2.5 flex items-center justify-center gap-1.5 cursor-pointer">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Touch &amp; Go Apply</span>
                </button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
