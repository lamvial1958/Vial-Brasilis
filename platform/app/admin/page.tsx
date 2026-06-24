import Link from "next/link";
import { listarAlunos } from "@/lib/admin/students";
import { AlunoActions } from "@/components/admin/AlunoActions";

export default async function AdminPage() {
  const alunos = await listarAlunos();

  return (
    <main className="mx-auto max-w-5xl py-10 px-4">
      <h1 className="text-2xl font-semibold">Painel do administrador</h1>
      <p className="mt-1 text-sm text-gray-500">{alunos.length} aluno(s) cadastrado(s)</p>

      <table className="mt-6 w-full text-sm border-collapse">
        <thead>
          <tr className="text-left border-b">
            <th className="py-2">E-mail</th>
            <th className="py-2">Cadastro</th>
            <th className="py-2">Unidades concluídas</th>
            <th className="py-2">Status</th>
            <th className="py-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          {alunos.map((aluno) => {
            const unidadesConcluidas = Array.isArray(
              (aluno.progresso as { unidadesConcluidas?: unknown[] } | null)?.unidadesConcluidas
            )
              ? ((aluno.progresso as { unidadesConcluidas: unknown[] }).unidadesConcluidas.length)
              : 0;

            return (
              <tr key={aluno.uid} className="border-b">
                <td className="py-2">
                  <Link href={`/admin/alunos/${aluno.uid}`} className="underline">
                    {aluno.email ?? aluno.uid}
                  </Link>
                </td>
                <td className="py-2">{new Date(aluno.criadoEm).toLocaleDateString("pt-BR")}</td>
                <td className="py-2">{unidadesConcluidas}</td>
                <td className="py-2">{aluno.bloqueado ? "Bloqueado" : "Ativo"}</td>
                <td className="py-2">
                  <AlunoActions uid={aluno.uid} bloqueado={aluno.bloqueado} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </main>
  );
}
