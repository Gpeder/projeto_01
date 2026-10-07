import { useEffect, useState } from 'react'
import { createFoodApi, FoodApiError, type ApiFood, type FoodSearch } from '../../api/foods'
import { createLatestRequest } from '../../api/latestRequest'

type SearchState =
  | { status: 'idle' }
  | { status: 'loading'; query: string; page: number }
  | { status: 'success'; query: string; data: FoodSearch }
  | { status: 'error'; query: string; page: number; message: string }

type DetailsState =
  | { status: 'idle' }
  | { status: 'loading'; food: ApiFood }
  | { status: 'error'; food: ApiFood; message: string }

const api = createFoodApi({ baseUrl: import.meta.env.VITE_API_BASE_URL || '/api' })

function errorMessage(error: unknown) {
  return error instanceof FoodApiError ? error.message : 'Não foi possível concluir a consulta. Tente novamente.'
}

export function useFoodSearch() {
  const [searchState, setSearchState] = useState<SearchState>({ status: 'idle' })
  const [detailsState, setDetailsState] = useState<DetailsState>({ status: 'idle' })
  const [requests] = useState(() => ({ search: createLatestRequest(), details: createLatestRequest() }))

  useEffect(() => () => {
    requests.search.cancel()
    requests.details.cancel()
  }, [requests])

  function cancel() {
    requests.search.cancel()
    requests.details.cancel()
    setSearchState((state) => state.status === 'loading' ? { status: 'idle' } : state)
    setDetailsState({ status: 'idle' })
  }

  async function search(query: string, page = 1) {
    const trimmed = query.trim()
    const key = `${trimmed}:${page}`
    if (!trimmed || requests.search.isPending(key)) return
    requests.details.cancel()
    setDetailsState({ status: 'idle' })
    const request = requests.search.begin(key)
    setSearchState({ status: 'loading', query: trimmed, page })
    try {
      const data = await api.search(trimmed, page, request.signal)
      if (request.isCurrent()) setSearchState({ status: 'success', query: trimmed, data })
    } catch (error) {
      if (request.isCurrent()) setSearchState({ status: 'error', query: trimmed, page, message: errorMessage(error) })
    } finally { request.finish() }
  }

  async function select(food: ApiFood): Promise<ApiFood | null> {
    if (requests.details.isPending(String(food.fdcId))) return null
    const request = requests.details.begin(String(food.fdcId))
    setDetailsState({ status: 'loading', food })
    try {
      const result = await api.details(food.fdcId, request.signal)
      if (!request.isCurrent()) return null
      setDetailsState({ status: 'idle' })
      return result
    } catch (error) {
      if (request.isCurrent()) setDetailsState({ status: 'error', food, message: errorMessage(error) })
      return null
    } finally { request.finish() }
  }

  return { searchState, detailsState, search, select, cancel }
}
