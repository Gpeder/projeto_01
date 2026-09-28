import { useEffect, useRef, useState } from 'react'
import Button from './components/ui/Button'

function App() {
  const [demoStatus, setDemoStatus] = useState<'idle' | 'loading' | 'complete'>('idle')
  const demoTimeout = useRef<ReturnType<typeof window.setTimeout> | null>(null)

  useEffect(() => () => {
    if (demoTimeout.current !== null) window.clearTimeout(demoTimeout.current)
  }, [])

  function handleDemoClick() {
    if (demoStatus === 'loading') return

    setDemoStatus('loading')
    demoTimeout.current = window.setTimeout(() => {
      setDemoStatus('complete')
      demoTimeout.current = null
    }, 1500)
  }

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
        <Button>Botão de amostra</Button>
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

      <section aria-labelledby="buttons-title" className="space-y-6 border-t border-border pt-6">
        <div className="space-y-2">
          <h2 id="buttons-title" className="text-xl">Botões</h2>
          <p className="text-muted">Variantes, tamanhos e estados de interação.</p>
        </div>

        <div className="space-y-3">
          <h3 className="text-base">Variantes</h3>
          <div className="flex flex-wrap items-center gap-3">
            <Button>Primário</Button>
            <Button variant="secondary">Secundário</Button>
            <Button variant="ghost">Discreto</Button>
            <Button variant="destructive">Destrutivo</Button>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-base">Tamanhos</h3>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm" variant="secondary">Pequeno</Button>
            <Button size="md" variant="secondary">Médio</Button>
            <Button size="lg" variant="secondary">Grande</Button>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-base">Estados</h3>
          <div className="flex flex-wrap items-center gap-3">
            <Button disabled>Indisponível</Button>
            <Button loading>Ação em andamento</Button>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-base">Experimente o carregamento</h3>
          <p className="text-muted">
            Acione o botão com clique, Enter ou Espaço. Ele ficará ocupado por um instante.
          </p>
          <Button
            loading={demoStatus === 'loading'}
            loadingLabel="Processando…"
            onClick={handleDemoClick}
          >
            Simular ação
          </Button>
          <p role="status" className="min-h-6 text-sm text-muted">
            {demoStatus === 'complete' ? 'Demonstração concluída. Você pode repetir.' : ''}
          </p>
        </div>
      </section>
    </main>
  )
}

export default App
