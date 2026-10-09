import { randomUUID } from 'node:crypto'
import type { CatalogInput, CatalogRecord } from '../src/catalog/types.js'
import type { CatalogRepository } from '../src/catalog/repository.js'

export const manual: CatalogInput = {
  name: 'Alimento manual', brand: null, preparation: 'Cozido', amount: '100', unit: 'g',
  nutrients: { kcal: '123.456789012345678901234567890123', protein: null, carbs: '20.125', fat: '0' }, source: 'manual',
}
export const imported: CatalogInput = {
  ...manual, name: 'Original', preparation: null,
  nutrients: { kcal: '100', protein: null, carbs: '24.01', fat: '0' }, source: 'usda',
  usda: {
    original: {
      fdcId: 123, source: 'USDA FoodData Central', dataType: 'SR Legacy', name: 'Original', brand: null, brandOwner: null,
      reference: { quantity: 100, unit: 'g' },
      nutrients: { energyKcal: 100, energyNutrientId: 1008, proteinG: null, carbohydrateG: 24.01, fatG: 0 },
    },
    manuallyEdited: false, modifiedFields: [], referenceReviewed: false,
  },
}
export const noUsda = { searchFoods: async () => { throw new Error('Catálogo não deve consultar USDA') }, getFood: async () => { throw new Error('Catálogo não deve consultar USDA') } }

export function memoryRepository(): CatalogRepository {
  const records = new Map<string, CatalogRecord>()
  return {
    async create(input) {
      const record = { ...structuredClone(input), id: randomUUID(), fdcId: input.usda?.original.fdcId ?? null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      records.set(record.id, record)
      return record
    },
    async update(id, input) {
      const old = records.get(id)
      if (!old) return null
      const record = { ...old, ...structuredClone(input), fdcId: input.usda?.original.fdcId ?? null, updatedAt: new Date().toISOString() }
      records.set(id, record)
      return record
    },
    async list(page, pageSize) {
      const all = [...records.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id))
      return { items: all.slice((page - 1) * pageSize, page * pageSize), page, pageSize, totalItems: all.length, totalPages: Math.ceil(all.length / pageSize) }
    },
  }
}
