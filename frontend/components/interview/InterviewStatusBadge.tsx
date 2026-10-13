"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Calendar, CheckCircle2, Clock, XCircle } from "lucide-react";

export interface InterviewStatusBadgeProps {
  status: "Scheduled" | "Rescheduled" | "Completed" | "Cancelled" | string;
  size?: "sm" | "md";
  className?: string;
}

export function InterviewStatusBadge({
  status,
  size = "sm",
  className,
}: InterviewStatusBadgeProps) {
  const s = (status || "Scheduled").toLowerCase();

  let styles = "bg-sky-50 text-sky-700 border-sky-200";
  let icon = <Calendar className="w-3 h-3 text-sky-600" />;
  let label = "Scheduled";

  if (s.includes("resched")) {
    styles = "bg-amber-50 text-amber-800 border-amber-200";
    icon = <Clock className="w-3 h-3 text-amber-600" />;
    label = "Rescheduled";
  } else if (s.includes("complete")) {
    styles = "bg-emerald-50 text-emerald-700 border-emerald-200";
    icon = <CheckCircle2 className="w-3 h-3 text-emerald-600" />;
    label = "Completed";
  } else if (s.includes("cancel")) {
    styles = "bg-rose-50 text-rose-700 border-rose-200";
    icon = <XCircle className="w-3 h-3 text-rose-600" />;
    label = "Cancelled";
  }

  const sizes = {
    sm: "text-[11px] px-2.5 py-0.5 gap-1.5",
    md: "text-xs px-3 py-1 gap-2",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-bold rounded-full border shadow-2xs select-none transition-colors",
        styles,
        sizes[size],
        className
      )}
    >
      {icon}
      <span>{label}</span>
    </span>
  );
}
