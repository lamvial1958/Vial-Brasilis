"use client";

import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { auth, db } from "@/lib/firebase/client";

export default function CadastroPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, senha);
      await setDoc(doc(db, "users", cred.user.uid), {
        email: cred.user.email,
        role: "student",
        criadoEm: serverTimestamp(),
      });
      await sendEmailVerification(cred.user);
      router.push("/verificar-email");
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao cadastrar.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="mx-auto max-w-sm py-16 px-4">
      <h1 className="text-2xl font-semibold mb-6">Criar conta</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          required
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
        <input
          type="password"
          required
          minLength={8}
          placeholder="Senha (mín. 8 caracteres)"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
        {erro && <p className="text-red-600 text-sm">{erro}</p>}
        <button
          type="submit"
          disabled={carregando}
          className="w-full bg-black text-white rounded px-3 py-2 disabled:opacity-50"
        >
          {carregando ? "Criando..." : "Criar conta"}
        </button>
      </form>
      <p className="mt-4 text-sm">
        Já tem conta? <a href="/login" className="underline">Entrar</a>
      </p>
    </main>
  );
}
