"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "soft";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "group inline-flex items-center justify-center font-semibold transition-all duration-200 ease-out select-none disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 cursor-pointer active:scale-[0.98]";

    const variants = {
      primary:
        "bg-[#4F46E5] hover:bg-[#4338CA] active:bg-[#3730A3] text-white border border-[#4338CA] shadow-[0_1px_2px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.2)] hover:shadow-[0_4px_16px_-2px_rgba(79,70,229,0.35)] rounded-xl",
      secondary:
        "bg-surface text-text-primary border border-border hover:bg-background hover:border-border-strong hover:text-text-primary shadow-[0_1px_2px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.9)] hover:shadow-[0_3px_10px_-2px_rgba(0,0,0,0.06)] rounded-xl",
      outline:
        "bg-transparent text-primary border border-primary/40 hover:bg-primary-soft hover:border-primary rounded-xl",
      ghost:
        "bg-transparent text-text-secondary hover:bg-background-alt hover:text-text-primary active:bg-border-subtle rounded-xl",
      danger:
        "bg-gradient-to-b from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 shadow-[0_1px_2px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.2)] border border-red-700 rounded-xl",
      soft:
        "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-xl",
    };

    const sizes = {
      sm: "text-xs px-3.5 py-1.5 gap-1.5 h-8.5 rounded-lg",
      md: "text-sm px-4.5 py-2.25 gap-2 h-10.5 rounded-xl",
      lg: "text-base px-6 py-3 gap-2.5 h-12 rounded-xl",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />
        ) : (
          leftIcon && (
            <span className="shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5">
              {leftIcon}
            </span>
          )
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && (
          <span className="shrink-0 transition-transform duration-200 group-hover:translate-x-0.5">
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);
Button.displayName = "Button";

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "soft";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  "aria-label": string;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      className,
      variant = "ghost",
      size = "md",
      isLoading = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-xl transition-all duration-200 ease-out select-none disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer active:scale-[0.96]";

    const variants = {
      primary:
        "bg-[#4F46E5] hover:bg-[#4338CA] active:bg-[#3730A3] text-white shadow-[0_1px_2px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.2)]",
      secondary:
        "bg-surface text-text-primary border border-border hover:bg-background hover:border-border-strong shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
      outline:
        "bg-transparent text-primary border border-primary/40 hover:bg-primary-soft",
      ghost:
        "bg-transparent text-text-muted hover:bg-background-alt hover:text-text-primary",
      danger:
        "bg-danger-soft text-danger hover:bg-danger hover:text-white",
      soft:
        "bg-blue-50 text-blue-700 hover:bg-blue-100",
    };

    const sizes = {
      sm: "w-8.5 h-8.5",
      md: "w-10 h-10",
      lg: "w-11.5 h-11.5",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-current" /> : children}
      </button>
    );
  }
);
IconButton.displayName = "IconButton";
