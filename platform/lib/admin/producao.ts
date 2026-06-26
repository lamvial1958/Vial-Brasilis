import "server-only";
import { querySubCollection } from "@/lib/firebase/firestore-rest";

export interface SubmissaoEscrita {
  id: string;
  nivel: string;
  slug: string;
  secaoOrdem: number;
  secaoTitulo: string;
  texto: string;
  enviadoEm: string | null;
  status: "pendente" | "corrigido";
  nota: number | null;
  feedback: string;
  feedbackEm: string | null;
}

export async function listarSubmissoes(uid: string): Promise<SubmissaoEscrita[]> {
  const docs = await querySubCollection(
    `producaoEscrita/${uid}`,
    "submissions",
    { field: "enviadoEm", direction: "DESCENDING" }
  );

  return docs.map((d) => {
    const data = d.data;
    return {
      id: d.id,
      nivel: String(data.nivel ?? ""),
      slug: String(data.slug ?? ""),
      secaoOrdem: typeof data.secaoOrdem === "number" ? data.secaoOrdem : 0,
      secaoTitulo: String(data.secaoTitulo ?? ""),
      texto: String(data.texto ?? ""),
      enviadoEm: typeof data.enviadoEm === "string" ? data.enviadoEm : null,
      status: data.status === "corrigido" ? "corrigido" : "pendente",
      nota: typeof data.nota === "number" ? data.nota : null,
      feedback: String(data.feedback ?? ""),
      feedbackEm: typeof data.feedbackEm === "string" ? data.feedbackEm : null,
    };
  });
}
