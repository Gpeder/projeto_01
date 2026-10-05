import { createElement } from 'react'
import { Link } from 'react-router'
import {
  checkmark,
  chevronForward,
  phonePortraitOutline,
  watchOutline,
} from 'ionicons/icons'

const demoWeek = [
  '2024-06-24',
  '2024-06-25',
  '2024-06-26',
  '2024-06-27',
  '2024-06-28',
  '2024-06-29',
  '2024-06-30',
]
const demoCheckIns = new Set(['2024-06-24', '2024-06-26'])
const weeklyGoal = 3
const demoWatchActivity = {
  date: '2024-06-26',
  workout: 'Treino B — Costas e bíceps',
  durationMinutes: 54,
  averageHeartRate: 128,
  maximumHeartRate: 156,
}

const weekFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
})
const fullDateFormatter = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
})
const weekdayFormatter = new Intl.DateTimeFormat('pt-BR', { weekday: 'short', timeZone: 'UTC' })
const dayFormatter = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', timeZone: 'UTC' })
const numberFormatter = new Intl.NumberFormat('pt-BR')
const sectionHeadingClass = 'text-[0.625rem] font-semibold tracking-[0.06875rem] text-muted uppercase'

function calendarDate(date: string) {
  return new Date(`${date}T12:00:00Z`)
}

function OverviewIcon({ icon, className = 'size-4' }: { icon: string; className?: string }) {
  return createElement('ion-icon', { icon, class: `${className} shrink-0`, 'aria-hidden': 'true' })
}

export default function OverviewPage() {
  const attendanceCount = demoWeek.filter((date) => demoCheckIns.has(date)).length
  const watchMetrics = [
    { label: 'Duração', value: demoWatchActivity.durationMinutes, unit: 'min' },
    { label: 'FC média', value: demoWatchActivity.averageHeartRate, unit: 'bpm' },
    { label: 'FC máxima', value: demoWatchActivity.maximumHeartRate, unit: 'bpm' },
  ]

  return (
    <>
      <title>Visão geral | consta</title>

      <header className="mb-6.25 min-[801px]:mb-8">
        <p className="mb-1.75 text-[0.625rem] font-semibold tracking-[0.06875rem] text-muted">
          ACOMPANHAMENTO
        </p>
        <h1 className="text-[1.625rem] tracking-[-0.0625rem] min-[801px]:text-[2rem]">
          Visão geral
        </h1>
        <p className="mt-2 text-pretty text-muted">
          Presença na academia e atividade dos alunos sob sua responsabilidade.
        </p>
      </header>

      <section
        aria-labelledby="overview-student"
        className="flex flex-col items-start gap-6 rounded-xl border border-border bg-surface p-5 min-[1100px]:flex-row min-[1100px]:items-center min-[1100px]:justify-between min-[1100px]:px-7 min-[1100px]:py-6.5"
      >
        <div className="flex min-w-0 items-center gap-3.5">
          <span
            aria-hidden="true"
            className="grid size-12 shrink-0 place-items-center rounded-full bg-primary font-heading text-lg font-semibold text-on-primary"
          >
            G
          </span>
          <div className="min-w-0 wrap-anywhere">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <h2 id="overview-student" className="text-[1.4375rem]">Gustavo</h2>
              <span className="rounded-md border border-border px-2 py-1.25 text-[0.625rem] font-semibold tracking-[0.015625rem] text-muted uppercase">
                Aluno de demonstração
              </span>
            </div>
            <p className="mt-1.25 text-sm text-pretty text-muted">
              Ganhar força e melhorar a composição corporal
            </p>
          </div>
        </div>
        <Link
          to="/alunos/gustavo"
          className="inline-flex min-h-11 w-full shrink-0 touch-manipulation items-center justify-center gap-2 rounded-[0.5625rem] border border-primary bg-primary px-4 py-2.5 text-[0.8125rem] font-semibold text-on-primary transition-opacity duration-(--duration-normal) ease-standard hover:opacity-85 active:opacity-75 motion-reduce:transition-none min-[1100px]:w-auto"
        >
          Ver aluno
          <OverviewIcon icon={chevronForward} />
        </Link>
      </section>

      <p className="mt-5 text-xs text-pretty text-muted">
        Semana de exemplo · {weekFormatter.formatRange(calendarDate(demoWeek[0]), calendarDate(demoWeek[6]))}
      </p>

      <div className="grid min-[1100px]:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] min-[1100px]:gap-12">
        <section aria-labelledby="attendance-heading" className="min-w-0 border-b border-border pt-6 pb-7.5">
          <h2 id="attendance-heading" className={sectionHeadingClass}>Presença na academia</h2>
          <p className="mt-2 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
            <strong className="font-heading text-[2.125rem] font-semibold leading-tight tabular-nums">
              {numberFormatter.format(attendanceCount)}
            </strong>
            <span className="text-sm text-muted">
              de {numberFormatter.format(weeklyGoal)} presenças na meta semanal
            </span>
          </p>
          <p className="mt-2 flex items-center gap-1.5 text-xs text-muted">
            <OverviewIcon icon={phonePortraitOutline} />
            Check-ins informados pelo aluno no app
          </p>

          <ol aria-label="Presenças na semana de exemplo" className="mt-6 grid grid-cols-7 gap-1">
            {demoWeek.map((date) => {
              const attended = demoCheckIns.has(date)
              const parsedDate = calendarDate(date)

              return (
                <li key={date} className="flex min-w-0 flex-col items-center gap-2 text-center">
                  <time dateTime={date} className="flex flex-col items-center gap-2">
                    <span className="sr-only">{fullDateFormatter.format(parsedDate)}</span>
                    <span aria-hidden="true" className="text-[0.6875rem] text-muted capitalize">
                      {weekdayFormatter.format(parsedDate)}
                    </span>
                    <span
                      aria-hidden="true"
                      className={`grid size-8 place-items-center rounded-full border text-xs tabular-nums min-[400px]:size-9 ${attended ? 'border-primary bg-primary font-semibold text-on-primary' : 'border-border text-muted'}`}
                    >
                      {dayFormatter.format(parsedDate)}
                    </span>
                  </time>
                  <span className="sr-only">
                    {attended ? 'Presença informada por check-in no app' : 'Sem registro de presença'}
                  </span>
                  <span aria-hidden="true" className="flex min-h-4 items-center justify-center text-muted">
                    {attended ? <OverviewIcon icon={checkmark} className="size-3.5 text-success" /> : '—'}
                  </span>
                </li>
              )
            })}
          </ol>

          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[0.6875rem] text-muted">
            <span className="inline-flex items-center gap-1.5">
              <OverviewIcon icon={checkmark} className="size-3.5 text-success" />
              Check-in no app
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden="true">—</span>
              Sem registro
            </span>
          </div>
        </section>

        <section aria-labelledby="watch-heading" className="min-w-0 border-b border-border pt-6 pb-7.5">
          <h2 id="watch-heading" className={sectionHeadingClass}>Atividade pelo relógio</h2>
          <h3 className="mt-3 text-lg leading-snug text-pretty">{demoWatchActivity.workout}</h3>
          <p className="mt-1.75 text-xs leading-relaxed text-muted">
            <time dateTime={demoWatchActivity.date}>
              {fullDateFormatter.format(calendarDate(demoWatchActivity.date))}
            </time>
          </p>
          <p className="mt-3 flex items-center gap-1.5 text-xs text-muted">
            <OverviewIcon icon={watchOutline} />
            Última atividade
          </p>

          <dl className="mt-6 grid grid-cols-3 gap-x-3 gap-y-4 tabular-nums">
            {watchMetrics.map(({ label, value, unit }) => (
              <div key={label} className="flex min-w-0 flex-col gap-1.5">
                <dt className="text-[0.6875rem] text-muted">{label}</dt>
                <dd className="order-first flex flex-wrap items-baseline gap-x-1.5">
                  <span className="font-heading text-[1.625rem] font-semibold leading-tight">
                    {numberFormatter.format(value)}
                  </span>
                  <span className="text-xs text-muted">{unit}</span>
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-5 text-[0.6875rem] leading-relaxed text-muted">
            FC: frequência cardíaca. As medidas ajudam a acompanhar o esforço durante a atividade.
          </p>
        </section>
      </div>
    </>
  )
}
