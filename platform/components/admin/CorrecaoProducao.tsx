"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SubmissaoEscrita } from "@/lib/admin/producao";

export function CorrecaoProducao({
  uid,
  submissao,
}: {
  uid: string;
  submissao: SubmissaoEscrita;
}) {
  const router = useRouter();
  const [nota, setNota] = useState(submissao.nota?.toString() ?? "");
  const [feedback, setFeedback] = useState(submissao.feedback);
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    setSalvando(true);
    await fetch(`/api/admin/producao/${uid}/${submissao.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nota: nota === "" ? null : Number(nota),
        feedback,
      }),
    });
    setSalvando(false);
    router.refresh();
  }

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">
          {submissao.nivel.toUpperCase()} / {submissao.slug}
        </span>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            submissao.status === "corrigido"
              ? "bg-green-100 text-green-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {submissao.status === "corrigido" ? "Corrigido" : "Aguardando correção"}
        </span>
      </div>

      {submissao.secaoTitulo && (
        <p className="text-xs text-slate-400 font-medium">{submissao.secaoTitulo}</p>
      )}

      <pre className="whitespace-pre-wrap text-sm bg-gray-50 border rounded p-3 max-h-72 overflow-auto leading-relaxed">
        {submissao.texto || "(sem texto enviado)"}
      </pre>

      <div className="flex items-center gap-3">
        <label className="text-sm text-slate-600">
          Nota:{" "}
          <input
            type="number"
            min={0}
            max={10}
            step={0.5}
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            className="border rounded px-2 py-1 w-20 ml-1"
          />
          <span className="text-slate-400 ml-1">/10</span>
        </label>
      </div>

      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        rows={4}
        placeholder="Feedback para o aluno (pontos fortes, erros, sugestões)…"
        className="w-full border rounded p-2 text-sm resize-y"
      />

      <button
        onClick={salvar}
        disabled={salvando}
        className="bg-[#009C3B] text-white rounded px-4 py-2 text-sm font-semibold disabled:opacity-50 hover:bg-[#007A2E] transition-colors"
      >
        {salvando ? "Salvando…" : "Salvar correção"}
      </button>
    </div>
  );
}
