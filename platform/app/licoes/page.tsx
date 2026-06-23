import Link from "next/link";
import { getIndiceGeral } from "@/lib/content/load";

const NOMES_NIVEL: Record<string, string> = {
  "pre-a1": "PRE-A1",
  a1: "A1",
  a2: "A2",
  b1: "B1",
  b2: "B2",
};

export default function LicoesPage() {
  const indice = getIndiceGeral();

  return (
    <main className="mx-auto max-w-3xl py-10 px-4">
      <h1 className="text-2xl font-semibold mb-6">Níveis do curso</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {indice.map((n) => (
          <Link
            key={n.nivel}
            href={`/licoes/${n.nivel}`}
            className="border rounded p-4 hover:bg-gray-50"
          >
            <h2 className="font-semibold">{NOMES_NIVEL[n.nivel] ?? n.nivel}</h2>
            <p className="text-sm text-gray-600">{n.unidades.length} unidades</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
