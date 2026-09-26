"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Select";
import { LoadingState } from "@/components/ui/States";
import { User, Building2, ArrowRight, ShieldAlert, Lock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/AuthContext";
import { useCandidate } from "@/lib/candidate/context/CandidateContext";
import { mockOtpService } from "@/lib/candidate/services/otpService";

type AuthMode = "signup" | "login";
type AuthRole = "candidate" | "employer";

const COUNTRY_CODES = [
  { code: "+91", label: "India (+91)", flag: "🇮🇳" },
  { code: "+1", label: "United States / Canada (+1)", flag: "🇺🇸" },
  { code: "+44", label: "United Kingdom (+44)", flag: "🇬🇧" },
  { code: "+65", label: "Singapore (+65)", flag: "🇸🇬" },
  { code: "+971", label: "United Arab Emirates (+971)", flag: "🇦🇪" },
  { code: "+49", label: "Germany (+49)", flag: "🇩🇪" },
  { code: "+61", label: "Australia (+61)", flag: "🇦🇺" },
];

// Candidate sign up schema
const candidateSignUpSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Please enter your name")
    .max(100, "Name is too long"),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address"),
  countryCode: z.string().min(1, "Please select a country code"),
  phone: z
    .string()
    .trim()
    .min(7, "Phone number must be at least 7 digits")
    .max(15, "Phone number must be at most 15 digits")
    .regex(/^[\d\s-]+$/, "Please enter a valid numeric phone number"),
  agreeToTerms: z
    .boolean()
    .refine((val) => val === true, "You must agree to the Terms of Service and Privacy Policy"),
});

type CandidateSignUpFormValues = z.infer<typeof candidateSignUpSchema>;

// Employer sign up schema
const employerSignUpSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters"),
  email: z.string().trim().email("Please enter a valid work email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must include at least one uppercase letter")
    .regex(/[0-9]/, "Must include at least one number"),
  agreeToTerms: z
    .boolean()
    .refine((val) => val === true, "You must agree to the Terms of Service"),
});

type EmployerSignUpFormValues = z.infer<typeof employerSignUpSchema>;

// Employer login schema
const employerLoginSchema = z.object({
  email: z.string().trim().email("Please enter a valid work email address"),
  password: z.string().min(1, "Please enter your password"),
});

type EmployerLoginFormValues = z.infer<typeof employerLoginSchema>;

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const rawRole = searchParams.get("role");
  const initialMode: AuthMode = searchParams.get("mode") === "login" ? "login" : "signup";
  const initialRole: AuthRole = rawRole === "employer" ? "employer" : "candidate";

  const { login, signup } = useAuth();
  const { setIdentity, loginCandidateByPhone } = useCandidate();

  const [activeTab, setActiveTab] = useState<AuthMode>(initialMode);
  const [selectedRole, setSelectedRole] = useState<AuthRole>(initialRole);
  const [showRoleSwitchWarning, setShowRoleSwitchWarning] = useState(false);
  const [pendingRoleSwitch, setPendingRoleSwitch] = useState<AuthRole | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  // Candidate login OTP state
  const [candidateLoginPhone, setCandidateLoginPhone] = useState("");
  const [candidateLoginOtp, setCandidateLoginOtp] = useState("");
  const [candidateOtpSent, setCandidateOtpSent] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // Sync mode with query params if changed externally
  useEffect(() => {
    const queryMode = searchParams.get("mode");
    if (queryMode === "login" || queryMode === "signup") {
      setActiveTab(queryMode);
    }
  }, [searchParams]);

  // Candidate Sign Up Form
  const candidateSignUpForm = useForm<CandidateSignUpFormValues>({
    resolver: zodResolver(candidateSignUpSchema),
    defaultValues: {
      fullName: "",
      email: "",
      countryCode: "+91",
      phone: "",
      agreeToTerms: false,
    },
  });

  // Employer Sign Up Form
  const employerSignUpForm = useForm<EmployerSignUpFormValues>({
    resolver: zodResolver(employerSignUpSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      agreeToTerms: false,
    },
  });

  // Employer Log In Form
  const employerLoginForm = useForm<EmployerLoginFormValues>({
    resolver: zodResolver(employerLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleRoleChange = (targetRole: AuthRole) => {
    if (targetRole === selectedRole) return;
    setAuthError(null);

    // If switching away from candidate in signup mode and candidate has entered text, warn before discarding
    if (activeTab === "signup" && selectedRole === "candidate" && targetRole === "employer") {
      const vals = candidateSignUpForm.getValues();
      if (vals.fullName || vals.email || vals.phone) {
        setPendingRoleSwitch(targetRole);
        setShowRoleSwitchWarning(true);
        return;
      }
    }

    setSelectedRole(targetRole);
  };

  const confirmRoleSwitch = () => {
    if (pendingRoleSwitch) {
      setSelectedRole(pendingRoleSwitch);
      setPendingRoleSwitch(null);
      setShowRoleSwitchWarning(false);
    }
  };

  const cancelRoleSwitch = () => {
    setPendingRoleSwitch(null);
    setShowRoleSwitchWarning(false);
  };

  const switchMode = (mode: AuthMode) => {
    setActiveTab(mode);
    setAuthError(null);
    setCandidateOtpSent(false);
  };

  // Submission Handlers
  const onCandidateSignUpSubmit = (data: CandidateSignUpFormValues) => {
    setIdentity({
      fullName: data.fullName,
      email: data.email,
      countryCode: data.countryCode,
      phone: data.phone,
      agreeToTerms: data.agreeToTerms,
    });

    mockOtpService.createChallenge(data.phone, data.countryCode);
    router.push("/verify-phone");
  };

  const onEmployerSignUpSubmit = async (data: EmployerSignUpFormValues) => {
    await signup({
      name: data.fullName,
      email: data.email,
      role: "employer",
    });
    const redirectQuery = redirect ? `&redirect=${encodeURIComponent(redirect)}` : "";
    router.push(`/verify?role=employer&email=${encodeURIComponent(data.email)}${redirectQuery}`);
  };

  const handleSendCandidateLoginOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateLoginPhone.trim()) {
      setAuthError("Please enter your registered phone number.");
      return;
    }
    setAuthError(null);
    setCandidateOtpSent(true);
  };

  const handleVerifyCandidateLoginOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (candidateLoginOtp !== "729410" && candidateLoginOtp.length < 6) {
      setAuthError("Invalid verification code. Use demo code 729410.");
      return;
    }

    setIsVerifyingOtp(true);
    setAuthError(null);

    try {
      const res = loginCandidateByPhone(candidateLoginPhone);
      await login(`cand_${candidateLoginPhone.slice(-10)}@tagjobs.in`, "candidate");

      if (redirect) {
        router.push(redirect);
      } else if (res.onboardingComplete) {
        router.push("/candidate/dashboard");
      } else {
        router.push("/onboarding");
      }
    } catch (err: any) {
      setAuthError(err.message || "Failed to verify phone OTP.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const onEmployerLoginSubmit = async (data: EmployerLoginFormValues) => {
    try {
      setAuthError(null);
      await login(data.email, "employer");
      if (redirect) {
        router.push(redirect);
      } else {
        router.push("/employer/dashboard");
      }
    } catch (err: any) {
      setAuthError(err.message || "Failed to sign in. Please verify your credentials.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-background px-4 py-12">
      <div className="w-full max-w-md flex flex-col gap-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <Link href="/sign-up" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-black text-xl shadow-xs group-hover:scale-105 transition-transform">
              T
            </div>
            <span className="font-bold text-2xl text-text-primary">TAG</span>
          </Link>
          <h1 className="text-xl font-bold tracking-tight text-text-primary mt-2">
            {activeTab === "signup"
              ? `Create your ${selectedRole === "candidate" ? "Candidate" : "Company"} Account`
              : `Sign In as ${selectedRole === "candidate" ? "Candidate" : "Company"}`}
          </h1>
          <p className="text-xs text-text-muted">
            {activeTab === "signup"
              ? selectedRole === "candidate"
                ? "Start your career discovery and personalize your dashboard"
                : "Verify your corporate domain and access structured tech talent"
              : selectedRole === "candidate"
                ? "Sign in with your registered phone number (passwordless OTP)"
                : "Access your company's hiring pipeline and talent matches"}
          </p>
        </div>

        {/* Role Switch Warning Alert */}
        {showRoleSwitchWarning && (
          <div className="p-4 rounded-xl bg-warning-soft border border-warning/30 flex flex-col gap-2.5 text-xs text-text-primary">
            <div className="flex items-center gap-2 text-warning font-bold">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Switching to Company</span>
            </div>
            <p className="text-text-secondary">
              Switching to the Company signup will clear the candidate details you have entered. Would you like to proceed?
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={confirmRoleSwitch}
                className="px-3 py-1.5 rounded-lg bg-warning text-white font-semibold text-xs hover:opacity-90 transition-opacity cursor-pointer"
              >
                Yes, Switch to Company
              </button>
              <button
                type="button"
                onClick={cancelRoleSwitch}
                className="px-3 py-1.5 rounded-lg bg-surface border border-border text-text-primary text-xs hover:bg-background transition-colors cursor-pointer"
              >
                Keep Candidate Form
              </button>
            </div>
          </div>
        )}

        <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-border shadow-xs flex flex-col gap-6">
          {/* Main Auth Mode Switcher: Sign Up vs Log In */}
          <div className="grid grid-cols-2 p-1 bg-border-subtle rounded-xl gap-1">
            <button
              type="button"
              onClick={() => switchMode("signup")}
              className={cn(
                "flex items-center justify-center py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                activeTab === "signup"
                  ? "bg-surface text-primary shadow-xs"
                  : "text-text-muted hover:text-text-primary"
              )}
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={() => switchMode("login")}
              className={cn(
                "flex items-center justify-center py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                activeTab === "login"
                  ? "bg-surface text-primary shadow-xs"
                  : "text-text-muted hover:text-text-primary"
              )}
            >
              Log In
            </button>
          </div>

          {/* Sub Role Selector: Job Seeker vs Company */}
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
              <span>Company</span>
            </button>
          </div>

          {authError && (
            <div className="p-3 rounded-lg bg-danger-soft border border-danger/20 text-xs text-danger font-medium">
              {authError}
            </div>
          )}

          {/* MODE 1: SIGN UP */}
          {activeTab === "signup" && (
            <>
              {selectedRole === "candidate" ? (
                <form onSubmit={candidateSignUpForm.handleSubmit(onCandidateSignUpSubmit)} className="flex flex-col gap-4">
                  <Input
                    label="Full Name"
                    placeholder="e.g. Ananya Sharma, José, or Li"
                    error={candidateSignUpForm.formState.errors.fullName?.message}
                    {...candidateSignUpForm.register("fullName")}
                  />

                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="ananya@example.com"
                    error={candidateSignUpForm.formState.errors.email?.message}
                    helperText="We'll use this to keep your preview and dashboard in sync"
                    {...candidateSignUpForm.register("email")}
                  />

                  {/* Phone Number with Explicit Country Selector */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-text-primary">Phone Number</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="sm:col-span-1">
                        <select
                          {...candidateSignUpForm.register("countryCode")}
                          className="w-full h-10 px-2.5 rounded-lg border border-border bg-surface text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                        >
                          {COUNTRY_CODES.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.flag} {c.code}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <input
                          type="tel"
                          placeholder="98765 43210"
                          {...candidateSignUpForm.register("phone")}
                          className="w-full h-10 px-3 rounded-lg border border-border bg-surface text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                      </div>
                    </div>
                    {candidateSignUpForm.formState.errors.phone && (
                      <p className="text-xs text-danger font-medium mt-0.5">
                        {candidateSignUpForm.formState.errors.phone.message}
                      </p>
                    )}
                    <span className="text-[11px] text-text-muted">
                      Used for simulated SMS verification. No actual SMS will be sent.
                    </span>
                  </div>

                  <div className="pt-2">
                    <Checkbox
                      label={
                        <span className="text-xs text-text-secondary leading-relaxed">
                          I agree to the{" "}
                          <Link href="/trust" target="_blank" className="text-primary hover:underline font-medium">
                            Terms of Service
                          </Link>{" "}
                          and{" "}
                          <Link href="/trust" target="_blank" className="text-primary hover:underline font-medium">
                            Privacy Policy
                          </Link>
                        </span>
                      }
                      checked={candidateSignUpForm.watch("agreeToTerms")}
                      onChange={(e) =>
                        candidateSignUpForm.setValue("agreeToTerms", e.target.checked, { shouldValidate: true })
                      }
                    />
                    {candidateSignUpForm.formState.errors.agreeToTerms?.message && (
                      <p className="text-xs text-danger font-medium mt-1">
                        {candidateSignUpForm.formState.errors.agreeToTerms.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    size="md"
                    variant="primary"
                    className="w-full mt-2"
                    isLoading={candidateSignUpForm.formState.isSubmitting}
                  >
                    Continue to Phone Verification
                  </Button>
                </form>
              ) : (
                <form onSubmit={employerSignUpForm.handleSubmit(onEmployerSignUpSubmit)} className="flex flex-col gap-4">
                  <Input
                    label="Full Name"
                    placeholder="e.g. Vikramaditya Nair"
                    error={employerSignUpForm.formState.errors.fullName?.message}
                    {...employerSignUpForm.register("fullName")}
                  />

                  <Input
                    label="Company Work Email"
                    type="email"
                    placeholder="vikram@company.com"
                    error={employerSignUpForm.formState.errors.email?.message}
                    helperText="Please use your official company domain"
                    {...employerSignUpForm.register("email")}
                  />

                  <Input
                    label="Create Password"
                    type="password"
                    placeholder="••••••••"
                    error={employerSignUpForm.formState.errors.password?.message}
                    helperText="Minimum 8 characters with at least one number and uppercase letter"
                    {...employerSignUpForm.register("password")}
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
                      checked={employerSignUpForm.watch("agreeToTerms")}
                      onChange={(e) =>
                        employerSignUpForm.setValue("agreeToTerms", e.target.checked, { shouldValidate: true })
                      }
                    />
                    {employerSignUpForm.formState.errors.agreeToTerms?.message && (
                      <p className="text-xs text-danger font-medium mt-1">
                        {employerSignUpForm.formState.errors.agreeToTerms.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    size="md"
                    variant="primary"
                    className="w-full mt-2"
                    isLoading={employerSignUpForm.formState.isSubmitting}
                  >
                    Create Account & Verify Email
                  </Button>
                </form>
              )}

              <div className="pt-4 border-t border-border text-center text-xs text-text-secondary">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="font-semibold text-primary hover:underline cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            </>
          )}

          {/* MODE 2: LOG IN */}
          {activeTab === "login" && (
            <>
              {selectedRole === "candidate" ? (
                <div className="flex flex-col gap-4">
                  {!candidateOtpSent ? (
                    <form onSubmit={handleSendCandidateLoginOtp} className="flex flex-col gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-text-primary">Phone Number</label>
                        <div className="flex gap-2">
                          <div className="w-20 px-3 py-2 rounded-xl border border-border bg-background text-xs text-text-muted flex items-center justify-center font-medium">
                            🇮🇳 +91
                          </div>
                          <input
                            type="tel"
                            value={candidateLoginPhone}
                            onChange={(e) => setCandidateLoginPhone(e.target.value)}
                            placeholder="98765 43210"
                            className="flex-1 px-3 py-2 rounded-xl border border-border bg-background text-xs text-text-primary focus:outline-none focus:border-primary"
                            required
                          />
                        </div>
                        <span className="text-[11px] text-text-muted">
                          Enter the phone number used during registration.
                        </span>
                      </div>

                      <Button
                        type="submit"
                        size="md"
                        variant="primary"
                        className="w-full mt-2"
                        rightIcon={<ArrowRight className="w-4 h-4" />}
                      >
                        Send Verification Code
                      </Button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyCandidateLoginOtp} className="flex flex-col gap-4">
                      <div className="p-3 rounded-xl bg-primary-soft/40 border border-primary/20 text-xs text-primary-dark flex items-center justify-between">
                        <span>Code sent to +91 {candidateLoginPhone.slice(-10)}</span>
                        <button
                          type="button"
                          onClick={() => setCandidateOtpSent(false)}
                          className="font-bold underline text-[11px] cursor-pointer"
                        >
                          Change
                        </button>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-text-primary">6-Digit OTP</label>
                          <span className="text-[11px] font-mono text-primary">Demo code: 729410</span>
                        </div>
                        <input
                          type="text"
                          maxLength={6}
                          value={candidateLoginOtp}
                          onChange={(e) => setCandidateLoginOtp(e.target.value)}
                          className="text-center font-mono text-lg tracking-widest px-3 py-2 rounded-xl border border-border bg-background text-text-primary focus:outline-none focus:border-primary"
                          placeholder="••••••"
                          required
                        />
                      </div>

                      <Button
                        type="submit"
                        size="md"
                        variant="primary"
                        className="w-full mt-2"
                        isLoading={isVerifyingOtp}
                      >
                        Verify & Continue
                      </Button>
                    </form>
                  )}
                </div>
              ) : (
                <form onSubmit={employerLoginForm.handleSubmit(onEmployerLoginSubmit)} className="flex flex-col gap-4">
                  <Input
                    label="Company Email"
                    type="email"
                    placeholder="vikram@company.com"
                    error={employerLoginForm.formState.errors.email?.message}
                    {...employerLoginForm.register("email")}
                  />

                  <Input
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    error={employerLoginForm.formState.errors.password?.message}
                    {...employerLoginForm.register("password")}
                  />

                  <Button
                    type="submit"
                    size="md"
                    variant="primary"
                    className="w-full mt-2"
                    isLoading={employerLoginForm.formState.isSubmitting}
                  >
                    Sign In to Company Portal
                  </Button>
                </form>
              )}

              <div className="pt-4 border-t border-border text-center text-xs text-text-secondary">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("signup")}
                  className="font-semibold text-primary hover:underline cursor-pointer"
                >
                  Create an Account
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <React.Suspense fallback={<LoadingState message="Loading authentication..." className="min-h-screen" />}>
      <AuthContent />
    </React.Suspense>
  );
}
