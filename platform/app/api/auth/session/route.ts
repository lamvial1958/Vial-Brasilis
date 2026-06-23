import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { createSessionCookie, SESSION_COOKIE_NAME } from "@/lib/firebase/session";

export async function POST(req: NextRequest) {
  const { idToken } = await req.json();
  if (!idToken) {
    return NextResponse.json({ error: "idToken ausente" }, { status: 400 });
  }

  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    const user = await adminAuth.getUser(decoded.uid);
    if (user.disabled) {
      return NextResponse.json({ error: "Conta bloqueada." }, { status: 403 });
    }

    const sessionCookie = await createSessionCookie(idToken);
    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 14,
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Token inválido." }, { status: 401 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(SESSION_COOKIE_NAME);
  return res;
}
