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

const OPCOES_QUALIDADE: { rotulo: string; qualidade: number }[] = [
  { rotulo: "Não lembrei", qualidade: 0 },
  { rotulo: "Difícil", qualidade: 3 },
  { rotulo: "Bom", qualidade: 4 },
  { rotulo: "Fácil", qualidade: 5 },
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
    return <main className="mx-auto max-w-xl py-10 px-4">Carregando…</main>;
  }

  if (fila.length === 0) {
    return (
      <main className="mx-auto max-w-xl py-10 px-4">
        <h1 className="text-2xl font-semibold">Revisão</h1>
        <p className="mt-4 text-gray-600">Nenhuma revisão pendente agora. Volte mais tarde.</p>
      </main>
    );
  }

  const cartao = fila[0];

  return (
    <main className="mx-auto max-w-xl py-10 px-4">
      <h1 className="text-2xl font-semibold">Revisão</h1>
      <p className="mt-1 text-sm text-gray-500">{fila.length} item(ns) na fila</p>

      <div className="mt-6 border rounded-lg p-8 text-center min-h-[180px] flex flex-col items-center justify-center gap-4">
        <p className="text-xl font-medium">{cartao.termo}</p>
        {revelado && (
          <div className="text-gray-700">
            <p>{cartao.definicao}</p>
            {cartao.exemplo && <p className="italic mt-2">{cartao.exemplo}</p>}
          </div>
        )}
        {!revelado && (
          <button onClick={() => setRevelado(true)} className="underline text-sm">
            mostrar resposta
          </button>
        )}
      </div>

      {revelado && (
        <div className="mt-6 grid grid-cols-4 gap-2">
          {OPCOES_QUALIDADE.map((opcao) => (
            <button
              key={opcao.qualidade}
              onClick={() => avaliar(opcao.qualidade)}
              className="border rounded px-2 py-2 text-sm hover:bg-gray-50"
            >
              {opcao.rotulo}
            </button>
          ))}
        </div>
      )}
    </main>
  );
}
