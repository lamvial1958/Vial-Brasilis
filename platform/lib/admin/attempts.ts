import "server-only";
import { querySubCollection } from "@/lib/firebase/firestore-rest";

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
  const docs = await querySubCollection(
    `simuladoSubmissions/${uid}`,
    "attempts",
    { field: "finalizadoEm", direction: "DESCENDING" }
  );

  return docs.map((d) => {
    const data = d.data;
    return {
      id: d.id,
      nivel: String(data.nivel ?? ""),
      slug: String(data.slug ?? ""),
      respostaTexto: String(data.respostaTexto ?? ""),
      duracaoSegundos: typeof data.duracaoSegundos === "number" ? data.duracaoSegundos : 0,
      status: data.status === "corrigido" ? "corrigido" : "enviado",
      nota: typeof data.nota === "number" ? data.nota : null,
      feedback: String(data.feedback ?? ""),
      finalizadoEm: typeof data.finalizadoEm === "string" ? data.finalizadoEm : null,
    };
  });
}
