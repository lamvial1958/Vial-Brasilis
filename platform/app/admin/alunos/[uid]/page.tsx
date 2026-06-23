import Link from "next/link";
import { listarTentativas } from "@/lib/admin/attempts";
import { CorrecaoTentativa } from "@/components/admin/CorrecaoTentativa";

export default async function AlunoDetalhePage({
  params,
}: {
  params: Promise<{ uid: string }>;
}) {
  const { uid } = await params;
  const tentativas = await listarTentativas(uid);

  return (
    <main className="mx-auto max-w-3xl py-10 px-4">
      <Link href="/admin" className="text-sm underline">
        ← voltar
      </Link>
      <h1 className="text-2xl font-semibold mt-2">Simulados do aluno</h1>

      <div className="mt-6 space-y-6">
        {tentativas.length === 0 && (
          <p className="text-gray-500">Nenhum simulado enviado por este aluno ainda.</p>
        )}
        {tentativas.map((tentativa) => (
          <CorrecaoTentativa key={tentativa.id} uid={uid} tentativa={tentativa} />
        ))}
      </div>
    </main>
  );
}
