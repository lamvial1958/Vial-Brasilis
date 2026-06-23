"use client";

import { arrayUnion, doc, serverTimestamp, setDoc, writeBatch } from "firebase/firestore";
import { useState } from "react";
import { db } from "@/lib/firebase/client";
import { useAuth } from "@/lib/auth/AuthProvider";
import { estadoInicialSrs } from "@/lib/srs/engine";
import type { VocabItem } from "@/lib/content/schema";

export function MarcarConcluida({
  nivel,
  slug,
  vocabulario,
  tags,
}: {
  nivel: string;
  slug: string;
  vocabulario: VocabItem[];
  tags: string[];
}) {
  const { user } = useAuth();
  const [feito, setFeito] = useState(false);

  async function marcar() {
    if (!user) return;
    const unidadeId = `${nivel}/${slug}`;

    await setDoc(
      doc(db, "progress", user.uid),
      {
        unidadesConcluidas: arrayUnion(unidadeId),
        ultimaAtividadeEm: serverTimestamp(),
      },
      { merge: true }
    );

    const batch = writeBatch(db);
    vocabulario.forEach((item) => {
      const itemId = `${slug}__${item.termo}`.replace(/[^a-zA-Z0-9_-]/g, "-");
      const ref = doc(db, "srsItems", user.uid, "items", itemId);
      batch.set(
        ref,
        {
          termo: item.termo,
          definicao: item.definicao,
          exemplo: item.exemplo,
          tags,
          proximaRevisaoEm: serverTimestamp(),
          ...estadoInicialSrs(),
        },
        { merge: true }
      );
    });
    await batch.commit();

    setFeito(true);
  }

  return (
    <button
      onClick={marcar}
      disabled={feito}
      className="bg-black text-white rounded px-4 py-2 disabled:opacity-50"
    >
      {feito ? "Unidade marcada como concluída" : "Marcar unidade como concluída"}
    </button>
  );
}
