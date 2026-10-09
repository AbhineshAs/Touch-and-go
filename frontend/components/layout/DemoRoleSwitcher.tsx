"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { UserRole } from "@/types";
import { switchActiveRole } from "@/lib/api/auth";
import { Globe, User as UserIcon, Building2, ShieldCheck, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function DemoRoleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const [activeRole, setActiveRole] = useState<string>("public");
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (pathname.startsWith("/admin")) {
      setActiveRole("admin");
    } else if (pathname.startsWith("/employer")) {
      setActiveRole("employer");
    } else if (pathname.startsWith("/candidate")) {
      setActiveRole("candidate");
    } else {
      setActiveRole("public");
    }
  }, [pathname]);

  const handleRoleSelect = async (role: "public" | UserRole) => {
    setActiveRole(role);
    if (role === "public") {
      router.push("/");
    } else if (role === "candidate") {
      await switchActiveRole("candidate");
      router.push("/candidate/dashboard");
    } else if (role === "employer") {
      await switchActiveRole("employer");
      router.push("/employer/dashboard");
    } else if (role === "admin") {
      await switchActiveRole("admin");
      router.push("/admin/dashboard");
    }
  };

  const roles = [
    { id: "public", label: "Public Market", sub: "Guest", icon: <Globe className="w-3.5 h-3.5" /> },
    { id: "candidate", label: "Candidate", sub: "Ananya", icon: <UserIcon className="w-3.5 h-3.5" /> },
    { id: "employer", label: "Company", sub: "RazorWave", icon: <Building2 className="w-3.5 h-3.5" /> },
    { id: "admin", label: "Platform Admin", sub: "Ops", icon: <ShieldCheck className="w-3.5 h-3.5" /> },
  ];

  return (
    <aside
      aria-label="Demo role switcher"
      className="fixed bottom-5 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ease-out"
    >
      <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-slate-950/90 text-white border border-white/15 shadow-[0_12px_40px_rgba(0,0,0,0.35),0_2px_8px_rgba(0,0,0,0.2)] backdrop-blur-xl">
        {/* Pulsing Live Dot */}
        <div className="flex items-center gap-2 pl-3 pr-2 py-1 text-[11px] font-bold tracking-wider text-slate-300 border-r border-slate-800">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="hidden sm:inline">DEMO PERSONA</span>
        </div>

        {/* Role Toggle Buttons */}
        <div className="flex items-center gap-1">
          {roles.map((r) => {
            const isActive = activeRole === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => handleRoleSelect(r.id as any)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 cursor-pointer select-none",
                  isActive
                    ? "bg-[#4F46E5] text-white shadow-[0_2px_10px_rgba(79,70,229,0.5)] border border-indigo-400/40"
                    : "text-slate-400 hover:text-white hover:bg-white/10"
                )}
              >
                <span className={cn(isActive ? "text-white" : "text-slate-400")}>{r.icon}</span>
                <span>{r.label}</span>
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.2 rounded-full font-normal hidden md:inline-block",
                    isActive ? "bg-white/20 text-white" : "bg-white/5 text-slate-400"
                  )}
                >
                  {r.sub}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
