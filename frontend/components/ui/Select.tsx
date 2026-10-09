"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, options, placeholder, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold text-text-secondary">
            {label}
            {props.required && <span className="text-danger ml-0.5">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          <select
            id={inputId}
            ref={ref}
            className={cn(
              "w-full appearance-none rounded-lg bg-surface border border-border px-3.5 py-2 pr-10 text-sm text-text-primary transition-colors duration-150 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-background disabled:cursor-not-allowed cursor-pointer",
              error && "border-danger focus:border-danger focus:ring-danger/20",
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 w-4 h-4 text-text-muted pointer-events-none" />
        </div>
        {error ? (
          <p className="text-xs text-danger font-medium mt-0.5">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-text-muted mt-0.5">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
Select.displayName = "Select";

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: React.ReactNode;
  description?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, id, ...props }, ref) => {
    const checkId = id || (typeof label === "string" ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <label htmlFor={checkId} className="inline-flex items-start gap-2.5 cursor-pointer select-none">
        <input
          id={checkId}
          type="checkbox"
          ref={ref}
          className={cn(
            "mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary/30 focus:ring-2 cursor-pointer accent-primary",
            className
          )}
          {...props}
        />
        {(label || description) && (
          <div className="flex flex-col">
            {label && <span className="text-sm font-medium text-text-primary leading-tight">{label}</span>}
            {description && <span className="text-xs text-text-muted mt-0.5">{description}</span>}
          </div>
        )}
      </label>
    );
  }
);
Checkbox.displayName = "Checkbox";

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  description?: string;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, description, id, checked, ...props }, ref) => {
    const switchId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <label htmlFor={switchId} className="flex items-center justify-between gap-3 cursor-pointer select-none">
        {(label || description) && (
          <div className="flex flex-col">
            {label && <span className="text-sm font-medium text-text-primary">{label}</span>}
            {description && <span className="text-xs text-text-muted">{description}</span>}
          </div>
        )}
        <div className="relative inline-flex items-center shrink-0">
          <input
            id={switchId}
            type="checkbox"
            ref={ref}
            checked={checked}
            className="sr-only peer"
            {...props}
          />
          <div className="w-9 h-5 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
        </div>
      </label>
    );
  }
);
Switch.displayName = "Switch";
