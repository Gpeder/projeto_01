import type { ApiFood } from '../../api/foods.ts'
import type { CatalogFood, Nutrients } from './studentData.ts'

export const foodNutrientFields = [
  { key: 'kcal', label: 'Calorias (kcal)' }, { key: 'protein', label: 'Proteínas (g)' },
  { key: 'carbs', label: 'Carboidratos (g)' }, { key: 'fat', label: 'Gorduras (g)' },
] as const

export type FoodDraft = Omit<CatalogFood, 'amount' | 'nutrients'> & {
  amount: string
  nutrients: Record<keyof Nutrients, string>
}

const asText = (value: number | null) => value === null ? '' : String(value)
const foodNumberFormatter = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 20 })

export function formatFoodValue(value: number | null, unit: string) {
  return value === null ? 'Não informado' : `${foodNumberFormatter.format(value)} ${unit}`
}

export function toFoodDraft(food: CatalogFood): FoodDraft {
  return {
    ...food,
    amount: String(food.amount),
    nutrients: {
      kcal: asText(food.nutrients.kcal), protein: asText(food.nutrients.protein),
      carbs: asText(food.nutrients.carbs), fat: asText(food.nutrients.fat),
    },
  }
}

export function importFood(id: string, food: ApiFood): FoodDraft {
  return {
    id, name: food.name, brand: food.brand ?? '', preparation: '',
    amount: asText(food.reference.quantity), unit: food.reference.unit ?? '',
    nutrients: {
      kcal: asText(food.nutrients.energyKcal), protein: asText(food.nutrients.proteinG),
      carbs: asText(food.nutrients.carbohydrateG), fat: asText(food.nutrients.fatG),
    },
    usda: { original: structuredClone(food), manuallyEdited: false, modifiedFields: [], referenceReviewed: false },
  }
}

export function hasFoodContent(draft: FoodDraft) {
  return !!(draft.name || draft.brand || draft.preparation || draft.usda
    || draft.amount !== '100' || draft.unit !== 'g' || Object.values(draft.nutrients).some((value) => value !== ''))
}

export function needsReferenceReview(draft: FoodDraft) {
  const original = draft.usda?.original.reference
  return !!original && (original.quantity === null || original.unit === null
    || Number(draft.amount) !== original.quantity || draft.unit !== original.unit)
}

function parseNumber(value: string): number | null {
  if (!value.trim()) return null
  const number = Number(value)
  if (!Number.isFinite(number) || number < 0) throw new Error('Informe números válidos, iguais ou maiores que zero.')
  return number
}

export function saveFoodDraft(draft: FoodDraft): CatalogFood {
  if (!draft.name.trim()) throw new Error('Informe o nome do alimento.')
  const amount = parseNumber(draft.amount)
  if (amount === null || amount <= 0 || !['g', 'ml', 'unidade', 'fatia', 'porção'].includes(draft.unit)) {
    throw new Error('Informe uma quantidade de referência maior que zero e selecione a unidade.')
  }
  if (needsReferenceReview(draft) && !draft.usda?.referenceReviewed) {
    throw new Error('Revise os nutrientes para a quantidade e unidade informadas e confirme a revisão.')
  }
  const food: CatalogFood = {
    id: draft.id, name: draft.name.trim(), brand: draft.brand.trim(), preparation: draft.preparation.trim(),
    amount, unit: draft.unit,
    nutrients: {
      kcal: parseNumber(draft.nutrients.kcal), protein: parseNumber(draft.nutrients.protein),
      carbs: parseNumber(draft.nutrients.carbs), fat: parseNumber(draft.nutrients.fat),
    },
  }
  if (draft.usda) {
    const original = draft.usda.original
    const pairs = [
      ['name', food.name, original.name], ['brand', food.brand, original.brand ?? ''],
      ['preparation', food.preparation, ''], ['amount', food.amount, original.reference.quantity],
      ['unit', food.unit, original.reference.unit], ['kcal', food.nutrients.kcal, original.nutrients.energyKcal],
      ['protein', food.nutrients.protein, original.nutrients.proteinG],
      ['carbs', food.nutrients.carbs, original.nutrients.carbohydrateG], ['fat', food.nutrients.fat, original.nutrients.fatG],
    ] as const
    const modifiedFields = pairs.filter(([, current, source]) => current !== source).map(([key]) => key)
    food.usda = { ...draft.usda, manuallyEdited: draft.usda.manuallyEdited || modifiedFields.length > 0, modifiedFields }
  }
  return food
}
