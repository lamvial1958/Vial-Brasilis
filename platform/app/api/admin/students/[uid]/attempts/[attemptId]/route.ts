import { NextResponse } from "next/server";
import { updateDocFields } from "@/lib/firebase/firestore-rest";
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

  await updateDocFields(
    `simuladoSubmissions/${uid}/attempts/${attemptId}`,
    {
      status: "corrigido",
      nota: typeof nota === "number" ? nota : null,
      feedback: typeof feedback === "string" ? feedback : "",
    }
  );

  return NextResponse.json({ ok: true });
}
