import { lazy, Suspense } from 'react'
import { Outlet, Route, Routes } from 'react-router'
import AppLayout from './components/layout/AppLayout'
import GoalsPage from './pages/GoalsPage'
import HistoryPage from './pages/HistoryPage'
import NutritionPage from './pages/NutritionPage'
import OverviewPage from './pages/OverviewPage'
import ProgressPage from './pages/ProgressPage'
import SettingsPage from './pages/SettingsPage'
import StudentsPage from './pages/StudentsPage'
import WorkoutsPage from './pages/WorkoutsPage'

const ComponentDemo = import.meta.env.DEV
  ? lazy(() => import('./pages/ComponentDemo'))
  : null

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout><Outlet /></AppLayout>}>
        <Route index element={<OverviewPage />} />
        <Route path="alunos" element={<StudentsPage />} />
        <Route path="treinos" element={<WorkoutsPage />} />
        <Route path="historicos" element={<HistoryPage />} />
        <Route path="evolucao" element={<ProgressPage />} />
        <Route path="alimentacao" element={<NutritionPage />} />
        <Route path="metas" element={<GoalsPage />} />
        <Route path="configuracoes" element={<SettingsPage />} />
      </Route>
      {ComponentDemo ? (
        <Route
          path="/dev/components"
          element={
            <Suspense fallback={<p role="status" className="p-6">Carregando amostras…</p>}>
              <ComponentDemo />
            </Suspense>
          }
        />
      ) : null}
    </Routes>
  )
}
