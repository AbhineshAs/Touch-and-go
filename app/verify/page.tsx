"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/States";
import { Mail, CheckCircle2, RefreshCw, ArrowRight } from "lucide-react";

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "ananya.sharma@example.com";
  const role = searchParams.get("role") || "candidate";
  const redirect = searchParams.get("redirect");

  const [otp, setOtp] = useState(["7", "2", "9", "4", "1", "0"]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [countdown, setCountdown] = useState(45);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsVerifying(true);
    await new Promise((r) => setTimeout(r, 600));
    setIsVerifying(false);
    setIsVerified(true);

    setTimeout(() => {
      if (redirect) {
        router.push(redirect);
      } else if (role === "employer") {
        router.push("/employer/organization");
      } else {
        router.push("/candidate/profile/resume");
      }
    }, 1200);
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
                Redirecting to {role === "employer" ? "Organization Setup" : "Resume Structuring"}...
              </p>
            </div>
          ) : (
            <form onSubmit={handleVerify} className="flex flex-col gap-6">
              {/* OTP Digits input */}
              <div className="flex justify-between gap-2">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => {
                      const newOtp = [...otp];
                      newOtp[idx] = e.target.value.slice(-1);
                      setOtp(newOtp);
                    }}
                    className="w-11 h-12 text-center text-lg font-bold rounded-lg border border-border bg-background focus:border-primary focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-primary"
                  />
                ))}
              </div>

              <Button
                type="submit"
                size="md"
                variant="primary"
                className="w-full"
                isLoading={isVerifying}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Confirm & Continue
              </Button>

              <div className="flex items-center justify-between text-xs text-text-muted pt-2 border-t border-border-subtle">
                <span>Didn&apos;t receive the code?</span>
                {countdown > 0 ? (
                  <span>Resend in {countdown}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setCountdown(60)}
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
