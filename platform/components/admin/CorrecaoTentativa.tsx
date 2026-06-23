"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { TentativaSimulado } from "@/lib/admin/attempts";

export function CorrecaoTentativa({ uid, tentativa }: { uid: string; tentativa: TentativaSimulado }) {
  const router = useRouter();
  const [nota, setNota] = useState(tentativa.nota?.toString() ?? "");
  const [feedback, setFeedback] = useState(tentativa.feedback);
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    setSalvando(true);
    await fetch(`/api/admin/students/${uid}/attempts/${tentativa.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nota: nota === "" ? null : Number(nota), feedback }),
    });
    setSalvando(false);
    router.refresh();
  }

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>
          {tentativa.nivel}/{tentativa.slug} — {Math.round(tentativa.duracaoSegundos / 60)} min
        </span>
        <span>{tentativa.status === "corrigido" ? "Corrigido" : "Aguardando correção"}</span>
      </div>

      <pre className="whitespace-pre-wrap text-sm bg-gray-50 border rounded p-3 max-h-64 overflow-auto">
        {tentativa.respostaTexto || "(sem resposta enviada)"}
      </pre>

      <div className="flex items-center gap-3">
        <label className="text-sm">
          Nota:{" "}
          <input
            type="number"
            min={0}
            max={10}
            step={0.5}
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            className="border rounded px-2 py-1 w-20"
          />
        </label>
      </div>

      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        rows={4}
        placeholder="Feedback para o aluno..."
        className="w-full border rounded p-2 text-sm"
      />

      <button onClick={salvar} disabled={salvando} className="bg-black text-white rounded px-4 py-2 text-sm">
        Salvar correção
      </button>
    </div>
  );
}
