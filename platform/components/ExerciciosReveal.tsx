"use client";

import { useState } from "react";
import type { ExercicioItem } from "@/lib/content/schema";

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
    <ul className="space-y-2 mt-4">
      {itens.map((item, i) => (
        <li key={i} className="border rounded p-3 flex items-center justify-between gap-4">
          <span>{item.enunciado}</span>
          <button
            onClick={() => toggle(i)}
            className="text-sm shrink-0 underline"
          >
            {revelados.has(i) ? item.resposta : "ver gabarito"}
          </button>
        </li>
      ))}
    </ul>
  );
}
