import { notFound } from "next/navigation";
import Link from "next/link";
import fs from "fs";
import path from "path";
import { getUnit } from "@/lib/content/load";
import type { Nivel } from "@/lib/content/schema";
import { SectionMarkdown } from "@/components/SectionMarkdown";
import { ExerciciosReveal } from "@/components/ExerciciosReveal";
import { MarcarConcluida } from "@/components/MarcarConcluida";
import { SimuladoCronometro } from "@/components/SimuladoCronometro";
import { TtsButton } from "@/components/TtsButton";
import { ProducaoEscritaForm } from "@/components/ProducaoEscritaForm";
import { BotaoImprimir } from "@/components/BotaoImprimir";
import { extrairVerbos } from "@/lib/content/verbos";

const NIVEL_TEMA: Record<string, {
  corHex: string;
  textoDestaqueHex: string;   // cor de texto sobre fundo branco (h2, títulos)
  textoSobreNivelHex: string; // cor de texto sobre fundo da cor do nível (tabelas, badges)
  textoNivel: string;
  badgeBg: string;
  badgeText: string;
  nome: string;
  exercBg: string;
  exercBorder: string;
}> = {
  "pre-a1": {
    corHex: "#FFDF00",
    textoDestaqueHex: "#1a1a1a",   // preto — amarelo não é legível sobre branco
    textoSobreNivelHex: "#1a1a1a", // preto — amarelo não tem contraste para texto branco
    textoNivel: "text-[#7a5a00]",
    badgeBg: "bg-[#FFDF00]",
    badgeText: "text-black",
    nome: "PRE-A1",
    exercBg: "bg-[#fffbe6]",
    exercBorder: "border-[#f5c800]",
  },
  "a1": {
    corHex: "#3DA35D",
    textoDestaqueHex: "#3DA35D",
    textoSobreNivelHex: "#ffffff",
    textoNivel: "text-[#3DA35D]",
    badgeBg: "bg-[#3DA35D]",
    badgeText: "text-white",
    nome: "A1",
    exercBg: "bg-[#f0fdf4]",
    exercBorder: "border-[#3DA35D]/40",
  },
  "a2": {
    corHex: "#009C3B",
    textoDestaqueHex: "#009C3B",
    textoSobreNivelHex: "#ffffff",
    textoNivel: "text-[#009C3B]",
    badgeBg: "bg-[#009C3B]",
    badgeText: "text-white",
    nome: "A2",
    exercBg: "bg-[#f0fdf4]",
    exercBorder: "border-[#009C3B]/40",
  },
  "b1": {
    corHex: "#002776",
    textoDestaqueHex: "#002776",
    textoSobreNivelHex: "#ffffff",
    textoNivel: "text-[#002776]",
    badgeBg: "bg-[#002776]",
    badgeText: "text-white",
    nome: "B1",
    exercBg: "bg-[#eff6ff]",
    exercBorder: "border-[#002776]/30",
  },
  "b2": {
    corHex: "#1351B4",
    textoDestaqueHex: "#1351B4",
    textoSobreNivelHex: "#ffffff",
    textoNivel: "text-[#1351B4]",
    badgeBg: "bg-[#1351B4]",
    badgeText: "text-white",
    nome: "B2",
    exercBg: "bg-[#eff6ff]",
    exercBorder: "border-[#1351B4]/30",
  },
};

const FALLBACK_TEMA = {
  corHex: "#0f2744",
  textoDestaqueHex: "#0f2744",
  textoSobreNivelHex: "#ffffff",
  textoNivel: "text-[#0f2744]",
  badgeBg: "bg-[#0f2744]",
  badgeText: "text-white",
  nome: "",
  exercBg: "bg-slate-50",
  exercBorder: "border-slate-200",
};

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

  const tema = NIVEL_TEMA[nivel] ?? FALLBACK_TEMA;
  const verbos = extrairVerbos(unidade.vocabulario);

  /** Retorna URL do áudio pré-gravado se existir em /public/audio/, senão undefined */
  function audioUrlSeExistir(ordem: number): string | undefined {
    const rel = path.join("public", "audio", nivel, slug, `secao-${ordem}.mp3`);
    return fs.existsSync(path.join(process.cwd(), rel))
      ? `/audio/${nivel}/${slug}/secao-${ordem}.mp3`
      : undefined;
  }

  return (
    <>
      {/* CSS variables para estilos de prose (tabelas, blockquotes) */}
      <style>{`:root { --cor-nivel: ${tema.corHex}; --cor-nivel-texto: ${tema.textoSobreNivelHex}; }`}</style>

      <div className="min-h-full bg-gradient-to-br from-[#f3f8f4] to-[#eef3fa]">
        <main className="mx-auto max-w-3xl px-4 py-8 space-y-5">

          {/* Hero da lição — inspirado em .lv-hero do projeto italiano */}
          <div
            className="bg-white rounded-2xl shadow-[0_4px_18px_rgba(0,0,0,0.08)] p-6"
            style={{ borderLeft: `6px solid ${tema.corHex}` }}
          >
            <span className={`inline-block ${tema.badgeBg} ${tema.badgeText} text-[11px] font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-3`}>
              {tema.nome || nivel.toUpperCase()}
            </span>
            <h1 className={`text-2xl font-bold leading-tight ${tema.textoNivel}`}>
              {unidade.codigo}
            </h1>
            <p className="text-slate-600 mt-1 font-medium text-base">{unidade.titulo}</p>
            <div className="mt-3">
              <BotaoImprimir />
            </div>
          </div>

          {/* Seções — inspirado em .unit-content do projeto italiano */}
          {unidade.secoes.map((secao) => {
            const isExercise = secao.titulo.toLowerCase().startsWith("exercícios");
            const isProducao = secao.titulo.toLowerCase().includes("produção");
            return (
              <section
                key={secao.ordem}
                className={`rounded-2xl overflow-hidden shadow-sm border ${
                  isExercise
                    ? `${tema.exercBg} ${tema.exercBorder}`
                    : "bg-white border-slate-100"
                }`}
              >
                {/* Cabeçalho da seção — h2 com borda inferior na cor do nível */}
                <div
                  className="px-6 py-4 flex items-center justify-between gap-3"
                  style={{ borderBottom: `3px solid ${tema.corHex}` }}
                >
                  <h2
                    className="text-base font-bold"
                    style={{ color: tema.textoDestaqueHex }}
                  >
                    {secao.ordem}. {secao.titulo}
                  </h2>
                  {!isExercise && (
                    <span className="print:hidden">
                      <TtsButton
                        markdown={secao.markdown}
                        audioUrl={audioUrlSeExistir(secao.ordem)}
                      />
                    </span>
                  )}
                </div>

                {/* Conteúdo */}
                <div className="px-6 py-5 conteudo-licao">
                  {isExercise ? (
                    <ExerciciosReveal itens={unidade.exercicios} />
                  ) : (
                    <>
                      <SectionMarkdown markdown={secao.markdown} verbos={verbos} />
                      {isProducao && (
                        <ProducaoEscritaForm
                          nivel={nivel}
                          slug={slug}
                          secaoOrdem={secao.ordem}
                          secaoTitulo={secao.titulo}
                          corHex={tema.corHex}
                          textoDestaqueHex={tema.textoDestaqueHex}
                          textoSobreNivelHex={tema.textoSobreNivelHex}
                        />
                      )}
                    </>
                  )}
                </div>
              </section>
            );
          })}

          {/* Simulado */}
          {unidade.tipo === "simulado" && (
            <div className="rounded-2xl overflow-hidden shadow-sm border border-amber-200 bg-amber-50">
              <SimuladoCronometro nivel={nivel} slug={slug} tempoSugeridoMin={unidade.tempoSugeridoMin} />
            </div>
          )}

          {/* Marcar como concluída */}
          <div className="print:hidden rounded-2xl bg-white shadow-sm border border-slate-100 px-6 py-5 flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-[#0f2744] text-sm">Concluiu esta unidade?</p>
              <p className="text-slate-400 text-xs mt-0.5">Marque para registrar o progresso e salvar o vocabulário para revisão.</p>
            </div>
            <MarcarConcluida
              nivel={nivel}
              slug={slug}
              vocabulario={unidade.vocabulario}
              tags={unidade.tagsVocabulario}
            />
          </div>

          {/* Navegação de volta */}
          <div className="print:hidden text-center pb-4">
            <Link
              href={`/licoes/${nivel}`}
              className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
            >
              ← Voltar para {tema.nome || nivel.toUpperCase()}
            </Link>
          </div>

        </main>
      </div>
    </>
  );
}
