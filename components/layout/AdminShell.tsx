"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ShieldCheck,
  Flag,
  Tags,
  FileSpreadsheet,
  BarChart2,
  ToggleLeft,
  Menu,
  X,
  LogOut,
  ShieldAlert,
  Activity,
  Search,
} from "lucide-react";
import { MOCK_USERS } from "@/lib/mocks/data";
import { useAuth } from "@/lib/auth/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { user: authUser, logout } = useAuth();
  const user = authUser || MOCK_USERS.admin;

  const adminNav = [
    { label: "Overview", href: "/admin/dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: "Employer Verification", href: "/admin/verifications", icon: <ShieldCheck className="w-4 h-4" />, badge: 2 },
    { label: "Moderation Queue", href: "/admin/moderation", icon: <Flag className="w-4 h-4" />, badge: 2 },
    { label: "Taxonomy & Skills", href: "/admin/taxonomy", icon: <Tags className="w-4 h-4" /> },
    { label: "Audit Ledger", href: "/admin/audit", icon: <FileSpreadsheet className="w-4 h-4" /> },
    { label: "Marketplace Analytics", href: "/admin/analytics", icon: <BarChart2 className="w-4 h-4" /> },
    { label: "Feature Controls", href: "/admin/feature-flags", icon: <ToggleLeft className="w-4 h-4" /> },
  ];

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen flex flex-col lg:flex-row bg-background text-text-primary">
      {/* Mobile Top Header */}
      <header className="lg:hidden h-16 bg-slate-950 text-white border-b border-slate-800 px-4 flex items-center justify-between sticky top-0 z-30">
        <Link href="/admin/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center font-black text-base shadow-xs">
            T
          </div>
          <span className="font-extrabold text-base tracking-tight">TAG Platform Governance</span>
        </Link>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
          aria-label="Toggle navigation menu"
        >
          {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-surface border-r border-border/80 flex flex-col justify-between p-4.5 transition-transform duration-200 lg:static lg:translate-x-0 shadow-xs",
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col gap-5">
          {/* Brand header */}
          <div className="flex items-center justify-between px-2 pt-1.5">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-center justify-center font-black text-lg tracking-wider shadow-xs group-hover:scale-105 transition-transform border border-slate-700">
                T
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base leading-tight tracking-tight text-text-primary">
                  TAG
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-600 leading-none">
                  Platform Admin
                </span>
              </div>
            </Link>
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden p-1 text-text-muted hover:text-text-primary"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* System Health Mini Indicator */}
          <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-700 animate-pulse" />
              <span className="font-bold text-emerald-950">Marketplace SLA</span>
            </div>
            <span className="text-[11px] font-extrabold text-emerald-800 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
              99.98%
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1">
            <span className="px-3 text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">
              Governance & Oversight
            </span>
            {adminNav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={cn(
                    "flex items-center justify-between px-3.5 py-2.25 rounded-xl text-xs font-semibold transition-all duration-150 relative",
                    isActive
                      ? "bg-slate-900 text-white font-bold shadow-xs"
                      : "text-text-secondary hover:text-text-primary hover:bg-background-alt"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className={cn(isActive ? "text-emerald-400" : "text-text-muted")}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full font-bold",
                        isActive
                          ? "bg-emerald-500 text-white"
                          : "bg-amber-100 text-amber-900 border border-amber-200"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-emerald-400" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card */}
        <div className="pt-4 border-t border-border/80">
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-background-alt/60 border border-border/80 shadow-2xs">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-8.5 h-8.5 rounded-full object-cover shrink-0 border border-border"
              />
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs font-bold text-text-primary truncate">{user.name}</span>
                <span className="text-[10px] text-emerald-700 font-semibold truncate">
                  Platform Operator
                </span>
              </div>
            </div>
            <button
              onClick={() => logout("/")}
              title="Sign Out"
              type="button"
              className="p-1.5 text-text-muted hover:text-danger rounded-lg hover:bg-surface transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Area with Top Header Bar */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="hidden lg:flex h-16 bg-surface/80 backdrop-blur-md border-b border-border/80 px-8 items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3 text-xs text-text-muted">
            <span className="font-bold text-text-primary">Admin Center</span>
            <span>/</span>
            <span className="capitalize">{pathname.split("/").pop() || "Dashboard"}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-background-alt/70 border border-border text-xs text-text-muted">
              <Search className="w-3.5 h-3.5" />
              <span>Filter audit logs, flags, or entity IDs...</span>
              <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-surface border border-border text-text-muted font-mono">
                ⌘K
              </kbd>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>MCA & GSTIN Live Audit Enabled</span>
            </span>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
    </ProtectedRoute>
  );
}
