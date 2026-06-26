"use client";

import Image from "next/image";
import { doc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { db } from "@/lib/firebase/client";
import { useAuth } from "@/lib/auth/AuthProvider";

const OBJETIVOS = [
  {
    id: "naturalizacao",
    titulo: "Naturalização brasileira",
    descricao: "Quero o CELPE-Bras para obter a cidadania",
    icone: "🇧🇷",
  },
  {
    id: "universidade",
    titulo: "Estudar no Brasil",
    descricao: "Ingresso em universidade brasileira",
    icone: "🎓",
  },
  {
    id: "viagem",
    titulo: "Viajar ou morar no Brasil",
    descricao: "Quero me comunicar bem no dia a dia",
    icone: "✈️",
  },
  {
    id: "trabalho",
    titulo: "Trabalho e negócios",
    descricao: "Contexto profissional com brasileiros",
    icone: "💼",
  },
];

export default function BoasVindasPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [objetivo, setObjetivo] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  async function comecar() {
    setSalvando(true);
    if (user && objetivo) {
      await updateDoc(doc(db, "users", user.uid), { objetivo }).catch(() => {});
    }
    router.push("/licoes/pre-a1");
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f3f8f4] to-[#eef3fa] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="flex flex-col items-center mb-8 text-center">
          <Image
            src="/logo.png"
            alt="VIAL Brasilis"
            width={64}
            height={64}
            className="rounded-2xl mb-4 shadow-md"
          />
          <h1 className="text-2xl font-bold text-[#0f2744]">Bem-vindo ao VIAL Brasilis!</h1>
          <p className="text-slate-400 mt-1 text-sm max-w-xs">
            Curso estruturado de Português do Brasil — do PRE-A1 ao B2, com foco no CELPE-Bras.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <p className="text-sm font-semibold text-[#0f2744] mb-4">
            Por que você quer aprender português? <span className="text-slate-400 font-normal">(opcional)</span>
          </p>

          <div className="space-y-2">
            {OBJETIVOS.map((op) => (
              <button
                key={op.id}
                onClick={() => setObjetivo(op.id === objetivo ? null : op.id)}
                className={`w-full text-left rounded-xl border px-4 py-3 transition-all duration-150 ${
                  objetivo === op.id
                    ? "border-[#009C3B] bg-[#f0faf4] ring-1 ring-[#009C3B]"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl leading-none mt-0.5">{op.icone}</span>
                  <div>
                    <p className="text-sm font-semibold text-[#0f2744]">{op.titulo}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{op.descricao}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={comecar}
            disabled={salvando}
            className="mt-6 w-full bg-[#009C3B] text-white rounded-xl px-4 py-3 text-sm font-semibold hover:bg-[#007A2E] disabled:opacity-50 transition-colors shadow-[0_4px_14px_rgba(0,156,59,0.25)]"
          >
            {salvando ? "Entrando…" : objetivo ? "Começar meu curso →" : "Pular e começar →"}
          </button>
        </div>
      </div>
    </main>
  );
}
