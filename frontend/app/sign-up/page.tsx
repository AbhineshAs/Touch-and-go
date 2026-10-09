"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Select";
import { LoadingState } from "@/components/ui/States";
import {
  User,
  Building2,
  ArrowRight,
  ArrowLeft,
  ShieldAlert,
  Eye,
  EyeOff,
  CheckCircle2,
  RotateCcw,
  Mail,
  KeyRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/AuthContext";
import { useCandidate } from "@/lib/candidate/context/CandidateContext";
import { mockOtpService } from "@/lib/candidate/services/otpService";
import { TagLogo } from "@/components/ui/TagLogo";

type AuthMode = "signup" | "login" | "forgot_password";
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

const candidateSignUpSchema = z
  .object({
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
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must include at least one uppercase letter")
      .regex(/[0-9]/, "Must include at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    agreeToTerms: z
      .boolean()
      .refine((val) => val === true, "You must agree to the Terms of Service and Privacy Policy"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type CandidateSignUpFormValues = z.infer<typeof candidateSignUpSchema>;

const employerSignUpSchema = z
  .object({
    fullName: z.string().trim().min(2, "Full name must be at least 2 characters"),
    email: z.string().trim().email("Please enter a valid work email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must include at least one uppercase letter")
      .regex(/[0-9]/, "Must include at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    agreeToTerms: z
      .boolean()
      .refine((val) => val === true, "You must agree to the Terms of Service"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type EmployerSignUpFormValues = z.infer<typeof employerSignUpSchema>;

const candidateLoginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(1, "Please enter your password"),
});

type CandidateLoginFormValues = z.infer<typeof candidateLoginSchema>;

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
  const { setIdentity, loginCandidateByPhone, loginCandidateByEmail } = useCandidate();

  const [activeTab, setActiveTab] = useState<AuthMode>(initialMode);
  const [selectedRole, setSelectedRole] = useState<AuthRole>(initialRole);
  const [showRoleSwitchWarning, setShowRoleSwitchWarning] = useState(false);
  const [pendingRoleSwitch, setPendingRoleSwitch] = useState<AuthRole | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const [showCandidatePassword, setShowCandidatePassword] = useState(false);
  const [showCandidateConfirmPassword, setShowCandidateConfirmPassword] = useState(false);
  const [showCandidateLoginPassword, setShowCandidateLoginPassword] = useState(false);
  const [showEmployerPassword, setShowEmployerPassword] = useState(false);
  const [showEmployerConfirmPassword, setShowEmployerConfirmPassword] = useState(false);

  // Forgot Password state
  type ForgotPasswordStep = "email" | "otp" | "reset_password" | "success";
  const [forgotStep, setForgotStep] = useState<ForgotPasswordStep>("email");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [showForgotConfirmPassword, setShowForgotConfirmPassword] = useState(false);
  const [forgotOtpError, setForgotOtpError] = useState<string | null>(null);
  const [forgotPasswordError, setForgotPasswordError] = useState<string | null>(null);
  const [forgotResendCooldown, setForgotResendCooldown] = useState(30);
  const [isSendingForgotOtp, setIsSendingForgotOtp] = useState(false);
  const [isVerifyingForgotOtp, setIsVerifyingForgotOtp] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const forgotOtpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (forgotResendCooldown <= 0) return;
    const timer = setInterval(() => {
      setForgotResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [forgotResendCooldown]);

  const handleForgotOtpChange = (index: number, val: string) => {
    setForgotOtpError(null);
    const clean = val.replace(/\D/g, "");
    const next = [...forgotOtp];
    next[index] = clean.slice(-1);
    setForgotOtp(next);
    if (clean && index < 5) {
      forgotOtpRefs.current[index + 1]?.focus();
    }
  };

  const handleForgotOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !forgotOtp[index] && index > 0) {
      forgotOtpRefs.current[index - 1]?.focus();
    }
  };

  const handleForgotOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    setForgotOtpError(null);
    const pastedData = e.clipboardData.getData("text").trim().replace(/\D/g, "").slice(0, 6);
    if (!pastedData) return;
    const next = [...forgotOtp];
    for (let i = 0; i < pastedData.length; i++) {
      next[i] = pastedData[i];
    }
    setForgotOtp(next);
    const nextIdx = Math.min(pastedData.length, 5);
    forgotOtpRefs.current[nextIdx]?.focus();
  };

  const handleSendForgotOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = forgotEmail.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setAuthError("Please enter a valid email address.");
      return;
    }
    setIsSendingForgotOtp(true);
    setAuthError(null);
    await new Promise((r) => setTimeout(r, 450));
    setIsSendingForgotOtp(false);
    setForgotResendCooldown(30);
    setForgotStep("otp");
  };

  const handleVerifyForgotOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = forgotOtp.join("");
    if (code.length < 6) {
      setForgotOtpError("Please enter all 6 digits of the confirmation code.");
      return;
    }
    setIsVerifyingForgotOtp(true);
    setForgotOtpError(null);
    await new Promise((r) => setTimeout(r, 400));
    setIsVerifyingForgotOtp(false);

    if (code !== "729410") {
      setForgotOtpError("Invalid verification code. Use demo code 729410.");
      return;
    }

    setForgotStep("reset_password");
  };

  const handleResendForgotOtp = () => {
    if (forgotResendCooldown > 0) return;
    setForgotOtp(["", "", "", "", "", ""]);
    setForgotOtpError(null);
    setForgotResendCooldown(30);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotPasswordError(null);

    if (forgotNewPassword.length < 8) {
      setForgotPasswordError("Password must be at least 8 characters long.");
      return;
    }
    if (!/[A-Z]/.test(forgotNewPassword)) {
      setForgotPasswordError("Password must include at least one uppercase letter.");
      return;
    }
    if (!/[0-9]/.test(forgotNewPassword)) {
      setForgotPasswordError("Password must include at least one number.");
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotPasswordError("Passwords do not match.");
      return;
    }

    setIsResettingPassword(true);
    await new Promise((r) => setTimeout(r, 500));
    setIsResettingPassword(false);
    setForgotStep("success");
  };

  useEffect(() => {
    const queryMode = searchParams.get("mode");
    if (queryMode === "login" || queryMode === "signup" || queryMode === "forgot_password") {
      setActiveTab(queryMode);
    }
  }, [searchParams]);

  const candidateSignUpForm = useForm<CandidateSignUpFormValues>({
    resolver: zodResolver(candidateSignUpSchema),
    defaultValues: {
      fullName: "",
      email: "",
      countryCode: "+91",
      phone: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: false,
    },
  });

  const employerSignUpForm = useForm<EmployerSignUpFormValues>({
    resolver: zodResolver(employerSignUpSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: false,
    },
  });

  const candidateLoginForm = useForm<CandidateLoginFormValues>({
    resolver: zodResolver(candidateLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

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
  };

  const onCandidateSignUpSubmit = (data: CandidateSignUpFormValues) => {
    setIdentity({
      fullName: data.fullName,
      email: data.email,
      countryCode: data.countryCode,
      phone: data.phone,
      password: data.password,
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

  const onCandidateLoginSubmit = async (data: CandidateLoginFormValues) => {
    try {
      setAuthError(null);
      if (loginCandidateByEmail) {
        loginCandidateByEmail(data.email);
      }
      await login(data.email, "candidate");

      if (redirect) {
        router.push(redirect);
      } else {
        router.push("/candidate/dashboard");
      }
    } catch (err: any) {
      setAuthError(err.message || "Failed to sign in. Please verify your credentials.");
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
    <div className="min-h-screen flex flex-col justify-between items-center bg-[#F8FAFC] px-4 py-8 sm:py-12 text-slate-900 font-sans">
      <div className="w-full max-w-[400px] flex flex-col gap-5 my-auto">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-1.5">
          <TagLogo height={40} />
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">
            {activeTab === "signup"
              ? "Create your account"
              : activeTab === "login"
                ? "Sign in to Touch And Go"
                : forgotStep === "otp"
                  ? "Verify your email"
                  : forgotStep === "reset_password"
                    ? "Create new password"
                    : forgotStep === "success"
                      ? "Password reset complete"
                      : "Reset your password"}
          </h1>
          <p className="text-xs text-slate-500 font-normal max-w-sm leading-relaxed">
            {activeTab === "signup"
              ? selectedRole === "candidate"
                ? "Join candidates discovering 1-touch matched opportunities"
                : "Access structured tech talent matches for your team"
              : activeTab === "login"
                ? selectedRole === "candidate"
                  ? "Enter your credentials to access your candidate dashboard"
                  : "Access your company's hiring pipeline and talent matches"
                : forgotStep === "otp"
                  ? `Enter the 6-digit verification code sent to ${forgotEmail}`
                  : forgotStep === "reset_password"
                    ? "Enter your new password below"
                    : forgotStep === "success"
                      ? "You can now log in to your account"
                      : "Enter your registered email to receive a verification code"}
          </p>
        </div>

        {/* Role Switch Warning Alert */}
        {showRoleSwitchWarning && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex flex-col gap-2 text-xs text-slate-900 shadow-2xs">
            <div className="flex items-center gap-2 text-amber-800 font-bold">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Switching to Company</span>
            </div>
            <p className="text-slate-600 font-medium">
              Switching to the Company signup will clear the candidate details you have entered. Would you like to proceed?
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={confirmRoleSwitch}
                className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-bold text-xs cursor-pointer shadow-2xs"
              >
                Yes, Switch to Company
              </button>
              <button
                type="button"
                onClick={cancelRoleSwitch}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 font-semibold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Keep Candidate Form
              </button>
            </div>
          </div>
        )}

        {/* Main Card */}
        <div className="p-6 sm:p-7 flex flex-col gap-4 bg-white border border-slate-200/80 rounded-2xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)]">
          {activeTab !== "forgot_password" && (
            <>
              {/* Main Auth Mode Switcher */}
              <div className="grid grid-cols-2 p-1 bg-slate-100/80 rounded-xl gap-1">
                <button
                  type="button"
                  onClick={() => switchMode("signup")}
                  className={cn(
                    "flex items-center justify-center py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                    activeTab === "signup"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  )}
                >
                  Sign Up
                </button>
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className={cn(
                    "flex items-center justify-center py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                    activeTab === "login"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  )}
                >
                  Log In
                </button>
              </div>

              {/* Sub Role Selector */}
              <div className="flex items-center justify-center gap-1.5 p-0.5 bg-slate-50 rounded-lg border border-slate-200/60">
                <button
                  type="button"
                  onClick={() => handleRoleChange("candidate")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs transition-all cursor-pointer",
                    selectedRole === "candidate"
                      ? "bg-white text-[#4F46E5] shadow-2xs font-semibold border border-slate-200/50"
                      : "text-slate-500 hover:text-slate-700 font-medium"
                  )}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Job Seeker</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleChange("employer")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs transition-all cursor-pointer",
                    selectedRole === "employer"
                      ? "bg-white text-[#4F46E5] shadow-2xs font-semibold border border-slate-200/50"
                      : "text-slate-500 hover:text-slate-700 font-medium"
                  )}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Company</span>
                </button>
              </div>
            </>
          )}

          {authError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold">
              {authError}
            </div>
          )}

          {/* MODE 1: SIGN UP */}
          {activeTab === "signup" && (
            <>
              {selectedRole === "candidate" ? (
                <form onSubmit={candidateSignUpForm.handleSubmit(onCandidateSignUpSubmit)} className="flex flex-col gap-3.5">
                  <Input
                    label="Full Name"
                    labelClassName="text-xs font-bold text-slate-800"
                    placeholder="e.g. Ananya Sharma"
                    error={candidateSignUpForm.formState.errors.fullName?.message}
                    {...candidateSignUpForm.register("fullName")}
                  />

                  <Input
                    label="Email Address"
                    labelClassName="text-xs font-bold text-slate-800"
                    type="email"
                    placeholder="ananya@example.com"
                    error={candidateSignUpForm.formState.errors.email?.message}
                    {...candidateSignUpForm.register("email")}
                  />

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-800 select-none">Phone Number</label>
                    <div className="flex h-10 rounded-lg border border-slate-200 bg-white overflow-hidden focus-within:border-[#4F46E5] focus-within:ring-1 focus-within:ring-[#4F46E5]/20 transition-all">
                      <select
                        {...candidateSignUpForm.register("countryCode")}
                        className="h-full px-2.5 bg-slate-50/70 border-r border-slate-200 text-xs font-medium text-slate-700 outline-none cursor-pointer hover:bg-slate-100 transition-colors"
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.flag} {c.code}
                          </option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        placeholder="98765 43210"
                        {...candidateSignUpForm.register("phone")}
                        className="flex-1 h-full px-3 text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none bg-transparent"
                      />
                    </div>
                    {candidateSignUpForm.formState.errors.phone && (
                      <p className="text-[11px] text-red-600 font-medium mt-0.5">
                        {candidateSignUpForm.formState.errors.phone.message}
                      </p>
                    )}
                  </div>

                  <Input
                    label="Password"
                    labelClassName="text-xs font-bold text-slate-800"
                    type={showCandidatePassword ? "text" : "password"}
                    placeholder="••••••••"
                    error={candidateSignUpForm.formState.errors.password?.message}
                    helperText="At least 8 characters with 1 number and uppercase letter"
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowCandidatePassword(!showCandidatePassword)}
                        className="p-1 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                        tabIndex={-1}
                        aria-label={showCandidatePassword ? "Hide password" : "Show password"}
                      >
                        {showCandidatePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    }
                    {...candidateSignUpForm.register("password")}
                  />

                  <Input
                    label="Confirm Password"
                    labelClassName="text-xs font-bold text-slate-800"
                    type={showCandidateConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    error={candidateSignUpForm.formState.errors.confirmPassword?.message}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowCandidateConfirmPassword(!showCandidateConfirmPassword)}
                        className="p-1 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                        tabIndex={-1}
                        aria-label={showCandidateConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showCandidateConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    }
                    {...candidateSignUpForm.register("confirmPassword")}
                  />

                  <div className="pt-1">
                    <Checkbox
                      label={
                        <span className="text-xs text-slate-500 leading-relaxed font-normal">
                          I agree to the{" "}
                          <Link href="/trust" target="_blank" className="text-[#4F46E5] hover:underline font-medium">
                            Terms of Service
                          </Link>{" "}
                          and{" "}
                          <Link href="/trust" target="_blank" className="text-[#4F46E5] hover:underline font-medium">
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
                      <p className="text-[11px] text-red-600 font-medium mt-1">
                        {candidateSignUpForm.formState.errors.agreeToTerms.message}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full h-10 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] active:bg-[#3730A3] text-white font-medium text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer mt-1"
                  >
                    <span>Agree &amp; Join</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              ) : (
                <form onSubmit={employerSignUpForm.handleSubmit(onEmployerSignUpSubmit)} className="flex flex-col gap-3.5">
                  <Input
                    label="Full Name"
                    labelClassName="text-xs font-bold text-slate-800"
                    placeholder="e.g. Vikramaditya Nair"
                    error={employerSignUpForm.formState.errors.fullName?.message}
                    {...employerSignUpForm.register("fullName")}
                  />

                  <Input
                    label="Company Work Email"
                    labelClassName="text-xs font-bold text-slate-800"
                    type="email"
                    placeholder="vikram@company.com"
                    error={employerSignUpForm.formState.errors.email?.message}
                    helperText="Please use your official company domain"
                    {...employerSignUpForm.register("email")}
                  />

                  <Input
                    label="Create Password"
                    labelClassName="text-xs font-bold text-slate-800"
                    type={showEmployerPassword ? "text" : "password"}
                    placeholder="••••••••"
                    error={employerSignUpForm.formState.errors.password?.message}
                    helperText="At least 8 characters with 1 number and uppercase letter"
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowEmployerPassword(!showEmployerPassword)}
                        className="p-1 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                        tabIndex={-1}
                        aria-label={showEmployerPassword ? "Hide password" : "Show password"}
                      >
                        {showEmployerPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    }
                    {...employerSignUpForm.register("password")}
                  />

                  <Input
                    label="Confirm Password"
                    labelClassName="text-xs font-bold text-slate-800"
                    type={showEmployerConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    error={employerSignUpForm.formState.errors.confirmPassword?.message}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowEmployerConfirmPassword(!showEmployerConfirmPassword)}
                        className="p-1 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                        tabIndex={-1}
                        aria-label={showEmployerConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showEmployerConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    }
                    {...employerSignUpForm.register("confirmPassword")}
                  />

                  <div className="pt-1">
                    <Checkbox
                      label={
                        <span className="text-xs text-slate-500 font-normal">
                          I agree to the{" "}
                          <Link href="/trust" className="text-[#4F46E5] hover:underline font-medium">
                            Terms of Service
                          </Link>{" "}
                          and{" "}
                          <Link href="/trust" className="text-[#4F46E5] hover:underline font-medium">
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
                      <p className="text-[11px] text-red-600 font-medium mt-1">
                        {employerSignUpForm.formState.errors.agreeToTerms.message}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full h-10 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] active:bg-[#3730A3] text-white font-medium text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer mt-1"
                  >
                    <span>Create Account &amp; Verify Email</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}

              <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-500 font-normal">
                Already on TAG?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="font-semibold text-[#4F46E5] hover:underline cursor-pointer"
                >
                  Sign in
                </button>
              </div>
            </>
          )}

          {/* MODE 2: LOG IN */}
          {activeTab === "login" && (
            <>
              {selectedRole === "candidate" ? (
                <form onSubmit={candidateLoginForm.handleSubmit(onCandidateLoginSubmit)} className="flex flex-col gap-3.5">
                  <Input
                    label="Email Address"
                    labelClassName="text-xs font-bold text-slate-800"
                    type="email"
                    placeholder="alen@example.com"
                    error={candidateLoginForm.formState.errors.email?.message}
                    {...candidateLoginForm.register("email")}
                  />

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800">Password</label>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthError(null);
                          setForgotStep("email");
                          const currentEmail = candidateLoginForm.getValues("email");
                          if (currentEmail) setForgotEmail(currentEmail);
                          setActiveTab("forgot_password");
                        }}
                        className="text-xs font-semibold text-[#4F46E5] hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <Input
                      type={showCandidateLoginPassword ? "text" : "password"}
                      placeholder="••••••••"
                      error={candidateLoginForm.formState.errors.password?.message}
                      rightIcon={
                        <button
                          type="button"
                          onClick={() => setShowCandidateLoginPassword(!showCandidateLoginPassword)}
                          className="text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                          tabIndex={-1}
                          aria-label={showCandidateLoginPassword ? "Hide password" : "Show password"}
                        >
                          {showCandidateLoginPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      }
                      {...candidateLoginForm.register("password")}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={candidateLoginForm.formState.isSubmitting}
                    className="w-full h-10 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] active:bg-[#3730A3] text-white font-medium text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer mt-1 disabled:opacity-50"
                  >
                    <span>{candidateLoginForm.formState.isSubmitting ? "Signing In..." : "Sign In"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              ) : (
                <form onSubmit={employerLoginForm.handleSubmit(onEmployerLoginSubmit)} className="flex flex-col gap-3.5">
                  <Input
                    label="Company Email"
                    labelClassName="text-xs font-bold text-slate-800"
                    type="email"
                    placeholder="vikram@company.com"
                    error={employerLoginForm.formState.errors.email?.message}
                    {...employerLoginForm.register("email")}
                  />

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800">Password</label>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthError(null);
                          setForgotStep("email");
                          const currentEmail = employerLoginForm.getValues("email");
                          if (currentEmail) setForgotEmail(currentEmail);
                          setActiveTab("forgot_password");
                        }}
                        className="text-xs font-semibold text-[#4F46E5] hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <Input
                      type={showEmployerPassword ? "text" : "password"}
                      placeholder="••••••••"
                      error={employerLoginForm.formState.errors.password?.message}
                      rightIcon={
                        <button
                          type="button"
                          onClick={() => setShowEmployerPassword(!showEmployerPassword)}
                          className="text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                          tabIndex={-1}
                          aria-label={showEmployerPassword ? "Hide password" : "Show password"}
                        >
                          {showEmployerPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      }
                      {...employerLoginForm.register("password")}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={employerLoginForm.formState.isSubmitting}
                    className="w-full h-10 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] active:bg-[#3730A3] text-white font-medium text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer mt-1 disabled:opacity-50"
                  >
                    <span>{employerLoginForm.formState.isSubmitting ? "Signing In..." : "Sign In"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}

              <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-500 font-normal">
                New to TAG?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("signup")}
                  className="font-semibold text-[#4F46E5] hover:underline cursor-pointer"
                >
                  Join now
                </button>
              </div>
            </>
          )}

          {/* MODE 3: FORGOT PASSWORD */}
          {activeTab === "forgot_password" && (
            <div className="flex flex-col gap-4">
              {/* Clean Top Navigation */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("login");
                    setForgotStep("email");
                    setAuthError(null);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </button>
                {forgotStep !== "success" && (
                  <span className="text-[11px] font-semibold text-slate-400">
                    Step {forgotStep === "email" ? "1" : forgotStep === "otp" ? "2" : "3"} of 3
                  </span>
                )}
              </div>

              {/* STEP 1: ENTER EMAIL */}
              {forgotStep === "email" && (
                <form onSubmit={handleSendForgotOtp} className="flex flex-col gap-3.5">
                  <Input
                    label="Email Address"
                    labelClassName="text-xs font-bold text-slate-800"
                    type="email"
                    placeholder="name@example.com"
                    value={forgotEmail}
                    onChange={(e) => {
                      setForgotEmail(e.target.value);
                      setAuthError(null);
                    }}
                    required
                    autoFocus
                  />

                  {authError && (
                    <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600 font-medium">
                      {authError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSendingForgotOtp}
                    className="w-full h-10 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] active:bg-[#3730A3] text-white font-medium text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer mt-1 disabled:opacity-50"
                  >
                    <span>{isSendingForgotOtp ? "Sending Code..." : "Send Verification Code"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}

              {/* STEP 2: ENTER OTP */}
              {forgotStep === "otp" && (
                <form onSubmit={handleVerifyForgotOtp} className="flex flex-col gap-3.5">
                  {/* Discreet Demo Banner */}
                  <div className="flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-slate-50 border border-slate-200/60">
                    <span className="text-slate-500 text-[11px]">Demo verification code:</span>
                    <code className="font-mono font-bold text-[#4F46E5] text-xs">729410</code>
                  </div>

                  {/* 6 Digit Input Grid */}
                  <div className="flex justify-between gap-1.5 sm:gap-2">
                    {forgotOtp.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => {
                          forgotOtpRefs.current[idx] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleForgotOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleForgotOtpKeyDown(idx, e)}
                        onPaste={idx === 0 ? handleForgotOtpPaste : undefined}
                        aria-label={`Digit ${idx + 1}`}
                        className="w-10 h-12 sm:w-11 sm:h-13 text-center text-lg font-bold rounded-lg border border-slate-200 bg-white text-slate-900 focus:border-[#4F46E5] focus:outline-none focus:ring-1 focus:ring-[#4F46E5]/20 transition-all"
                      />
                    ))}
                  </div>

                  {forgotOtpError && (
                    <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600 font-medium">
                      {forgotOtpError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isVerifyingForgotOtp}
                    className="w-full h-10 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] active:bg-[#3730A3] text-white font-medium text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer mt-1 disabled:opacity-50"
                  >
                    <span>{isVerifyingForgotOtp ? "Verifying..." : "Verify Code"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setForgotStep("email")}
                      className="text-slate-500 hover:text-slate-800 transition-colors cursor-pointer text-xs"
                    >
                      Change Email
                    </button>
                    {forgotResendCooldown > 0 ? (
                      <span className="text-slate-400 text-xs">Resend in {forgotResendCooldown}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendForgotOtp}
                        className="font-semibold text-[#4F46E5] hover:underline cursor-pointer flex items-center gap-1 text-xs"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Resend Code</span>
                      </button>
                    )}
                  </div>
                </form>
              )}

              {/* STEP 3: CREATE NEW PASSWORD */}
              {forgotStep === "reset_password" && (
                <form onSubmit={handleResetPassword} className="flex flex-col gap-3.5">
                  <Input
                    label="New Password"
                    labelClassName="text-xs font-bold text-slate-800"
                    type={showForgotNewPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={forgotNewPassword}
                    onChange={(e) => {
                      setForgotNewPassword(e.target.value);
                      setForgotPasswordError(null);
                    }}
                    helperText="At least 8 characters with 1 number and 1 uppercase letter"
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                        className="text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                        tabIndex={-1}
                      >
                        {showForgotNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    }
                    required
                  />

                  <Input
                    label="Confirm New Password"
                    labelClassName="text-xs font-bold text-slate-800"
                    type={showForgotConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={forgotConfirmPassword}
                    onChange={(e) => {
                      setForgotConfirmPassword(e.target.value);
                      setForgotPasswordError(null);
                    }}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowForgotConfirmPassword(!showForgotConfirmPassword)}
                        className="text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                        tabIndex={-1}
                      >
                        {showForgotConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    }
                    required
                  />

                  {forgotPasswordError && (
                    <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600 font-medium">
                      {forgotPasswordError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isResettingPassword}
                    className="w-full h-10 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] active:bg-[#3730A3] text-white font-medium text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer mt-1 disabled:opacity-50"
                  >
                    <span>{isResettingPassword ? "Saving..." : "Save New Password"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}

              {/* STEP 4: SUCCESS */}
              {forgotStep === "success" && (
                <div className="py-2 text-center flex flex-col items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-sm font-bold text-slate-900">Password Reset Complete</h3>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
                      Your password has been updated. You can now sign in with your new password.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedRole === "candidate") {
                        candidateLoginForm.setValue("email", forgotEmail);
                      } else {
                        employerLoginForm.setValue("email", forgotEmail);
                      }
                      setActiveTab("login");
                      setForgotStep("email");
                    }}
                    className="w-full h-10 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] active:bg-[#3730A3] text-white font-medium text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer mt-2"
                  >
                    <span>Sign In to Account</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Page Footer / Sponsors (Outside Card) */}
        <footer className="text-center pt-2 pb-2 space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Official Platform Sponsors
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] font-medium text-slate-400">
            <a href="https://www.whitetracktech.com" target="_blank" rel="noopener noreferrer" className="hover:text-slate-600 transition-colors">
              WhiteTrack Technologies
            </a>
            <span className="text-slate-300">•</span>
            <a href="https://www.whiteaurax.com" target="_blank" rel="noopener noreferrer" className="hover:text-slate-600 transition-colors">
              WhiteAurax
            </a>
            <span className="text-slate-300">•</span>
            <a href="https://zynorixglobal.com" target="_blank" rel="noopener noreferrer" className="hover:text-slate-600 transition-colors">
              Zynorix Global
            </a>
            <span className="text-slate-300">•</span>
            <a href="https://www.whitetracktech.com" target="_blank" rel="noopener noreferrer" className="hover:text-slate-600 transition-colors">
              Techcy Routes
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <React.Suspense fallback={<LoadingState message="Loading authentication..." className="min-h-screen bg-[#F8FAFC]" />}>
      <AuthContent />
    </React.Suspense>
  );
}
