"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AlunoActions({ uid, bloqueado }: { uid: string; bloqueado: boolean }) {
  const router = useRouter();
  const [carregando, setCarregando] = useState(false);

  async function alternarBloqueio() {
    setCarregando(true);
    await fetch(`/api/admin/students/${uid}/block`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bloqueado: !bloqueado }),
    });
    setCarregando(false);
    router.refresh();
  }

  async function excluir() {
    if (!confirm("Excluir definitivamente este aluno e seus dados? Esta ação não pode ser desfeita.")) {
      return;
    }
    setCarregando(true);
    await fetch(`/api/admin/students/${uid}`, { method: "DELETE" });
    setCarregando(false);
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={alternarBloqueio}
        disabled={carregando}
        className="text-sm underline disabled:opacity-50"
      >
        {bloqueado ? "Desbloquear" : "Bloquear"}
      </button>
      <button
        onClick={excluir}
        disabled={carregando}
        className="text-sm underline text-red-600 disabled:opacity-50"
      >
        Excluir
      </button>
    </div>
  );
}
