import { Prisma } from '@projeto/database'
import { apiError } from '../errors.js'
import type { CatalogRepository } from './repository.js'
import type { CatalogInput } from './types.js'

function decimal(value: string | null, positive = false): string | null {
  if (value === null && !positive) return null
  try {
    const parsed = new Prisma.Decimal(value!)
    if (!parsed.isFinite() || parsed.isNegative() || (positive && parsed.isZero())
      || parsed.decimalPlaces() > 30 || parsed.greaterThanOrEqualTo('1e35')) throw new Error()
    return parsed.toFixed()
  } catch { throw apiError('CATALOG_INVALID_DECIMAL') }
}

export function normalizeCatalogInput(input: CatalogInput): CatalogInput {
  if ((input.source === 'usda') !== Boolean(input.usda)) throw apiError('CATALOG_INVALID_SOURCE')
  const food: CatalogInput = {
    ...input, name: input.name.trim(), brand: input.brand?.trim() || null, preparation: input.preparation?.trim() || null,
    amount: decimal(input.amount, true)!,
    nutrients: { kcal: decimal(input.nutrients.kcal), protein: decimal(input.nutrients.protein), carbs: decimal(input.nutrients.carbs), fat: decimal(input.nutrients.fat) },
  }
  if (input.usda) {
    const { original } = input.usda
    if (Buffer.byteLength(JSON.stringify(original), 'utf8') > 32 * 1024) throw apiError('CATALOG_INVALID_SOURCE')
    const equal = (current: string | null, source: number | null) => current === null || source === null
      ? current === source : new Prisma.Decimal(current).equals(String(source))
    const referenceChanged = !equal(food.amount, original.reference.quantity) || food.unit !== original.reference.unit
    if (referenceChanged && !input.usda.referenceReviewed) throw apiError('CATALOG_REVIEW_REQUIRED')
    const changes: [string, boolean][] = [
      ['name', food.name !== original.name], ['brand', food.brand !== original.brand], ['preparation', food.preparation !== null],
      ['amount', !equal(food.amount, original.reference.quantity)], ['unit', food.unit !== original.reference.unit],
      ['kcal', !equal(food.nutrients.kcal, original.nutrients.energyKcal)],
      ['protein', !equal(food.nutrients.protein, original.nutrients.proteinG)],
      ['carbs', !equal(food.nutrients.carbs, original.nutrients.carbohydrateG)],
      ['fat', !equal(food.nutrients.fat, original.nutrients.fatG)],
    ]
    const modifiedFields = changes.filter(([, changed]) => changed).map(([key]) => key)
    food.usda = { ...input.usda, modifiedFields, manuallyEdited: input.usda.manuallyEdited || modifiedFields.length > 0 }
  }
  return food
}

export function createCatalogService(repository: CatalogRepository) {
  async function access<T>(action: () => Promise<T>) {
    try { return await action() } catch { throw apiError('CATALOG_UNAVAILABLE') }
  }
  return {
    list: (page: number, pageSize: number) => access(() => repository.list(page, pageSize)),
    create(input: CatalogInput) {
      const normalized = normalizeCatalogInput(input)
      return access(() => repository.create(normalized))
    },
    async update(id: string, input: CatalogInput) {
      const normalized = normalizeCatalogInput(input)
      const result = await access(() => repository.update(id, normalized))
      if (!result) throw apiError('CATALOG_NOT_FOUND')
      return result
    },
  }
}
export type CatalogService = ReturnType<typeof createCatalogService>
