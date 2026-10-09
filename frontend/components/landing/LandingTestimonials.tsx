"use client";

import React from "react";
import { Star, Award } from "lucide-react";

export function LandingTestimonials() {
  const testimonials = [
    {
      quote:
        "TAG eliminated recruiter spam completely. I created my profile, ran a Touch & Go match, and landed a Lead React role at WhiteTrack Technologies with a 45% hike in 4 days.",
      author: "Aditya S.",
      title: "Senior Full-Stack Engineer, Bengaluru",
      hike: "+45% CTC Hike",
      rating: 5,
    },
    {
      quote:
        "As an engineering director, sifting through 500 irrelevant resumes was a nightmare. TAG's shortlisting gave us 5 pre-vetted candidates with 95%+ criteria overlap.",
      author: "Meera Nair",
      title: "VP of Engineering, WhiteAurax",
      hike: "3 Senior Hires in 1 Wk",
      rating: 5,
    },
    {
      quote:
        "The salary transparency and instant interview scheduling at Zynorix Global are game changers. You know exactly what CTC to expect before walking into an interview.",
      author: "Rohan Kapoor",
      title: "Staff Cloud Architect, Gurgaon",
      hike: "₹42 LPA Offer",
      rating: 5,
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-[#F8FAFC] text-slate-900 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700 mb-3 shadow-xs">
            <Award className="w-3.5 h-3.5 text-blue-600" />
            <span>COMMUNITY TESTIMONIALS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            Loved by candidates &amp; <span className="text-blue-600">hiring managers</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            See how Touch And Go is transforming tech recruitment across India.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                    {t.hike}
                  </span>
                </div>

                <p className="text-sm text-slate-700 leading-relaxed italic mb-6">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <div className="font-extrabold text-sm text-slate-900">{t.author}</div>
                <div className="text-xs text-slate-500 font-medium">{t.title}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
