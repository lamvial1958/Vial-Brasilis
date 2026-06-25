import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col flex-1">

      {/* Hero */}
      <section className="flex flex-col items-center justify-center flex-1 px-6 py-24 text-center bg-white">
        <Image
          src="/logo.png"
          alt="VIAL Brasilis"
          width={88}
          height={88}
          className="rounded-2xl mb-6 shadow-sm"
        />
        <p className="mb-3 text-xs font-semibold tracking-widest uppercase text-[#2f7fc1]">
          V&amp;M — Vial &amp; Monticelli
        </p>
        <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight text-[#0f2744] sm:text-5xl">
          VIAL Brasilis
        </h1>
        <p className="mt-3 text-lg font-medium text-slate-500">
          Português do Brasil para Estrangeiros
        </p>
        <p className="mt-4 max-w-xl text-base text-slate-500 leading-relaxed">
          Curso estruturado de PLE do PRE-A1 ao B2 — com revisão espaçada,
          produção oral e escrita, e simulados no formato oficial do{" "}
          <span className="text-[#1a6b3a] font-medium">CELPE-Bras</span>.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/cadastro"
            className="rounded-full bg-[#d9624a] px-8 py-3 text-base font-semibold text-white shadow-sm hover:bg-[#c0523b] transition-colors"
          >
            Começar agora — grátis
          </Link>
          <Link
            href="/licoes"
            className="rounded-full border border-slate-200 px-8 py-3 text-base font-semibold text-[#0f2744] hover:bg-slate-50 transition-colors"
          >
            Ver as lições
          </Link>
        </div>
      </section>

      {/* Níveis */}
      <section className="bg-[#f4f7fb] py-16 px-6">
        <div className="mx-auto max-w-3xl">
          <p className="text-center text-xs font-semibold tracking-widest uppercase text-slate-400 mb-8">
            Percurso completo
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {["PRE-A1", "A1", "A2", "B1", "B2"].map((nivel, i) => (
              <span
                key={nivel}
                className={`rounded-full px-5 py-2 text-sm font-semibold border ${
                  i === 3
                    ? "bg-[#1a6b3a] text-white border-[#1a6b3a]"
                    : "bg-white text-[#0f2744] border-slate-200"
                }`}
              >
                {nivel}
                {i === 3 && (
                  <span className="ml-1.5 text-[10px] font-normal opacity-80">CELPE-Bras</span>
                )}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-20 px-6">
        <div className="mx-auto max-w-4xl grid gap-6 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 bg-[#f4f7fb] p-6">
            <div className="mb-3 w-10 h-10 rounded-xl bg-[#2f7fc1]/10 flex items-center justify-center text-xl">
              📚
            </div>
            <h3 className="font-semibold text-[#0f2744]">50 unidades</h3>
            <p className="mt-1 text-sm text-slate-500">
              Conteúdo completo do PRE-A1 ao B2, organizado por nível e função comunicativa.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-[#f4f7fb] p-6">
            <div className="mb-3 w-10 h-10 rounded-xl bg-[#2f7fc1]/10 flex items-center justify-center text-xl">
              🧠
            </div>
            <h3 className="font-semibold text-[#0f2744]">Revisão espaçada</h3>
            <p className="mt-1 text-sm text-slate-500">
              Algoritmo SM-2 para reforçar vocabulário no momento exato de maior retenção.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-[#f4f7fb] p-6">
            <div className="mb-3 w-10 h-10 rounded-xl bg-[#2f7fc1]/10 flex items-center justify-center text-xl">
              📝
            </div>
            <h3 className="font-semibold text-[#0f2744]">Simulados CELPE-Bras</h3>
            <p className="mt-1 text-sm text-slate-500">
              Pratique no formato real da certificação oficial brasileira com feedback do professor.
            </p>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-[#0f2744] py-16 px-6 text-center text-white">
        <Image
          src="/logo.png"
          alt="VIAL Brasilis"
          width={48}
          height={48}
          className="rounded-xl mx-auto mb-5 opacity-90"
        />
        <h2 className="text-2xl font-bold">Pronto para começar?</h2>
        <p className="mt-2 text-slate-300 text-sm">
          Crie sua conta em segundos e acesse todas as lições gratuitamente.
        </p>
        <Link
          href="/cadastro"
          className="mt-6 inline-block rounded-full bg-[#d9624a] px-8 py-3 text-base font-semibold text-white hover:bg-[#c0523b] transition-colors"
        >
          Criar conta — grátis
        </Link>
        <p className="mt-4 text-xs text-slate-500">
          VIAL Brasilis · V&amp;M Vial &amp; Monticelli
        </p>
      </section>

    </main>
  );
}
