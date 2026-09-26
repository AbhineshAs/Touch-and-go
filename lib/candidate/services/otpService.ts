// lib/candidate/services/otpService.ts

import { OTPChallenge } from "../types";

export const DEMO_OTP_CODE = "729410";
export const RESEND_COOLDOWN_SECONDS = 30;
export const EXPIRY_MINUTES = 5;
export const MAX_ATTEMPTS = 5;

export interface OTPVerificationResult {
  success: boolean;
  error?: "wrong_code" | "expired" | "throttled" | "invalid_challenge" | "service_error";
  remainingAttempts?: number;
  challenge: OTPChallenge;
}

export class MockOTPService {
  private activeChallenge: OTPChallenge | null = null;
  private simulatedServiceFailure: boolean = false;

  public setSimulatedServiceFailure(fail: boolean) {
    this.simulatedServiceFailure = fail;
  }

  public createChallenge(phone: string, countryCode: string = "+91"): OTPChallenge {
    const cleanPhone = phone.trim().replace(/\D/g, "");
    const normalizedPhone = `${countryCode}${cleanPhone}`;
    const now = Date.now();

    const challenge: OTPChallenge = {
      phone: cleanPhone,
      countryCode,
      normalizedPhone,
      code: DEMO_OTP_CODE,
      createdAt: now,
      expiresAt: now + EXPIRY_MINUTES * 60 * 1000,
      attempts: 0,
      maxAttempts: MAX_ATTEMPTS,
      cooldownUntil: now + RESEND_COOLDOWN_SECONDS * 1000,
      isThrottled: false,
      status: "pending",
    };

    this.activeChallenge = challenge;
    return { ...challenge };
  }

  public getActiveChallenge(): OTPChallenge | null {
    if (!this.activeChallenge) return null;
    return { ...this.activeChallenge };
  }

  public invalidateChallenge(): void {
    this.activeChallenge = null;
  }

  public resendCode(normalizedPhone: string): { challenge: OTPChallenge | null; error?: string } {
    if (this.simulatedServiceFailure) {
      return { challenge: null, error: "service_error" };
    }

    if (!this.activeChallenge || this.activeChallenge.normalizedPhone !== normalizedPhone) {
      return { challenge: null, error: "invalid_challenge" };
    }

    const now = Date.now();
    if (now < this.activeChallenge.cooldownUntil) {
      return { challenge: { ...this.activeChallenge }, error: "cooldown_active" };
    }

    // New challenge supersedes old challenge
    const newChallenge: OTPChallenge = {
      ...this.activeChallenge,
      createdAt: now,
      expiresAt: now + EXPIRY_MINUTES * 60 * 1000,
      attempts: 0,
      cooldownUntil: now + RESEND_COOLDOWN_SECONDS * 1000,
      isThrottled: false,
      status: "pending",
    };

    this.activeChallenge = newChallenge;
    return { challenge: { ...newChallenge } };
  }

  public verifyCode(normalizedPhone: string, codeInput: string): OTPVerificationResult {
    if (this.simulatedServiceFailure) {
      return {
        success: false,
        error: "service_error",
        challenge: this.activeChallenge || this.createChallenge("0000000000"),
      };
    }

    // Ignore stale responses or mismatched phone
    if (!this.activeChallenge || this.activeChallenge.normalizedPhone !== normalizedPhone) {
      return {
        success: false,
        error: "invalid_challenge",
        challenge: this.activeChallenge || this.createChallenge("0000000000"),
      };
    }

    const challenge = this.activeChallenge;
    const now = Date.now();

    // Check if already throttled
    if (challenge.isThrottled || challenge.attempts >= challenge.maxAttempts) {
      challenge.status = "throttled";
      challenge.isThrottled = true;
      return {
        success: false,
        error: "throttled",
        remainingAttempts: 0,
        challenge: { ...challenge },
      };
    }

    // Check expiry
    if (now > challenge.expiresAt) {
      challenge.status = "expired";
      return {
        success: false,
        error: "expired",
        remainingAttempts: challenge.maxAttempts - challenge.attempts,
        challenge: { ...challenge },
      };
    }

    // Check code match
    const cleanInput = codeInput.trim().replace(/\D/g, "");
    if (cleanInput !== challenge.code) {
      challenge.attempts += 1;
      const remaining = challenge.maxAttempts - challenge.attempts;

      if (remaining <= 0) {
        challenge.isThrottled = true;
        challenge.status = "throttled";
        return {
          success: false,
          error: "throttled",
          remainingAttempts: 0,
          challenge: { ...challenge },
        };
      }

      return {
        success: false,
        error: "wrong_code",
        remainingAttempts: remaining,
        challenge: { ...challenge },
      };
    }

    // Successful mock verification
    challenge.status = "verified";
    return {
      success: true,
      challenge: { ...challenge },
    };
  }
}

export const mockOtpService = new MockOTPService();
