"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Compass, X } from "lucide-react";

export function LandingStickyBar() {
  const [isVisible, setIsVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400 && !dismissed) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [dismissed]);

  if (!isVisible || dismissed) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4 transition-all">
      <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 p-3.5 rounded-2xl shadow-xl flex items-center justify-between gap-4 text-slate-900">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
            <Compass className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-xs text-slate-900">Ready for 1-Touch Job Matching?</h4>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                1,420+ Live Jobs
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block font-medium">
              Explore verified engineering &amp; product roles with transparent CTC across India.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link href="/sign-up?role=candidate">
            <button className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer">
              <span>Instant Match</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
