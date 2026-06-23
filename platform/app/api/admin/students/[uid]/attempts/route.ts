import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/firebase/session";
import { listarTentativas } from "@/lib/admin/attempts";

export async function GET(_req: Request, { params }: { params: Promise<{ uid: string }> }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Acesso restrito ao administrador." }, { status: 403 });
  }

  const { uid } = await params;
  const tentativas = await listarTentativas(uid);
  return NextResponse.json({ tentativas });
}
