"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Calendar,
  BarChart3,
  ShieldCheck,
  Building2,
  Settings,
  Menu,
  X,
  Plus,
  LogOut,
  SlidersHorizontal,
  Search,
  Bell,
} from "lucide-react";
import { MOCK_USERS, MOCK_ORGANIZATIONS } from "@/lib/mocks/data";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export function EmployerShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { user: authUser, logout } = useAuth();
  const user = authUser || MOCK_USERS.employer;
  const org = MOCK_ORGANIZATIONS[0];

  const mainNav = [
    { label: "Overview", href: "/employer/dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: "Jobs", href: "/employer/jobs", icon: <Briefcase className="w-4 h-4" /> },
    { label: "Pipeline", href: "/employer/jobs/job_01/pipeline", icon: <SlidersHorizontal className="w-4 h-4" /> },
    { label: "Interviews", href: "/employer/interviews", icon: <Calendar className="w-4 h-4" />, badge: 1 },
    { label: "Team", href: "/employer/team", icon: <Users className="w-4 h-4" /> },
    { label: "Analytics", href: "/employer/analytics", icon: <BarChart3 className="w-4 h-4" /> },
  ];

  const adminNav = [
    { label: "Organization", href: "/employer/organization", icon: <Building2 className="w-4 h-4" /> },
    { label: "Verification", href: "/employer/verification", icon: <ShieldCheck className="w-4 h-4" /> },
    { label: "Settings", href: "/employer/settings", icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <ProtectedRoute allowedRoles={["employer", "admin"]}>
      <div className="min-h-screen flex flex-col lg:flex-row bg-background text-text-primary">
      {/* Mobile Top Header */}
      <header className="lg:hidden h-16 bg-surface/90 backdrop-blur-md border-b border-border px-4 flex items-center justify-between sticky top-0 z-30">
        <Link href="/employer/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#197B69] to-[#0A3C34] text-white flex items-center justify-center font-bold text-sm shadow-xs">
            T
          </div>
          <span className="font-extrabold text-base text-text-primary tracking-tight">TAG Recruiter</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link href="/employer/jobs/new">
            <Button size="sm" variant="primary" leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Post Job
            </Button>
          </Link>
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-2 rounded-xl text-text-secondary hover:bg-background-alt"
            aria-label="Toggle navigation menu"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
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
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#197B69] to-[#0A3C34] text-white flex items-center justify-center font-black text-lg tracking-wider shadow-xs group-hover:scale-105 transition-transform">
                T
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base leading-tight tracking-tight text-text-primary">
                  TAG
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-primary leading-none">
                  Company Console
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

          {/* Org mini card */}
          <div className="p-3 rounded-2xl bg-gradient-to-br from-primary-soft/40 to-background-alt border border-primary/20 flex items-center gap-2.5">
            <img
              src={org.logo}
              alt={org.name}
              className="w-9 h-9 rounded-xl object-cover border border-border shrink-0 shadow-2xs"
            />
            <div className="flex flex-col overflow-hidden">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-text-primary truncate">{org.name}</span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              </div>
              <span className="text-[10px] font-semibold text-emerald-700">MCA Verified Entity</span>
            </div>
          </div>

          {/* Quick Action: Post New Job */}
          <Link href="/employer/jobs/new" onClick={() => setMobileSidebarOpen(false)}>
            <Button
              className="w-full justify-center shadow-sm"
              size="sm"
              variant="primary"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Post New Requisition
            </Button>
          </Link>

          {/* Main Navigation */}
          <div className="flex flex-col gap-1">
            <span className="px-3 text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">
              Recruitment Ops
            </span>
            <nav className="flex flex-col gap-0.5">
              {mainNav.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/employer/dashboard" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={cn(
                      "flex items-center justify-between px-3.5 py-2.25 rounded-xl text-xs font-semibold transition-all duration-150 relative",
                      isActive
                        ? "bg-primary-soft text-primary-dark font-bold shadow-2xs"
                        : "text-text-secondary hover:text-text-primary hover:bg-background-alt"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className={cn(isActive ? "text-primary" : "text-text-muted")}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span
                        className={cn(
                          "text-[10px] px-2 py-0.5 rounded-full font-bold",
                          isActive
                            ? "bg-primary text-white"
                            : "bg-background-alt text-text-secondary border border-border"
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                    {isActive && (
                      <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-primary" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Administration Section */}
          <div className="flex flex-col gap-1 pt-2 border-t border-border-subtle">
            <span className="px-3 text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">
              Organization
            </span>
            <nav className="flex flex-col gap-0.5">
              {adminNav.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3.5 py-2.25 rounded-xl text-xs font-semibold transition-colors",
                      isActive
                        ? "bg-primary-soft text-primary-dark font-bold"
                        : "text-text-secondary hover:text-text-primary hover:bg-background-alt"
                    )}
                  >
                    <span className={cn(isActive ? "text-primary" : "text-text-muted")}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
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
                <span className="text-[10px] text-text-muted truncate">Lead Recruiter</span>
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

      {/* Main Area with Desktop Header Bar */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="hidden lg:flex h-16 bg-surface/80 backdrop-blur-md border-b border-border/80 px-8 items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3 text-xs text-text-muted">
            <span className="font-semibold text-text-primary capitalize">Recruiter Workspace</span>
            <span>/</span>
            <span className="capitalize">{pathname.split("/").pop() || "Dashboard"}</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-background-alt/70 border border-border text-xs text-text-muted">
              <Search className="w-3.5 h-3.5" />
              <span>Search candidates or jobs...</span>
              <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-surface border border-border text-text-muted font-mono">
                ⌘K
              </kbd>
            </div>

            <Link
              href="/employer/notifications"
              className="p-2 rounded-xl text-text-secondary hover:bg-background-alt transition-colors relative"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
            </Link>

            <Link href="/employer/jobs/new">
              <Button variant="primary" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
                Create Job
              </Button>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
    </ProtectedRoute>
  );
}
