"use client";

import { addDoc, collection, serverTimestamp, Timestamp } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { db } from "@/lib/firebase/client";
import { useAuth } from "@/lib/auth/AuthProvider";

function formatarTempo(segundos: number): string {
  const m = Math.floor(Math.abs(segundos) / 60);
  const s = Math.abs(segundos) % 60;
  const sinal = segundos < 0 ? "-" : "";
  return `${sinal}${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function SimuladoCronometro({
  nivel,
  slug,
  tempoSugeridoMin,
}: {
  nivel: string;
  slug: string;
  tempoSugeridoMin: number;
}) {
  const { user } = useAuth();
  const [status, setStatus] = useState<"idle" | "rodando" | "enviado">("idle");
  const [segundosRestantes, setSegundosRestantes] = useState(tempoSugeridoMin * 60);
  const [resposta, setResposta] = useState("");
  const iniciadoEmRef = useRef<Date | null>(null);

  useEffect(() => {
    if (status !== "rodando") return;
    const id = setInterval(() => setSegundosRestantes((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [status]);

  function iniciar() {
    iniciadoEmRef.current = new Date();
    setStatus("rodando");
  }

  async function finalizar() {
    if (!user) return;
    const iniciadoEm = iniciadoEmRef.current ?? new Date();
    const duracaoSegundos = Math.max(0, Math.round((Date.now() - iniciadoEm.getTime()) / 1000));

    await addDoc(collection(db, "simuladoSubmissions", user.uid, "attempts"), {
      nivel,
      slug,
      iniciadoEm: Timestamp.fromDate(iniciadoEm),
      finalizadoEm: serverTimestamp(),
      duracaoSegundos,
      respostaTexto: resposta,
      status: "enviado",
    });

    setStatus("enviado");
  }

  if (status === "enviado") {
    return (
      <div className="border rounded-lg p-4 bg-green-50 text-green-800">
        Simulado enviado. A correção (rubrica) ficará disponível com seu tutor/admin.
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Simulado cronometrado</h3>
        {status === "rodando" && (
          <span
            className={`font-mono text-lg ${segundosRestantes < 0 ? "text-red-600" : ""}`}
          >
            {formatarTempo(segundosRestantes)}
          </span>
        )}
      </div>

      {status === "idle" && (
        <>
          <p className="text-sm text-gray-600">
            Tempo sugerido para esta unidade: {tempoSugeridoMin > 0 ? `${tempoSugeridoMin} min` : "não especificado"}.
            Ao iniciar, o cronômetro começa a contar. Escreva suas respostas/produções no campo abaixo,
            seguindo os comandos de cada parte do simulado.
          </p>
          <button onClick={iniciar} className="bg-black text-white rounded px-4 py-2">
            Iniciar simulado
          </button>
        </>
      )}

      {status === "rodando" && (
        <>
          {segundosRestantes < 0 && (
            <p className="text-sm text-red-600">Tempo sugerido esgotado — você pode continuar ou finalizar.</p>
          )}
          <textarea
            value={resposta}
            onChange={(e) => setResposta(e.target.value)}
            rows={14}
            placeholder="Escreva aqui suas respostas/produções, identificando cada parte (ex.: Tarefa Escrita 1, Tarefa Escrita 2...)."
            className="w-full border rounded p-3 font-mono text-sm"
          />
          <button onClick={finalizar} className="bg-black text-white rounded px-4 py-2">
            Finalizar e enviar
          </button>
        </>
      )}
    </div>
  );
}
