import { NextResponse } from "next/server";
import { getUser, deleteUser } from "@/lib/firebase/auth-rest";
import { deleteDoc } from "@/lib/firebase/firestore-rest";
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
  await deleteDoc("users", uid);
  await deleteDoc("progress", uid);

  return NextResponse.json({ ok: true });
}
