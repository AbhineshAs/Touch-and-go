"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema, SignInFormValues } from "@/lib/schemas/auth";
import { useAuth } from "@/lib/auth/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { LoadingState } from "@/components/ui/States";
import { UserRole } from "@/types";
import { User, Building2, ShieldCheck, ArrowLeft, Lock, Sparkles, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const reason = searchParams.get("reason");
  const rawRole = searchParams.get("role");
  const initialRole: "candidate" | "employer" = rawRole === "employer" ? "employer" : "candidate";

  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<"candidate" | "employer">(initialRole);
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email:
        selectedRole === "candidate"
          ? "ananya.sharma@example.com"
          : "vikram@razorwave.tech",
      password: "Password123!",
      role: selectedRole,
    },
  });

  const handleRoleChange = (role: "candidate" | "employer") => {
    setSelectedRole(role);
    setValue("role", role);
    if (role === "candidate") {
      setValue("email", "ananya.sharma@example.com");
    } else {
      setValue("email", "vikram@razorwave.tech");
    }
  };

  const handleSuccessfulAuth = (role: UserRole) => {
    if (redirect) {
      router.push(redirect);
    } else if (role === "candidate") {
      router.push("/candidate/dashboard");
    } else if (role === "employer") {
      router.push("/employer/dashboard");
    } else {
      router.push("/admin/dashboard");
    }
  };

  const onSubmit = async (data: SignInFormValues) => {
    try {
      setAuthError(null);
      await login(data.email, data.role);
      handleSuccessfulAuth(data.role);
    } catch (err: any) {
      setAuthError(err.message || "Failed to sign in. Please verify your credentials.");
    }
  };

  const handleQuickDemoLogin = async (role: UserRole) => {
    try {
      setAuthError(null);
      const email =
        role === "candidate"
          ? "ananya.sharma@example.com"
          : role === "employer"
          ? "vikram@razorwave.tech"
          : "priya.admin@tagjobs.in";
      await login(email, role);
      handleSuccessfulAuth(role);
    } catch (err: any) {
      setAuthError(err.message || "Failed to sign in.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-background px-4 py-12">
      <div className="w-full max-w-md flex flex-col gap-6">
        {/* Brand header */}
        <div className="flex flex-col items-center text-center gap-2">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#197B69] to-[#0A3C34] text-white flex items-center justify-center font-black text-xl shadow-xs group-hover:scale-105 transition-transform">
              T
            </div>
            <span className="font-bold text-2xl text-text-primary">TAG</span>
          </Link>
          <h1 className="text-xl font-bold tracking-tight text-text-primary mt-2">
            Sign in to your account
          </h1>
          <p className="text-xs text-text-muted">
            Access your structured profile, verified job listings, or hiring pipeline
          </p>
        </div>

        {/* Reason banner if redirected from protected route */}
        {reason === "auth_required" && (
          <div className="p-3.5 rounded-xl bg-primary-soft border border-primary/25 flex items-start gap-2.5 text-xs text-primary-dark animate-in fade-in duration-200">
            <Lock className="w-4 h-4 shrink-0 text-primary mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="font-bold">Authentication Required</span>
              <span>
                Please sign in or create an account to access that private workspace. You&apos;ll be
                redirected right after logging in.
              </span>
            </div>
          </div>
        )}

        {/* Card Box */}
        <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-border shadow-xs flex flex-col gap-6">
          {/* Role selector tabs */}
          <div className="grid grid-cols-2 p-1 bg-border-subtle rounded-xl gap-1">
            <button
              type="button"
              onClick={() => handleRoleChange("candidate")}
              className={cn(
                "flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                selectedRole === "candidate"
                  ? "bg-surface text-primary shadow-xs"
                  : "text-text-muted hover:text-text-primary"
              )}
            >
              <User className="w-3.5 h-3.5" />
              <span>Candidate</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange("employer")}
              className={cn(
                "flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                selectedRole === "employer"
                  ? "bg-surface text-primary shadow-xs"
                  : "text-text-muted hover:text-text-primary"
              )}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Employer</span>
            </button>
          </div>

          {authError && (
            <div className="p-3 rounded-lg bg-danger-soft border border-danger/20 text-xs text-danger font-medium">
              {authError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <input type="hidden" {...register("role")} />

            <Input
              label="Email Address"
              type="email"
              placeholder={
                selectedRole === "candidate"
                  ? "you@example.com"
                  : "you@company.com"
              }
              error={errors.email?.message}
              {...register("email")}
            />

            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-secondary">Password</span>
                <Link
                  href="/recover"
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register("password")}
              />
            </div>

            <Button
              type="submit"
              size="md"
              variant="primary"
              className="w-full mt-2"
              isLoading={isSubmitting}
            >
              Sign In as {selectedRole === "candidate" ? "Candidate" : "Employer"}
            </Button>
          </form>

          {/* Quick Demo Logins for frictionless testing */}
          <div className="p-3 rounded-xl bg-background-alt/80 border border-border flex flex-col gap-2">
            <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
              Quick 1-Click Test Personas
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin("candidate")}
                className="px-2 py-1.5 rounded-lg bg-surface border border-border hover:border-primary/40 text-[11px] font-semibold text-text-secondary hover:text-primary transition-colors text-center"
              >
                Ananya (Candidate)
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin("employer")}
                className="px-2 py-1.5 rounded-lg bg-surface border border-border hover:border-primary/40 text-[11px] font-semibold text-text-secondary hover:text-primary transition-colors text-center"
              >
                Vikram (Employer)
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-border text-center text-xs text-text-secondary">
            Don&apos;t have an account?{" "}
            <Link
              href={`/sign-up?role=${selectedRole}${
                redirect ? `&redirect=${encodeURIComponent(redirect)}` : ""
              }`}
              className="font-semibold text-primary hover:underline"
            >
              Create {selectedRole} account
            </Link>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Public Marketplace</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <React.Suspense fallback={<LoadingState message="Loading sign-in..." className="min-h-screen" />}>
      <SignInContent />
    </React.Suspense>
  );
}
