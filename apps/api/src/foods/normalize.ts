import { apiError } from '../errors.js'
import type { Food } from './types.js'

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function textOrNull(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null
}

function numberOrNull(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null
}

function referenceFor(food: Record<string, unknown>): Food['reference'] {
  const dataType = textOrNull(food.dataType)
  if (dataType && ['Foundation', 'SR Legacy', 'Survey (FNDDS)'].includes(dataType)) {
    return { quantity: 100, unit: 'g' }
  }
  if (food.dataType === 'Branded') {
    const unit = textOrNull(food.servingSizeUnit)?.trim().toLowerCase()
    if (unit === 'g' || unit === 'grm') return { quantity: 100, unit: 'g' }
    if (unit === 'ml' || unit === 'mlt') return { quantity: 100, unit: 'ml' }
  }
  return { quantity: null, unit: null }
}

export function normalizeFood(payload: unknown, format: 'search' | 'detail'): Food {
  if (!isRecord(payload) || !Number.isSafeInteger(payload.fdcId) || Number(payload.fdcId) <= 0 || !textOrNull(payload.description)) {
    throw apiError('USDA_INVALID_RESPONSE')
  }
  if (payload.foodNutrients != null && !Array.isArray(payload.foodNutrients)) {
    throw apiError('USDA_INVALID_RESPONSE')
  }

  const entries: unknown[] = payload.foodNutrients ?? []
  const nutrients = entries.filter(isRecord).map((entry) => {
    const nutrient = format === 'detail' && isRecord(entry.nutrient) ? entry.nutrient : {}
    return {
      id: format === 'search' ? entry.nutrientId : nutrient.id,
      unit: textOrNull(format === 'search' ? entry.unitName : nutrient.unitName)?.trim().toLowerCase(),
      amount: (numberOrNull(entry.loq) ?? 0) > 0
        ? null
        : numberOrNull(format === 'search' ? entry.value : entry.amount),
    }
  })

  function amount(id: number, unit: string): number | null {
    const values = nutrients.filter((item) => item.id === id && item.unit === unit && item.amount !== null)
    const first = values[0]?.amount ?? null
    return values.every((item) => item.amount === first) ? first : null
  }

  const energyIds = payload.dataType === 'Foundation' ? [2048, 2047, 1008] : [1008, 2048, 2047]
  const energyNutrientId = energyIds.find((id) => amount(id, 'kcal') !== null) ?? null

  return {
    fdcId: Number(payload.fdcId),
    source: 'USDA FoodData Central',
    dataType: textOrNull(payload.dataType),
    name: String(payload.description),
    brand: textOrNull(payload.brandName),
    brandOwner: textOrNull(payload.brandOwner),
    reference: referenceFor(payload),
    nutrients: {
      energyKcal: energyNutrientId === null ? null : amount(energyNutrientId, 'kcal'),
      energyNutrientId,
      proteinG: amount(1003, 'g'),
      carbohydrateG: amount(1005, 'g'),
      fatG: amount(1004, 'g'),
    },
  }
}
