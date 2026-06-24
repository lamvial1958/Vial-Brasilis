import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col flex-1">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center flex-1 px-6 py-24 text-center bg-white">
        <span className="mb-4 inline-block rounded-full bg-green-100 px-4 py-1 text-sm font-medium text-green-700">
          PRE-A1 → B2
        </span>
        <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight text-zinc-900 sm:text-5xl">
          Aprenda Português do Brasil com propósito
        </h1>
        <p className="mt-6 max-w-xl text-lg text-zinc-500 leading-relaxed">
          Curso estruturado de PLE com lições progressivas, revisão espaçada e
          simulados no formato do Celpe-Bras. Do zero ao nível B2.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/cadastro"
            className="rounded-full bg-green-600 px-8 py-3 text-base font-semibold text-white shadow-sm hover:bg-green-700 transition-colors"
          >
            Começar agora — grátis
          </Link>
          <Link
            href="/licoes"
            className="rounded-full border border-zinc-200 px-8 py-3 text-base font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
          >
            Ver as lições
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="bg-zinc-50 py-20 px-6">
        <div className="mx-auto max-w-4xl grid gap-8 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-3 text-2xl">📚</div>
            <h3 className="font-semibold text-zinc-900">50 unidades</h3>
            <p className="mt-1 text-sm text-zinc-500">
              Conteúdo completo do PRE-A1 ao B2, organizado por nível e tema.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-3 text-2xl">🧠</div>
            <h3 className="font-semibold text-zinc-900">Revisão espaçada</h3>
            <p className="mt-1 text-sm text-zinc-500">
              Algoritmo SM-2 para reforçar o vocabulário no momento certo.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-3 text-2xl">📝</div>
            <h3 className="font-semibold text-zinc-900">Simulados cronometrados</h3>
            <p className="mt-1 text-sm text-zinc-500">
              Pratique no formato real do Celpe-Bras com feedback do professor.
            </p>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-green-600 py-16 px-6 text-center text-white">
        <h2 className="text-2xl font-bold">Pronto para começar?</h2>
        <p className="mt-2 text-green-100">
          Crie sua conta em segundos e acesse todas as lições gratuitamente.
        </p>
        <Link
          href="/cadastro"
          className="mt-6 inline-block rounded-full bg-white px-8 py-3 text-base font-semibold text-green-700 hover:bg-green-50 transition-colors"
        >
          Criar conta
        </Link>
      </section>
    </main>
  );
}
