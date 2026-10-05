import { Link } from 'react-router'
import { timeOutline } from 'ionicons/icons'
import { Icon, SectionTitle } from '../../components/student/StudentUi'
import styles from '../../components/student/Student.module.css'
import { formatDate, formatNumber, measurements, sessions, student, sumNutrients, weights } from './studentData'
import { useStudent } from './StudentPage'

const week = [
  { day: 'Seg', date: '24', workout: 'Treino A', status: 'done' },
  { day: 'Ter', date: '25', workout: 'Sem registro', status: '' },
  { day: 'Qua', date: '26', workout: 'Treino B', status: 'done' },
  { day: 'Qui', date: '27', workout: 'Sem registro', status: '' },
  { day: 'Sex', date: '28', workout: 'Treino C', status: 'planned' },
  { day: 'Sáb', date: '29', workout: 'Sem registro', status: '' },
  { day: 'Dom', date: '30', workout: 'Sem registro', status: '' },
]

export default function StudentSummary() {
  const { planName, workouts, assigned, nutrition } = useStudent()
  const totals = nutrition ? sumNutrients(nutrition.meals) : null
  const recentWeight = weights[weights.length - 1]
  const completed = sessions.filter((session) => session.date >= '2024-06-24' && session.date <= '2024-06-30').length

  return <>
    <title>Resumo de Gustavo | consta</title>
    <section aria-labelledby="weekly-goal" className={styles.row}>
      <div><h2 id="weekly-goal" className={styles.eyebrow}>Meta semanal</h2>
        <p className={styles.keyNumber}><strong>{completed}</strong><span>de {student.weeklyGoal} sessões concluídas</span></p>
      </div>
      <div className={styles.legend}>
        <span><i className={`${styles.dot} ${styles.doneDot}`} />Concluído</span>
        <span><i className={`${styles.dot} ${styles.plannedDot}`} />Planejado</span>
        <span><i className={styles.dot} />Sem registro</span>
      </div>
    </section>
    <ol aria-label="Semana de 24 a 30 de junho de 2024" className={styles.week}>
      {week.map((day) => <li key={day.date} className={day.status === 'done' ? styles.done : day.status === 'planned' && assigned ? styles.planned : undefined}>
        <time dateTime={`2024-06-${day.date}`}><span>{day.day}</span><strong>{day.date}</strong></time>
        <small>{day.status === 'done' ? '✓ ' : day.status === 'planned' && assigned ? 'Planejado · ' : ''}{day.status === 'planned' && !assigned ? 'Sem registro' : day.workout}</small>
        {day.status === 'done' ? <span className="sr-only">Concluído</span> : null}
      </li>)}
    </ol>
    <div className={styles.columns}>
      <section className={styles.section}>
        <div className={styles.row}><SectionTitle>Treino atribuído</SectionTitle><Link className={styles.action} to="treinos">Abrir treinos</Link></div>
        <h3>{assigned ? planName : 'Sem treino atribuído'}</h3>
        {assigned ? <p>{workouts.length} treinos no plano</p> : null}
        <div className={styles.detail}><Icon icon={timeOutline} /><span>Última sessão: {sessions[0].workout}<small>{formatDate(sessions[0].date)} · {sessions[0].duration} min</small></span></div>
      </section>
      <section className={styles.section}>
        <div className={styles.row}><SectionTitle>Plano alimentar vigente</SectionTitle><Link className={styles.action} to="alimentacao">Ver plano</Link></div>
        <h3>{nutrition?.name ?? 'Sem plano alimentar'}</h3>
        {totals && nutrition ? <p>Planejado: {formatNumber(totals.kcal)} kcal · {formatNumber(totals.protein)} g de proteína · {nutrition.meals.length} refeições</p> : null}
      </section>
    </div>
    <div className={styles.columns}>
      <section className={styles.section}>
        <div className={styles.row}><SectionTitle>Evolução recente</SectionTitle><Link className={styles.action} to="evolucao">Ver evolução</Link></div>
        <div className={styles.stats}>
          <div><strong>{formatNumber(recentWeight.value)} kg</strong><span>Peso · {formatDate(recentWeight.date)}</span></div>
          <div><strong>{measurements[0].waist} cm</strong><span>Cintura · {formatDate(measurements[0].date)}</span></div>
        </div>
      </section>
      <section className={styles.section}>
        <SectionTitle>Atividades recentes</SectionTitle>
        <ul className={styles.activity}>
          <li><i className={`${styles.dot} ${styles.doneDot}`} /><span>Sessão de Treino B registrada<small>26 jun · 54 min</small></span></li>
          <li><i className={`${styles.dot} ${styles.doneDot}`} /><span>Peso e medidas atualizados<small>26 jun · pelo aluno</small></span></li>
          {assigned ? <li><i className={`${styles.dot} ${styles.plannedDot}`} /><span>Treino C planejado<small>28 jun · ainda sem registro</small></span></li> : null}
        </ul>
      </section>
    </div>
  </>
}
