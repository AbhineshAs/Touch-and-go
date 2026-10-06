"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/AuthContext";
import {
  Menu,
  X,
  ArrowRight,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  Building2,
  Compass,
  Award,
  Briefcase,
} from "lucide-react";

import { TagLogo } from "@/components/ui/TagLogo";

export function PublicNavbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const getPortalLink = () => {
    if (!user) return "/sign-in";
    if (user.role === "candidate") return "/candidate/dashboard";
    if (user.role === "employer") return "/employer/dashboard";
    return "/admin/dashboard";
  };

  const getPortalLabel = () => {
    if (!user) return "My Workspace";
    if (user.role === "candidate") return "Candidate Portal";
    if (user.role === "employer") return "Company Portal";
    return "Admin Console";
  };

  const navLinks = [
    { label: "Explore Roles", href: "/jobs", icon: Compass },
    { label: "Product Features", href: "#product-showcase", icon: Award },
    {
      label: "Employer Console",
      href: isAuthenticated
        ? user?.role === "employer"
          ? "/employer/dashboard"
          : "/employer/dashboard"
        : "/sign-in?role=employer&redirect=%2Femployer%2Fdashboard",
      icon: Building2,
    },
    { label: "Trust & Security", href: "/trust", icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs text-slate-900 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Left Section: Brand Logo */}
        <div className="flex items-center gap-8 shrink-0">
          <TagLogo height={44} />

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1.5">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={cn(
                    "px-3.5 py-2 text-xs font-bold rounded-xl transition-all duration-200 flex items-center gap-1.5",
                    isActive
                      ? "text-[#2563EB] bg-blue-50/80 border border-blue-200/80 shadow-2xs"
                      : "text-slate-700 hover:text-[#2563EB] hover:bg-slate-100/80 border border-transparent"
                  )}
                >
                  <Icon className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right CTA / Auth controls */}
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <Link
                href={getPortalLink()}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-colors shadow-2xs group"
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border border-blue-200"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center font-bold text-xs">
                    {user.name.charAt(0)}
                  </div>
                )}
                <div className="flex flex-col text-left leading-tight">
                  <span className="text-xs font-bold text-slate-900 group-hover:text-[#2563EB] transition-colors">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-slate-500 capitalize font-mono">
                    {user.role}
                  </span>
                </div>
              </Link>

              <Link href={getPortalLink()}>
                <button className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold text-xs shadow-xs flex items-center gap-2 transition-all cursor-pointer">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>{getPortalLabel()}</span>
                </button>
              </Link>

              <button
                type="button"
                onClick={() => logout("/")}
                title="Sign Out"
                className="p-2.5 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer border border-transparent hover:border-red-200"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <Link href="/sign-in">
                <button className="px-4 py-2.5 text-xs font-extrabold text-[#2563EB] hover:text-[#1D4ED8] transition-colors cursor-pointer">
                  Login
                </button>
              </Link>
              <Link href="/sign-up">
                <button className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold text-xs shadow-xs flex items-center gap-2 transition-all hover:scale-[1.02] cursor-pointer">
                  <span>Register Free</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-xl text-slate-700 hover:text-[#2563EB] hover:bg-slate-100 border border-slate-200 cursor-pointer"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Backdrop & Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute top-full left-0 right-0 z-50 border-t border-slate-200 bg-white/98 backdrop-blur-xl px-5 pt-4 pb-7 flex flex-col gap-4 shadow-2xl animate-in slide-in-from-top-2 duration-200 max-h-[calc(100vh-5rem)] overflow-y-auto">
            <nav className="flex flex-col gap-1.5">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "px-4 py-3 text-sm font-bold rounded-xl transition-colors flex items-center justify-between",
                      isActive
                        ? "text-[#2563EB] bg-blue-50/80 border border-blue-200"
                        : "text-slate-700 hover:text-[#2563EB] hover:bg-slate-100/80"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-[#2563EB]" />
                      <span>{link.label}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-slate-200 flex flex-col gap-3">
              {isAuthenticated && user ? (
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover border border-blue-200 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center font-bold text-sm shrink-0">
                        {user.name.charAt(0)}
                      </div>
                    )}
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm font-bold text-slate-900 truncate">{user.name}</span>
                      <span className="text-xs text-slate-500 capitalize">{user.role} workspace</span>
                    </div>
                  </div>

                  <Link href={getPortalLink()} onClick={() => setMobileMenuOpen(false)} className="w-full">
                    <button className="w-full py-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer">
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Open {getPortalLabel()}</span>
                    </button>
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout("/");
                    }}
                    className="w-full py-2.5 rounded-xl text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <>
                  <Link href="/sign-in" onClick={() => setMobileMenuOpen(false)} className="w-full">
                    <button className="w-full py-3 rounded-xl font-bold text-xs text-[#2563EB] bg-blue-50 border border-blue-200 cursor-pointer">
                      Sign In to Platform
                    </button>
                  </Link>
                  <Link href="/sign-up" onClick={() => setMobileMenuOpen(false)} className="w-full">
                    <button className="w-full py-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer">
                      <span>Get Started Free</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
