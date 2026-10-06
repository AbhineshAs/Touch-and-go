"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, Check, ArrowRight, Zap } from "lucide-react";

export function LinkedInMatchCalculator() {
  const [role, setRole] = useState<"frontend" | "backend" | "ai" | "product">("frontend");
  const [exp, setExp] = useState<"mid" | "senior" | "lead">("senior");
  const [city, setCity] = useState("Bengaluru");

  const roleConfigs = {
    frontend: {
      title: "Senior React & Next.js Engineer",
      skills: ["Next.js 16", "React 19", "TypeScript", "TailwindCSS", "Web Vitals"],
      midCTC: "₹18 - ₹26 LPA",
      seniorCTC: "₹28 - ₹38 LPA",
      leadCTC: "₹40 - ₹55 LPA",
      companies: [
        { name: "Razorwave Tech", logo: "RT", match: "96%", open: "2 Roles" },
        { name: "CloudScale AI", logo: "CS", match: "94%", open: "1 Role" },
        { name: "FinTech Next", logo: "FN", match: "92%", open: "3 Roles" },
      ],
    },
    backend: {
      title: "Backend & Microservices Lead",
      skills: ["Node.js", "Go", "PostgreSQL", "Kafka", "Docker & K8s"],
      midCTC: "₹20 - ₹28 LPA",
      seniorCTC: "₹30 - ₹42 LPA",
      leadCTC: "₹45 - ₹65 LPA",
      companies: [
        { name: "BharatData Systems", logo: "BD", match: "98%", open: "4 Roles" },
        { name: "Apex Cyber", logo: "AC", match: "95%", open: "2 Roles" },
        { name: "Razorwave Tech", logo: "RT", match: "91%", open: "1 Role" },
      ],
    },
    ai: {
      title: "AI / LLM Systems Engineer",
      skills: ["Python", "PyTorch", "LangChain", "Vector DBs", "Model Fine-Tuning"],
      midCTC: "₹24 - ₹34 LPA",
      seniorCTC: "₹36 - ₹52 LPA",
      leadCTC: "₹55 - ₹80 LPA",
      companies: [
        { name: "CloudScale AI", logo: "CS", match: "99%", open: "3 Roles" },
        { name: "Apex Cyber", logo: "AC", match: "96%", open: "2 Roles" },
        { name: "FinTech Next", logo: "FN", match: "94%", open: "1 Role" },
      ],
    },
    product: {
      title: "Tech Product Manager",
      skills: ["Product Roadmap", "User Analytics", "A/B Testing", "Agile / Scrum", "SQL"],
      midCTC: "₹22 - ₹30 LPA",
      seniorCTC: "₹32 - ₹45 LPA",
      leadCTC: "₹48 - ₹70 LPA",
      companies: [
        { name: "FinTech Next", logo: "FN", match: "97%", open: "2 Roles" },
        { name: "Razorwave Tech", logo: "RT", match: "93%", open: "1 Role" },
        { name: "BharatData Systems", logo: "BD", match: "90%", open: "2 Roles" },
      ],
    },
  };

  const current = roleConfigs[role];
  const currentCTC = exp === "mid" ? current.midCTC : exp === "senior" ? current.seniorCTC : current.leadCTC;

  return (
    <section className="py-16 lg:py-24 bg-white text-slate-900 border-b border-black/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EDF3F8] text-[#0A66C2] border border-[#0A66C2]/20 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>INTERACTIVE CAREER &amp; CTC CALCULATOR</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            Calculate your market value &amp; live role matches
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Select your specialization and experience below to calculate benchmark compensation in India.
          </p>
        </div>

        {/* Toolbar Controls */}
        <div className="bg-[#F4F2EE] border border-black/15 rounded-2xl p-6 mb-8 grid lg:grid-cols-12 gap-6 items-center shadow-xs">
          <div className="lg:col-span-4 space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              1. Tech Specialization
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full bg-white border border-black/15 text-slate-900 font-semibold text-sm rounded-xl p-3 focus:outline-hidden cursor-pointer shadow-xs"
            >
              <option value="frontend">Senior Frontend &amp; Next.js</option>
              <option value="backend">Backend &amp; Microservices</option>
              <option value="ai">AI / LLM Engineering</option>
              <option value="product">Tech Product Management</option>
            </select>
          </div>

          <div className="lg:col-span-4 space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              2. Experience Tier
            </label>
            <div className="flex items-center bg-white p-1 rounded-xl border border-black/15 shadow-xs">
              <button
                onClick={() => setExp("mid")}
                className={`flex-1 py-2 font-bold text-xs rounded-lg transition-colors cursor-pointer ${
                  exp === "mid" ? "bg-[#0A66C2] text-white" : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                2-4 Years
              </button>
              <button
                onClick={() => setExp("senior")}
                className={`flex-1 py-2 font-bold text-xs rounded-lg transition-colors cursor-pointer ${
                  exp === "senior" ? "bg-[#0A66C2] text-white" : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                5-8 Years
              </button>
              <button
                onClick={() => setExp("lead")}
                className={`flex-1 py-2 font-bold text-xs rounded-lg transition-colors cursor-pointer ${
                  exp === "lead" ? "bg-[#0A66C2] text-white" : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                8+ Years (Lead)
              </button>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              3. Target Hub
            </label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-white border border-black/15 text-slate-900 font-semibold text-sm rounded-xl p-3 focus:outline-hidden cursor-pointer shadow-xs"
            >
              <option value="Bengaluru">Bengaluru (KA)</option>
              <option value="Gurgaon / NCR">Gurgaon / NCR</option>
              <option value="Mumbai">Mumbai (MH)</option>
              <option value="Remote">Remote (India)</option>
            </select>
          </div>
        </div>

        {/* Live Calculation Output Card */}
        <div className="linkedin-card p-6 sm:p-10 shadow-xs">
          <div className="grid md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#EDF3F8] text-[#0A66C2] border border-[#0A66C2]/20 text-xs font-mono">
                <span>ESTIMATED CTC BENCHMARK ({city})</span>
              </div>

              <div>
                <div className="text-3xl sm:text-5xl font-black text-[#0A66C2] font-mono tracking-tight mb-2">
                  {currentCTC}
                </div>
                <p className="text-slate-600 text-sm">
                  Based on recent verified hiring benchmarks for {current.title} in {city}.
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Required Core Tech Skills
                </div>
                <div className="flex flex-wrap gap-2">
                  {current.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 border border-black/10 text-xs font-semibold text-slate-800 flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5 text-[#0A66C2]" />
                      <span>{skill}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="md:col-span-5 bg-[#F4F2EE] border border-black/15 p-6 rounded-2xl space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 border-b border-black/10 pb-3">
                <span>TOP MATCHING COMPANIES</span>
                <span className="text-[#0A66C2] font-mono">3 Active</span>
              </div>

              <div className="space-y-3">
                {current.companies.map((c, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-xl bg-white border border-black/10 hover:border-[#0A66C2] transition-colors shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#0A66C2] text-white font-bold text-xs flex items-center justify-center">
                        {c.logo}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900">{c.name}</div>
                        <div className="text-[10px] text-slate-500">{c.open}</div>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#0A66C2] bg-[#EDF3F8] px-2 py-0.5 rounded border border-[#0A66C2]/20">
                      {c.match} Match
                    </span>
                  </div>
                ))}
              </div>

              <Link href="/sign-up" className="block pt-2">
                <button className="linkedin-pill-button linkedin-pill-button-filled w-full text-xs py-3 flex items-center justify-center gap-2 cursor-pointer">
                  <span>View All Matching Roles</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
