"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

interface AuthContextValue {
  user: User | null;
  role: "admin" | "user";
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({ user: null, role: "user", loading: true });

function getRoleFromEmail(email: string | null | undefined): "admin" | "user" {
  if (!email) return "user";
  const normalized = email.toLowerCase();
  return normalized.includes("admin") || normalized.includes("@avelo.dev") ? "admin" : "user";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<"admin" | "user">("user");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      const nextRole = getRoleFromEmail(nextUser?.email ?? null);
      setRole(nextRole);
      localStorage.setItem("avelo-role", nextRole);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const storedRole = localStorage.getItem("avelo-role") as "admin" | "user" | null;
    if (storedRole) {
      setRole(storedRole);
    }
  }, []);

  const value = useMemo(() => ({ user, role, loading }), [user, role, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
