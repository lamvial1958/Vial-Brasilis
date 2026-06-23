import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/firebase/session";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ uid: string; attemptId: string }> }
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Acesso restrito ao administrador." }, { status: 403 });
  }

  const { uid, attemptId } = await params;
  const { nota, feedback } = await req.json();

  await adminDb
    .collection("simuladoSubmissions")
    .doc(uid)
    .collection("attempts")
    .doc(attemptId)
    .update({
      status: "corrigido",
      nota: typeof nota === "number" ? nota : null,
      feedback: typeof feedback === "string" ? feedback : "",
    });

  return NextResponse.json({ ok: true });
}
