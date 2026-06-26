import Link from "next/link";
import { notFound } from "next/navigation";
import { getNivelIndex } from "@/lib/content/load";
import type { Nivel } from "@/lib/content/schema";

const NIVEL_TEMA: Record<string, {
  corHex: string;
  textoNivel: string;
  badgeBg: string;
  badgeText: string;
  nome: string;
  descricao: string;
  cardHoverBorder: string;
  cardHoverShadow: string;
  simuladoBadge: string;
}> = {
  "pre-a1": {
    corHex: "#FFDF00",
    textoNivel: "text-[#7a5a00]",
    badgeBg: "bg-[#FFDF00]",
    badgeText: "text-[#5a3d00]",
    nome: "PRE-A1",
    descricao: "Sobrevivência — primeiros contatos no Brasil",
    cardHoverBorder: "hover:border-[#FFDF00]",
    cardHoverShadow: "hover:shadow-[0_10px_25px_rgba(255,223,0,0.3)]",
    simuladoBadge: "bg-[#fff9db] text-[#7a5a00] border-[#f5c800]",
  },
  "a1": {
    corHex: "#3DA35D",
    textoNivel: "text-[#3DA35D]",
    badgeBg: "bg-[#3DA35D]",
    badgeText: "text-white",
    nome: "A1",
    descricao: "Conexão — rotina e apresentação",
    cardHoverBorder: "hover:border-[#3DA35D]",
    cardHoverShadow: "hover:shadow-[0_10px_25px_rgba(61,163,93,0.2)]",
    simuladoBadge: "bg-green-100 text-green-800 border-green-300",
  },
  "a2": {
    corHex: "#009C3B",
    textoNivel: "text-[#009C3B]",
    badgeBg: "bg-[#009C3B]",
    badgeText: "text-white",
    nome: "A2",
    descricao: "Autonomia — vida cotidiana",
    cardHoverBorder: "hover:border-[#009C3B]",
    cardHoverShadow: "hover:shadow-[0_10px_25px_rgba(0,156,59,0.2)]",
    simuladoBadge: "bg-emerald-100 text-emerald-800 border-emerald-300",
  },
  "b1": {
    corHex: "#002776",
    textoNivel: "text-[#002776]",
    badgeBg: "bg-[#002776]",
    badgeText: "text-white",
    nome: "B1",
    descricao: "Integração — marco CELPE-Bras",
    cardHoverBorder: "hover:border-[#002776]",
    cardHoverShadow: "hover:shadow-[0_10px_25px_rgba(0,39,118,0.18)]",
    simuladoBadge: "bg-blue-100 text-blue-800 border-blue-300",
  },
  "b2": {
    corHex: "#1351B4",
    textoNivel: "text-[#1351B4]",
    badgeBg: "bg-[#1351B4]",
    badgeText: "text-white",
    nome: "B2",
    descricao: "Fluência social e argumentação",
    cardHoverBorder: "hover:border-[#1351B4]",
    cardHoverShadow: "hover:shadow-[0_10px_25px_rgba(19,81,180,0.18)]",
    simuladoBadge: "bg-blue-50 text-blue-700 border-blue-200",
  },
};

const FALLBACK_TEMA = {
  corHex: "#0f2744",
  textoNivel: "text-[#0f2744]",
  badgeBg: "bg-[#0f2744]",
  badgeText: "text-white",
  nome: "",
  descricao: "",
  cardHoverBorder: "hover:border-[#0f2744]",
  cardHoverShadow: "hover:shadow-md",
  simuladoBadge: "bg-slate-100 text-slate-700 border-slate-200",
};

export default async function NivelPage({ params }: { params: Promise<{ nivel: string }> }) {
  const { nivel } = await params;
  const indice = getNivelIndex(nivel as Nivel);
  if (!indice) notFound();

  const tema = NIVEL_TEMA[nivel] ?? { ...FALLBACK_TEMA, nome: nivel.toUpperCase() };

  return (
    <div className="min-h-full bg-gradient-to-br from-[#f3f8f4] to-[#eef3fa]">
      <main className="mx-auto max-w-4xl px-4 py-8">

        {/* Hero — inspirado em .lv-hero do projeto italiano */}
        <div
          className="bg-white rounded-2xl shadow-[0_4px_18px_rgba(0,0,0,0.08)] p-7 mb-8 flex flex-wrap items-center justify-between gap-4"
          style={{ borderLeft: `6px solid ${tema.corHex}` }}
        >
          <div>
            <h1 className={`text-3xl font-bold ${tema.textoNivel}`}>
              {tema.nome || nivel.toUpperCase()}
            </h1>
            {tema.descricao && (
              <p className="text-slate-500 text-sm mt-1">{tema.descricao}</p>
            )}
          </div>
          <span className={`${tema.badgeBg} ${tema.badgeText} px-5 py-1.5 rounded-full font-semibold text-sm whitespace-nowrap`}>
            {indice.unidades.length} unidades
          </span>
        </div>

        {/* Separador — inspirado em .parte-separator do projeto italiano */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
          <span className={`text-[11px] font-bold tracking-widest uppercase whitespace-nowrap ${tema.textoNivel}`}>
            Unidades do nível
          </span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
        </div>

        {/* Grid de unidades — inspirado em .unit-grid / .unit-card do projeto italiano */}
        <ol className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
          {indice.unidades.map((u, i) => (
            <li key={u.slug}>
              <Link
                href={`/licoes/${nivel}/${u.slug}`}
                className={`
                  group relative flex flex-col items-center justify-center text-center
                  aspect-square bg-white rounded-xl border-2 border-slate-200
                  ${tema.cardHoverBorder} ${tema.cardHoverShadow}
                  shadow-[0_2px_8px_rgba(0,0,0,0.04)]
                  transition-all duration-200 hover:-translate-y-1
                  p-3 overflow-hidden no-underline
                `}
              >
                {u.tipo === "simulado" && (
                  <span className={`absolute top-2 right-2 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${tema.simuladoBadge}`}>
                    sim.
                  </span>
                )}
                <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-1">
                  {u.codigo}
                </span>
                <span
                  className="text-4xl font-black leading-none mb-2"
                  style={{ color: tema.corHex }}
                >
                  {i + 1}
                </span>
                <span className="text-[0.72rem] font-semibold text-slate-600 leading-tight line-clamp-2">
                  {u.titulo}
                </span>
              </Link>
            </li>
          ))}
        </ol>

        {/* Voltar */}
        <div className="text-center mt-10">
          <Link href="/licoes" className="text-sm text-slate-400 hover:text-slate-600 transition-colors">
            ← Todos os níveis
          </Link>
        </div>

      </main>
    </div>
  );
}
