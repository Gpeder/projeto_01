import { isApiFood } from './foods.ts'
import type { CatalogFood, Nutrients } from '../pages/student/studentData.ts'

export type DecimalNutrients = Record<keyof Nutrients, string | null>
export type CatalogInput = Omit<CatalogFood, 'id' | 'amount' | 'nutrients'> & {
  amount: string
  nutrients: DecimalNutrients
  source: 'manual' | 'usda'
}
export type CatalogRecord = CatalogInput & { id: string; fdcId: number | null; createdAt: string; updatedAt: string }
export type CatalogPage = { items: CatalogRecord[]; page: number; pageSize: number; totalItems: number; totalPages: number }

const messages: Record<string, string> = {
  CATALOG_INVALID_INPUT: 'Confira o nome, a quantidade, a unidade, os nutrientes e os dados de origem do alimento.',
  CATALOG_INVALID_DECIMAL: 'Informe valores não negativos, com até 35 dígitos inteiros e 30 casas decimais. A quantidade deve ser maior que zero.',
  CATALOG_INVALID_SOURCE: 'Confira a origem e os dados originais do alimento USDA.',
  CATALOG_REVIEW_REQUIRED: 'Revise os nutrientes para a quantidade e unidade informadas e confirme a revisão.',
  CATALOG_NOT_FOUND: 'Alimento cadastrado não encontrado. Atualize a lista e tente novamente.',
  CATALOG_UNAVAILABLE: 'Não foi possível acessar o catálogo. Tente novamente.',
  CATALOG_TIMEOUT: 'O catálogo demorou para responder. Confira a lista antes de tentar salvar novamente.',
  CATALOG_INVALID_RESPONSE: 'Não foi possível ler a resposta do catálogo. Tente novamente.',
}
export class CatalogApiError extends Error {
  code: string
  constructor(code: string) { super(messages[code] ?? messages.CATALOG_UNAVAILABLE); this.name = 'CatalogApiError'; this.code = code }
}
const object = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value)
const decimal = (value: unknown): value is string => typeof value === 'string' && /^(?:0|[1-9]\d{0,34})(?:\.\d{1,30})?$/.test(value)
const nullableText = (value: unknown) => value === null || typeof value === 'string'
const fields = ['name', 'brand', 'preparation', 'amount', 'unit', 'kcal', 'protein', 'carbs', 'fat']

function readRecord(value: unknown): CatalogRecord {
  if (!object(value) || typeof value.id !== 'string' || !/^[\da-f-]{36}$/i.test(value.id)
    || typeof value.name !== 'string' || !value.name.trim() || !nullableText(value.brand) || !nullableText(value.preparation)
    || !decimal(value.amount) || Number(value.amount) <= 0 || !['g', 'ml', 'unidade', 'fatia', 'porção'].includes(String(value.unit))
    || !object(value.nutrients) || !['kcal', 'protein', 'carbs', 'fat'].every(key => value.nutrients && ((value.nutrients as Record<string, unknown>)[key] === null || decimal((value.nutrients as Record<string, unknown>)[key])))
    || !['createdAt', 'updatedAt'].every(key => typeof value[key] === 'string' && Number.isFinite(Date.parse(value[key] as string)))) throw new CatalogApiError('CATALOG_INVALID_RESPONSE')
  if (value.source === 'usda') {
    if (!object(value.usda) || !isApiFood(value.usda.original) || value.fdcId !== value.usda.original.fdcId
      || typeof value.usda.manuallyEdited !== 'boolean' || typeof value.usda.referenceReviewed !== 'boolean'
      || !Array.isArray(value.usda.modifiedFields) || !value.usda.modifiedFields.every(key => fields.includes(key))) throw new CatalogApiError('CATALOG_INVALID_RESPONSE')
  } else if (value.source !== 'manual' || value.fdcId !== null || value.usda !== undefined) throw new CatalogApiError('CATALOG_INVALID_RESPONSE')
  return { ...value, brand: value.brand ?? '', preparation: value.preparation ?? '' } as CatalogRecord
}

export function createCatalogApi({ baseUrl = '/api', fetchImpl = fetch, timeoutMs = 15_000 }: { baseUrl?: string; fetchImpl?: typeof fetch; timeoutMs?: number } = {}) {
  async function request(path: string, options: RequestInit = {}): Promise<unknown> {
    const timeout = AbortSignal.timeout(timeoutMs)
    try {
      const response = await fetchImpl(`${baseUrl.replace(/\/$/, '')}/catalog/foods${path}`, {
        ...options, headers: { Accept: 'application/json', ...(options.body ? { 'Content-Type': 'application/json' } : {}) },
        signal: options.signal ? AbortSignal.any([options.signal, timeout]) : timeout,
      })
      const body: unknown = await response.json()
      if (!response.ok) throw new CatalogApiError(object(body) && object(body.error) && typeof body.error.code === 'string' ? body.error.code : 'CATALOG_UNAVAILABLE')
      return body
    } catch (error) {
      if (options.signal?.aborted) throw new DOMException('Consulta cancelada.', 'AbortError')
      if (timeout.aborted) throw new CatalogApiError('CATALOG_TIMEOUT')
      if (error instanceof CatalogApiError) throw error
      throw new CatalogApiError(error instanceof SyntaxError ? 'CATALOG_INVALID_RESPONSE' : 'CATALOG_UNAVAILABLE')
    }
  }
  return {
    async list(page: number, signal: AbortSignal, pageSize = 20): Promise<CatalogPage> {
      const body = await request(`?${new URLSearchParams({ page: String(page), pageSize: String(pageSize) })}`, { signal })
      if (!object(body) || !Array.isArray(body.items) || body.page !== page || body.pageSize !== pageSize
        || !['totalItems', 'totalPages'].every(key => Number.isSafeInteger(body[key]) && Number(body[key]) >= 0)
        || body.items.length > pageSize || body.totalPages !== Math.ceil(Number(body.totalItems) / pageSize)) throw new CatalogApiError('CATALOG_INVALID_RESPONSE')
      return { items: body.items.map(readRecord), page, pageSize, totalItems: Number(body.totalItems), totalPages: Number(body.totalPages) }
    },
    async save(input: CatalogInput, id?: string): Promise<CatalogRecord> {
      const data = readRecord(await request(id ? `/${encodeURIComponent(id)}` : '', {
        method: id ? 'PUT' : 'POST', body: JSON.stringify({ ...input, brand: input.brand || null, preparation: input.preparation || null }),
      }))
      if (id && data.id !== id) throw new CatalogApiError('CATALOG_INVALID_RESPONSE')
      return data
    },
  }
}
