"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Select";
import { LoadingState } from "@/components/ui/States";
import { User, Building2, ArrowRight, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/AuthContext";
import { useCandidate } from "@/lib/candidate/context/CandidateContext";
import { mockOtpService } from "@/lib/candidate/services/otpService";
import { TagLogo } from "@/components/ui/TagLogo";

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

  const [candidateLoginPhone, setCandidateLoginPhone] = useState("");
  const [candidateLoginOtp, setCandidateLoginOtp] = useState("");
  const [candidateOtpSent, setCandidateOtpSent] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  useEffect(() => {
    const queryMode = searchParams.get("mode");
    if (queryMode === "login" || queryMode === "signup") {
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
      agreeToTerms: false,
    },
  });

  const employerSignUpForm = useForm<EmployerSignUpFormValues>({
    resolver: zodResolver(employerSignUpSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      agreeToTerms: false,
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
    setCandidateOtpSent(false);
  };

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
      loginCandidateByPhone(candidateLoginPhone);
      await login(`cand_${candidateLoginPhone.slice(-10)}@tagjobs.in`, "candidate");

      if (redirect) {
        router.push(redirect);
      } else {
        router.push("/candidate/dashboard");
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
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#F8FAFC] px-4 py-12 text-slate-900 font-sans">
      <div className="w-full max-w-md flex flex-col gap-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <TagLogo height={46} />
          <h1 className="text-2xl font-black tracking-tight text-slate-900 mt-2">
            {activeTab === "signup"
              ? `Make the most of your ${selectedRole === "candidate" ? "career" : "hiring"}`
              : `Welcome back to Touch And Go`}
          </h1>
          <p className="text-xs text-slate-600 font-medium">
            {activeTab === "signup"
              ? selectedRole === "candidate"
                ? "Join 50,000+ candidates discovering 1-touch matched opportunities"
                : "Verify your corporate domain and access structured tech talent"
              : selectedRole === "candidate"
                ? "Sign in with your registered phone number (passwordless OTP)"
                : "Access your company's hiring pipeline and talent matches"}
          </p>
        </div>

        {/* Role Switch Warning Alert */}
        {showRoleSwitchWarning && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col gap-2.5 text-xs text-slate-900 shadow-2xs">
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
                className="px-3 py-1.5 rounded-xl bg-amber-600 text-white font-bold text-xs cursor-pointer shadow-2xs"
              >
                Yes, Switch to Company
              </button>
              <button
                type="button"
                onClick={cancelRoleSwitch}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-semibold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Keep Candidate Form
              </button>
            </div>
          </div>
        )}

        <div className="p-6 sm:p-8 flex flex-col gap-6 shadow-xl shadow-blue-600/5 bg-white border border-slate-200/90 rounded-3xl">
          {/* Main Auth Mode Switcher */}
          <div className="grid grid-cols-2 p-1.5 bg-slate-100/80 rounded-2xl gap-1">
            <button
              type="button"
              onClick={() => switchMode("signup")}
              className={cn(
                "flex items-center justify-center py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer",
                activeTab === "signup"
                  ? "bg-white text-[#2563EB] shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={() => switchMode("login")}
              className={cn(
                "flex items-center justify-center py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer",
                activeTab === "login"
                  ? "bg-white text-[#2563EB] shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              Log In
            </button>
          </div>

          {/* Sub Role Selector */}
          <div className="grid grid-cols-2 p-1.5 bg-slate-100/80 rounded-2xl gap-1">
            <button
              type="button"
              onClick={() => handleRoleChange("candidate")}
              className={cn(
                "flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                selectedRole === "candidate"
                  ? "bg-white text-[#2563EB] shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <User className="w-3.5 h-3.5" />
              <span>Job Seeker</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange("employer")}
              className={cn(
                "flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                selectedRole === "employer"
                  ? "bg-white text-[#2563EB] shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Company</span>
            </button>
          </div>

          {authError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold">
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
                    placeholder="e.g. Ananya Sharma"
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

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-extrabold text-slate-900">Phone Number</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="sm:col-span-1">
                        <select
                          {...candidateSignUpForm.register("countryCode")}
                          className="w-full h-11 px-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#2563EB] cursor-pointer"
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
                          className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB] transition-all"
                        />
                      </div>
                    </div>
                    {candidateSignUpForm.formState.errors.phone && (
                      <p className="text-xs text-red-600 font-medium mt-0.5">
                        {candidateSignUpForm.formState.errors.phone.message}
                      </p>
                    )}
                  </div>

                  <div className="pt-2">
                    <Checkbox
                      label={
                        <span className="text-xs text-slate-600 leading-relaxed font-medium">
                          I agree to the{" "}
                          <Link href="/trust" target="_blank" className="text-[#2563EB] hover:underline font-bold">
                            Terms of Service
                          </Link>{" "}
                          and{" "}
                          <Link href="/trust" target="_blank" className="text-[#2563EB] hover:underline font-bold">
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
                      <p className="text-xs text-red-600 font-medium mt-1">
                        {candidateSignUpForm.formState.errors.agreeToTerms.message}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold text-xs shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
                  >
                    <span>Agree &amp; Join</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
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
                        <span className="text-xs text-slate-600 font-medium">
                          I agree to the{" "}
                          <Link href="/trust" className="text-[#2563EB] hover:underline font-bold">
                            Terms of Service
                          </Link>{" "}
                          and{" "}
                          <Link href="/trust" className="text-[#2563EB] hover:underline font-bold">
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
                      <p className="text-xs text-red-600 font-medium mt-1">
                        {employerSignUpForm.formState.errors.agreeToTerms.message}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold text-xs shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
                  >
                    <span>Create Account &amp; Verify Email</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              <div className="pt-4 border-t border-slate-200 text-center text-xs text-slate-600 font-medium">
                Already on TAG?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="font-extrabold text-[#2563EB] hover:underline cursor-pointer"
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
                <div className="flex flex-col gap-4">
                  {!candidateOtpSent ? (
                    <form onSubmit={handleSendCandidateLoginOtp} className="flex flex-col gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-extrabold text-slate-900">Phone Number</label>
                        <div className="flex gap-2">
                          <div className="w-20 px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-700 flex items-center justify-center font-bold">
                            🇮🇳 +91
                          </div>
                          <input
                            type="tel"
                            value={candidateLoginPhone}
                            onChange={(e) => setCandidateLoginPhone(e.target.value)}
                            placeholder="98765 43210"
                            className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#2563EB]"
                            required
                          />
                        </div>
                        <span className="text-[11px] text-slate-500 font-medium">
                          Enter the phone number used during registration.
                        </span>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold text-xs shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
                      >
                        <span>Send Verification Code</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyCandidateLoginOtp} className="flex flex-col gap-4">
                      <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-[#2563EB] flex items-center justify-between font-bold">
                        <span>Code sent to +91 {candidateLoginPhone.slice(-10)}</span>
                        <button
                          type="button"
                          onClick={() => setCandidateOtpSent(false)}
                          className="font-extrabold underline text-[11px] cursor-pointer"
                        >
                          Change
                        </button>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-extrabold text-slate-900">6-Digit OTP</label>
                          <span className="text-[11px] font-mono font-bold text-[#2563EB]">Demo code: 729410</span>
                        </div>
                        <input
                          type="text"
                          maxLength={6}
                          value={candidateLoginOtp}
                          onChange={(e) => setCandidateLoginOtp(e.target.value)}
                          className="text-center font-mono font-bold text-lg tracking-widest px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-[#2563EB]"
                          placeholder="••••••"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isVerifyingOtp}
                        className="w-full py-3.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold text-xs shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
                      >
                        {isVerifyingOtp ? "Verifying..." : "Verify & Continue"}
                      </button>
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

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold text-xs shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
                  >
                    <span>Sign In to Company Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              <div className="pt-4 border-t border-slate-200 text-center text-xs text-slate-600 font-medium">
                New to TAG?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("signup")}
                  className="font-extrabold text-[#2563EB] hover:underline cursor-pointer"
                >
                  Join now
                </button>
              </div>
            </>
          )}

          {/* Official Sponsors Strip */}
          <div className="pt-6 border-t border-slate-200 text-center space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              Official Platform Sponsors
            </span>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs font-bold text-[#2563EB]">
              <a href="https://www.whitetracktech.com" target="_blank" rel="noopener noreferrer" className="hover:underline">
                WhiteTrack Technologies
              </a>
              <span className="text-slate-300">•</span>
              <a href="https://www.whiteaurax.com" target="_blank" rel="noopener noreferrer" className="hover:underline">
                WhiteAurax
              </a>
              <span className="text-slate-300">•</span>
              <a href="https://zynorixglobal.com" target="_blank" rel="noopener noreferrer" className="hover:underline">
                Zynorix Global
              </a>
              <span className="text-slate-300">•</span>
              <a href="https://www.whitetracktech.com" target="_blank" rel="noopener noreferrer" className="hover:underline">
                Techcy Routes
              </a>
            </div>
          </div>
        </div>
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
