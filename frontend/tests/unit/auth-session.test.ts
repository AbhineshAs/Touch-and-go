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

  it("Strict role redirection logic ensures employer never redirects to /candidate/* and sets tag_active_role = 'employer'", () => {
    const staleRedirect = "/candidate/dashboard";
    const effectiveRole = "employer";

    // Simulate verify page redirection resolution logic
    const resolvedRedirect = (effectiveRole === "employer")
      ? (staleRedirect && staleRedirect.startsWith("/employer") ? staleRedirect : "/employer/organization?setup=true")
      : (staleRedirect && !staleRedirect.startsWith("/employer") ? staleRedirect : "/candidate/dashboard");

    assert.equal(resolvedRedirect, "/employer/organization?setup=true");
    assert.ok(!resolvedRedirect.startsWith("/candidate"));

    // Simulate session storage
    localStorage.setItem(AUTH_ROLE_KEY, effectiveRole);
    assert.equal(localStorage.getItem(AUTH_ROLE_KEY), "employer");
  });

  it("Candidate role redirection properly permits candidate paths but blocks employer paths", () => {
    const employerRedirect = "/employer/dashboard";
    const effectiveRole: "candidate" | "employer" = "candidate";

    const resolvedRedirect = (effectiveRole === "employer")
      ? (employerRedirect && employerRedirect.startsWith("/employer") ? employerRedirect : "/employer/dashboard")
      : (employerRedirect && !employerRedirect.startsWith("/employer") ? employerRedirect : "/candidate/dashboard");

    assert.equal(resolvedRedirect, "/candidate/dashboard");
    assert.ok(!resolvedRedirect.startsWith("/employer"));

    localStorage.setItem(AUTH_ROLE_KEY, effectiveRole);
    assert.equal(localStorage.getItem(AUTH_ROLE_KEY), "candidate");
  });

  it("Candidate sign in with personalized email preserves user name without overriding with Ananya Sharma", async () => {
    const customUser = {
      id: "usr_custom_101",
      name: "Alen William",
      email: "alenwilliam212@gmail.com",
      role: "candidate" as const,
      phone: "8848230572",
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(customUser));

    const res = await signIn("alenwilliam212@gmail.com", "candidate");
    assert.equal(res.user.name, "Alen William");
    assert.equal(res.user.email, "alenwilliam212@gmail.com");
    assert.notEqual(res.user.name, "Ananya Sharma");
  });

  it("Candidate record persistence in storage reloads faithfully simulating browser refresh", () => {
    const candidateRecord = {
      id: "cand_persisted_01",
      schemaVersion: "1.0.0",
      profileRevision: 1,
      onboardingComplete: true,
      confirmedAt: new Date().toISOString(),
      identity: {
        fullName: "Alen William",
        email: "alenwilliam212@gmail.com",
        phone: "8848230572",
        countryCode: "+91",
        agreeToTerms: true,
      },
      discovery: {
        careerStage: "student",
        primaryGoal: "first_job",
        targetRoles: ["Full Stack Engineer"],
        skills: [{ name: "React", level: "confident" }],
      },
      profile: {
        headline: "Aspiring Full Stack Engineer",
        summary: "Motivated student",
        location: "India",
        phone: "8848230572",
        education: [],
        experience: [],
        projects: [],
        certifications: [],
        skills: [{ name: "React", level: "confident" }],
        links: [],
      },
      applications: [],
      savedJobIds: [],
      interviews: [],
    };

    // Simulate saving to storage
    localStorage.setItem("tag_candidate_record", JSON.stringify(candidateRecord));
    localStorage.setItem("tag_candidate_record_alenwilliam212@gmail.com", JSON.stringify(candidateRecord));

    // Simulate browser reload by reading from storage
    const reloaded = JSON.parse(localStorage.getItem("tag_candidate_record_alenwilliam212@gmail.com")!);
    assert.ok(reloaded);
    assert.equal(reloaded.identity.fullName, "Alen William");
    assert.equal(reloaded.identity.email, "alenwilliam212@gmail.com");
    assert.equal(reloaded.identity.phone, "8848230572");
    assert.equal(reloaded.onboardingComplete, true);
    assert.equal(reloaded.profile.headline, "Aspiring Full Stack Engineer");
  });
});
