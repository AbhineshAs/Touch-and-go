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
  refreshAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshAuth = useCallback(() => {
    const storedUser = getStoredUser();
    const storedToken = getStoredToken();
    if (storedUser && storedToken) {
      setUser(storedUser);
      setToken(storedToken);
    } else {
      setUser(null);
      setToken(null);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refreshAuth();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "tag_auth_token" || e.key === "tag_auth_user") {
        refreshAuth();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
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
