"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { User, UserRole } from "@/types";
import {
  signIn,
  signUp,
  signOut,
  switchActiveRole,
  getStoredUser,
  getStoredToken,
} from "@/lib/api/auth";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, role: UserRole) => Promise<User>;
  signup: (data: { name: string; email: string; role: UserRole }) => Promise<User>;
  logout: (redirectTo?: string) => Promise<void>;
  switchRole: (role: UserRole) => Promise<User>;
  refreshAuth: () => User | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshAuth = useCallback((): User | null => {
    const storedUser = getStoredUser();
    const storedToken = getStoredToken();
    if (storedUser && storedToken) {
      setUser(storedUser);
      setToken(storedToken);
      setIsLoading(false);
      return storedUser;
    } else {
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return null;
    }
  }, []);

  useEffect(() => {
    refreshAuth();

    const handleStorageChange = (e?: StorageEvent | Event) => {
      if (
        !e ||
        !("key" in e) ||
        (e as StorageEvent).key === "tag_auth_token" ||
        (e as StorageEvent).key === "tag_auth_user" ||
        (e as StorageEvent).key === "tag_active_role" ||
        (e as StorageEvent).key === null
      ) {
        refreshAuth();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("tag_auth_changed", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("tag_auth_changed", handleStorageChange);
    };
  }, [refreshAuth]);

  const login = async (email: string, role: UserRole): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await signIn(email, role);
      setUser(res.user);
      setToken(res.token);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (data: { name: string; email: string; role: UserRole }): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await signUp(data);
      setUser(res.user);
      setToken(res.token);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (redirectTo: string = "/"): Promise<void> => {
    setIsLoading(true);
    try {
      await signOut();
      setUser(null);
      setToken(null);
      router.push(redirectTo);
    } finally {
      setIsLoading(false);
    }
  };

  const switchRole = async (role: UserRole): Promise<User> => {
    setIsLoading(true);
    try {
      const updatedUser = await switchActiveRole(role);
      setUser(updatedUser);
      return updatedUser;
    } finally {
      setIsLoading(false);
    }
  };

  const isAuthenticated = Boolean(user && token);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        login,
        signup,
        logout,
        switchRole,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
