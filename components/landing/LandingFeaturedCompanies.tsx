"use client";

import React from "react";
import { ShieldCheck, ExternalLink, ArrowRight } from "lucide-react";

export function LandingFeaturedCompanies() {
  const companies = [
    {
      name: "WhiteTrack Technologies",
      url: "https://www.whitetracktech.com",
      stage: "Enterprise • Cloud Solutions",
      location: "India & Global",
      roles: "8 Active Roles",
      tech: ["Cloud Infra", "Full Stack", "DevOps", "Cybersecurity"],
      badge: "Official Sponsor",
    },
    {
      name: "WhiteAurax",
      url: "https://www.whiteaurax.com",
      stage: "Growth • AI Transformation",
      location: "India & Remote",
      roles: "6 Active Roles",
      tech: ["AI Agents", "Python", "React 19", "LLMs"],
      badge: "Official Sponsor",
    },
    {
      name: "Zynorix Global",
      url: "https://zynorixglobal.com",
      stage: "Global • Tech Consulting",
      location: "India & Worldwide",
      roles: "10 Active Roles",
      tech: ["Next.js", "Node.js", "Microservices", "AWS"],
      badge: "Official Sponsor",
    },
    {
      name: "Techcy Routes",
      url: "https://www.whitetracktech.com",
      stage: "Innovative • Talent Pathways",
      location: "India Hubs",
      roles: "5 Active Roles",
      tech: ["Frontend", "Backend", "Product Ops", "QA Automation"],
      badge: "Official Sponsor",
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-[#0B0F19] text-white border-t border-indigo-900/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-950 border border-indigo-700 text-xs font-bold text-sky-400 mb-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>OFFICIAL SPONSORS &amp; VERIFIED NETWORK</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-4">
            Hiring at our official <span className="text-sky-400">sponsors &amp; partners</span>
          </h2>
          <p className="text-base sm:text-lg text-sky-200/80">
            Apply directly to openings at WhiteTrack Technologies, WhiteAurax, Zynorix Global, and Techcy Routes.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {companies.map((c, i) => (
            <a
              key={i}
              href={c.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#1E293B] border border-indigo-800 rounded-2xl p-6 hover:border-sky-400 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-sky-500 text-white font-extrabold text-sm flex items-center justify-center shadow-md">
                    {c.name.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="text-[10px] font-mono font-bold text-sky-300 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-sky-400" />
                    <span>{c.badge}</span>
                  </span>
                </div>

                <h4 className="font-extrabold text-base text-white group-hover:text-sky-300 transition-colors mb-1">
                  {c.name}
                </h4>
                <p className="text-xs text-sky-300/80 mb-3">{c.stage} • {c.location}</p>

                <div className="text-xs font-bold text-sky-400 font-mono mb-4">{c.roles}</div>

                <div className="flex flex-wrap gap-1.5">
                  {c.tech.map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded text-[10px] bg-[#0F172A] text-sky-200 border border-indigo-800">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-indigo-900 mt-6 flex items-center justify-between text-xs font-bold text-sky-400 group-hover:text-white">
                <span>Visit Sponsor Web</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

