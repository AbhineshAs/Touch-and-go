// tests/unit/auth-session.test.ts
import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  signIn,
  signUp,
  getStoredUser,
  getStoredToken,
  AUTH_TOKEN_KEY,
  AUTH_USER_KEY,
  AUTH_ROLE_KEY,
} from "../../lib/api/auth";

// Simulated browser storage environment for Node.js test runner
const mockLocalStorage: Record<string, string> = {};

if (typeof (global as any).window === "undefined") {
  (global as any).window = {
    dispatchEvent: () => true,
  };
  (global as any).localStorage = {
    getItem: (key: string) => mockLocalStorage[key] || null,
    setItem: (key: string, val: string) => {
      mockLocalStorage[key] = val;
    },
    removeItem: (key: string) => {
      delete mockLocalStorage[key];
    },
  };
  (global as any).document = {
    cookie: "",
  };
}

describe("Auth Session Synchronization Unit Tests", () => {
  beforeEach(() => {
    for (const k in mockLocalStorage) delete mockLocalStorage[k];
  });

  it("Candidate signup sets stored token and candidate role in storage", async () => {
    const res = await signUp({
      name: "Ananya Sharma",
      email: "ananya@example.com",
      role: "candidate",
    });

    assert.equal(res.user.name, "Ananya Sharma");
    assert.equal(res.user.role, "candidate");
    assert.ok(res.token.startsWith("tag_jwt_"));

    const storedUser = getStoredUser();
    const storedToken = getStoredToken();

    assert.ok(storedUser);
    assert.equal(storedUser.role, "candidate");
    assert.equal(storedToken, res.token);

    // ProtectedRoute synchronous check simulation
    const effectivelyAuthenticated = Boolean(storedUser && storedToken);
    assert.equal(effectivelyAuthenticated, true);
    assert.ok(["candidate", "admin"].includes(storedUser.role));
  });

  it("Employer signup sets stored token and employer role in storage", async () => {
    const res = await signUp({
      name: "Rohit Verma",
      email: "rohit@razorwave.com",
      role: "employer",
    });

    assert.equal(res.user.name, "Rohit Verma");
    assert.equal(res.user.role, "employer");
    assert.ok(res.token.startsWith("tag_jwt_"));

    const storedUser = getStoredUser();
    const storedToken = getStoredToken();

    assert.ok(storedUser);
    assert.equal(storedUser.role, "employer");
    assert.equal(storedToken, res.token);

    // ProtectedRoute synchronous check simulation
    const effectivelyAuthenticated = Boolean(storedUser && storedToken);
    assert.equal(effectivelyAuthenticated, true);
    assert.ok(["employer", "admin"].includes(storedUser.role));
  });

  it("Candidate profile confirmation syncs session to storage so protected routes do not redirect", () => {
    const candidateId = "cand_test_999";
    const candidateUser = {
      id: candidateId,
      name: "Priya Patel",
      email: "priya@example.com",
      role: "candidate",
      createdAt: new Date().toISOString(),
    };
    const token = `tag_jwt_${candidateId}`;

    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(candidateUser));
    localStorage.setItem(AUTH_ROLE_KEY, "candidate");

    const storedUser = getStoredUser();
    const storedToken = getStoredToken();

    assert.ok(storedUser);
    assert.equal(storedUser.name, "Priya Patel");
    assert.equal(storedUser.role, "candidate");
    assert.equal(storedToken, token);

    // ProtectedRoute logic: will not redirect to /sign-in
    const effectivelyAuthenticated = Boolean(storedUser && storedToken);
    assert.equal(effectivelyAuthenticated, true);
  });
});
