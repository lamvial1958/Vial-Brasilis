import { NextResponse } from "next/server";
import { getUser, updateUser, revokeRefreshTokens } from "@/lib/firebase/auth-rest";
import { requireAdmin } from "@/lib/firebase/session";

export async function POST(req: Request, { params }: { params: Promise<{ uid: string }> }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Acesso restrito ao administrador." }, { status: 403 });
  }

  const { uid } = await params;
  const target = await getUser(uid);
  if (target.role === "admin") {
    return NextResponse.json({ error: "Não é possível bloquear um administrador." }, { status: 403 });
  }

  const { bloqueado } = await req.json();
  await updateUser(uid, { disabled: Boolean(bloqueado) });
  if (bloqueado) {
    await revokeRefreshTokens(uid);
  }

  return NextResponse.json({ ok: true });
}
