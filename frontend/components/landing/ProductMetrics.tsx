"use client";

import React from "react";
import { Users, Building2, Target, TrendingUp, ShieldCheck, CheckCircle2 } from "lucide-react";

export function ProductMetrics() {
  const metrics = [
    {
      value: "50,000+",
      label: "Tech Professionals",
      subLabel: "Pre-vetted engineering & product talent",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50 border-blue-200",
    },
    {
      value: "1,200+",
      label: "Verified Employers",
      subLabel: "Top tech startups & MNCs across India",
      icon: Building2,
      color: "text-indigo-600",
      bg: "bg-indigo-50 border-indigo-200",
    },
    {
      value: "96.4%",
      label: "Match Accuracy",
      subLabel: "Explainable multi-vector AI scoring",
      icon: Target,
      color: "text-emerald-600",
      bg: "bg-emerald-50 border-emerald-200",
    },
    {
      value: "₹34.2 LPA",
      label: "Average Matched CTC",
      subLabel: "Transparent upfront compensation",
      icon: TrendingUp,
      color: "text-amber-600",
      bg: "bg-amber-50 border-amber-200",
    },
  ];

  return (
    <section className="py-16 bg-slate-900 text-white relative border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {metrics.map((m, idx) => {
            const Icon = m.icon;
            return (
              <div
                key={idx}
                className="bg-slate-800/80 border border-slate-700/80 p-6 rounded-3xl shadow-xl hover:border-slate-600 transition-all flex flex-col justify-between group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl ${m.bg} border flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}>
                    <Icon className={`w-6 h-6 ${m.color}`} />
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                </div>

                <div>
                  <div className="text-3xl sm:text-4xl font-black tracking-tight font-mono text-white mb-1">
                    {m.value}
                  </div>
                  <div className="text-sm font-extrabold text-slate-200 mb-1">{m.label}</div>
                  <div className="text-xs text-slate-400 font-medium">{m.subLabel}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Marketplace Activity Ticker */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-300">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span>LIVE MATCH STREAM:</span>
            <span className="text-emerald-400 font-mono">Senior React Lead matched with Techcy Routes • ₹38 LPA</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400 font-semibold">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>Verified Partner Network · WhiteTrack Technologies</span>
          </div>
        </div>
      </div>
    </section>
  );
}
