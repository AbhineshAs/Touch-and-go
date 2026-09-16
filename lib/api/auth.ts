import { User, UserRole } from "@/types";
import { MOCK_USERS } from "@/lib/mocks/data";

export const AUTH_TOKEN_KEY = "tag_auth_token";
export const AUTH_USER_KEY = "tag_auth_user";
export const AUTH_ROLE_KEY = "tag_active_role";

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
  const user = MOCK_USERS[role];
  if (typeof window !== "undefined") {
    localStorage.setItem(AUTH_ROLE_KEY, role);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    document.cookie = `${AUTH_ROLE_KEY}=${role}; path=/; max-age=604800; SameSite=Lax`;
  }
  return user;
}

export async function signIn(
  email: string,
  role: UserRole
): Promise<{ user: User; token: string }> {
  await new Promise((r) => setTimeout(r, 300));
  const baseMock = MOCK_USERS[role];
  const user: User = baseMock
    ? { ...baseMock, email }
    : {
        id: `usr_${Date.now()}`,
        name: email.split("@")[0],
        email,
        role,
        createdAt: new Date().toISOString(),
      };

  const token = `tag_jwt_${Date.now()}_${role}`;

  if (typeof window !== "undefined") {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    localStorage.setItem(AUTH_ROLE_KEY, role);
    document.cookie = `${AUTH_TOKEN_KEY}=${token}; path=/; max-age=604800; SameSite=Lax`;
    document.cookie = `${AUTH_ROLE_KEY}=${role}; path=/; max-age=604800; SameSite=Lax`;
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
  const user: User = {
    id: `usr_${Date.now()}`,
    name: data.name,
    email: data.email,
    role: data.role,
    avatarUrl: baseMock?.avatarUrl,
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
  }
}
