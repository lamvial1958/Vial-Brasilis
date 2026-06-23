import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/firebase/session";
import { listarAlunos } from "@/lib/admin/students";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Acesso restrito ao administrador." }, { status: 403 });
  }

  const alunos = await listarAlunos();
  return NextResponse.json({ alunos });
}
