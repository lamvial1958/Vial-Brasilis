import { NextResponse } from "next/server";
import { updateDocFields } from "@/lib/firebase/firestore-rest";
import { requireAdmin } from "@/lib/firebase/session";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ uid: string; submissaoId: string }> }
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Acesso restrito ao administrador." }, { status: 403 });
  }

  const { uid, submissaoId } = await params;
  const { nota, feedback } = await req.json();

  await updateDocFields(
    `producaoEscrita/${uid}/submissions/${submissaoId}`,
    {
      status: "corrigido",
      nota: typeof nota === "number" ? nota : null,
      feedback: typeof feedback === "string" ? feedback : "",
      feedbackEm: new Date().toISOString(),
    }
  );

  return NextResponse.json({ ok: true });
}
