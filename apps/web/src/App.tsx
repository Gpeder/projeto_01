import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router'
import AppLayout from './components/layout/AppLayout'
import OverviewPage from './pages/OverviewPage'

const ComponentDemo = import.meta.env.DEV
  ? lazy(() => import('./pages/ComponentDemo'))
  : null

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout><OverviewPage /></AppLayout>} />
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
