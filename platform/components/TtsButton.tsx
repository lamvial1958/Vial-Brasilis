"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Remove sintaxe markdown para leitura limpa em voz alta */
function markdownParaFala(md: string): string {
  return md
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^>\s*/gm, "")
    .replace(/^\|[-:\s|]+\|$/gm, "")   // separadores de tabela
    .replace(/\|/g, " — ")             // colunas de tabela → pausa
    .replace(/^[-*+]\s+/gm, "")
    .replace(/\n{2,}/g, ". ")
    .replace(/\n/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

interface Props {
  /** Conteúdo markdown da seção */
  markdown: string;
  /**
   * URL de áudio pré-gravado (opcional).
   * Convenção: /audio/[nivel]/[slug]/secao-[ordem].mp3
   * Se ausente ou inválido, usa síntese de voz como fallback.
   */
  audioUrl?: string;
}

export function TtsButton({ markdown, audioUrl }: Props) {
  const [tocando, setTocando] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const parar = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    setTocando(false);
  }, []);

  useEffect(() => () => { parar(); }, [parar]);

  function sintetizar() {
    if (!("speechSynthesis" in window)) return;
    const texto = markdownParaFala(markdown);
    if (!texto) return;
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = "pt-BR";
    utterance.rate = 0.88;
    utterance.onend = () => setTocando(false);
    utterance.onerror = () => setTocando(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setTocando(true);
  }

  function tocar() {
    if (tocando) { parar(); return; }

    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.onended = () => { audioRef.current = null; setTocando(false); };
      audio.onerror = () => { audioRef.current = null; setTocando(false); sintetizar(); };
      setTocando(true);
      audio.play().catch(() => { sintetizar(); });
      return;
    }

    sintetizar();
  }

  return (
    <button
      onClick={tocar}
      title={tocando ? "Parar leitura" : "Ouvir em voz alta (pt-BR)"}
      className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border transition-all duration-150 ${
        tocando
          ? "bg-[#002776] text-white border-[#002776]"
          : "bg-white text-slate-400 border-slate-200 hover:border-slate-300 hover:text-slate-600"
      }`}
    >
      {tocando ? (
        <>
          <span className="inline-block w-1.5 h-1.5 rounded-sm bg-white animate-pulse" />
          Parar
        </>
      ) : (
        <>
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
          </svg>
          Ouvir
        </>
      )}
    </button>
  );
}
