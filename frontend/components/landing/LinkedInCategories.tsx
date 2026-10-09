"use client";

import React from "react";
import Link from "next/link";
import { BookOpen, Briefcase, Building2, ChevronRight, ArrowRight, Check } from "lucide-react";

export function LinkedInCategories() {
  const topics = [
    "React 19 & Next.js 16",
    "AI Agents & LLM Fine-Tuning",
    "Microservices & System Design",
    "DevOps & Kubernetes",
    "Product Management",
    "FinTech & High-Frequency Trading",
  ];

  return (
    <section className="py-16 lg:py-24 bg-[#F4F2EE] text-slate-900 border-b border-black/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="linkedin-card p-8 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="w-12 h-12 rounded-full bg-[#EDF3F8] text-[#0A66C2] flex items-center justify-center mb-6">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-normal text-slate-900 mb-3 leading-snug">
                Explore collaborative <strong className="font-extrabold">tech articles &amp; guides</strong>
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                We&apos;re unlocking community knowledge so you can master trending skills, system design patterns, and interview prep.
              </p>

              <div className="flex flex-wrap gap-2 mb-6">
                {topics.map((t) => (
                  <span
                    key={t}
                    className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-[#EDF3F8] hover:text-[#0A66C2] text-xs font-semibold text-slate-700 transition-colors cursor-pointer border border-black/10"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <Link href="/about">
              <button className="linkedin-pill-button linkedin-pill-button-outline w-full text-xs flex items-center justify-center gap-2">
                <span>Browse All Topics</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </Link>
          </div>

          {/* Card 2 */}
          <div className="linkedin-card p-8 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="w-12 h-12 rounded-full bg-[#EDF3F8] text-[#0A66C2] flex items-center justify-center mb-6">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-normal text-slate-900 mb-3 leading-snug">
                Find the right <strong className="font-extrabold">job or opportunity</strong> for you
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                Connect directly with 1,200+ verified hiring companies across Bengaluru, Gurgaon, Mumbai, and Remote India.
              </p>

              <div className="space-y-3 mb-6">
                {[
                  "1-Click Touch & Go Applications",
                  "Verified Salary & CTC Disclosure",
                  "24-Hour Guaranteed Recruiter Response",
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
                    <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link href="/jobs">
              <button className="linkedin-pill-button linkedin-pill-button-filled w-full text-xs flex items-center justify-center gap-2">
                <span>Explore Jobs Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>

          {/* Card 3 */}
          <div className="linkedin-card p-8 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="w-12 h-12 rounded-full bg-[#EDF3F8] text-[#0A66C2] flex items-center justify-center mb-6">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-normal text-slate-900 mb-3 leading-snug">
                Post your job for <strong className="font-extrabold">pre-vetted candidates</strong>
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                Reach qualified senior developers, DevOps leads, and product managers with 95%+ criteria overlap in 24 hours.
              </p>

              <div className="space-y-3 mb-6">
                {[
                  "Automated AI Candidate Shortlisting",
                  "Direct Technical Interview Scheduling",
                  "Structured Team Evaluation Pipeline",
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
                    <div className="w-4 h-4 rounded-full bg-[#EDF3F8] text-[#0A66C2] flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link href="/sign-up?role=employer">
              <button className="linkedin-pill-button linkedin-pill-button-outline w-full text-xs flex items-center justify-center gap-2">
                <span>Post a Job for Free</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
