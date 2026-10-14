"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  ChevronRight,
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
  const router = useRouter();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [headerSearch, setHeaderSearch] = useState("");
  const { user: authUser, logout } = useAuth();
  const { candidateRecord, resetAll } = useCandidate();

  const [storedAvatar, setStoredAvatar] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        document.getElementById("candidate-global-search")?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleHeaderSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (headerSearch.trim()) {
      router.push(`/candidate/jobs?q=${encodeURIComponent(headerSearch.trim())}`);
    } else {
      router.push("/candidate/jobs");
    }
  };

  useEffect(() => {
    const syncAvatar = () => {
      if (typeof window !== "undefined") {
        setStoredAvatar(localStorage.getItem("tag_candidate_avatar"));
      }
    };
    syncAvatar();
    window.addEventListener("storage", syncAvatar);
    return () => window.removeEventListener("storage", syncAvatar);
  }, []);

  const candidateName =
    candidateRecord?.identity?.fullName ||
    authUser?.name ||
    "Candidate";
  const candidateEmail =
    candidateRecord?.identity?.email ||
    authUser?.email ||
    "candidate@tagjobs.in";
  const candidateAvatar =
    storedAvatar ||
    candidateRecord?.identity?.avatarUrl ||
    (candidateName.toLowerCase().includes("ananya") || candidateEmail.toLowerCase().includes("ananya")
      ? MOCK_USERS.candidate.avatarUrl
      : undefined);

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
        <header className="lg:hidden h-16 shrink-0 bg-white border-b border-slate-200 px-4 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
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
            "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between p-4 transition-transform duration-200 shadow-2xs",
            "lg:static lg:h-full lg:w-64 lg:shrink-0 lg:translate-x-0 overflow-y-auto",
            mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex flex-col gap-5">
            {/* Brand header */}
            <div className="flex items-center justify-between px-2 pt-1">
              <TagLogo href="/candidate/dashboard" height={36} />
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="lg:hidden p-1 text-slate-400 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Portal Label & Status Indicator */}
            <div className="flex items-center justify-between px-2 text-xs">
              <span className="font-semibold text-slate-500">Candidate Portal</span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 ring-1 ring-emerald-600/20 px-2 py-0.5 rounded-full">
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
                      "rounded-lg text-sm transition-colors px-3.5 py-2.5 flex items-center justify-between gap-3",
                      isActive
                        ? "bg-blue-50 text-blue-600 font-semibold"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={cn(isActive ? "text-blue-600" : "text-slate-400")}>
                        {item.icon}
                      </span>
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full font-mono font-medium shrink-0",
                          isActive
                            ? "bg-blue-100 text-blue-700"
                            : "bg-slate-100 text-slate-600 border border-slate-200/80"
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Bottom User Profile Card */}
          <div className="flex flex-col gap-1 pt-4 border-t border-slate-200/80">
            <Link
              href="/candidate/notifications"
              onClick={() => setMobileSidebarOpen(false)}
              className={cn(
                "flex items-center justify-between gap-3 rounded-lg text-sm transition-colors px-3.5 py-2.5",
                pathname.startsWith("/candidate/notifications")
                  ? "bg-blue-50 text-blue-600 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Bell className={cn("w-4 h-4 shrink-0", pathname.startsWith("/candidate/notifications") ? "text-blue-600" : "text-slate-400")} />
                <span className="truncate">Notifications</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
            </Link>

            <Link
              href="/candidate/settings"
              onClick={() => setMobileSidebarOpen(false)}
              className={cn(
                "flex items-center justify-between gap-3 rounded-lg text-sm transition-colors px-3.5 py-2.5",
                pathname === "/candidate/settings"
                  ? "bg-blue-50 text-blue-600 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Settings className={cn("w-4 h-4 shrink-0", pathname === "/candidate/settings" ? "text-blue-600" : "text-slate-400")} />
                <span className="truncate">Settings &amp; Privacy</span>
              </div>
            </Link>

            <div
              className={cn(
                "flex items-center justify-between p-2.5 mt-2 rounded-xl border gap-2 transition-colors",
                pathname.startsWith("/candidate/profile")
                  ? "bg-blue-50/70 border-blue-200/80"
                  : "bg-slate-50 border-slate-200/80"
              )}
            >
              <Link
                href="/candidate/profile"
                onClick={() => setMobileSidebarOpen(false)}
                className="flex items-center gap-2.5 min-w-0 flex-1 group"
                title={`${candidateName} (${candidateEmail})`}
              >
                {candidateAvatar ? (
                  <img
                    src={candidateAvatar}
                    alt={candidateName}
                    className="w-9 h-9 rounded-full object-cover shrink-0 border border-slate-200"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {candidateName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-semibold text-slate-900 truncate block group-hover:text-blue-600 transition-colors">
                    {candidateName}
                  </span>
                  <span className="text-[11px] text-slate-500 font-normal truncate block">
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
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* Main Page Area */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto">
          <header className="hidden lg:flex h-16 shrink-0 w-full border-b border-slate-200/80 bg-white px-8 items-center justify-between sticky top-0 z-20">
            <div className="flex items-center gap-2 text-sm shrink-0">
              <Link
                href="/candidate/dashboard"
                className="font-medium text-slate-500 hover:text-slate-800 transition-colors"
              >
                Candidate Workspace
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-semibold text-slate-900">
                {pathname === "/candidate/dashboard" || pathname === "/candidate"
                  ? "Dashboard"
                  : pathname.startsWith("/candidate/jobs")
                  ? "Find Jobs"
                  : pathname.startsWith("/candidate/recommended")
                  ? "Recommended"
                  : pathname.startsWith("/candidate/applications")
                  ? "Applications"
                  : pathname.startsWith("/candidate/saved")
                  ? "Saved Jobs"
                  : pathname.startsWith("/candidate/resume")
                  ? "Resume"
                  : pathname.startsWith("/candidate/profile")
                  ? "Profile"
                  : pathname.startsWith("/candidate/notifications")
                  ? "Notifications"
                  : pathname.startsWith("/candidate/settings")
                  ? "Settings"
                  : (pathname.split("/").filter(Boolean).pop() || "Dashboard").replace(/^\w/, (c) => c.toUpperCase())}
              </span>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <form onSubmit={handleHeaderSearch} className="relative w-72 md:w-80 shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  id="candidate-global-search"
                  type="text"
                  placeholder="Search marketplace jobs..."
                  value={headerSearch}
                  onChange={(e) => setHeaderSearch(e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/70 pl-9 pr-12 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all focus:outline-none"
                />
                <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 border border-slate-200 bg-white text-[11px] font-mono text-slate-400 px-1.5 py-0.5 rounded shadow-2xs pointer-events-none">
                  ⌘K
                </kbd>
              </form>

              <Link
                href="/candidate/notifications"
                className={cn(
                  "relative flex h-10 w-10 items-center justify-center rounded-lg border transition-colors shrink-0",
                  pathname.startsWith("/candidate/notifications")
                    ? "border-blue-200 bg-blue-50 text-blue-600"
                    : "border-slate-200/70 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
                aria-label="Notifications"
              >
                <Bell className={cn("w-4.5 h-4.5", pathname.startsWith("/candidate/notifications") ? "text-blue-600" : "text-slate-600")} />
                <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white" />
              </Link>
            </div>
          </header>

          <main className="flex-1 p-6 lg:p-8 w-full">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
