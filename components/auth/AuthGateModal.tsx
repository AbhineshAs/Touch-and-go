"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import {
  Lock,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  UserCheck,
  Building2,
} from "lucide-react";

interface AuthGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  jobTitle?: string;
  companyName?: string;
  redirectUrl?: string;
  onAuthenticated?: () => void;
}

export function AuthGateModal({
  isOpen,
  onClose,
  title = "Sign in to continue",
  subtitle = "Join TAG to unlock verified candidate applications, profile matching, and saved jobs.",
  jobTitle,
  companyName,
  redirectUrl,
  onAuthenticated,
}: AuthGateModalProps) {
  const router = useRouter();
  const destination = redirectUrl || (typeof window !== "undefined" ? window.location.pathname : "/jobs");

  const handleSignInRedirect = () => {
    onClose();
    router.push(`/sign-in?redirect=${encodeURIComponent(destination)}&reason=auth_required`);
  };

  const handleSignUpRedirect = () => {
    onClose();
    router.push(`/sign-up?role=candidate&redirect=${encodeURIComponent(destination)}`);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={title}
    >
      <div className="flex flex-col gap-5 pt-1">
        {/* Job preview context if available */}
        {jobTitle && (
          <div className="p-3.5 rounded-xl bg-primary-soft/60 border border-primary/20 flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                Target Role
              </span>
              <span className="text-sm font-bold text-text-primary leading-tight">{jobTitle}</span>
              {companyName && (
                <span className="text-xs text-text-secondary mt-0.5">{companyName}</span>
              )}
            </div>
            <div className="w-8 h-8 rounded-xl bg-surface border border-primary/30 flex items-center justify-center text-primary shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
        )}

        <p className="text-xs text-text-secondary leading-relaxed">{subtitle}</p>

        {/* Benefits list */}
        <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-background-alt border border-border text-xs">
          <div className="flex items-start gap-2 text-text-secondary">
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <span>Apply with your structured, verified talent profile</span>
          </div>
          <div className="flex items-start gap-2 text-text-secondary">
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <span>Instant explainable match scoring across published criteria</span>
          </div>
          <div className="flex items-start gap-2 text-text-secondary">
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <span>Track direct employer review status & schedule interviews</span>
          </div>
        </div>

        {/* Standard Auth Options */}
        <div className="flex flex-col gap-2 pt-2 border-t border-border">
          <Button
            variant="secondary"
            size="md"
            className="w-full"
            onClick={handleSignInRedirect}
          >
            Sign In with Existing Account
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="w-full text-primary hover:underline"
            onClick={handleSignUpRedirect}
          >
            Don&apos;t have an account? Join TAG
          </Button>
        </div>
      </div>
    </Modal>
  );
}
