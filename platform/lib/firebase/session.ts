import "server-only";
import { cookies } from "next/headers";
import { adminAuth } from "./admin";

export const SESSION_COOKIE_NAME = "ple_session";
const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 14; // 14 dias

export interface SessionUser {
  uid: string;
  email: string | null;
  role: "admin" | "student";
  emailVerified: boolean;
}

export async function createSessionCookie(idToken: string): Promise<string> {
  return adminAuth.createSessionCookie(idToken, { expiresIn: SESSION_MAX_AGE_MS });
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) return null;

  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    return {
      uid: decoded.uid,
      email: decoded.email ?? null,
      role: decoded.role === "admin" ? "admin" : "student",
      emailVerified: Boolean(decoded.email_verified),
    };
  } catch {
    return null;
  }
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    throw new Error("Acesso restrito ao administrador.");
  }
  return user;
}
