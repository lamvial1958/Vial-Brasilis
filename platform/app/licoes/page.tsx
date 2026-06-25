import Link from "next/link";
import { getIndiceGeral } from "@/lib/content/load";

const NIVEL_META: Record<string, { label: string; descricao: string; cor: string }> = {
  "pre-a1": { label: "PRE-A1", descricao: "Sobrevivência — primeiros contatos", cor: "bg-slate-100 text-slate-700 border-slate-200" },
  a1:       { label: "A1",     descricao: "Conexão — rotina e apresentação",    cor: "bg-blue-50 text-blue-800 border-blue-100" },
  a2:       { label: "A2",     descricao: "Autonomia — vida cotidiana",          cor: "bg-sky-50 text-sky-800 border-sky-100" },
  b1:       { label: "B1",     descricao: "Integração — marco CELPE-Bras",      cor: "bg-green-50 text-green-800 border-green-200" },
  b2:       { label: "B2",     descricao: "Fluência social e argumentação",     cor: "bg-emerald-50 text-emerald-800 border-emerald-200" },
};

export default function LicoesPage() {
  const indice = getIndiceGeral();

  return (
    <main className="mx-auto max-w-3xl py-10 px-4">
      <h1 className="text-2xl font-bold text-[#0f2744] mb-1">Lições</h1>
      <p className="text-sm text-slate-500 mb-8">Selecione um nível para ver as unidades.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {indice.map((n) => {
          const meta = NIVEL_META[n.nivel] ?? { label: n.nivel.toUpperCase(), descricao: "", cor: "bg-slate-50 text-slate-700 border-slate-200" };
          return (
            <Link
              key={n.nivel}
              href={`/licoes/${n.nivel}`}
              className={`border rounded-xl p-5 hover:shadow-md transition-shadow ${meta.cor}`}
            >
              <span className="text-xs font-semibold tracking-widest uppercase opacity-60">{meta.label}</span>
              <h2 className="font-bold text-base mt-0.5">{meta.descricao}</h2>
              <p className="text-xs mt-2 opacity-60">{n.unidades.length} unidades</p>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
