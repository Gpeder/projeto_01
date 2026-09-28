function App() {
  return (
    <main className="mx-auto max-w-3xl space-y-8 px-6 py-12 sm:py-16">
      <header className="space-y-3">
        <p className="text-sm font-medium text-muted">Amostra de tipografia e cores</p>
        <h1 className="text-[2rem] tracking-tight">Base visual</h1>
        <p className="max-w-prose text-muted">
          Uma base simples para conferir a leitura, as superfícies e os estados
          nos temas claro e escuro.
        </p>
      </header>

      <section
        aria-labelledby="typography-title"
        className="space-y-5 rounded-lg border border-border bg-surface p-6"
      >
        <h2 id="typography-title" className="text-2xl font-medium">
          Clareza em cada detalhe
        </h2>
        <p className="max-w-prose">
          Manrope nos títulos e Inter nos textos. Este parágrafo usa o tamanho
          base de 16 px e uma entrelinha confortável para a leitura.
        </p>
        <p className="text-muted">
          O texto secundário mantém a hierarquia visual sem perder a legibilidade.
        </p>
        <button
          type="button"
          className="min-h-11 cursor-pointer touch-manipulation rounded-lg border border-primary bg-primary px-5 py-2 font-semibold text-on-primary hover:opacity-90"
        >
          Botão de amostra
        </button>
      </section>

      <section aria-labelledby="surfaces-title" className="space-y-4">
        <h2 id="surfaces-title" className="text-xl">Superfícies</h2>
        <ul role="list" className="grid gap-3 sm:grid-cols-3">
          <li className="rounded-lg border border-border bg-background p-5">
            Fundo da página
          </li>
          <li className="rounded-lg border border-border bg-surface p-5">
            Superfície
          </li>
          <li className="rounded-lg border border-border bg-surface-muted p-5">
            Superfície secundária
          </li>
        </ul>
      </section>

      <section aria-labelledby="states-title" className="space-y-4 border-t border-border pt-6">
        <h2 id="states-title" className="text-xl">Cores de estado</h2>
        <ul role="list" className="flex flex-wrap gap-x-8 gap-y-3 font-medium">
          <li className="text-success">Sucesso</li>
          <li className="text-warning">Atenção</li>
          <li className="text-error">Erro</li>
        </ul>
        <p className="text-sm text-muted">
          Use a tecla Tab para conferir o indicador de foco no botão.
        </p>
      </section>
    </main>
  )
}

export default App
