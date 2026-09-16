"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  variant?: "default" | "elevated" | "glass" | "bezel" | "subtle";
}

export function Card({
  className,
  hoverable = false,
  variant = "default",
  children,
  ...props
}: CardProps) {
  const variantStyles = {
    default:
      "bg-surface border border-border/80 shadow-[0_1px_3px_0_rgba(15,23,42,0.03),0_1px_2px_-1px_rgba(15,23,42,0.03)]",
    elevated:
      "bg-surface border border-border/70 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06),0_2px_6px_-2px_rgba(15,23,42,0.03)]",
    glass:
      "glass-panel",
    bezel:
      "bezel-inner shadow-[0_2px_8px_-2px_rgba(15,23,42,0.05)]",
    subtle:
      "bg-background-alt/60 border border-border-subtle",
  };

  return (
    <div
      className={cn(
        "rounded-2xl overflow-hidden transition-all duration-200 ease-out",
        variantStyles[variant],
        hoverable &&
          "hover:border-primary/40 hover:-translate-y-0.75 hover:shadow-[0_12px_28px_-6px_rgba(22,107,92,0.1),0_4px_10px_-2px_rgba(15,23,42,0.04)] cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("p-6 pb-4 border-b border-border-subtle/80 flex flex-col gap-1.5", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-base font-bold text-text-primary tracking-tight", className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-xs text-text-muted leading-relaxed font-normal", className)}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-6", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "px-6 py-4 bg-background-alt/40 border-t border-border-subtle/80 flex items-center justify-between text-xs text-text-muted",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  subtitle?: string;
  className?: string;
}

export function MetricCard({
  label,
  value,
  icon,
  change,
  changeType = "neutral",
  subtitle,
  className,
}: MetricCardProps) {
  const changeColors = {
    positive: "text-emerald-800 bg-emerald-50 border-emerald-200/80",
    negative: "text-rose-800 bg-rose-50 border-rose-200/80",
    neutral: "text-text-secondary bg-background-alt border-border",
  };

  return (
    <div
      className={cn(
        "p-5 rounded-2xl bg-surface border border-border/80 shadow-[0_2px_10px_-2px_rgba(15,23,42,0.04)] flex flex-col justify-between gap-4 hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-200",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-text-secondary truncate">{label}</span>
        {icon && (
          <div className="w-8.5 h-8.5 rounded-xl bg-background-alt/80 border border-border flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
          {value}
        </span>
        <div className="flex items-center gap-2 flex-wrap text-xs">
          {change && (
            <span
              className={cn(
                "inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border",
                changeColors[changeType]
              )}
            >
              {change}
            </span>
          )}
          {subtitle && (
            <span className="text-[11px] text-text-muted font-normal">{subtitle}</span>
          )}
        </div>
      </div>
    </div>
  );
}
