"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Search,
  Compass,
  FileText,
  Bookmark,
  User,
  Settings,
  Bell,
  Menu,
  X,
  LogOut,
  Briefcase,
  FileEdit,
} from "lucide-react";
import { MOCK_USERS } from "@/lib/mocks/data";
import { useAuth } from "@/lib/auth/AuthContext";
import { useCandidate } from "@/lib/candidate/context/CandidateContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { TagLogo } from "@/components/ui/TagLogo";

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
    { label: "Recommended", href: "/candidate/recommended", icon: <Compass className="w-4 h-4" /> },
    {
      label: "Applications",
      href: "/candidate/applications",
      icon: <Briefcase className="w-4 h-4" />,
      badge: applicationsCount > 0 ? applicationsCount : undefined,
    },
    {
      label: "Saved Jobs",
      href: "/candidate/saved",
      icon: <Bookmark className="w-4 h-4" />,
      badge: savedJobsCount > 0 ? savedJobsCount : undefined,
    },
    {
      label: "Resume",
      href: "/candidate/resume",
      icon: <FileText className="w-4 h-4" />,
    },
    { label: "Profile", href: "/candidate/profile", icon: <User className="w-4 h-4" /> },
  ];

  return (
    <ProtectedRoute allowedRoles={["candidate", "admin"]}>
      <div className="min-h-screen lg:h-screen flex flex-col lg:flex-row bg-[#F8FAFC] text-slate-900 lg:overflow-hidden font-sans">
        {/* Mobile Top Bar */}
        <header className="lg:hidden h-16 bg-white border-b border-slate-200 px-4 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
          <TagLogo href="/candidate/dashboard" height={36} />

          <div className="flex items-center gap-2">
            <Link
              href="/candidate/notifications"
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 relative"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-[#2563EB]" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#2563EB]" />
            </Link>
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Mobile Backdrop Overlay */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-30 lg:hidden transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Sidebar (Desktop + Mobile Drawer) */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between p-4.5 transition-transform duration-200 shadow-2xs",
            "lg:static lg:h-full lg:w-64 lg:shrink-0 lg:translate-x-0 overflow-y-auto",
            mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex flex-col gap-6">
            {/* Brand header */}
            <div className="flex items-center justify-between px-2 pt-1.5">
              <TagLogo href="/candidate/dashboard" height={38} />
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="lg:hidden p-1 text-slate-400 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Status Pill */}
            <div className="mx-2 px-3 py-2 rounded-xl bg-blue-50/80 border border-blue-200 flex items-center justify-between text-xs">
              <span className="text-[#2563EB] font-bold">Candidate Portal</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
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
                      "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 relative",
                      isActive
                        ? "bg-blue-50/80 text-[#2563EB] shadow-2xs border border-blue-200/80"
                        : "text-slate-700 hover:text-[#2563EB] hover:bg-slate-100/80 border border-transparent"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className={cn(isActive ? "text-[#2563EB]" : "text-slate-400")}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span
                        className={cn(
                          "text-[10px] px-2 py-0.5 rounded-full font-bold",
                          isActive
                            ? "bg-[#2563EB] text-white"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                    {isActive && (
                      <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#2563EB]" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Bottom User Profile Card */}
          <div className="flex flex-col gap-1.5 pt-4 border-t border-slate-200">
            <Link
              href="/candidate/notifications"
              onClick={() => setMobileSidebarOpen(false)}
              className={cn(
                "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 relative",
                pathname === "/candidate/notifications"
                  ? "bg-blue-50/80 text-[#2563EB] shadow-2xs border border-blue-200"
                  : "text-slate-700 hover:text-[#2563EB] hover:bg-slate-100/80"
              )}
            >
              <div className="flex items-center gap-3">
                <Bell className={cn("w-4 h-4", pathname === "/candidate/notifications" ? "text-[#2563EB]" : "text-slate-400")} />
                <span>Notifications</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-[#2563EB] shrink-0" />
            </Link>

            <Link
              href="/candidate/settings"
              onClick={() => setMobileSidebarOpen(false)}
              className={cn(
                "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 relative",
                pathname === "/candidate/settings"
                  ? "bg-blue-50/80 text-[#2563EB] shadow-2xs border border-blue-200"
                  : "text-slate-700 hover:text-[#2563EB] hover:bg-slate-100/80"
              )}
            >
              <div className="flex items-center gap-3">
                <Settings className={cn("w-4 h-4", pathname === "/candidate/settings" ? "text-[#2563EB]" : "text-slate-400")} />
                <span>Settings &amp; Privacy</span>
              </div>
            </Link>

            <div className="flex items-center justify-between p-2.5 mt-2 rounded-2xl bg-slate-50 border border-slate-200">
              <Link
                href="/candidate/profile"
                onClick={() => setMobileSidebarOpen(false)}
                className="flex items-center gap-2.5 min-w-0 flex-1 group"
              >
                {candidateAvatar ? (
                  <img
                    src={candidateAvatar}
                    alt={candidateName}
                    className="w-9 h-9 rounded-full object-cover shrink-0 border border-blue-200"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {candidateName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-extrabold text-slate-900 truncate group-hover:text-[#2563EB] transition-colors">
                    {candidateName}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium truncate">
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
                className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer shrink-0 ml-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* Main Page Area */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto">
          <header className="hidden lg:flex h-16 bg-white border-b border-slate-200/90 px-8 items-center justify-between sticky top-0 z-20 shadow-2xs">
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="font-extrabold text-slate-900 capitalize">Candidate Workspace</span>
              <span>/</span>
              <span className="capitalize font-bold text-[#2563EB]">{pathname.split("/").pop() || "Dashboard"}</span>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/jobs" className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-300 text-xs font-semibold text-slate-700 transition-colors">
                <Search className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>Explore Marketplace Jobs...</span>
              </Link>

              <Link
                href="/candidate/notifications"
                className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 relative"
              >
                <Bell className="w-4 h-4 text-[#2563EB]" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#2563EB]" />
              </Link>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
