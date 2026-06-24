import "server-only";
import { listUsers } from "@/lib/firebase/auth-rest";
import { getCollection } from "@/lib/firebase/firestore-rest";

export interface AlunoResumo {
  uid: string;
  email: string | null;
  criadoEm: string;
  bloqueado: boolean;
  progresso: Record<string, unknown> | null;
}

export async function listarAlunos(): Promise<AlunoResumo[]> {
  const users = await listUsers(1000);
  const progressDocs = await getCollection("progress");
  const progressByUid = new Map(progressDocs.map((d) => [d.id, d.data]));

  return users
    .filter((u) => u.role !== "admin")
    .map((u) => ({
      uid: u.uid,
      email: u.email ?? null,
      criadoEm: u.metadata.creationTime ?? "",
      bloqueado: u.disabled,
      progresso: progressByUid.get(u.uid) ?? null,
    }));
}
