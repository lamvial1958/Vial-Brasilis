"use client";

import { sendEmailVerification } from "firebase/auth";
import { useState } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";

export default function VerificarEmailPage() {
  const { user } = useAuth();
  const [enviado, setEnviado] = useState(false);

  async function reenviar() {
    if (!user) return;
    await sendEmailVerification(user);
    setEnviado(true);
  }

  return (
    <main className="mx-auto max-w-sm py-16 px-4 text-center">
      <h1 className="text-2xl font-semibold mb-4">Confirme seu e-mail</h1>
      <p className="text-gray-600 mb-6">
        Enviamos um link de confirmação para <strong>{user?.email}</strong>. Clique no link e
        depois recarregue esta página ou faça login novamente.
      </p>
      <button onClick={reenviar} className="underline text-sm">
        {enviado ? "E-mail reenviado." : "Reenviar e-mail de confirmação"}
      </button>
    </main>
  );
}
