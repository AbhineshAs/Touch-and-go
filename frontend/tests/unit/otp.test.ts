// tests/unit/otp.test.ts
import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { MockOTPService, DEMO_OTP_CODE } from "../../lib/candidate/services/otpService";

describe("Mock Phone OTP Service Unit Tests", () => {
  it("Generates valid challenge with 5-minute expiry and 30s resend cooldown", () => {
    const service = new MockOTPService();
    const challenge = service.createChallenge("9876543210", "+91");

    assert.equal(challenge.phone, "9876543210");
    assert.equal(challenge.countryCode, "+91");
    assert.equal(challenge.normalizedPhone, "+919876543210");
    assert.equal(challenge.code, DEMO_OTP_CODE);
    assert.equal(challenge.status, "pending");
    assert.ok(challenge.expiresAt > Date.now() + 4 * 60 * 1000);
    assert.ok(challenge.cooldownUntil <= Date.now() + 30 * 1000);
  });

  it("Verifies correct demo code successfully", () => {
    const service = new MockOTPService();
    service.createChallenge("9876543210", "+91");

    const result = service.verifyCode("+919876543210", DEMO_OTP_CODE);
    assert.equal(result.success, true);
    assert.equal(result.challenge.status, "verified");
  });

  it("Counts failed attempts and throttles after 5 consecutive incorrect attempts", () => {
    const service = new MockOTPService();
    service.createChallenge("9876543210", "+91");

    // Attempts 1 to 4
    for (let i = 1; i <= 4; i++) {
      const res = service.verifyCode("+919876543210", "000000");
      assert.equal(res.success, false);
      assert.equal(res.error, "wrong_code");
      assert.equal(res.remainingAttempts, 5 - i);
    }

    // 5th failed attempt: triggers throttling
    const res5 = service.verifyCode("+919876543210", "000000");
    assert.equal(res5.success, false);
    assert.equal(res5.error, "throttled");
    assert.equal(res5.remainingAttempts, 0);

    // 6th attempt should remain blocked
    const res6 = service.verifyCode("+919876543210", DEMO_OTP_CODE);
    assert.equal(res6.success, false);
    assert.equal(res6.error, "throttled");
  });

  it("Editing phone number invalidates previous challenge; stale responses cannot verify", () => {
    const service = new MockOTPService();
    service.createChallenge("9876543210", "+91");

    // Candidate changes phone to different number
    service.invalidateChallenge();
    const newChallenge = service.createChallenge("9123456780", "+91");

    // Submitting code for old phone must fail
    const staleResult = service.verifyCode("+919876543210", DEMO_OTP_CODE);
    assert.equal(staleResult.success, false);
    assert.equal(staleResult.error, "invalid_challenge");

    // Submitting code for new phone succeeds
    const freshResult = service.verifyCode("+919123456780", DEMO_OTP_CODE);
    assert.equal(freshResult.success, true);
  });

  it("Handles simulated service errors gracefully", () => {
    const service = new MockOTPService();
    service.createChallenge("9876543210", "+91");
    service.setSimulatedServiceFailure(true);

    const result = service.verifyCode("+919876543210", DEMO_OTP_CODE);
    assert.equal(result.success, false);
    assert.equal(result.error, "service_error");
  });
});
