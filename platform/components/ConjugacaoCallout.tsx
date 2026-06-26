export function ConjugacaoCallout() {
  return (
    <div className="print:hidden mt-4 flex items-start gap-3 rounded-xl bg-blue-50 border border-blue-200 px-4 py-3">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-blue-400 mt-0.5 shrink-0"
        aria-hidden="true"
      >
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
      <p className="text-xs text-blue-800 leading-relaxed">
        Qualquer verbo do português pode ser conjugado em{" "}
        <a
          href="https://www.conjugacao.com.br"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold underline underline-offset-2 hover:no-underline"
        >
          conjugacao.com.br
        </a>
        {" "}— basta digitar o infinitivo na busca.
      </p>
    </div>
  );
}
