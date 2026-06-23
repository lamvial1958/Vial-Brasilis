import "server-only";
import { adminDb } from "@/lib/firebase/admin";

export interface TentativaSimulado {
  id: string;
  nivel: string;
  slug: string;
  respostaTexto: string;
  duracaoSegundos: number;
  status: "enviado" | "corrigido";
  nota: number | null;
  feedback: string;
  finalizadoEm: string | null;
}

export async function listarTentativas(uid: string): Promise<TentativaSimulado[]> {
  const snap = await adminDb
    .collection("simuladoSubmissions")
    .doc(uid)
    .collection("attempts")
    .orderBy("finalizadoEm", "desc")
    .get();

  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      nivel: data.nivel,
      slug: data.slug,
      respostaTexto: data.respostaTexto ?? "",
      duracaoSegundos: data.duracaoSegundos ?? 0,
      status: data.status === "corrigido" ? "corrigido" : "enviado",
      nota: typeof data.nota === "number" ? data.nota : null,
      feedback: data.feedback ?? "",
      finalizadoEm: data.finalizadoEm ? data.finalizadoEm.toDate().toISOString() : null,
    };
  });
}
