"use client";

import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { auth } from "@/lib/firebase/client";

export default function LoginPage() {
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
      const cred = await signInWithEmailAndPassword(auth, email, senha);
      if (!cred.user.emailVerified) {
        router.push("/verificar-email");
        return;
      }
      router.push("/licoes");
    } catch {
      setErro("E-mail ou senha incorretos, ou conta bloqueada.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="mx-auto max-w-sm py-16 px-4">
      <h1 className="text-2xl font-semibold mb-6">Entrar</h1>
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
          placeholder="Senha"
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
          {carregando ? "Entrando..." : "Entrar"}
        </button>
      </form>
      <p className="mt-4 text-sm">
        Ainda não tem conta? <a href="/cadastro" className="underline">Criar conta</a>
      </p>
    </main>
  );
}
