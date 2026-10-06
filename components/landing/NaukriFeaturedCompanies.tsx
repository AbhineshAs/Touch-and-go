"use client";

import React from "react";
import { ShieldCheck, Star, ExternalLink } from "lucide-react";

export function NaukriFeaturedCompanies() {
  const sponsors = [
    {
      name: "WhiteTrack Technologies",
      url: "https://www.whitetracktech.com",
      rating: "4.8",
      reviews: "1.4k+ Reviews",
      type: "Official Sponsor",
      desc: "Enterprise Cloud, Microservices & Software Architecture",
      openings: "8 Active Roles",
      location: "Bengaluru & Global",
      tech: ["Cloud Infra", "Full Stack", "DevOps", "Java"],
    },
    {
      name: "WhiteAurax",
      url: "https://www.whiteaurax.com",
      rating: "4.9",
      reviews: "980+ Reviews",
      type: "Official Sponsor",
      desc: "Cutting-Edge AI, LLM Orchestration & Digital Transformation",
      openings: "6 Active Roles",
      location: "Gurgaon & Remote",
      tech: ["Python", "PyTorch", "React 19", "RAG"],
    },
    {
      name: "Zynorix Global",
      url: "https://zynorixglobal.com",
      rating: "4.7",
      reviews: "2.1k+ Reviews",
      type: "Official Sponsor",
      desc: "Global Tech Consulting, Enterprise Integration & Advisory",
      openings: "10 Active Roles",
      location: "Mumbai & Remote",
      tech: ["Go", "Next.js", "AWS", "Kafka"],
    },
    {
      name: "Techcy Routes",
      url: "https://www.whitetracktech.com",
      rating: "4.8",
      reviews: "750+ Reviews",
      type: "Official Sponsor",
      desc: "Talent Mobility, Career Pathways & Engineering Acceleration",
      openings: "5 Active Roles",
      location: "Bengaluru & NCR",
      tech: ["Frontend", "Backend", "Product", "QA"],
    },
  ];

  return (
    <section className="py-16 lg:py-24 bg-[#F8FAFC] text-slate-900 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700 mb-3 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>TOP HIRING EMPLOYERS IN INDIA</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-3">
            Featured companies <span className="text-blue-600">actively hiring today</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Apply directly to openings at verified sponsors and top enterprise leaders.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sponsors.map((c, idx) => (
            <a
              key={idx}
              href={c.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white border border-slate-200/90 rounded-2xl p-6 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between group shadow-2xs"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-black text-base flex items-center justify-center shadow-xs">
                    {c.name.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-blue-600" />
                    <span>{c.type}</span>
                  </span>
                </div>

                <h3 className="font-extrabold text-base text-slate-900 group-hover:text-blue-600 transition-colors mb-1">
                  {c.name}
                </h3>

                <div className="flex items-center gap-2 text-xs mb-3">
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{c.rating}</span>
                  </div>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500 text-[11px] font-medium">{c.reviews}</span>
                </div>

                <p className="text-xs text-slate-600 mb-4 line-clamp-2">{c.desc}</p>

                <div className="text-xs font-mono font-bold text-blue-600 mb-4">{c.openings}</div>

                <div className="flex flex-wrap gap-1.5">
                  {c.tech.map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded text-[10px] bg-slate-100 border border-slate-200 text-slate-700 font-medium">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-6 flex items-center justify-between text-xs font-bold text-blue-600 group-hover:text-blue-700">
                <span>View Company Jobs</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
