"use client";

import Image from "next/image";
import Link from "next/link";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { useAuth } from "@/lib/auth/AuthProvider";

export function NavBar() {
  const { user, role, loading } = useAuth();

  return (
    <header className="border-b border-slate-200 bg-white px-4 py-2 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2.5 group">
        <Image
          src="/logo.png"
          alt="V&M logo"
          width={36}
          height={36}
          className="rounded-md"
        />
        <span className="font-semibold text-[#0f2744] text-base tracking-tight leading-none">
          VIAL Brasilis
          <span className="block text-[10px] font-normal text-slate-400 tracking-widest uppercase">
            by V&amp;M
          </span>
        </span>
      </Link>

      <nav className="flex items-center gap-5 text-sm font-medium text-slate-600">
        <Link href="/licoes" className="hover:text-[#0f2744] transition-colors">Lições</Link>
        {!loading && user && (
          <Link href="/revisao" className="hover:text-[#0f2744] transition-colors">Revisão</Link>
        )}
        {!loading && role === "admin" && (
          <Link href="/admin" className="hover:text-[#0f2744] transition-colors">Admin</Link>
        )}
        {!loading && !user && (
          <Link
            href="/login"
            className="rounded-full border border-slate-300 px-4 py-1.5 hover:border-[#0f2744] hover:text-[#0f2744] transition-colors"
          >
            Entrar
          </Link>
        )}
        {!loading && user && (
          <button
            onClick={() => signOut(auth)}
            className="text-slate-400 hover:text-slate-700 transition-colors"
          >
            Sair
          </button>
        )}
      </nav>
    </header>
  );
}
