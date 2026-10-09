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
      <div className="min-h-screen flex flex-col lg:flex-row bg-[#F4F2EE] text-slate-900">
        {/* Mobile Top Header */}
        <header className="lg:hidden h-16 bg-white border-b border-black/10 px-4 flex items-center justify-between sticky top-0 z-30">
          <Link href="/employer/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0A66C2] text-white flex items-center justify-center font-bold text-sm shadow-xs">
              T
            </div>
            <span className="font-extrabold text-base text-[#0A66C2] tracking-tight">TAG Recruiter</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link href="/employer/jobs/new">
              <button className="linkedin-pill-button linkedin-pill-button-filled text-xs py-1.5 px-4">
                Post Job
              </button>
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

        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-black/10 flex flex-col justify-between p-4.5 transition-transform duration-200 lg:static lg:translate-x-0 shadow-xs overflow-y-auto",
            mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex flex-col gap-5">
            {/* Brand header */}
            <div className="flex items-center justify-between px-2 pt-1.5">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-9 h-9 rounded-lg bg-[#0A66C2] text-white flex items-center justify-center font-black text-lg tracking-wider shadow-xs">
                  T
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-base leading-tight tracking-tight text-[#0A66C2]">
                    TAG
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 leading-none">
                    Company Console
                  </span>
                </div>
              </Link>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="lg:hidden p-1 text-slate-400 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Org mini card */}
            <div className="p-3 rounded-2xl bg-[#EDF3F8] border border-[#0A66C2]/20 flex items-center gap-2.5">
              <img
                src={org.logo}
                alt={org.name}
                className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0"
              />
              <div className="flex flex-col overflow-hidden">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-slate-900 truncate">{org.name}</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0A66C2] shrink-0" />
                </div>
                <span className="text-[10px] font-semibold text-[#0A66C2]">MCA Verified Entity</span>
              </div>
            </div>

            {/* Quick Action: Post New Job */}
            <Link href="/employer/jobs/new" onClick={() => setMobileSidebarOpen(false)}>
              <button className="linkedin-pill-button linkedin-pill-button-filled w-full text-xs py-2.5 flex items-center justify-center gap-1.5 cursor-pointer">
                <Plus className="w-4 h-4" />
                <span>Post New Requisition</span>
              </button>
            </Link>

            {/* Main Navigation */}
            <div className="flex flex-col gap-1">
              <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
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
                          ? "bg-[#EDF3F8] text-[#0A66C2] font-bold shadow-2xs"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className={cn(isActive ? "text-[#0A66C2]" : "text-slate-400")}>
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span
                          className={cn(
                            "text-[10px] px-2 py-0.5 rounded-full font-bold",
                            isActive
                              ? "bg-[#0A66C2] text-white"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                      {isActive && (
                        <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#0A66C2]" />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Administration Section */}
            <div className="flex flex-col gap-1 pt-2 border-t border-black/10">
              <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
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
                          ? "bg-[#EDF3F8] text-[#0A66C2] font-bold"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      )}
                    >
                      <span className={cn(isActive ? "text-[#0A66C2]" : "text-slate-400")}>
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
          <div className="pt-4 border-t border-black/10">
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-8.5 h-8.5 rounded-full object-cover shrink-0 border border-slate-200"
                />
                <div className="flex flex-col overflow-hidden">
                  <span className="text-xs font-bold text-slate-900 truncate">{user.name}</span>
                  <span className="text-[10px] text-slate-500 truncate">Lead Recruiter</span>
                </div>
              </div>
              <button
                onClick={() => logout("/")}
                title="Sign Out"
                type="button"
                className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-white transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* Main Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <header className="hidden lg:flex h-16 bg-white border-b border-black/10 px-8 items-center justify-between sticky top-0 z-20">
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="font-semibold text-slate-900 capitalize">Recruiter Workspace</span>
              <span>/</span>
              <span className="capitalize">{pathname.split("/").pop() || "Dashboard"}</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-500">
                <Search className="w-3.5 h-3.5" />
                <span>Search candidates or jobs...</span>
              </div>

              <Link
                href="/employer/notifications"
                className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 relative"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#0A66C2]" />
              </Link>

              <Link href="/employer/jobs/new">
                <button className="linkedin-pill-button linkedin-pill-button-filled text-xs py-2 px-4 flex items-center gap-1.5 cursor-pointer">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Job</span>
                </button>
              </Link>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
