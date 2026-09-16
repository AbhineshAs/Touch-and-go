"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth/AuthContext";
import {
  Menu,
  X,
  Shield,
  Sparkles,
  ArrowRight,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
  Building2,
  ShieldCheck,
} from "lucide-react";

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
    if (user.role === "employer") return "Recruiter Portal";
    return "Admin Console";
  };

  const navLinks = [
    { label: "Find Jobs", href: "/jobs" },
    { label: "Companies", href: "/companies/razorwave-technologies" },
    {
      label: "For Employers",
      href: isAuthenticated
        ? user?.role === "employer"
          ? "/employer/dashboard"
          : "/employer/dashboard"
        : "/sign-in?role=employer&redirect=%2Femployer%2Fdashboard",
    },
    { label: "Trust & Safety", href: "/trust" },
    { label: "About Platform", href: "/about" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-border/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-17 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#197B69] to-[#0A3C34] text-white flex items-center justify-center font-black text-xl tracking-wider shadow-[0_2px_8px_-1px_rgba(22,107,92,0.4)] group-hover:scale-105 transition-transform duration-200">
              T
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl leading-tight tracking-tight text-text-primary">
                  TAG
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] font-extrabold tracking-wider uppercase bg-primary-soft text-primary-dark border border-primary/20">
                  MVP
                </span>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-primary leading-none">
                Touch And Go
              </span>
            </div>
          </Link>

          {/* Live Platform Signal Badge */}
          <div className="hidden xl:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50/90 border border-emerald-200/80 text-[11px] font-semibold text-emerald-900 shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
            </span>
            <span>1,420+ Verified Tech Roles in India</span>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={cn(
                    "px-3.5 py-1.5 text-sm font-semibold rounded-lg transition-all duration-150",
                    isActive
                      ? "text-primary bg-primary-soft/60"
                      : "text-text-secondary hover:text-text-primary hover:bg-background-alt"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right CTA / Auth controls */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              {/* User profile capsule */}
              <Link
                href={getPortalLink()}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-surface border border-border hover:border-primary/40 transition-colors shadow-2xs group"
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover border border-border"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                    {user.name.charAt(0)}
                  </div>
                )}
                <div className="flex flex-col text-left leading-tight">
                  <span className="text-xs font-bold text-text-primary group-hover:text-primary transition-colors">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-text-muted capitalize font-medium">
                    {user.role}
                  </span>
                </div>
              </Link>

              {/* Direct Workspace link */}
              <Link href={getPortalLink()}>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<LayoutDashboard className="w-3.5 h-3.5" />}
                >
                  {getPortalLabel()}
                </Button>
              </Link>

              {/* Sign out button */}
              <button
                type="button"
                onClick={() => logout("/")}
                title="Sign Out"
                className="p-2 rounded-xl text-text-muted hover:text-danger hover:bg-danger-soft/40 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <Link href="/sign-in">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button
                  variant="primary"
                  size="sm"
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-background-alt transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/80 bg-surface px-5 pt-4 pb-7 flex flex-col gap-3.5 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3.5 py-2 text-sm font-semibold text-text-secondary hover:text-primary hover:bg-primary-soft/50 rounded-xl transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="pt-3.5 border-t border-border/80 flex flex-col gap-2.5">
            {isAuthenticated && user ? (
              <>
                <div className="flex items-center gap-3 p-2 rounded-xl bg-background-alt">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-9 h-9 rounded-full object-cover border border-border"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                      {user.name.charAt(0)}
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-text-primary">{user.name}</span>
                    <span className="text-[10px] text-text-muted capitalize">{user.role}</span>
                  </div>
                </div>

                <Link
                  href={getPortalLink()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full"
                >
                  <Button variant="primary" size="md" className="w-full">
                    Open {getPortalLabel()}
                  </Button>
                </Link>

                <Button
                  variant="secondary"
                  size="md"
                  className="w-full text-danger hover:text-danger"
                  leftIcon={<LogOut className="w-4 h-4" />}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout("/");
                  }}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full"
                >
                  <Button variant="secondary" size="md" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link
                  href="/sign-up"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full"
                >
                  <Button variant="primary" size="md" className="w-full">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
