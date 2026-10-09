import type { Food } from '../foods/types.js'

export type DecimalNutrients = { kcal: string | null; protein: string | null; carbs: string | null; fat: string | null }
export type CatalogInput = {
  name: string
  brand: string | null
  preparation: string | null
  amount: string
  unit: 'g' | 'ml' | 'unidade' | 'fatia' | 'porção'
  nutrients: DecimalNutrients
  source: 'manual' | 'usda'
  usda?: {
    original: Food
    manuallyEdited: boolean
    modifiedFields: string[]
    referenceReviewed: boolean
  }
}
export type CatalogRecord = CatalogInput & { id: string; fdcId: number | null; createdAt: string; updatedAt: string }
export type CatalogQuery = { page: string; pageSize: string }
export type CatalogPage = { items: CatalogRecord[]; page: number; pageSize: number; totalItems: number; totalPages: number }
