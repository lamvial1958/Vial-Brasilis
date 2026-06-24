import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/firebase/auth-rest";
import { createSessionCookie, SESSION_COOKIE_NAME } from "@/lib/firebase/session";

export async function POST(req: NextRequest) {
  const { idToken } = await req.json();
  if (!idToken) {
    return NextResponse.json({ error: "idToken ausente" }, { status: 400 });
  }

  try {
    const sessionCookie = await createSessionCookie(idToken);

    // createSessionCookie already verifies the token; extract uid to check disabled
    const payload = JSON.parse(
      Buffer.from(sessionCookie.split(".")[1], "base64url").toString()
    ) as { uid: string };
    const user = await getUser(payload.uid);
    if (user.disabled) {
      return NextResponse.json({ error: "Conta bloqueada." }, { status: 403 });
    }

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
