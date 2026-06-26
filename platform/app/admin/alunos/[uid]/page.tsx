import Link from "next/link";
import { listarTentativas } from "@/lib/admin/attempts";
import { listarSubmissoes } from "@/lib/admin/producao";
import { CorrecaoTentativa } from "@/components/admin/CorrecaoTentativa";
import { CorrecaoProducao } from "@/components/admin/CorrecaoProducao";

export default async function AlunoDetalhePage({
  params,
}: {
  params: Promise<{ uid: string }>;
}) {
  const { uid } = await params;
  const [tentativas, submissoes] = await Promise.all([
    listarTentativas(uid),
    listarSubmissoes(uid),
  ]);

  const pendentes = submissoes.filter((s) => s.status === "pendente").length;

  return (
    <main className="mx-auto max-w-3xl py-10 px-4 space-y-10">
      <Link href="/admin" className="text-sm underline">
        ← voltar
      </Link>

      {/* Produções escritas */}
      <section>
        <h2 className="text-xl font-semibold">
          Produções escritas
          {pendentes > 0 && (
            <span className="ml-2 text-sm font-normal bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full">
              {pendentes} pendente{pendentes > 1 ? "s" : ""}
            </span>
          )}
        </h2>

        <div className="mt-4 space-y-6">
          {submissoes.length === 0 && (
            <p className="text-gray-500">Nenhuma produção enviada por este aluno ainda.</p>
          )}
          {submissoes.map((submissao) => (
            <CorrecaoProducao key={submissao.id} uid={uid} submissao={submissao} />
          ))}
        </div>
      </section>

      {/* Simulados */}
      <section>
        <h2 className="text-xl font-semibold">Simulados</h2>

        <div className="mt-4 space-y-6">
          {tentativas.length === 0 && (
            <p className="text-gray-500">Nenhum simulado enviado por este aluno ainda.</p>
          )}
          {tentativas.map((tentativa) => (
            <CorrecaoTentativa key={tentativa.id} uid={uid} tentativa={tentativa} />
          ))}
        </div>
      </section>
    </main>
  );
}
