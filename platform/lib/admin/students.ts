import "server-only";
import { listUsers } from "@/lib/firebase/auth-rest";
import { adminDb } from "@/lib/firebase/admin";

export interface AlunoResumo {
  uid: string;
  email: string | null;
  criadoEm: string;
  bloqueado: boolean;
  progresso: Record<string, unknown> | null;
}

export async function listarAlunos(): Promise<AlunoResumo[]> {
  const users = await listUsers(1000);
  const progressSnap = await adminDb.collection("progress").get();
  const progressByUid = new Map(progressSnap.docs.map((d) => [d.id, d.data()]));

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
