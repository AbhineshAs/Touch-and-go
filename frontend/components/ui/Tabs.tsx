"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
  variant?: "underline" | "pills";
}

export function Tabs({
  tabs,
  activeTab,
  onChange,
  className,
  variant = "underline",
}: TabsProps) {
  if (variant === "pills") {
    return (
      <div className={cn("inline-flex max-w-full overflow-x-auto items-center p-1 bg-border-subtle rounded-lg gap-1 scrollbar-none", className)}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                "inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer",
                isActive
                  ? "bg-surface text-text-primary shadow-xs"
                  : "text-text-muted hover:text-text-primary hover:bg-surface/50"
              )}
            >
              {tab.icon && <span>{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.2 rounded-full",
                    isActive ? "bg-primary-soft text-primary font-bold" : "bg-border text-text-muted"
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-6 border-b border-border overflow-x-auto", className)}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "inline-flex items-center gap-2 pb-3 pt-1 text-sm font-medium transition-colors relative whitespace-nowrap cursor-pointer",
              isActive
                ? "text-primary font-semibold"
                : "text-text-muted hover:text-text-primary"
            )}
          >
            {tab.icon && <span>{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  "text-xs px-2 py-0.5 rounded-full font-medium",
                  isActive
                    ? "bg-primary-soft text-primary-dark"
                    : "bg-border-subtle text-text-muted"
                )}
              >
                {tab.count}
              </span>
            )}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
            )}
          </button>
        );
      })}
    </div>
  );
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumb({ items, className }: { items: BreadcrumbItem[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center text-xs text-text-muted", className)}>
      <ol className="flex items-center gap-2 flex-wrap">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex items-center gap-2">
              {index > 0 && <span className="text-border-strong">/</span>}
              {item.href && !isLast ? (
                <a href={item.href} className="hover:text-primary transition-colors">
                  {item.label}
                </a>
              ) : (
                <span className={cn(isLast && "font-semibold text-text-primary")}>{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className={cn("flex items-center justify-between gap-4 py-3", className)}>
      <p className="text-xs text-text-muted">
        Page <span className="font-semibold text-text-primary">{currentPage}</span> of{" "}
        <span className="font-semibold text-text-primary">{totalPages}</span>
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-surface text-text-secondary hover:text-text-primary hover:bg-background disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-surface text-text-secondary hover:text-text-primary hover:bg-background disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
        >
          Next
        </button>
      </div>
    </div>
  );
}
