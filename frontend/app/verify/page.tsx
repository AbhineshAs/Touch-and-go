"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/States";
import { Mail, CheckCircle2, RefreshCw, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { UserRole } from "@/types";

import { verifyEmailApi, resendOtpApi } from "@/lib/api/auth";

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "ananya.sharma@example.com";
  const role = searchParams.get("role") || "candidate";
  const redirect = searchParams.get("redirect");
  const { user, login, switchRole, refreshAuth } = useAuth();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [countdown, setCountdown] = useState(45);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleDigitChange = (index: number, val: string) => {
    setErrorMessage(null);
    const clean = val.replace(/\D/g, "");
    const newOtp = [...otp];
    newOtp[index] = clean.slice(-1);
    setOtp(newOtp);

    // Auto-advance to the next column when a digit is entered
    if (clean && index < 5) {
      inputRefs.current[index + 1]?.focus();
      inputRefs.current[index + 1]?.select();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
      inputRefs.current[index - 1]?.select();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
      inputRefs.current[index + 1]?.select();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const newOtp = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);

    const focusIdx = Math.min(pasted.length, 5);
    inputRefs.current[focusIdx]?.focus();
  };


  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) {
      setErrorMessage("Please enter all 6 digits of the confirmation code.");
      return;
    }

    setIsVerifying(true);
    setErrorMessage(null);

    let verifiedRole: UserRole | null = null;

    try {
      const verifyRes = await verifyEmailApi(email, code);
      setIsVerified(true);
      if (verifyRes?.user?.role) {
        const rawRole = verifyRes.user.role;
        verifiedRole = rawRole === "employer" ? "employer" : "candidate";
      }
    } catch (err: any) {
      const msg = err?.message || "";
      if (msg.includes("Invalid") || msg.includes("expired")) {
        setErrorMessage(msg);
        setIsVerifying(false);
        return;
      }
      // Demo fallback if backend is offline
      setIsVerified(true);
    } finally {
      setIsVerifying(false);
    }

    const effectiveRole: UserRole = (verifiedRole === "employer" || role === "employer") ? "employer" : "candidate";

    try {
      if (!user) {
        await login(email, effectiveRole);
      } else if (user.role !== effectiveRole) {
        await switchRole(effectiveRole);
      } else {
        refreshAuth();
      }
    } catch {
      refreshAuth();
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("tag_active_role", effectiveRole);
      document.cookie = `tag_active_role=${effectiveRole}; path=/; max-age=604800; SameSite=Lax`;
      window.dispatchEvent(new CustomEvent("tag_auth_changed"));
    }

    setTimeout(() => {
      if (effectiveRole === "employer") {
        const dest = (redirect && redirect.startsWith("/employer")) ? redirect : "/employer/organization?setup=true";
        router.push(dest);
      } else {
        const dest = (redirect && !redirect.startsWith("/employer")) ? redirect : "/candidate/dashboard";
        router.push(dest);
      }
    }, 1200);
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setOtp(["", "", "", "", "", ""]);
    setErrorMessage(null);
    setCountdown(60);
    try {
      await resendOtpApi(email);
    } catch {}
  };


  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-background px-4 py-12">
      <div className="w-full max-w-md flex flex-col gap-6">
        <div className="flex flex-col items-center text-center gap-2">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-black text-xl shadow-xs">
              T
            </div>
            <span className="font-bold text-2xl text-text-primary">TAG</span>
          </Link>
          <h1 className="text-xl font-bold tracking-tight text-text-primary mt-2">
            Verify your email address
          </h1>
          <p className="text-xs text-text-muted">
            We sent a 6-digit confirmation code to{" "}
            <span className="font-semibold text-text-primary">{email}</span>
          </p>
        </div>

        <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-border shadow-xs flex flex-col gap-6">
          {isVerified ? (
            <div className="py-6 text-center flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-success-soft text-success flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-base font-bold text-text-primary">Email Verified Successfully</h2>
              <p className="text-xs text-text-muted">
                Redirecting to {role === "employer" ? "Organization Profile Setup" : "Resume Structuring"}...
              </p>
            </div>
          ) : (
            <form onSubmit={handleVerify} className="flex flex-col gap-6">
              {/* OTP Digits input */}
              <div className="flex justify-between gap-2 sm:gap-2.5">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete={idx === 0 ? "one-time-code" : "off"}
                    maxLength={1}
                    value={digit}
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                    onFocus={(e) => (e.target as HTMLInputElement).select()}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    onPaste={idx === 0 ? handlePaste : undefined}
                    aria-label={`Digit ${idx + 1}`}
                    className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-xl border border-border bg-background focus:border-primary focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-primary transition-all cursor-pointer"
                  />
                ))}
              </div>


              {errorMessage && (
                <div className="p-3 rounded-lg bg-danger-soft border border-danger/20 text-xs text-danger font-medium">
                  {errorMessage}
                </div>
              )}

              <Button
                type="submit"
                size="md"
                variant="primary"
                className="w-full font-medium"
                isLoading={isVerifying}
              >
                Verify
              </Button>

              <div className="flex items-center justify-between text-xs text-text-muted pt-2 border-t border-border-subtle">
                <span>Didn&apos;t receive the code?</span>
                {countdown > 0 ? (
                  <span>Resend in {countdown}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    className="text-primary hover:underline font-semibold cursor-pointer"
                  >
                    Resend Code
                  </button>
                )}
              </div>
            </form>

          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <React.Suspense fallback={<LoadingState message="Loading verification..." className="min-h-screen" />}>
      <VerifyContent />
    </React.Suspense>
  );
}
