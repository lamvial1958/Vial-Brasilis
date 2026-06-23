import { notFound } from "next/navigation";
import { getUnit } from "@/lib/content/load";
import type { Nivel } from "@/lib/content/schema";
import { SectionMarkdown } from "@/components/SectionMarkdown";
import { ExerciciosReveal } from "@/components/ExerciciosReveal";
import { MarcarConcluida } from "@/components/MarcarConcluida";
import { SimuladoCronometro } from "@/components/SimuladoCronometro";

export default async function UnidadePage({
  params,
}: {
  params: Promise<{ nivel: string; slug: string }>;
}) {
  const { nivel, slug } = await params;

  let unidade;
  try {
    unidade = getUnit(nivel as Nivel, slug);
  } catch {
    notFound();
  }

  return (
    <main className="mx-auto max-w-3xl py-10 px-4">
      <h1 className="text-2xl font-semibold">
        {unidade.codigo} — {unidade.titulo}
      </h1>
      {unidade.notaIntro && (
        <p className="text-sm text-gray-500 italic mt-2">{unidade.notaIntro}</p>
      )}

      <div className="mt-8 space-y-8">
        {unidade.secoes.map((secao) => (
          <section key={secao.ordem}>
            <h2 className="text-lg font-semibold mb-2">
              {secao.ordem}. {secao.titulo}
            </h2>
            {secao.titulo.toLowerCase().startsWith("exercícios") ? (
              <ExerciciosReveal itens={unidade.exercicios} />
            ) : (
              <SectionMarkdown markdown={secao.markdown} />
            )}
          </section>
        ))}
      </div>

      {unidade.tipo === "simulado" && (
        <div className="mt-10">
          <SimuladoCronometro nivel={nivel} slug={slug} tempoSugeridoMin={unidade.tempoSugeridoMin} />
        </div>
      )}

      <div className="mt-10 border-t pt-6">
        <MarcarConcluida
          nivel={nivel}
          slug={slug}
          vocabulario={unidade.vocabulario}
          tags={unidade.tagsVocabulario}
        />
      </div>
    </main>
  );
}
