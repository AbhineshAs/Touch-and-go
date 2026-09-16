"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, Sparkles } from "lucide-react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "outline" | "success" | "warning" | "danger" | "info" | "soft";
  size?: "sm" | "md";
}

export function Badge({ className, variant = "default", size = "sm", children, ...props }: BadgeProps) {
  const baseStyles = "inline-flex items-center font-medium rounded-full select-none transition-colors";

  const variants = {
    default: "bg-primary-soft text-primary-dark border border-primary/20",
    secondary: "bg-background-alt text-text-secondary border border-border/80",
    outline: "bg-transparent text-text-secondary border border-border",
    success: "bg-emerald-50 text-emerald-800 border border-emerald-200/80",
    warning: "bg-amber-50 text-amber-900 border border-amber-200/80",
    danger: "bg-rose-50 text-rose-800 border border-rose-200/80",
    info: "bg-sky-50 text-sky-800 border border-sky-200/80",
    soft: "bg-primary/10 text-primary-dark border border-primary/20",
  };

  const sizes = {
    sm: "text-[11px] px-2.5 py-0.5 gap-1.5",
    md: "text-xs px-3 py-1 gap-2",
  };

  return (
    <span className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {children}
    </span>
  );
}

export interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const s = status.toLowerCase();

  let variant: BadgeProps["variant"] = "secondary";
  let dotColor = "bg-slate-400";
  let hasPulse = false;

  if (
    s.includes("verified") ||
    s.includes("published") ||
    s.includes("offer") ||
    s.includes("shortlisted") ||
    s.includes("active") ||
    s.includes("resolved") ||
    s.includes("decision")
  ) {
    variant = "success";
    dotColor = "bg-emerald-600";
    hasPulse = true;
  } else if (
    s.includes("pending") ||
    s.includes("review") ||
    s.includes("screening") ||
    s.includes("applied") ||
    s.includes("under review") ||
    s.includes("submitted")
  ) {
    variant = "warning";
    dotColor = "bg-amber-500";
    hasPulse = true;
  } else if (
    s.includes("rejected") ||
    s.includes("suspended") ||
    s.includes("critical") ||
    s.includes("high") ||
    s.includes("closed")
  ) {
    variant = "danger";
    dotColor = "bg-rose-600";
  } else if (s.includes("interview") || s.includes("scheduled")) {
    variant = "info";
    dotColor = "bg-sky-600";
    hasPulse = true;
  }

  return (
    <Badge variant={variant} className={cn("font-medium shadow-2xs", className)}>
      <span className="relative flex h-2 w-2 shrink-0">
        {hasPulse && (
          <span
            className={cn(
              "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
              dotColor
            )}
          />
        )}
        <span className={cn("relative inline-flex rounded-full h-2 w-2", dotColor)} />
      </span>
      <span>{status}</span>
    </Badge>
  );
}

export interface SkillBadgeProps {
  name: string;
  verified?: boolean;
  years?: number;
  className?: string;
}

export function SkillBadge({ name, verified, years, className }: SkillBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-semibold px-2.75 py-1 rounded-lg bg-surface text-text-primary border border-border/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-primary/50 transition-all duration-150 cursor-default",
        verified && "border-primary/35 bg-primary-soft/40 text-primary-dark",
        className
      )}
    >
      <span>{name}</span>
      {years !== undefined && (
        <span className="text-text-muted font-normal text-[11px]">({years}y)</span>
      )}
      {verified && (
        <span title="Verified in structured work history" className="inline-flex">
          <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
        </span>
      )}
    </span>
  );
}

export interface MatchBadgeProps {
  score: number; // 0 to 100
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function MatchBadge({ score, size = "md", className }: MatchBadgeProps) {
  const isHigh = score >= 75;
  const isMid = score >= 50 && score < 75;

  const bg = isHigh
    ? "bg-gradient-to-r from-emerald-50 to-teal-50/80 text-[#0E4F45] border-teal-200/90 shadow-[0_1px_3px_rgba(22,107,92,0.08)]"
    : isMid
    ? "bg-amber-50 text-amber-900 border-amber-200"
    : "bg-slate-100 text-slate-700 border-slate-200";

  const sizes = {
    sm: "text-[11px] px-2.5 py-0.75",
    md: "text-xs px-3 py-1 font-semibold",
    lg: "text-sm px-3.5 py-1.5 font-bold",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border select-none transition-all duration-150 tracking-tight",
        bg,
        sizes[size],
        className
      )}
      title="Criteria Alignment with published job specifications"
    >
      <Sparkles className="w-3.5 h-3.5 shrink-0 text-primary animate-pulse" />
      <span>{score}% Alignment</span>
    </span>
  );
}
