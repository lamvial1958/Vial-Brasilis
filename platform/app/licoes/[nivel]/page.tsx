import Link from "next/link";
import { notFound } from "next/navigation";
import { getNivelIndex } from "@/lib/content/load";
import type { Nivel } from "@/lib/content/schema";

export default async function NivelPage({ params }: { params: Promise<{ nivel: string }> }) {
  const { nivel } = await params;
  const indice = getNivelIndex(nivel as Nivel);
  if (!indice) notFound();

  return (
    <main className="mx-auto max-w-3xl py-10 px-4">
      <h1 className="text-2xl font-semibold mb-6 uppercase">{nivel}</h1>
      <ol className="space-y-2">
        {indice.unidades.map((u) => (
          <li key={u.slug}>
            <Link href={`/licoes/${nivel}/${u.slug}`} className="border rounded p-3 block hover:bg-gray-50">
              <span className="font-medium">{u.codigo}</span> — {u.titulo}
              {u.tipo === "simulado" && (
                <span className="ml-2 text-xs uppercase text-amber-700">simulado</span>
              )}
            </Link>
          </li>
        ))}
      </ol>
    </main>
  );
}
