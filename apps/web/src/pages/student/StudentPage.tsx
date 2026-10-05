import { useState, type Dispatch, type SetStateAction } from 'react'
import { Link, NavLink, Outlet, useOutletContext, useParams } from 'react-router'
import { chevronForward } from 'ionicons/icons'
import { Icon } from '../../components/student/StudentUi'
import styles from '../../components/student/Student.module.css'
import { initialNutrition, initialWorkouts, student, type CatalogFood, type NutritionPlan, type Workout } from './studentData'

type StudentContext = {
  workouts: Workout[]
  setWorkouts: Dispatch<SetStateAction<Workout[]>>
  planName: string
  setPlanName: Dispatch<SetStateAction<string>>
  assigned: boolean
  setAssigned: Dispatch<SetStateAction<boolean>>
  nutrition: NutritionPlan | null
  setNutrition: Dispatch<SetStateAction<NutritionPlan | null>>
  foods: CatalogFood[]
  setFoods: Dispatch<SetStateAction<CatalogFood[]>>
}

export function useStudent() { return useOutletContext<StudentContext>() }

export default function StudentPage() {
  const { studentId } = useParams()
  const [workouts, setWorkouts] = useState(initialWorkouts)
  const [planName, setPlanName] = useState('Plano ABC — Força base')
  const [assigned, setAssigned] = useState(true)
  const [nutrition, setNutrition] = useState<NutritionPlan | null>(initialNutrition)
  const [foods, setFoods] = useState<CatalogFood[]>([])

  if (studentId !== student.id) return <div className={styles.empty}>
    <title>Aluno não encontrado | consta</title>
    <h1>Aluno não encontrado</h1>
    <Link to="/alunos" className={styles.action}>Voltar para alunos</Link>
  </div>

  return <div className={styles.page}>
    <nav aria-label="Caminho da página" className={styles.breadcrumb}>
      <Link to="/alunos">Alunos</Link><Icon icon={chevronForward} size={14} /><span aria-current="page">{student.name}</span>
    </nav>
    <header className={styles.identity}>
      <span className={styles.avatar} aria-hidden="true">G</span>
      <div><h1>{student.name}</h1><p>{student.objective}</p></div>
    </header>
    <nav aria-label="Seções do aluno" className={styles.tabs}>
      <NavLink to="." end>Resumo</NavLink>
      <NavLink to="treinos">Treinos</NavLink>
      <NavLink to="alimentacao">Alimentação</NavLink>
      <NavLink to="evolucao">Evolução</NavLink>
    </nav>
    <div className={styles.content}>
      <Outlet context={{ workouts, setWorkouts, planName, setPlanName, assigned, setAssigned, nutrition, setNutrition, foods, setFoods } satisfies StudentContext} />
    </div>
  </div>
}
