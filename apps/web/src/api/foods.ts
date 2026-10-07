export type ApiFood = {
  fdcId: number
  source: 'USDA FoodData Central'
  dataType: string | null
  name: string
  brand: string | null
  brandOwner: string | null
  reference: { quantity: number | null; unit: 'g' | 'ml' | null }
  nutrients: {
    energyKcal: number | null
    energyNutrientId: number | null
    proteinG: number | null
    carbohydrateG: number | null
    fatG: number | null
  }
}

export type FoodSearch = {
  items: ApiFood[]
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

const messages: Record<string, string> = {
  INVALID_INPUT: 'Confira o termo de busca e tente novamente.',
  FOOD_NOT_FOUND: 'Este alimento não está mais disponível. Selecione outro resultado.',
  USDA_RATE_LIMIT: 'Limite de consultas à USDA atingido. Tente mais tarde ou preencha manualmente.',
  USDA_TIMEOUT: 'A consulta demorou para responder. Tente novamente ou preencha manualmente.',
  USDA_UNAVAILABLE: 'O serviço de alimentos está indisponível. Tente novamente ou preencha manualmente.',
  USDA_INVALID_RESPONSE: 'Não foi possível ler os dados do serviço de alimentos. Tente novamente.',
  CONNECTION_ERROR: 'Não foi possível conectar à API. Tente novamente ou preencha manualmente.',
}

export class FoodApiError extends Error {
  code: string

  constructor(code: string) {
    super(messages[code] ?? 'Não foi possível concluir a consulta. Tente novamente ou preencha manualmente.')
    this.name = 'FoodApiError'
    this.code = code
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function isNullableNumber(value: unknown) {
  return value === null || (typeof value === 'number' && Number.isFinite(value) && value >= 0)
}

function isApiFood(value: unknown): value is ApiFood {
  if (!isRecord(value) || !isRecord(value.reference) || !isRecord(value.nutrients)) return false
  return Number.isSafeInteger(value.fdcId) && Number(value.fdcId) > 0
    && value.source === 'USDA FoodData Central' && typeof value.name === 'string' && !!value.name.trim()
    && ['dataType', 'brand', 'brandOwner'].every((key) => value[key] === null || typeof value[key] === 'string')
    && isNullableNumber(value.reference.quantity) && [null, 'g', 'ml'].includes(value.reference.unit as string | null)
    && ['energyKcal', 'energyNutrientId', 'proteinG', 'carbohydrateG', 'fatG'].every((key) => isNullableNumber((value.nutrients as Record<string, unknown>)[key]))
}

export function createFoodApi({
  baseUrl = '/api', fetchImpl = fetch, timeoutMs = 15_000,
}: { baseUrl?: string; fetchImpl?: typeof fetch; timeoutMs?: number } = {}) {
  async function request(path: string, signal: AbortSignal): Promise<unknown> {
    const timeout = AbortSignal.timeout(timeoutMs)
    const combinedSignal = AbortSignal.any([signal, timeout])
    try {
      const response = await fetchImpl(`${baseUrl.replace(/\/$/, '')}${path}`, {
        signal: combinedSignal, headers: { Accept: 'application/json' },
      })
      const body: unknown = await response.json()
      if (!response.ok) {
        const code = isRecord(body) && isRecord(body.error) && typeof body.error.code === 'string'
          ? body.error.code : 'INTERNAL_ERROR'
        throw new FoodApiError(code)
      }
      return body
    } catch (error) {
      if (signal.aborted) throw new DOMException('Consulta cancelada.', 'AbortError')
      if (timeout.aborted) throw new FoodApiError('USDA_TIMEOUT')
      if (error instanceof FoodApiError) throw error
      throw new FoodApiError(error instanceof SyntaxError ? 'USDA_INVALID_RESPONSE' : 'CONNECTION_ERROR')
    }
  }

  return {
    async search(query: string, page: number, signal: AbortSignal): Promise<FoodSearch> {
      const params = new URLSearchParams({ query, page: String(page) })
      const body = await request(`/foods?${params}`, signal)
      if (!isRecord(body) || !Array.isArray(body.items) || !body.items.every(isApiFood)
        || !['page', 'pageSize', 'totalItems', 'totalPages'].every((key) => Number.isSafeInteger(body[key]) && Number(body[key]) >= 0)
        || body.page !== page || Number(body.pageSize) < 1) throw new FoodApiError('USDA_INVALID_RESPONSE')
      return body as FoodSearch
    },
    async details(id: number, signal: AbortSignal): Promise<ApiFood> {
      const body = await request(`/foods/${id}`, signal)
      if (!isApiFood(body) || body.fdcId !== id) throw new FoodApiError('USDA_INVALID_RESPONSE')
      return body
    },
  }
}
