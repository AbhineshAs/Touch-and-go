"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { recoverSchema, RecoverFormValues } from "@/lib/schemas/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ArrowLeft, CheckCircle2, Mail } from "lucide-react";

export default function RecoverPage() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<RecoverFormValues>({
    resolver: zodResolver(recoverSchema),
  });

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 600));
    setSubmitted(true);
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
            Reset your password
          </h1>
          <p className="text-xs text-text-muted">
            Enter the email associated with your TAG account to receive recovery instructions
          </p>
        </div>

        <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-border shadow-xs flex flex-col gap-6">
          {submitted ? (
            <div className="py-6 text-center flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-success-soft text-success flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-base font-bold text-text-primary">Recovery Link Sent</h2>
              <p className="text-xs text-text-secondary leading-relaxed">
                If an account exists for <strong className="text-text-primary">{getValues("email")}</strong>, you will receive a secure password reset link within 2 minutes.
              </p>
              <Link href="/sign-in" className="mt-2 w-full">
                <Button variant="primary" size="md" className="w-full">
                  Return to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <Input
                label="Registered Email"
                type="email"
                placeholder="you@example.com"
                error={errors.email?.message}
                {...register("email")}
              />

              <Button
                type="submit"
                size="md"
                variant="primary"
                className="w-full mt-2"
                isLoading={isSubmitting}
              >
                Send Password Reset Link
              </Button>
            </form>
          )}
        </div>

        <div className="text-center">
          <Link
            href="/sign-in"
            className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
