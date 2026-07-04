"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "../lib/auth-context";

export function ProtectedRoute({ children, requiredRole = "user" }: { children: React.ReactNode; requiredRole?: "admin" | "user" }) {
  const router = useRouter();
  const { user, role, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
      return;
    }

    if (!loading && requiredRole === "admin" && role !== "admin") {
      router.replace("/dashboard");
    }
  }, [loading, requiredRole, role, router, user]);

  if (loading) {
    return <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", fontFamily: "Outfit, sans-serif" }}>Loading your account…</div>;
  }

  if (!user) {
    return null;
  }

  if (requiredRole === "admin" && role !== "admin") {
    return null;
  }

  return <>{children}</>;
}
