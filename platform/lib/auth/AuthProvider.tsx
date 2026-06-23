"use client";

import { onIdTokenChanged, type User } from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "@/lib/firebase/client";
import { ensureAppCheck } from "@/lib/firebase/app-check";

interface AuthState {
  user: User | null;
  role: "admin" | "student" | null;
  loading: boolean;
}

const AuthContext = createContext<AuthState>({ user: null, role: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, role: null, loading: true });

  useEffect(() => {
    ensureAppCheck();
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (!user) {
        setState({ user: null, role: null, loading: false });
        await fetch("/api/auth/session", { method: "DELETE" });
        return;
      }

      const tokenResult = await user.getIdTokenResult();
      const role = tokenResult.claims.role === "admin" ? "admin" : "student";
      setState({ user, role, loading: false });

      await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: tokenResult.token }),
      });
    });
    return unsubscribe;
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
