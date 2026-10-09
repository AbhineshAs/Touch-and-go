"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Calculator, Check, ArrowRight, Building2 } from "lucide-react";

export function LandingMatchSimulator() {
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
        { name: "WhiteTrack Tech", logo: "WT", match: "98%", open: "4 Roles" },
        { name: "WhiteAurax", logo: "WA", match: "95%", open: "2 Roles" },
        { name: "Zynorix Global", logo: "ZG", match: "92%", open: "3 Roles" },
      ],
    },
    backend: {
      title: "Backend & Microservices Lead",
      skills: ["Node.js", "Go", "PostgreSQL", "Kafka", "Docker & K8s"],
      midCTC: "₹20 - ₹28 LPA",
      seniorCTC: "₹30 - ₹42 LPA",
      leadCTC: "₹45 - ₹65 LPA",
      companies: [
        { name: "Zynorix Global", logo: "ZG", match: "98%", open: "4 Roles" },
        { name: "WhiteTrack Tech", logo: "WT", match: "96%", open: "2 Roles" },
        { name: "Techcy Routes", logo: "TR", match: "91%", open: "1 Role" },
      ],
    },
    ai: {
      title: "AI / LLM Systems Engineer",
      skills: ["Python", "PyTorch", "LangChain", "Vector DBs", "Model Fine-Tuning"],
      midCTC: "₹24 - ₹34 LPA",
      seniorCTC: "₹36 - ₹52 LPA",
      leadCTC: "₹55 - ₹80 LPA",
      companies: [
        { name: "WhiteAurax", logo: "WA", match: "99%", open: "3 Roles" },
        { name: "WhiteTrack Tech", logo: "WT", match: "96%", open: "2 Roles" },
        { name: "Zynorix Global", logo: "ZG", match: "94%", open: "1 Role" },
      ],
    },
    product: {
      title: "Tech Product Manager",
      skills: ["Product Roadmap", "User Analytics", "A/B Testing", "Agile / Scrum", "SQL"],
      midCTC: "₹22 - ₹30 LPA",
      seniorCTC: "₹32 - ₹45 LPA",
      leadCTC: "₹48 - ₹70 LPA",
      companies: [
        { name: "Techcy Routes", logo: "TR", match: "97%", open: "2 Roles" },
        { name: "WhiteTrack Tech", logo: "WT", match: "93%", open: "1 Role" },
        { name: "WhiteAurax", logo: "WA", match: "90%", open: "2 Roles" },
      ],
    },
  };

  const current = roleConfigs[role];
  const currentCTC = exp === "mid" ? current.midCTC : exp === "senior" ? current.seniorCTC : current.leadCTC;

  return (
    <section className="py-16 sm:py-24 bg-[#F8FAFC] text-slate-900 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700 mb-3 shadow-xs">
            <Calculator className="w-3.5 h-3.5 text-blue-600" />
            <span>INTERACTIVE SALARY &amp; MATCH CALCULATOR</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            Explore your market <span className="text-blue-600">CTC benchmark</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Select your specialization and experience tier to calculate live market CTC ranges and matching partner roles in India.
          </p>
        </div>

        {/* Calculator Filter Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 mb-8 grid lg:grid-cols-12 gap-6 items-center shadow-xs">
          <div className="lg:col-span-4 space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              1. Specialization
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 font-semibold text-sm rounded-xl p-3 focus:outline-hidden focus:border-blue-600 cursor-pointer"
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
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setExp("mid")}
                className={`flex-1 py-2 font-bold text-xs rounded-lg transition-colors cursor-pointer ${
                  exp === "mid" ? "bg-white text-blue-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                2-4 Years
              </button>
              <button
                onClick={() => setExp("senior")}
                className={`flex-1 py-2 font-bold text-xs rounded-lg transition-colors cursor-pointer ${
                  exp === "senior" ? "bg-white text-blue-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                5-8 Years
              </button>
              <button
                onClick={() => setExp("lead")}
                className={`flex-1 py-2 font-bold text-xs rounded-lg transition-colors cursor-pointer ${
                  exp === "lead" ? "bg-white text-blue-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                8+ Yrs (Lead)
              </button>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              3. Target Tech Hub
            </label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 font-semibold text-sm rounded-xl p-3 focus:outline-hidden focus:border-blue-600 cursor-pointer"
            >
              <option value="Bengaluru">Bengaluru (KA)</option>
              <option value="Gurgaon / NCR">Gurgaon / NCR</option>
              <option value="Mumbai">Mumbai (MH)</option>
              <option value="Remote">Remote (India)</option>
            </select>
          </div>
        </div>

        {/* Results Card Container */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="grid md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-xs font-mono font-bold">
                <span>VERIFIED CTC BENCHMARK ({city.toUpperCase()})</span>
              </div>

              <div>
                <div className="text-3xl sm:text-5xl font-black text-slate-900 font-mono tracking-tight mb-1">
                  {currentCTC}
                </div>
                <p className="text-slate-600 text-sm font-medium">
                  Based on recent verified hiring offers for {current.title} in {city}.
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
                      className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5 text-blue-600" />
                      <span>{skill}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="md:col-span-5 bg-slate-50 border border-slate-200 p-6 rounded-2xl space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 border-b border-slate-200 pb-3">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span>TOP MATCHING COMPANIES</span>
                </span>
                <span className="text-blue-700 font-mono">3 Active</span>
              </div>

              <div className="space-y-3">
                {current.companies.map((c, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 hover:border-blue-400 transition-colors shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 font-bold text-xs flex items-center justify-center">
                        {c.logo}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900">{c.name}</div>
                        <div className="text-[10px] text-slate-500 font-medium">{c.open}</div>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {c.match} Match
                    </span>
                  </div>
                ))}
              </div>

              <Link href="/sign-up" className="block pt-2">
                <button className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer">
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
