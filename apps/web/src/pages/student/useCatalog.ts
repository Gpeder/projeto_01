import { useCallback, useEffect, useState } from 'react'
import { createCatalogApi, type CatalogInput, type CatalogPage, type CatalogRecord } from '../../api/catalog'
import { createLatestRequest } from '../../api/latestRequest'

const api = createCatalogApi({ baseUrl: import.meta.env.VITE_API_BASE_URL || '/api' })
export type CatalogState =
  | { status: 'loading'; page: number }
  | { status: 'error'; page: number; message: string }
  | { status: 'success'; data: CatalogPage }

export function useCatalog() {
  const [state, setState] = useState<CatalogState>({ status: 'loading', page: 1 })
  const [request] = useState(createLatestRequest)
  const [lastSaved, setLastSaved] = useState<CatalogRecord | null>(null)

  const fetchPage = useCallback(async (page: number) => {
    const active = request.begin(String(page))
    try {
      const data = await api.list(page, active.signal)
      if (active.isCurrent()) setState({ status: 'success', data })
    } catch (error) {
      if (active.isCurrent()) setState({ status: 'error', page, message: error instanceof Error ? error.message : 'Não foi possível carregar o catálogo.' })
    } finally { active.finish() }
  }, [request])

  function load(page = 1) {
    setState({ status: 'loading', page })
    return fetchPage(page)
  }

  useEffect(() => {
    const active = request.begin('1')
    void api.list(1, active.signal).then(data => {
      if (active.isCurrent()) setState({ status: 'success', data })
    }, error => {
      if (active.isCurrent()) setState({ status: 'error', page: 1, message: error instanceof Error ? error.message : 'Não foi possível carregar o catálogo.' })
    }).finally(active.finish)
    return () => request.cancel()
  }, [request])

  async function save(input: CatalogInput, id?: string): Promise<CatalogRecord> {
    const saved = await api.save(input, id)
    setLastSaved(saved)
    request.cancel() // Uma resposta antiga não pode apagar o registro recém-salvo.
    if (state.status === 'success' && (id || state.data.page === 1)) {
      setState(previous => previous.status === 'success' ? {
        status: 'success', data: {
          ...previous.data,
          items: id ? previous.data.items.map(item => item.id === saved.id ? saved : item)
            : [saved, ...previous.data.items.filter(item => item.id !== saved.id)].slice(0, previous.data.pageSize),
          totalItems: previous.data.totalItems + (id ? 0 : 1),
          totalPages: Math.ceil((previous.data.totalItems + (id ? 0 : 1)) / previous.data.pageSize),
        },
      } : previous)
    } else {
      // A criação aparece na primeira página; usa o registro confirmado pelo servidor.
      await load(1)
      setState(previous => previous.status === 'success' && previous.data.page === 1 ? {
        status: 'success', data: { ...previous.data, items: previous.data.items.map(item => item.id === saved.id ? saved : item) },
      } : previous)
    }
    return saved
  }
  return { state, load, save, lastSaved }
}
export type Catalog = ReturnType<typeof useCatalog>
