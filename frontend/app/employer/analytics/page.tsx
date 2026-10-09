"use client";

import React from "react";
import { Card, MetricCard } from "@/components/ui/Card";
import { Users, TrendingUp, Clock, CheckCircle2, Award } from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const MONTHLY_APPLICATIONS = [
  { month: "May", applicants: 24, qualified: 16 },
  { month: "Jun", applicants: 38, qualified: 26 },
  { month: "Jul", applicants: 45, qualified: 31 },
  { month: "Aug", applicants: 52, qualified: 39 },
  { month: "Sep", applicants: 43, qualified: 34 },
];

const SOURCE_DATA = [
  { name: "Direct TAG Match", value: 62, color: "#4F46E5" },
  { name: "Company Public Page", value: 24, color: "#2563EB" },
  { name: "Referrals", value: 14, color: "#D97706" },
];

export default function EmployerAnalyticsPage() {
  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-8 pb-16">
      <div className="flex flex-col gap-1 pb-4 border-b border-border">
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          Recruitment Analytics
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary">
          Data-driven pipeline telemetry, criteria alignment distribution, and time-to-hire velocity.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Qualified Match Rate"
          value="78.4%"
          icon={<Award className="w-5 h-5 text-primary" />}
          change="+6.2% vs avg"
          changeType="positive"
        />
        <MetricCard
          label="Average Time to Hire"
          value="18 Days"
          icon={<Clock className="w-5 h-5 text-primary" />}
          change="4 days faster"
          changeType="positive"
        />
        <MetricCard
          label="Offer Acceptance Rate"
          value="87.5%"
          icon={<CheckCircle2 className="w-5 h-5 text-primary" />}
          subtitle="7 of 8 accepted"
        />
        <MetricCard
          label="Recruiter Review SLA"
          value="1.8 Days"
          icon={<TrendingUp className="w-5 h-5 text-primary" />}
          subtitle="Target: under 3 days"
        />
      </div>

      {/* Two Column Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Trend */}
        <Card className="lg:col-span-2 p-6 bg-surface border-border flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
            <div>
              <h2 className="text-base font-bold text-text-primary">Applicant Volume & Qualified Rate</h2>
              <p className="text-xs text-text-muted">Total applications vs candidates scoring &gt;75% alignment</p>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MONTHLY_APPLICATIONS} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E7EC" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#475467" }} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#475467" }} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "8px",
                    border: "1px solid #E4E7EC",
                    fontSize: "12px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="applicants"
                  name="Total Applicants"
                  stroke="#667085"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="qualified"
                  name="Qualified (>75% Match)"
                  stroke="#4F46E5"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Candidate Source Breakdown */}
        <Card className="p-6 bg-surface border-border flex flex-col justify-between gap-4">
          <div className="pb-2 border-b border-border-subtle">
            <h2 className="text-base font-bold text-text-primary">Candidate Inflow Channels</h2>
            <p className="text-xs text-text-muted">Where qualified candidates discover you</p>
          </div>

          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={SOURCE_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {SOURCE_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "8px",
                    border: "1px solid #E4E7EC",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-col gap-2 pt-2 border-t border-border-subtle text-xs">
            {SOURCE_DATA.map((src) => (
              <div key={src.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: src.color }} />
                  <span className="text-text-secondary">{src.name}</span>
                </div>
                <strong className="text-text-primary">{src.value}%</strong>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
