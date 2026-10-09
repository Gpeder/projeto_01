import type { ReactNode } from 'react'
import Button from '../../components/ui/Button'
import styles from '../../components/student/Student.module.css'
import type { Catalog } from './useCatalog'

export function CatalogBrowser({ catalog, children }: { catalog: Catalog; children: ReactNode }) {
  const { state, load } = catalog
  if (state.status === 'loading') return <p role="status" className={styles.muted}>Carregando catálogo…</p>
  if (state.status === 'error') return <div><p role="alert" className={styles.error}>{state.message}</p><Button variant="secondary" onClick={() => void load(state.page)}>Tentar novamente</Button></div>
  const { data } = state
  return <>
    {data.totalItems === 0 ? <p className={styles.muted}>Nenhum alimento cadastrado.</p> : <>
      {data.items.length ? children : <p className={styles.muted}>Nenhum alimento nesta página.</p>}
      <nav className={styles.searchPagination} aria-label="Páginas do catálogo de alimentos">
        <Button variant="secondary" size="sm" disabled={data.page <= 1} onClick={() => void load(data.page - 1)}>Anterior</Button>
        <span>Página {data.page} de {data.totalPages} · {data.totalItems} alimentos</span>
        <Button variant="secondary" size="sm" disabled={data.page >= data.totalPages} onClick={() => void load(data.page + 1)}>Próxima</Button>
      </nav>
    </>}
  </>
}
