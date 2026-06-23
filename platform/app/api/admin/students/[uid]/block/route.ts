import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/firebase/session";

export async function POST(req: Request, { params }: { params: Promise<{ uid: string }> }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Acesso restrito ao administrador." }, { status: 403 });
  }

  const { uid } = await params;
  const { bloqueado } = await req.json();

  await adminAuth.updateUser(uid, { disabled: Boolean(bloqueado) });
  if (bloqueado) {
    // invalida sessões/tokens já emitidos para esse usuário
    await adminAuth.revokeRefreshTokens(uid);
  }

  return NextResponse.json({ ok: true });
}
