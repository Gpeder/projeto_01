import { apiError } from '../errors.js'

export const PAGE_SIZE = 20

type ClientOptions = {
  apiKey: string
  fetchImpl?: typeof fetch
  timeoutMs?: number
}

export function createUsdaClient({ apiKey, fetchImpl = fetch, timeoutMs = 10_000 }: ClientOptions) {
  async function request(path: string, params: Record<string, string> = {}): Promise<unknown> {
    const url = new URL(path, 'https://api.nal.usda.gov/fdc/v1/')
    url.search = new URLSearchParams(params).toString()
    const signal = AbortSignal.timeout(timeoutMs)
    let response: Response
    try {
      response = await fetchImpl(url, {
        headers: { Accept: 'application/json', 'X-Api-Key': apiKey },
        signal,
        redirect: 'error',
      })
    } catch {
      throw apiError(signal.aborted ? 'USDA_TIMEOUT' : 'USDA_UNAVAILABLE')
    }

    if (!response.ok) {
      await response.body?.cancel().catch(() => undefined)
      if (response.status === 400) throw apiError('INVALID_INPUT')
      if (response.status === 404 && path.startsWith('food/')) throw apiError('FOOD_NOT_FOUND')
      if (response.status === 429) throw apiError('USDA_RATE_LIMIT')
      throw apiError('USDA_UNAVAILABLE')
    }

    try {
      return await response.json()
    } catch {
      throw apiError(signal.aborted ? 'USDA_TIMEOUT' : 'USDA_INVALID_RESPONSE')
    }
  }

  return {
    searchFoods(query: string, page: number) {
      return request('foods/search', { query, pageNumber: String(page), pageSize: String(PAGE_SIZE) })
    },
    getFood(id: number) {
      return request(`food/${id}`, { format: 'full' })
    },
  }
}

export type UsdaClient = ReturnType<typeof createUsdaClient>
