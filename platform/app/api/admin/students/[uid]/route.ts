import { NextResponse } from "next/server";
import { getUser, deleteUser } from "@/lib/firebase/auth-rest";
import { adminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/firebase/session";

export async function DELETE(_req: Request, { params }: { params: Promise<{ uid: string }> }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Acesso restrito ao administrador." }, { status: 403 });
  }

  const { uid } = await params;
  const target = await getUser(uid);
  if (target.role === "admin") {
    return NextResponse.json({ error: "Não é possível excluir um administrador." }, { status: 403 });
  }
  await deleteUser(uid);
  await adminDb.collection("users").doc(uid).delete();
  await adminDb.collection("progress").doc(uid).delete();

  return NextResponse.json({ ok: true });
}
