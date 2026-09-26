"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import {
  ShieldCheck,
  RotateCcw,
  Edit2,
  AlertTriangle,
  Lock,
  ArrowRight,
  Info,
} from "lucide-react";
import { useCandidate } from "@/lib/candidate/context/CandidateContext";
import { useAuth } from "@/lib/auth/AuthContext";
import {
  mockOtpService,
  DEMO_OTP_CODE,
  RESEND_COOLDOWN_SECONDS,
} from "@/lib/candidate/services/otpService";

export default function VerifyPhonePage() {
  const router = useRouter();
  const { identity, setPhoneVerified } = useCandidate();
  const { signup } = useAuth();

  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isThrottled, setIsThrottled] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [cooldown, setCooldown] = useState<number>(RESEND_COOLDOWN_SECONDS);
  const [expiryCountdown, setExpiryCountdown] = useState<number>(300); // 5 mins in seconds

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Default demo fallback if user navigated directly
  const normalizedPhone = identity
    ? `${identity.countryCode}${identity.phone.replace(/\D/g, "")}`
    : "+919876543210";

  // Ensure active challenge exists
  useEffect(() => {
    const active = mockOtpService.getActiveChallenge();
    if (!active || active.normalizedPhone !== normalizedPhone) {
      mockOtpService.createChallenge(
        identity?.phone || "9876543210",
        identity?.countryCode || "+91"
      );
    }
  }, [identity, normalizedPhone]);

  // Resend cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  // Expiry countdown timer
  useEffect(() => {
    if (expiryCountdown <= 0) {
      setIsExpired(true);
      return;
    }
    const interval = setInterval(() => {
      setExpiryCountdown((prev) => {
        if (prev <= 1) {
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [expiryCountdown]);

  const handleDigitChange = (index: number, val: string) => {
    setErrorMessage(null);
    const clean = val.replace(/\D/g, "");

    // Handle single character
    const newDigits = [...digits];
    newDigits[index] = clean.slice(-1);
    setDigits(newDigits);

    // Auto advance focus
    if (clean && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    const pastedData = e.clipboardData.getData("text").trim().replace(/\D/g, "").slice(0, 6);
    if (!pastedData) return;

    const newDigits = [...digits];
    for (let i = 0; i < pastedData.length; i++) {
      newDigits[i] = pastedData[i];
    }
    setDigits(newDigits);

    // Focus last pasted or next empty
    const nextIdx = Math.min(pastedData.length, 5);
    inputRefs.current[nextIdx]?.focus();
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = digits.join("");

    if (code.length < 6) {
      setErrorMessage("Please enter all 6 digits of the confirmation code.");
      return;
    }

    setIsVerifying(true);
    setErrorMessage(null);

    // Short simulated delay for smooth UX
    await new Promise((r) => setTimeout(r, 400));

    const result = mockOtpService.verifyCode(normalizedPhone, code);
    setIsVerifying(false);

    if (result.success) {
      setPhoneVerified(true);
      try {
        const candidateEmail = identity?.email || "candidate@tagjobs.in";
        const candidateName = identity?.fullName || "Candidate";
        await signup({
          name: candidateName,
          email: candidateEmail,
          role: "candidate",
        });
      } catch (err) {
        console.warn("Auth session initialization note:", err);
      }
      router.push("/onboarding");
    } else {
      if (result.error === "throttled") {
        setIsThrottled(true);
        setErrorMessage("Simulated block: 5 consecutive incorrect attempts reached. Please request a new code.");
      } else if (result.error === "expired") {
        setIsExpired(true);
        setErrorMessage("This confirmation code has expired. Please request a new code.");
      } else if (result.error === "wrong_code") {
        setErrorMessage(
          `Incorrect code. ${result.remainingAttempts ?? 0} attempt(s) remaining. (Demo code is ${DEMO_OTP_CODE})`
        );
      } else {
        setErrorMessage("Verification failed. Please check the code and try again.");
      }
    }
  };

  const handleResend = () => {
    if (cooldown > 0) return;

    const res = mockOtpService.resendCode(normalizedPhone);
    if (res.challenge) {
      setDigits(["", "", "", "", "", ""]);
      setErrorMessage(null);
      setIsThrottled(false);
      setIsExpired(false);
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setExpiryCountdown(300);
      inputRefs.current[0]?.focus();
    } else {
      setErrorMessage("Could not resend code. Please try again or re-enter your phone number.");
    }
  };

  const handleEditPhone = () => {
    mockOtpService.invalidateChallenge();
    router.push("/sign-up?role=candidate");
  };

  const minutesRemaining = Math.floor(expiryCountdown / 60);
  const secondsRemaining = (expiryCountdown % 60).toString().padStart(2, "0");

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
            Verify your phone number
          </h1>
          <p className="text-xs text-text-muted">
            Enter the 6-digit confirmation code sent to{" "}
            <span className="font-semibold text-text-primary">{normalizedPhone}</span>
          </p>
        </div>

        {/* Prototype Demo Banner */}
        <div className="p-3.5 rounded-xl bg-primary-soft/50 border border-primary/20 flex items-start gap-2.5 text-xs text-primary-dark">
          <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="font-bold">Demo verification</span>
            <span className="text-[11px] leading-relaxed text-text-secondary">
              No real SMS is sent and no database account is created. Use test code:{" "}
              <code className="font-mono font-bold text-primary px-1 py-0.5 rounded bg-surface border border-primary/20">
                {DEMO_OTP_CODE}
              </code>
            </span>
          </div>
        </div>

        {/* OTP Input Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-border shadow-xs flex flex-col gap-6">
          <form onSubmit={handleVerify} className="flex flex-col gap-5">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-text-secondary">Enter 6-Digit Code</span>
              <span className="text-[11px] text-text-muted">
                Expires in {minutesRemaining}:{secondsRemaining}
              </span>
            </div>

            {/* Accessible 6-Digit Input Grid */}
            <div className="flex justify-between gap-2 sm:gap-2.5">
              {digits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    inputRefs.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete={idx === 0 ? "one-time-code" : "off"}
                  maxLength={1}
                  disabled={isThrottled || isExpired}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  onPaste={idx === 0 ? handlePaste : undefined}
                  aria-label={`Digit ${idx + 1}`}
                  className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-xl border border-border bg-background text-text-primary focus:border-primary focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50"
                />
              ))}
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-lg bg-danger-soft border border-danger/20 flex items-start gap-2 text-xs text-danger">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="font-medium">{errorMessage}</span>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              size="md"
              variant="primary"
              className="w-full"
              isLoading={isVerifying}
              disabled={isThrottled || isExpired}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Verify & Continue to Discovery
            </Button>

            {/* Resend & Edit Controls */}
            <div className="flex items-center justify-between text-xs pt-3 border-t border-border-subtle">
              <button
                type="button"
                onClick={handleEditPhone}
                className="inline-flex items-center gap-1.5 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Phone</span>
              </button>

              <div>
                {cooldown > 0 ? (
                  <span className="text-text-muted">Resend in {cooldown}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    className="inline-flex items-center gap-1.5 text-primary hover:underline font-semibold cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Resend Code</span>
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Security Notice */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-text-muted text-center">
          <Lock className="w-3 h-3" />
          <span>Local simulated verification. State resides strictly in-memory.</span>
        </div>
      </div>
    </div>
  );
}
