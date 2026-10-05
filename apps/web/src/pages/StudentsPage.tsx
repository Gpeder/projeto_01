import { Link } from 'react-router'

export default function StudentsPage() {
  return (
    <>
      <title>Alunos | consta</title>

      <header className="mb-6.25 min-[801px]:mb-8">
        <p className="mb-1.75 text-[0.625rem] font-semibold tracking-[0.06875rem] text-muted">
          CARTEIRA
        </p>
        <h1 className="text-[1.625rem] tracking-[-0.0625rem] min-[801px]:text-[2rem]">
          Alunos
        </h1>
        <p className="mt-2 text-muted">1 aluno acompanhado</p>
      </header>

      <table role="table" className="block w-full border-t border-border">
        <caption className="sr-only">Lista de alunos</caption>
        <thead role="rowgroup" className="sr-only min-[801px]:not-sr-only min-[801px]:block">
          <tr
            role="row"
            className="grid grid-cols-[minmax(0,1.1fr)_minmax(0,1.3fr)_minmax(0,1fr)_auto] items-center gap-6 py-3 text-left text-[0.625rem] tracking-[0.03125rem] text-muted uppercase"
          >
            <th scope="col" role="columnheader" className="font-semibold">Aluno</th>
            <th scope="col" role="columnheader" className="font-semibold">Objetivo</th>
            <th scope="col" role="columnheader" className="font-semibold">Último treino registrado</th>
            <th scope="col" role="columnheader" className="font-semibold">Ação</th>
          </tr>
        </thead>
        <tbody role="rowgroup" className="block">
          <tr
            role="row"
            className="grid gap-4.25 border-b border-border px-1 py-5 text-[0.8125rem] leading-[1.4] min-[801px]:min-h-23 min-[801px]:grid-cols-[minmax(0,1.1fr)_minmax(0,1.3fr)_minmax(0,1fr)_auto] min-[801px]:items-center min-[801px]:gap-6 min-[801px]:border-t min-[801px]:px-0 min-[801px]:py-3.5"
          >
            <td role="cell" className="flex min-w-0 items-center gap-3.5">
              <span
                aria-hidden="true"
                className="grid size-8.5 shrink-0 place-items-center rounded-full bg-primary font-semibold text-on-primary"
              >
                G
              </span>
              <div className="flex min-w-0 flex-col gap-1">
                <strong className="font-semibold">Gustavo</strong>
                <span className="text-[0.6875rem] text-muted">Demonstração</span>
              </div>
            </td>
            <td role="cell" className="flex min-w-0 flex-col gap-1">
              <span
                aria-hidden="true"
                className="text-[0.5625rem] tracking-[0.03125rem] text-muted uppercase min-[801px]:hidden"
              >
                Objetivo
              </span>
              <span>Ganhar força e melhorar a composição corporal</span>
            </td>
            <td role="cell" className="flex min-w-0 flex-col gap-1">
              <span
                aria-hidden="true"
                className="text-[0.5625rem] tracking-[0.03125rem] text-muted uppercase min-[801px]:hidden"
              >
                Último treino registrado
              </span>
              <time dateTime="2024-06-26">26 jun 2024</time>
              <span className="text-[0.6875rem] text-muted">Treino B — Costas e bíceps</span>
            </td>
            <td role="cell">
              <Link to="/alunos/gustavo" className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-control-strong px-4 py-2.5 font-semibold hover:bg-surface-muted min-[801px]:w-auto">
                Ver aluno
              </Link>
            </td>
          </tr>
        </tbody>
      </table>
    </>
  )
}
