"use client";

import {
  collection,
  doc,
  getDocs,
  query,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/client";
import { useAuth } from "@/lib/auth/AuthProvider";
import { calcularProximaRevisao, type SrsState } from "@/lib/srs/engine";

interface SrsCard extends SrsState {
  id: string;
  termo: string;
  definicao: string;
  exemplo: string;
}

const OPCOES_QUALIDADE: { rotulo: string; qualidade: number; cor: string }[] = [
  { rotulo: "Não lembrei", qualidade: 0, cor: "border-red-200 hover:bg-red-50 text-red-700" },
  { rotulo: "Difícil", qualidade: 3, cor: "border-amber-200 hover:bg-amber-50 text-amber-700" },
  { rotulo: "Bom", qualidade: 4, cor: "border-blue-200 hover:bg-blue-50 text-blue-700" },
  { rotulo: "Fácil", qualidade: 5, cor: "border-green-200 hover:bg-green-50 text-green-700" },
];

export default function RevisaoPage() {
  const { user, loading } = useAuth();
  const [fila, setFila] = useState<SrsCard[] | null>(null);
  const [revelado, setRevelado] = useState(false);

  useEffect(() => {
    if (loading || !user) return;
    (async () => {
      const itensRef = collection(db, "srsItems", user.uid, "items");
      const snap = await getDocs(
        query(itensRef, where("proximaRevisaoEm", "<=", Timestamp.now()))
      );
      const cartoes = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          termo: data.termo,
          definicao: data.definicao,
          exemplo: data.exemplo,
          repeticoes: data.repeticoes,
          intervaloDias: data.intervaloDias,
          fatorFacilidade: data.fatorFacilidade,
        } as SrsCard;
      });
      setFila(cartoes);
    })();
  }, [loading, user]);

  async function avaliar(qualidade: number) {
    if (!user || !fila || fila.length === 0) return;
    const atual = fila[0];
    const resultado = calcularProximaRevisao(atual, qualidade);
    await updateDoc(doc(db, "srsItems", user.uid, "items", atual.id), {
      repeticoes: resultado.repeticoes,
      intervaloDias: resultado.intervaloDias,
      fatorFacilidade: resultado.fatorFacilidade,
      proximaRevisaoEm: Timestamp.fromDate(resultado.proximaRevisaoEm),
    });
    setRevelado(false);
    setFila(fila.slice(1));
  }

  if (loading || fila === null) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#f3f8f4] to-[#eef3fa] flex items-center justify-center">
        <p className="text-slate-400 text-sm">Carregando revisão…</p>
      </main>
    );
  }

  if (fila.length === 0) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#f3f8f4] to-[#eef3fa] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-[#0f2744]">Revisão em dia!</h1>
          <p className="mt-2 text-slate-500 text-sm">
            Nenhum cartão pendente agora. Continue estudando as lições para adicionar novos itens.
          </p>
          <a
            href="/licoes"
            className="mt-6 inline-block bg-[#009C3B] text-white rounded-full px-6 py-2.5 text-sm font-semibold hover:bg-[#007A2E] transition-colors shadow-[0_4px_14px_rgba(0,156,59,0.3)]"
          >
            Ir para as lições
          </a>
        </div>
      </main>
    );
  }

  const cartao = fila[0];
  const restante = fila.length;

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f3f8f4] to-[#eef3fa] flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-lg font-bold text-[#0f2744]">Revisão espaçada</h1>
          <span className="text-xs font-semibold bg-white border border-slate-200 rounded-full px-3 py-1 text-slate-500 shadow-sm">
            {restante} {restante === 1 ? "cartão" : "cartões"}
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center min-h-[220px] flex flex-col items-center justify-center gap-4">
          <p className="text-2xl font-bold text-[#0f2744]">{cartao.termo}</p>

          {revelado ? (
            <div className="text-slate-600 space-y-2">
              <p className="text-base">{cartao.definicao}</p>
              {cartao.exemplo && (
                <p className="italic text-sm text-slate-400">{cartao.exemplo}</p>
              )}
            </div>
          ) : (
            <button
              onClick={() => setRevelado(true)}
              className="text-sm text-[#2f7fc1] underline hover:text-[#0f2744] transition-colors"
            >
              mostrar resposta
            </button>
          )}
        </div>

        {revelado && (
          <div className="mt-4 grid grid-cols-4 gap-2">
            {OPCOES_QUALIDADE.map((opcao) => (
              <button
                key={opcao.qualidade}
                onClick={() => avaliar(opcao.qualidade)}
                className={`border rounded-xl px-2 py-3 text-xs font-semibold transition-colors ${opcao.cor}`}
              >
                {opcao.rotulo}
              </button>
            ))}
          </div>
        )}

        <p className="text-center text-xs text-slate-400 mt-5">
          Avalie com honestidade — o algoritmo ajusta o intervalo automaticamente.
        </p>
      </div>
    </main>
  );
}
