"use client";

import { useState } from "react";
import type { ExercicioItem } from "@/lib/content/schema";
import { SttPronuncia } from "@/components/SttPronuncia";

export function ExerciciosReveal({ itens }: { itens: ExercicioItem[] }) {
  const [revelados, setRevelados] = useState<Set<number>>(new Set());

  function toggle(i: number) {
    setRevelados((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  if (itens.length === 0) return null;

  return (
    <ul className="space-y-3 mt-2">
      {itens.map((item, i) => (
        <li key={i} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-2">
          {/* Enunciado + botão gabarito */}
          <div className="flex items-start justify-between gap-4">
            <span className="text-sm text-slate-700 leading-relaxed">{item.enunciado}</span>
            <button
              onClick={() => toggle(i)}
              className={`print:hidden shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all duration-150 ${
                revelados.has(i)
                  ? "bg-[#009C3B] text-white border-[#009C3B]"
                  : "bg-white text-[#7a5a00] border-[#FFDF00] hover:bg-[#fffbe6]"
              }`}
            >
              {revelados.has(i) ? item.resposta : "ver gabarito"}
            </button>
            {/* Gabarito sempre visível na impressão */}
            <span className="hidden print:inline text-xs font-semibold text-[#009C3B]">
              {item.resposta}
            </span>
          </div>

          {/* Botão de fala — oculto na impressão */}
          <div className="print:hidden">
            <SttPronuncia textoEsperado={revelados.has(i) ? item.resposta : undefined} />
          </div>
        </li>
      ))}
    </ul>
  );
}
