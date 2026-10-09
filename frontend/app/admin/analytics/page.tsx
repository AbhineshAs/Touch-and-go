"use client";

import React from "react";
import { Card, MetricCard } from "@/components/ui/Card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { ShieldCheck, Users, Briefcase, Sparkles, TrendingUp } from "lucide-react";

const CITY_DISTRIBUTION = [
  { city: "Bengaluru", candidates: 540, employers: 24 },
  { city: "Hyderabad", candidates: 320, employers: 12 },
  { city: "Pune", candidates: 210, employers: 8 },
  { city: "Chennai", candidates: 180, employers: 6 },
  { city: "Kochi", candidates: 95, employers: 4 },
  { city: "Remote", candidates: 420, employers: 18 },
];

export default function AdminAnalyticsPage() {
  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-8 pb-16">
      <div className="flex flex-col gap-1 pb-4 border-b border-border">
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          Marketplace Liquidity & Metrics
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary">
          System-wide performance indicators, candidate profile completion rates, and regional tech hub depth.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Profile Completion Rate"
          value="74.2%"
          icon={<Users className="w-5 h-5 text-primary" />}
          change="+4.1% MoM"
          changeType="positive"
        />
        <MetricCard
          label="Verification Turnaround"
          value="14 Hours"
          icon={<ShieldCheck className="w-5 h-5 text-primary" />}
          subtitle="Target: under 24 hrs"
        />
        <MetricCard
          label="Recommendation Relevance"
          value="82.6%"
          icon={<Sparkles className="w-5 h-5 text-primary" />}
          change="Calibrated weekly"
          changeType="positive"
        />
        <MetricCard
          label="Avg Jobs per Employer"
          value="3.4"
          icon={<Briefcase className="w-5 h-5 text-primary" />}
          change="+0.8 MoM"
          changeType="positive"
        />
      </div>

      {/* Regional Indian Tech Hub Depth */}
      <Card className="p-6 bg-surface border-border flex flex-col gap-4">
        <div className="pb-2 border-b border-border-subtle">
          <h2 className="text-base font-bold text-text-primary">Regional Talent Distribution (India)</h2>
          <p className="text-xs text-text-muted">Active candidate profiles across primary technology clusters</p>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={CITY_DISTRIBUTION} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E7EC" />
              <XAxis dataKey="city" tick={{ fontSize: 11, fill: "#475467" }} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#475467" }} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: "8px",
                  border: "1px solid #E4E7EC",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="candidates" fill="#4F46E5" radius={[4, 4, 0, 0]} name="Verified Candidates" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
