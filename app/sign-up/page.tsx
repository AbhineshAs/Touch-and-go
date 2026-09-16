"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema, SignUpFormValues } from "@/lib/schemas/auth";
import { signUp } from "@/lib/api/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Select";
import { LoadingState } from "@/components/ui/States";
import { UserRole } from "@/types";
import { User, Building2, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

import { useAuth } from "@/lib/auth/AuthContext";

type SignUpRole = "candidate" | "employer";

function SignUpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const rawRole = searchParams.get("role");
  const initialRole: SignUpRole = rawRole === "employer" ? "employer" : "candidate";

  const { signup } = useAuth();
  const [selectedRole, setSelectedRole] = useState<SignUpRole>(initialRole);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema) as any,
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      role: initialRole,
      agreeToTerms: false,
    },
  });

  const handleRoleChange = (role: SignUpRole) => {
    setSelectedRole(role);
    setValue("role", role);
  };

  const onSubmit = async (data: SignUpFormValues) => {
    await signup({
      name: data.fullName,
      email: data.email,
      role: data.role,
    });
    const redirectQuery = redirect ? `&redirect=${encodeURIComponent(redirect)}` : "";
    router.push(`/verify?role=${data.role}&email=${encodeURIComponent(data.email)}${redirectQuery}`);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-background px-4 py-12">
      <div className="w-full max-w-md flex flex-col gap-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-black text-xl shadow-xs">
              T
            </div>
            <span className="font-bold text-2xl text-text-primary">TAG</span>
          </Link>
          <h1 className="text-xl font-bold tracking-tight text-text-primary mt-2">
            Create your {selectedRole === "candidate" ? "Candidate" : "Employer"} Account
          </h1>
          <p className="text-xs text-text-muted">
            {selectedRole === "candidate"
              ? "Build your structured profile and discover verified technology roles"
              : "Verify your corporate domain and access structured tech talent"}
          </p>
        </div>

        <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-border shadow-xs flex flex-col gap-6">
          {/* Role selector */}
          <div className="grid grid-cols-2 p-1 bg-border-subtle rounded-xl gap-1">
            <button
              type="button"
              onClick={() => handleRoleChange("candidate")}
              className={cn(
                "flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                selectedRole === "candidate"
                  ? "bg-surface text-primary shadow-xs"
                  : "text-text-muted hover:text-text-primary"
              )}
            >
              <User className="w-3.5 h-3.5" />
              <span>Job Seeker</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange("employer")}
              className={cn(
                "flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                selectedRole === "employer"
                  ? "bg-surface text-primary shadow-xs"
                  : "text-text-muted hover:text-text-primary"
              )}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Hiring Team</span>
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <input type="hidden" {...register("role")} />

            <Input
              label="Full Name"
              placeholder={selectedRole === "candidate" ? "e.g. Ananya Sharma" : "e.g. Vikramaditya Nair"}
              error={errors.fullName?.message}
              {...register("fullName")}
            />

            <Input
              label={selectedRole === "candidate" ? "Email Address" : "Company Work Email"}
              type="email"
              placeholder={selectedRole === "candidate" ? "ananya@example.com" : "vikram@company.com"}
              error={errors.email?.message}
              helperText={selectedRole === "employer" ? "Please use your official company domain" : undefined}
              {...register("email")}
            />

            <Input
              label="Create Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              helperText="Minimum 8 characters with at least one number and uppercase letter"
              {...register("password")}
            />

            <div className="pt-2">
              <Checkbox
                label={
                  <span className="text-xs text-text-secondary">
                    I agree to the{" "}
                    <Link href="/trust" className="text-primary hover:underline font-medium">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/trust" className="text-primary hover:underline font-medium">
                      Responsible AI Charter
                    </Link>
                  </span>
                }
                checked={watch("agreeToTerms")}
                onChange={(e) => setValue("agreeToTerms", e.target.checked, { shouldValidate: true })}
              />
              {errors.agreeToTerms?.message && (
                <p className="text-xs text-danger font-medium mt-1">
                  {errors.agreeToTerms.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              size="md"
              variant="primary"
              className="w-full mt-2"
              isLoading={isSubmitting}
            >
              Create Account & Verify Email
            </Button>
          </form>

          <div className="pt-4 border-t border-border text-center text-xs text-text-secondary">
            Already have an account?{" "}
            <Link href="/sign-in" className="font-semibold text-primary hover:underline">
              Sign In
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

export default function SignUpPage() {
  return (
    <React.Suspense fallback={<LoadingState message="Loading sign-up..." className="min-h-screen" />}>
      <SignUpContent />
    </React.Suspense>
  );
}
