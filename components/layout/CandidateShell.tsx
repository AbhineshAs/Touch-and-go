"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Search,
  Sparkles,
  FileText,
  Bookmark,
  User,
  Settings,
  Bell,
  Menu,
  X,
  LogOut,
  ExternalLink,
  Command,
} from "lucide-react";
import { MOCK_USERS } from "@/lib/mocks/data";
import { useAuth } from "@/lib/auth/AuthContext";
import { useCandidate } from "@/lib/candidate/context/CandidateContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

export function CandidateShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { user: authUser, logout } = useAuth();
  const { candidateRecord, resetAll } = useCandidate();

  const candidateName = candidateRecord?.identity.fullName || authUser?.name || "Alen William";
  const candidateEmail = candidateRecord?.identity.email || authUser?.email || "alenwilliam92@gmail.com";
  const candidateAvatar =
    candidateName.toLowerCase().includes("ananya")
      ? MOCK_USERS.candidate.avatarUrl
      : undefined;

  const applicationsCount = candidateRecord?.applications.length || 0;
  const savedJobsCount = candidateRecord?.savedJobIds.length || 0;

  const navItems: NavItem[] = [
    { label: "Overview", href: "/candidate/dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: "Find Jobs", href: "/candidate/jobs", icon: <Search className="w-4 h-4" /> },
    { label: "Recommended", href: "/candidate/recommended", icon: <Sparkles className="w-4 h-4" /> },
    {
      label: "Applications",
      href: "/candidate/applications",
      icon: <FileText className="w-4 h-4" />,
      badge: applicationsCount > 0 ? applicationsCount : undefined,
    },
    {
      label: "Saved Jobs",
      href: "/candidate/saved",
      icon: <Bookmark className="w-4 h-4" />,
      badge: savedJobsCount > 0 ? savedJobsCount : undefined,
    },
    { label: "Profile", href: "/candidate/profile", icon: <User className="w-4 h-4" /> },
  ];


  return (
    <ProtectedRoute allowedRoles={["candidate", "admin"]}>
      <div className="min-h-screen lg:h-screen flex flex-col lg:flex-row bg-background text-text-primary lg:overflow-hidden">
      {/* Mobile Top Bar */}
      <header className="lg:hidden h-16 bg-surface/90 backdrop-blur-md border-b border-border px-4 flex items-center justify-between sticky top-0 z-30">
        <Link href="/candidate/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#197B69] to-[#0A3C34] text-white flex items-center justify-center font-black text-base shadow-xs">
            T
          </div>
          <span className="font-extrabold text-base text-text-primary tracking-tight">TAG Candidate</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/candidate/notifications"
            className="p-2 rounded-xl text-text-secondary hover:bg-background-alt relative"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
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

      {/* Sidebar (Desktop + Mobile Drawer) */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-surface border-r border-border/80 flex flex-col justify-between p-4.5 transition-transform duration-200 shadow-xs",
          "lg:static lg:h-full lg:w-64 lg:shrink-0 lg:translate-x-0 overflow-y-auto",
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col gap-6">
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
                  Candidate Portal
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

          {/* Quick Status Pill */}
          <div className="mx-2 px-3 py-2 rounded-xl bg-primary-soft/50 border border-primary/20 flex items-center justify-between text-xs">
            <span className="text-primary-dark font-semibold">Active Status</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-white px-2 py-0.5 rounded-full border border-emerald-200/80">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Open to Work
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/candidate/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={cn(
                    "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 relative",
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

        {/* Bottom User Profile Card & Settings */}
        <div className="flex flex-col gap-1.5 pt-4 border-t border-border/80">
          <Link
            href="/candidate/notifications"
            onClick={() => setMobileSidebarOpen(false)}
            className={cn(
              "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 relative",
              pathname === "/candidate/notifications"
                ? "bg-primary-soft text-primary-dark font-bold shadow-2xs"
                : "text-text-secondary hover:text-text-primary hover:bg-background-alt"
            )}
          >
            <div className="flex items-center gap-3">
              <Bell className={cn("w-4 h-4", pathname === "/candidate/notifications" ? "text-primary" : "text-text-muted")} />
              <span>Notifications</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-[#197B69] shrink-0" />
            {pathname === "/candidate/notifications" && (
              <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-primary" />
            )}
          </Link>

          <Link
            href="/candidate/settings"
            onClick={() => setMobileSidebarOpen(false)}
            className={cn(
              "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 relative",
              pathname === "/candidate/settings"
                ? "bg-primary-soft text-primary-dark font-bold shadow-2xs"
                : "text-text-secondary hover:text-text-primary hover:bg-background-alt"
            )}
          >
            <div className="flex items-center gap-3">
              <Settings className={cn("w-4 h-4", pathname === "/candidate/settings" ? "text-primary" : "text-text-muted")} />
              <span>Settings & Privacy</span>
            </div>
            {pathname === "/candidate/settings" && (
              <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-primary" />
            )}
          </Link>

          <div className="flex items-center justify-between p-2.5 mt-2 rounded-2xl bg-background-alt/70 border border-border/80 shadow-2xs">
            <Link
              href="/candidate/profile"
              onClick={() => setMobileSidebarOpen(false)}
              className="flex items-center gap-2.5 min-w-0 flex-1 group"
            >
              {candidateAvatar ? (
                <img
                  src={candidateAvatar}
                  alt={candidateName}
                  className="w-9 h-9 rounded-full object-cover shrink-0 border border-border"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-[#197B69] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs group-hover:opacity-90 transition-opacity">
                  {candidateName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-text-primary truncate group-hover:text-primary transition-colors">
                  {candidateName}
                </span>
                <span className="text-[11px] text-text-muted truncate">
                  {candidateEmail}
                </span>
              </div>
            </Link>
            <button
              onClick={() => {
                resetAll();
                logout("/");
              }}
              title="Sign Out"
              type="button"
              className="p-1.5 text-text-muted hover:text-danger rounded-lg hover:bg-surface transition-colors cursor-pointer shrink-0 ml-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </aside>

      {/* Main Page Area with Elevated Header Bar */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto">
        {/* Desktop Top Header Command Bar */}
        <header className="hidden lg:flex h-16 bg-surface/80 backdrop-blur-md border-b border-border/80 px-8 items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3 text-xs text-text-muted">
            <span className="font-semibold text-text-primary capitalize">Candidate Workspace</span>
            <span>/</span>
            <span className="capitalize">{pathname.split("/").pop() || "Dashboard"}</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick Search Cue */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-background-alt/70 border border-border text-xs text-text-muted">
              <Search className="w-3.5 h-3.5" />
              <span>Search criteria or jobs...</span>
              <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-surface border border-border text-text-muted font-mono">
                ⌘K
              </kbd>
            </div>

            <Link
              href="/candidate/notifications"
              className="p-2 rounded-xl text-text-secondary hover:bg-background-alt transition-colors relative"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
    </ProtectedRoute>
  );
}
