import "server-only";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

export interface AlunoResumo {
  uid: string;
  email: string | null;
  criadoEm: string;
  ultimoLogin: string;
  emailVerificado: boolean;
  bloqueado: boolean;
  progresso: Record<string, unknown> | null;
}

export async function listarAlunos(): Promise<AlunoResumo[]> {
  const listResult = await adminAuth.listUsers(1000);
  const progressSnap = await adminDb.collection("progress").get();
  const progressByUid = new Map(progressSnap.docs.map((d) => [d.id, d.data()]));

  return listResult.users
    .filter((u) => u.customClaims?.role !== "admin")
    .map((u) => ({
      uid: u.uid,
      email: u.email ?? null,
      criadoEm: u.metadata.creationTime,
      ultimoLogin: u.metadata.lastSignInTime,
      emailVerificado: u.emailVerified,
      bloqueado: Boolean(u.disabled),
      progresso: progressByUid.get(u.uid) ?? null,
    }));
}
