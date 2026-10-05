import { useId, useState, type FormEvent } from 'react'
import { addOutline, arrowDownOutline, arrowUpOutline, checkmark, chevronForward, trashOutline } from 'ionicons/icons'
import Button from '../../components/ui/Button'
import { Icon, Modal } from '../../components/student/StudentUi'
import styles from '../../components/student/Student.module.css'
import { formatDate, sessions, type Exercise, type Session, type Workout } from './studentData'
import { useStudent } from './StudentPage'
import { NameEditor } from './StudentEditors'

function newExercise(): Exercise {
  return { id: crypto.randomUUID(), name: '', sets: 3, reps: '10', rest: 60, instruction: '' }
}

function WorkoutEditor({ workout, save, close }: { workout: Workout; save: (workout: Workout) => void; close: () => void }) {
  const [draft, setDraft] = useState(() => structuredClone(workout))
  const [dirty, setDirty] = useState(false)
  const [error, setError] = useState('')
  const formId = useId()
  const attemptClose = () => { if (!dirty || window.confirm('Descartar alterações não salvas?')) close() }
  function updateExercise(id: string, changes: Partial<Exercise>) {
    setDirty(true)
    setDraft((old) => ({ ...old, exercises: old.exercises.map((item) => item.id === id ? { ...item, ...changes } : item) }))
  }
  function move(index: number, direction: number) {
    setDirty(true)
    setDraft((old) => {
      const exercises = [...old.exercises]
      const target = index + direction
      ;[exercises[index], exercises[target]] = [exercises[target], exercises[index]]
      return { ...old, exercises }
    })
  }
  function submit(event: FormEvent) {
    event.preventDefault()
    if (!draft.name.trim() || !draft.exercises.length || draft.exercises.some((item) => !item.name.trim() || !item.reps.trim())) {
      setError('Preencha o nome do treino e inclua ao menos um exercício com nome e repetições.')
      return
    }
    save({ ...draft, name: draft.name.trim(), exercises: draft.exercises.map((item) => ({ ...item, name: item.name.trim(), reps: item.reps.trim() })) })
  }
  return <Modal wide title={workout.name ? 'Editar treino' : 'Criar treino'} close={attemptClose}
    footer={<><Button variant="secondary" onClick={attemptClose}>Cancelar</Button><Button type="submit" form={formId}>Salvar treino</Button></>}>
    <form id={formId} className={styles.form} onSubmit={submit} onChange={() => setDirty(true)}>
      <div className={styles.formGrid}>
        <label>Nome do treino<input required maxLength={100} value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></label>
        <label>Descrição (opcional)<input maxLength={240} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} /></label>
      </div>
      <div className={styles.row}><h3>Exercícios</h3><Button variant="secondary" onClick={() => { setDirty(true); setDraft({ ...draft, exercises: [...draft.exercises, newExercise()] }) }}>Adicionar exercício</Button></div>
      {draft.exercises.map((exercise, index) => <fieldset key={exercise.id} className={styles.editorItem}>
        <legend>Exercício {index + 1}</legend>
        <label>Nome do exercício {index + 1}<input required maxLength={100} value={exercise.name} onChange={(event) => updateExercise(exercise.id, { name: event.target.value })} /></label>
        <div className={styles.exerciseFields}>
          <label>Séries<input type="number" min={1} max={100} required value={exercise.sets} onChange={(event) => updateExercise(exercise.id, { sets: Number(event.target.value) })} /></label>
          <label>Repetições<input required maxLength={30} value={exercise.reps} onChange={(event) => updateExercise(exercise.id, { reps: event.target.value })} /></label>
          <label>Descanso (s)<input type="number" min={0} max={3600} required value={exercise.rest} onChange={(event) => updateExercise(exercise.id, { rest: Number(event.target.value) })} /></label>
        </div>
        <label>Instruções (opcional)<input maxLength={300} value={exercise.instruction} onChange={(event) => updateExercise(exercise.id, { instruction: event.target.value })} /></label>
        <div className={styles.actions}>
          <Button variant="secondary" disabled={index === 0} onClick={() => move(index, -1)} aria-label={`Mover exercício ${index + 1} para cima`}><Icon icon={arrowUpOutline} /></Button>
          <Button variant="secondary" disabled={index === draft.exercises.length - 1} onClick={() => move(index, 1)} aria-label={`Mover exercício ${index + 1} para baixo`}><Icon icon={arrowDownOutline} /></Button>
          <Button variant="destructive" aria-label={`Remover exercício ${index + 1}`} onClick={() => {
            if (window.confirm('Remover este exercício do treino?')) {
              setDirty(true)
              setDraft({ ...draft, exercises: draft.exercises.filter((item) => item.id !== exercise.id) })
            }
          }}><Icon icon={trashOutline} /></Button>
        </div>
      </fieldset>)}
      {error ? <p role="alert" className={styles.error}>{error}</p> : null}
    </form>
  </Modal>
}

function SessionDetail({ session, close }: { session: Session; close: () => void }) {
  return <Modal wide title="Sessão realizada" close={close} footer={<Button onClick={close}>Fechar</Button>}>
    <h3 className="mb-5 text-lg">{session.workout}</h3>
    <dl className={styles.metrics}>
      <div><dt>Data</dt><dd className="!text-sm">{formatDate(session.date)}</dd></div>
      <div><dt>Duração</dt><dd>{session.duration} min</dd></div>
      <div><dt>Séries</dt><dd>{session.sets}</dd></div>
    </dl>
    <div className={styles.tableScroll} role="region" aria-label="Exercícios da sessão" tabIndex={0}>
      <table className={styles.table}>
        <caption>Exercícios registrados</caption>
        <thead><tr><th scope="col">Exercício</th><th scope="col">Planejado</th><th scope="col">Realizado</th></tr></thead>
        <tbody>{session.exercises.map((item) => <tr key={item.name}><th scope="row">{item.name}</th><td>{item.planned}</td><td>{item.performed ?? 'Sem registro'}</td></tr>)}</tbody>
      </table>
    </div>
    <div className={styles.note}><h3>Observação do aluno</h3><p>{session.note}</p></div>
  </Modal>
}

export default function StudentWorkouts() {
  const { workouts, setWorkouts, planName, setPlanName, assigned, setAssigned } = useStudent()
  const [editor, setEditor] = useState<Workout | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [editPlan, setEditPlan] = useState(false)

  return <>
    <title>Treinos de Gustavo | consta</title>
    <div className={styles.toolbar}><div><p className={styles.eyebrow}>Planejamento</p><h2>Treinos de Gustavo</h2></div>
      <Button onClick={() => setEditor({ id: crypto.randomUUID(), name: '', description: '', exercises: [newExercise()] })}><span className={styles.actions}><Icon icon={addOutline} />Criar treino</span></Button>
    </div>
    <section className={styles.plan} aria-label="Plano de treinos">
      <div><span className={styles.tag}>{assigned ? 'Plano atribuído' : 'Sem treino atribuído'}</span><h3>{planName}</h3><p className={styles.muted}>{workouts.length} treinos</p></div>
      <div className={styles.actions}>
        <Button variant="secondary" onClick={() => setEditPlan(true)}>Editar plano</Button>
        <Button variant={assigned ? 'secondary' : 'primary'} onClick={() => {
          if (!assigned || window.confirm('Remover a atribuição deste plano?')) setAssigned(!assigned)
        }}>{assigned ? 'Remover atribuição' : 'Atribuir treino ao aluno'}</Button>
      </div>
    </section>
    <div className={styles.workouts}>
      {workouts.map((workout, index) => <article key={workout.id} className={styles.workout}>
        <span className={styles.ordinal} aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
        <div className={styles.grow}><h3>{workout.name}</h3><p className={styles.muted}>{workout.description}</p>
          <ul className={styles.exercises}>{workout.exercises.map((exercise) => <li key={exercise.id}>
            <strong>{exercise.name}</strong><small>{exercise.sets} séries · {exercise.reps} rep · {exercise.rest} s</small>
            {exercise.instruction ? <small>{exercise.instruction}</small> : null}
          </li>)}</ul>
        </div>
        <button className={styles.action} onClick={() => setEditor(workout)} aria-label={`Editar ${workout.name}`}>Editar</button>
      </article>)}
    </div>
    <section className={styles.history}>
      <div className={styles.row}><div><p className={styles.eyebrow}>Histórico</p><h2>Sessões realizadas</h2></div><span className={styles.muted}>{sessions.length} registros</span></div>
      {sessions.map((item) => <button key={item.id} className={styles.session} onClick={() => setSession(item)}>
        <span className={styles.date} aria-hidden="true"><strong>{item.date.slice(-2)}</strong><span>JUN</span></span>
        <span className={styles.grow}><strong>{item.workout}</strong><small>{formatDate(item.date)} · {item.duration} min · {item.sets} séries</small></span>
        <span className={styles.status}><Icon icon={checkmark} size={15} />Concluído</span><Icon icon={chevronForward} />
      </button>)}
    </section>
    {editor ? <WorkoutEditor workout={editor} close={() => setEditor(null)} save={(updated) => {
      setWorkouts((old) => old.some((item) => item.id === updated.id) ? old.map((item) => item.id === updated.id ? updated : item) : [...old, updated])
      setEditor(null)
    }} /> : null}
    {session ? <SessionDetail session={session} close={() => setSession(null)} /> : null}
    {editPlan ? <NameEditor title="Editar plano de treinos" label="Nome do plano" initialName={planName} close={() => setEditPlan(false)} save={(name) => { setPlanName(name); setEditPlan(false) }} /> : null}
  </>
}
