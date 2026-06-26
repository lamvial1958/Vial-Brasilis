"use client";

import { useRef, useState } from "react";

function normalizar(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

interface Props {
  /** Texto esperado para comparação (opcional). Se omitido, só mostra a transcrição. */
  textoEsperado?: string;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export function SttPronuncia({ textoEsperado }: Props) {
  const [gravando, setGravando] = useState(false);
  const [transcricao, setTranscricao] = useState<string | null>(null);
  const srRef = useRef<any>(null);

  const suportado =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  if (!suportado) return null;

  function iniciar() {
    const w = window as any;
    const SR = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!SR) return;

    const sr = new SR();
    sr.lang = "pt-BR";
    sr.interimResults = false;
    sr.maxAlternatives = 1;

    sr.onresult = (e: any) => {
      setTranscricao(e.results[0][0].transcript as string);
      setGravando(false);
    };
    sr.onerror = () => setGravando(false);
    sr.onend = () => setGravando(false);

    srRef.current = sr;
    setTranscricao(null);
    setGravando(true);
    sr.start();
  }

  function parar() {
    srRef.current?.stop();
    setGravando(false);
  }

  const acerto =
    transcricao && textoEsperado
      ? normalizar(transcricao) === normalizar(textoEsperado)
      : null;

  return (
    <div className="space-y-1.5">
      <button
        onClick={gravando ? parar : iniciar}
        title={gravando ? "Parar gravação" : "Falar a resposta em voz alta"}
        className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border transition-all duration-150 ${
          gravando
            ? "bg-red-500 text-white border-red-500"
            : "bg-white text-slate-400 border-slate-200 hover:border-slate-300 hover:text-slate-600"
        }`}
      >
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
        </svg>
        {gravando ? "Ouvindo… (clique para parar)" : "Falar"}
      </button>

      {transcricao && (
        <div className={`text-xs rounded-lg px-3 py-2 border ${
          acerto === true
            ? "bg-green-50 border-green-300 text-green-800"
            : acerto === false
            ? "bg-amber-50 border-amber-200 text-amber-800"
            : "bg-slate-50 border-slate-200 text-slate-600"
        }`}>
          <span className="font-semibold">Você disse:</span>{" "}
          <em>{transcricao}</em>
          {acerto === true && <span className="ml-1.5 font-bold">✓ Correto</span>}
          {acerto === false && <span className="ml-1.5">— tente novamente</span>}
        </div>
      )}
    </div>
  );
}
