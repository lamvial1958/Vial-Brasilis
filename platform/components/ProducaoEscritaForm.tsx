"use client";

import { useEffect, useRef, useState } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useAuth } from "@/lib/auth/AuthProvider";

interface Props {
  nivel: string;
  slug: string;
  secaoOrdem: number;
  secaoTitulo: string;
  corHex: string;
  textoDestaqueHex: string;
  textoSobreNivelHex: string;
}

type EstadoForm = "carregando" | "vazio" | "redigindo" | "pendente" | "corrigido";

export function ProducaoEscritaForm({
  nivel,
  slug,
  secaoOrdem,
  secaoTitulo,
  corHex,
  textoDestaqueHex,
  textoSobreNivelHex,
}: Props) {
  const { user } = useAuth();
  // Estado inicial "vazio" (não "carregando") garante que o componente
  // sempre renderiza um elemento no DOM — necessário para que o React 19
  // inclua o componente na árvore de hidratação e o useEffect dispare.
  const [estado, setEstado] = useState<EstadoForm>("vazio");
  const [texto, setTexto] = useState("");
  const [nota, setNota] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const [textoEnviado, setTextoEnviado] = useState("");
  const [enviando, setEnviando] = useState(false);
  const antesDeRedigir = useRef<"pendente" | "corrigido">("pendente");
  const fetchedRef = useRef(false);

  const submissaoId = `${nivel}-${slug}-secao${secaoOrdem}`;

  useEffect(() => {
    // Só consulta Firestore uma vez por montagem, quando o usuário estiver disponível
    if (!user || fetchedRef.current) return;
    fetchedRef.current = true;
    const docRef = doc(db, "producaoEscrita", user.uid, "submissions", submissaoId);
    getDoc(docRef).then((snap) => {
      if (!snap.exists()) {
        setEstado("vazio");
        return;
      }
      const data = snap.data();
      setTextoEnviado(String(data.texto ?? ""));
      setNota(typeof data.nota === "number" ? data.nota : null);
      setFeedback(String(data.feedback ?? ""));
      setEstado(data.status === "corrigido" ? "corrigido" : "pendente");
    });
  }, [user, submissaoId]);

  async function enviar() {
    if (!user || !texto.trim()) return;
    setEnviando(true);
    const docRef = doc(db, "producaoEscrita", user.uid, "submissions", submissaoId);
    await setDoc(docRef, {
      nivel,
      slug,
      secaoOrdem,
      secaoTitulo,
      texto: texto.trim(),
      enviadoEm: serverTimestamp(),
      status: "pendente",
      nota: null,
      feedback: "",
      feedbackEm: null,
    });
    setTextoEnviado(texto.trim());
    setFeedback("");
    setNota(null);
    setEnviando(false);
    setEstado("pendente");
  }

  function entrarModoEdicao(estadoAtual: "pendente" | "corrigido") {
    antesDeRedigir.current = estadoAtual;
    setTexto(textoEnviado);
    setEstado("redigindo");
  }

  function cancelarEdicao() {
    setEstado(antesDeRedigir.current);
  }

  const palavras = texto.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div
      className="mt-5 rounded-xl border-2 p-5 space-y-4"
      style={{ borderColor: corHex }}
    >
      <h3
        className="text-xs font-bold tracking-widest uppercase"
        style={{ color: textoDestaqueHex }}
      >
        Sua produção escrita
      </h3>

      {!user && (
        <p className="text-sm text-slate-400 italic">Faça login para enviar sua produção.</p>
      )}

      {user && estado === "corrigido" && (
        <div className="space-y-3">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
            <p className="text-xs font-bold text-green-700 uppercase tracking-wide">Corrigido</p>
            {nota !== null && (
              <p className="text-sm font-bold text-green-800">Nota: {nota}/10</p>
            )}
            {feedback && (
              <p className="text-sm text-green-800 whitespace-pre-wrap leading-relaxed">{feedback}</p>
            )}
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-lg p-3">
            <p className="text-xs text-slate-400 font-semibold uppercase mb-1.5">Seu texto enviado</p>
            <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{textoEnviado}</p>
          </div>
          <button
            onClick={() => entrarModoEdicao("corrigido")}
            className="text-xs text-slate-400 hover:text-slate-600 underline transition-colors"
          >
            Enviar nova versão
          </button>
        </div>
      )}

      {user && estado === "pendente" && (
        <div className="space-y-3">
          <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-3 py-1 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Aguardando correção
          </span>
          <div className="bg-slate-50 border border-slate-100 rounded-lg p-3">
            <p className="text-xs text-slate-400 font-semibold uppercase mb-1.5">Texto enviado</p>
            <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{textoEnviado}</p>
          </div>
          <button
            onClick={() => entrarModoEdicao("pendente")}
            className="text-xs text-slate-400 hover:text-slate-600 underline transition-colors"
          >
            Reenviar com alterações
          </button>
        </div>
      )}

      {user && (estado === "vazio" || estado === "redigindo") && (
        <div className="space-y-3">
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            rows={8}
            placeholder="Escreva aqui sua produção…"
            className="w-full border border-slate-200 rounded-lg p-3 text-sm text-slate-700 focus:outline-none focus:border-current resize-y leading-relaxed"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">
              {palavras} {palavras === 1 ? "palavra" : "palavras"}
            </span>
            <div className="flex items-center gap-2">
              {estado === "redigindo" && (
                <button
                  onClick={cancelarEdicao}
                  className="text-xs text-slate-400 hover:text-slate-600 px-3 py-2 transition-colors"
                >
                  Cancelar
                </button>
              )}
              <button
                onClick={enviar}
                disabled={enviando || !texto.trim()}
                className="text-sm font-semibold px-5 py-2 rounded-full disabled:opacity-50 transition-all duration-150"
                style={{ backgroundColor: corHex, color: textoSobreNivelHex }}
              >
                {enviando ? "Enviando…" : "Enviar para correção"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
