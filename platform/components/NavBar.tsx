"use client";

import Link from "next/link";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { useAuth } from "@/lib/auth/AuthProvider";

export function NavBar() {
  const { user, role, loading } = useAuth();

  return (
    <header className="border-b px-4 py-3 flex items-center justify-between">
      <Link href="/" className="font-semibold">
        Português Brasil PLE
      </Link>
      <nav className="flex items-center gap-4 text-sm">
        <Link href="/licoes">Lições</Link>
        {!loading && user && <Link href="/revisao">Revisão</Link>}
        {!loading && role === "admin" && <Link href="/admin">Admin</Link>}
        {!loading && !user && <Link href="/login">Entrar</Link>}
        {!loading && user && (
          <button onClick={() => signOut(auth)} className="underline">
            Sair
          </button>
        )}
      </nav>
    </header>
  );
}
