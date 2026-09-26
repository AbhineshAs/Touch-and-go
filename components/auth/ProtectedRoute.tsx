"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { getStoredUser, getStoredToken } from "@/lib/api/auth";
import { UserRole } from "@/types";
import { LoadingState } from "@/components/ui/States";
import { Button } from "@/components/ui/Button";
import { ShieldAlert, ArrowLeft, LogOut, ArrowRight } from "lucide-react";
import Link from "next/link";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requiredPermissionDescription?: string;
}

export function ProtectedRoute({
  children,
  allowedRoles,
  requiredPermissionDescription,
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, isAuthenticated, switchRole, logout, refreshAuth } = useAuth();

  // Inspect storage synchronously to avoid race conditions when navigating right after session commit
  const storedUser = typeof window !== "undefined" ? getStoredUser() : null;
  const storedToken = typeof window !== "undefined" ? getStoredToken() : null;
  const effectivelyAuthenticated = isAuthenticated || Boolean(storedUser && storedToken);
  const effectiveUser = user || storedUser;

  useEffect(() => {
    if (!isLoading) {
      if (!effectivelyAuthenticated) {
        const redirectUrl = `/sign-in?redirect=${encodeURIComponent(pathname)}&reason=auth_required`;
        router.replace(redirectUrl);
      } else if (!isAuthenticated && storedUser && storedToken) {
        refreshAuth();
      }
    }
  }, [isLoading, effectivelyAuthenticated, isAuthenticated, pathname, router, refreshAuth, storedUser, storedToken]);

  if (isLoading || (!isAuthenticated && effectivelyAuthenticated)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingState message="Verifying authentication & access permissions..." />
      </div>
    );
  }

  if (!effectivelyAuthenticated || !effectiveUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingState message="Redirecting to sign-in..." />
      </div>
    );
  }

  // Role validation
  if (allowedRoles && effectiveUser && !allowedRoles.includes(effectiveUser.role)) {
    const primaryTargetRole = allowedRoles[0];
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-md w-full p-8 rounded-2xl bg-surface border border-border shadow-lg flex flex-col items-center text-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <div className="flex flex-col gap-1.5">
            <h1 className="text-lg font-extrabold text-text-primary">
              Role Access Restricted
            </h1>
            <p className="text-xs text-text-secondary leading-relaxed">
              You are signed in as <strong className="text-text-primary">{effectiveUser.name}</strong> with the{" "}
              <span className="capitalize font-semibold text-primary">{effectiveUser.role}</span> role.
              This area is restricted to{" "}
              <strong>{allowedRoles.map((r) => r.toUpperCase()).join(" / ")}</strong> accounts.
            </p>
            {requiredPermissionDescription && (
              <p className="text-[11px] text-text-muted mt-1 bg-background-alt p-2 rounded-lg">
                {requiredPermissionDescription}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2.5 w-full pt-2">
            <Button
              variant="primary"
              size="md"
              className="w-full"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={async () => {
                await switchRole(primaryTargetRole);
                router.push(`/${primaryTargetRole}/dashboard`);
              }}
            >
              Switch to {primaryTargetRole.toUpperCase()} Persona
            </Button>

            <Link href={`/${effectiveUser.role}/dashboard`} className="w-full">
              <Button variant="secondary" size="md" className="w-full">
                Return to My {effectiveUser.role.toUpperCase()} Workspace
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="sm"
              className="text-text-muted hover:text-danger mt-1"
              leftIcon={<LogOut className="w-3.5 h-3.5" />}
              onClick={() => logout("/")}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
