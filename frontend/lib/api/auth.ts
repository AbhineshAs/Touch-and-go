import { User, UserRole } from "@/types";
import { MOCK_USERS } from "@/lib/mocks/data";

export const AUTH_TOKEN_KEY = "tag_auth_token";
export const AUTH_USER_KEY = "tag_auth_user";
export const AUTH_ROLE_KEY = "tag_active_role";

export function notifyAuthChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("tag_auth_changed"));
  try {
    window.dispatchEvent(new StorageEvent("storage", { key: AUTH_TOKEN_KEY }));
  } catch {
    window.dispatchEvent(new Event("storage"));
  }
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(AUTH_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  await new Promise((r) => setTimeout(r, 60));
  return getStoredUser();
}

export async function switchActiveRole(role: UserRole): Promise<User> {
  await new Promise((r) => setTimeout(r, 100));
  const storedUser = getStoredUser();
  const baseMock = MOCK_USERS[role];
  const user: User =
    storedUser && storedUser.role === role
      ? storedUser
      : baseMock;

  if (typeof window !== "undefined") {
    localStorage.setItem(AUTH_ROLE_KEY, role);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    document.cookie = `${AUTH_ROLE_KEY}=${role}; path=/; max-age=604800; SameSite=Lax`;
    notifyAuthChange();
  }
  return user;
}

export async function signIn(
  email: string,
  role: UserRole
): Promise<{ user: User; token: string }> {
  await new Promise((r) => setTimeout(r, 300));
  const storedUser = getStoredUser();
  const baseMock = MOCK_USERS[role];

  let user: User;
  if (storedUser && storedUser.email.toLowerCase() === email.toLowerCase() && storedUser.role === role) {
    user = storedUser;
  } else if (email.toLowerCase().includes("ananya") && role === "candidate") {
    user = { ...baseMock, email };
  } else if (email.toLowerCase().includes("rohit") && role === "employer") {
    user = { ...baseMock, email };
  } else {
    const prefix = email.split("@")[0].replace(/[._-]/g, " ");
    const formattedName = prefix
      .split(" ")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");

    user = {
      id: `usr_${Date.now()}`,
      name: formattedName || "Candidate",
      email,
      role,
      createdAt: new Date().toISOString(),
    };
  }

  const token = `tag_jwt_${Date.now()}_${role}`;

  if (typeof window !== "undefined") {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    localStorage.setItem(AUTH_ROLE_KEY, role);
    document.cookie = `${AUTH_TOKEN_KEY}=${token}; path=/; max-age=604800; SameSite=Lax`;
    document.cookie = `${AUTH_ROLE_KEY}=${role}; path=/; max-age=604800; SameSite=Lax`;
    notifyAuthChange();
  }

  return { user, token };
}

export async function signUp(data: {
  name: string;
  email: string;
  role: UserRole;
}): Promise<{ user: User; token: string }> {
  await new Promise((r) => setTimeout(r, 400));
  const baseMock = MOCK_USERS[data.role];
  const isAnanya =
    data.name.toLowerCase().includes("ananya") ||
    data.email.toLowerCase().includes("ananya");

  const user: User = {
    id: `usr_${Date.now()}`,
    name: data.name,
    email: data.email,
    role: data.role,
    avatarUrl: isAnanya ? baseMock?.avatarUrl : undefined,
    organizationId: data.role === "employer" ? "org_razorwave" : undefined,
    createdAt: new Date().toISOString(),
  };

  const token = `tag_jwt_${Date.now()}_${data.role}`;

  if (typeof window !== "undefined") {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    localStorage.setItem(AUTH_ROLE_KEY, data.role);
    document.cookie = `${AUTH_TOKEN_KEY}=${token}; path=/; max-age=604800; SameSite=Lax`;
    document.cookie = `${AUTH_ROLE_KEY}=${data.role}; path=/; max-age=604800; SameSite=Lax`;
    notifyAuthChange();
  }

  return { user, token };
}

export async function signOut(): Promise<void> {
  await new Promise((r) => setTimeout(r, 150));
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(AUTH_ROLE_KEY);
    document.cookie = `${AUTH_TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    document.cookie = `${AUTH_ROLE_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    notifyAuthChange();
  }
}

export const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export async function registerCandidateApi(payload: {
  fullName: string;
  email: string;
  countryCode?: string;
  phone: string;
  password: string;
  confirmPassword: string;
  agreeToTerms?: boolean;
}) {
  const res = await fetch(`${BACKEND_URL}/api/auth/register/candidate/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || Object.values(data).flat().join(" ") || "Registration failed");
  }
  return data;
}

export async function registerEmployerApi(payload: {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms?: boolean;
}) {
  let res: Response;
  try {
    res = await fetch(`${BACKEND_URL}/api/v1/auth/employer/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok && res.status === 404) {
      res = await fetch(`${BACKEND_URL}/api/auth/register/employer/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
  } catch {
    res = await fetch(`${BACKEND_URL}/api/auth/register/employer/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || Object.values(data).flat().join(" ") || "Company registration failed");
  }
  return data;
}


export async function verifyEmailApi(email: string, otp: string) {
  const res = await fetch(`${BACKEND_URL}/api/auth/verify-email/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || "Verification failed");
  }

  // Persist verified user session
  if (data.tokens?.access && data.user && typeof window !== "undefined") {
    const rawRole = data.user.role;
    const normalizedRole = rawRole === "employer" ? "employer" : "candidate";
    localStorage.setItem(AUTH_TOKEN_KEY, data.tokens.access);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify({ ...data.user, role: normalizedRole }));
    localStorage.setItem(AUTH_ROLE_KEY, normalizedRole);
    document.cookie = `${AUTH_TOKEN_KEY}=${data.tokens.access}; path=/; max-age=604800; SameSite=Lax`;
    document.cookie = `${AUTH_ROLE_KEY}=${normalizedRole}; path=/; max-age=604800; SameSite=Lax`;
    notifyAuthChange();
  }

  return data;
}

export async function resendOtpApi(email: string, purpose: "email_verification" | "password_reset" = "email_verification") {
  const res = await fetch(`${BACKEND_URL}/api/auth/resend-otp/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, purpose }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || "Failed to resend confirmation code");
  }
  return data;
}

export async function loginApi(email: string, password: string, role?: string) {
  const res = await fetch(`${BACKEND_URL}/api/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, role }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || Object.values(data).flat().join(" ") || "Login failed");
  }

  if (data.tokens?.access && data.user && typeof window !== "undefined") {
    localStorage.setItem(AUTH_TOKEN_KEY, data.tokens.access);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
    localStorage.setItem(AUTH_ROLE_KEY, data.user.role);
    document.cookie = `${AUTH_TOKEN_KEY}=${data.tokens.access}; path=/; max-age=604800; SameSite=Lax`;
    document.cookie = `${AUTH_ROLE_KEY}=${data.user.role}; path=/; max-age=604800; SameSite=Lax`;
    notifyAuthChange();
  }

  return data;
}

export async function forgotPasswordApi(email: string) {
  const res = await fetch(`${BACKEND_URL}/api/auth/forgot-password/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || "Failed to initiate password reset");
  }
  return data;
}

export async function verifyResetOtpApi(email: string, otp: string) {
  const res = await fetch(`${BACKEND_URL}/api/auth/verify-reset-otp/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || "Invalid reset code");
  }
  return data;
}

export async function resetPasswordApi(payload: {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}) {
  const res = await fetch(`${BACKEND_URL}/api/auth/reset-password/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || Object.values(data).flat().join(" ") || "Password reset failed");
  }
  return data;
}
