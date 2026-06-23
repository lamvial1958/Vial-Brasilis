import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/firebase/session";

export async function DELETE(_req: Request, { params }: { params: Promise<{ uid: string }> }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Acesso restrito ao administrador." }, { status: 403 });
  }

  const { uid } = await params;
  await adminAuth.deleteUser(uid);
  await adminDb.collection("users").doc(uid).delete();
  await adminDb.collection("progress").doc(uid).delete();

  return NextResponse.json({ ok: true });
}
