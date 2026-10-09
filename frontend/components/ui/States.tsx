"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, AlertTriangle, CheckCircle, FileQuestion, Info, Loader2, RefreshCw } from "lucide-react";
import { Button } from "./Button";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-border-subtle/80", className)}
      {...props}
    />
  );
}

export function LoadingState({
  message = "Loading data...",
  className,
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 px-4 gap-3 text-center", className)}>
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="text-sm font-medium text-text-secondary">{message}</p>
    </div>
  );
}

export function EmptyState({
  icon = <FileQuestion className="w-10 h-10 text-text-muted" />,
  title = "No items found",
  description = "There are no records to display at this time.",
  action,
  className,
}: {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-dashed border-border bg-surface/50 p-10 flex flex-col items-center justify-center text-center gap-3",
        className
      )}
    >
      <div className="w-14 h-14 rounded-full bg-border-subtle flex items-center justify-center mb-1">
        {icon}
      </div>
      <h4 className="text-base font-semibold text-text-primary">{title}</h4>
      <p className="text-xs text-text-muted max-w-sm leading-relaxed">{description}</p>
      {action && (
        <Button size="sm" variant="outline" onClick={action.onClick} className="mt-2">
          {action.label}
        </Button>
      )}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description = "An error occurred while loading this data. Please try again.",
  onRetry,
  className,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-danger/20 bg-danger-soft/30 p-8 flex flex-col items-center justify-center text-center gap-3",
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-danger-soft text-danger flex items-center justify-center mb-1">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h4 className="text-base font-semibold text-text-primary">{title}</h4>
      <p className="text-xs text-text-muted max-w-sm leading-relaxed">{description}</p>
      {onRetry && (
        <Button
          size="sm"
          variant="secondary"
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          onClick={onRetry}
          className="mt-2"
        >
          Try Again
        </Button>
      )}
    </div>
  );
}

export interface ToastProps {
  type?: "success" | "error" | "info" | "warning";
  title: string;
  message?: string;
  onClose?: () => void;
}

export function Toast({ type = "success", title, message, onClose }: ToastProps) {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-success shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-danger shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-warning shrink-0" />,
    info: <Info className="w-5 h-5 text-info shrink-0" />,
  };

  const borderColors = {
    success: "border-success/30",
    error: "border-danger/30",
    warning: "border-warning/30",
    info: "border-info/30",
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-xl bg-surface border shadow-lg max-w-md w-full animate-in slide-in-from-top-2 duration-150",
        borderColors[type]
      )}
    >
      {icons[type]}
      <div className="flex-1 flex flex-col gap-0.5">
        <p className="text-sm font-semibold text-text-primary">{title}</p>
        {message && <p className="text-xs text-text-muted leading-relaxed">{message}</p>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-text-muted hover:text-text-primary text-xs font-medium cursor-pointer"
        >
          Dismiss
        </button>
      )}
    </div>
  );
}
