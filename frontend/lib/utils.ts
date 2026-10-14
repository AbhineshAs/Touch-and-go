import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrencyINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatSalaryRange(min?: number, max?: number, period: "year" | "month" = "year"): string {
  if (!min && !max) return "Competitive Compensation";
  const p = period === "year" ? "yr" : "mo";
  if (min && max) {
    return `${formatCurrencyINR(min)} – ${formatCurrencyINR(max)} / ${p}`;
  }
  if (min) return `From ${formatCurrencyINR(min)} / ${p}`;
  return `Up to ${formatCurrencyINR(max!)} / ${p}`;
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    
    if (diffMs < 0) return "Just now";
    
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffSecs < 60) return "Just now";
    if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? "minute" : "minutes"} ago`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    
    const diffWeeks = Math.floor(diffDays / 7);
    if (diffDays < 30) return `${diffWeeks} ${diffWeeks === 1 ? "week" : "weeks"} ago`;
    
    const diffMonths = Math.floor(diffDays / 30);
    if (diffDays < 365) return `${diffMonths} ${diffMonths === 1 ? "month" : "months"} ago`;
    
    const diffYears = Math.floor(diffDays / 365);
    return `${diffYears} ${diffYears === 1 ? "year" : "years"} ago`;
  } catch {
    return dateString;
  }
}

export function formatFullDateTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(date);
  } catch {
    return dateString;
  }
}
