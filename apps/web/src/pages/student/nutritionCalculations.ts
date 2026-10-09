import type { CatalogFood, Food, Meal, Nutrients } from './studentData.ts'
import type { CatalogRecord } from '../../api/catalog.ts'

const units = ['g', 'ml', 'unidade', 'fatia', 'porção']
export const emptyNutrients = (): Nutrients => ({ kcal: null, protein: null, carbs: null, fat: null })
export const isPositiveQuantity = (value: number) => Number.isFinite(value) && value > 0
const validNutrient = (value: number | null): value is number => value !== null && Number.isFinite(value) && value >= 0

export function includeCatalogFood(catalog: CatalogFood | CatalogRecord, id: string): Food {
  const amount = Number(catalog.amount)
  if (!isPositiveQuantity(amount) || !units.includes(catalog.unit)) {
    throw new Error('Revise a quantidade e a unidade de referência do cadastro.')
  }
  return {
    id, name: catalog.name, quantity: amount, unit: catalog.unit,
    snapshot: structuredClone({
      catalogId: catalog.id, name: catalog.name, brand: catalog.brand, preparation: catalog.preparation,
      reference: { quantity: amount, unit: catalog.unit }, nutrients: {
        kcal: catalog.nutrients.kcal === null ? null : Number(catalog.nutrients.kcal),
        protein: catalog.nutrients.protein === null ? null : Number(catalog.nutrients.protein),
        carbs: catalog.nutrients.carbs === null ? null : Number(catalog.nutrients.carbs),
        fat: catalog.nutrients.fat === null ? null : Number(catalog.nutrients.fat),
      },
      source: catalog.usda ? 'usda' : 'manual', usda: catalog.usda,
    }),
  }
}

// Uma troca de unidade reinicia a quantidade na referência, sem conversão.
// O editor confirma essa substituição antes de chamar esta função.
export function linkCatalogFood(food: Food, catalog: CatalogFood | CatalogRecord): Food {
  const linked = includeCatalogFood(catalog, food.id)
  return { ...linked, quantity: food.unit === linked.unit ? food.quantity : linked.quantity }
}

export function foodCalculationIssue(food: Food): string | null {
  if (!food.snapshot) return 'Vincule este alimento a um cadastro para calcular seus nutrientes.'
  const reference = food.snapshot.reference
  if (!isPositiveQuantity(reference.quantity) || !units.includes(reference.unit)) {
    return 'Referência nutricional inválida. Revise o cadastro e vincule o alimento novamente.'
  }
  if (!isPositiveQuantity(food.quantity)) return 'Informe uma quantidade finita e maior que zero.'
  if (food.unit !== reference.unit) return 'Use a mesma unidade da referência. Não há conversão automática.'
  return null
}

export function calculateFoodNutrients(food: Food): Nutrients {
  if (foodCalculationIssue(food) || !food.snapshot) return emptyNutrients()
  const { nutrients, reference } = food.snapshot
  const scale = (value: number | null): number | null => {
    if (!validNutrient(value)) return null
    if (value === 0) return 0
    const result = value * (food.quantity / reference.quantity)
    return Number.isFinite(result) ? result : null
  }
  return { kcal: scale(nutrients.kcal), protein: scale(nutrients.protein), carbs: scale(nutrients.carbs), fat: scale(nutrients.fat) }
}

function sumValues(values: Nutrients[]): Nutrients {
  if (values.length === 0) return emptyNutrients()
  const add = (a: number | null, b: number | null) => {
    if (!validNutrient(a) || !validNutrient(b)) return null
    const result = a + b
    return Number.isFinite(result) ? result : null
  }
  return values.reduce<Nutrients>((total, item) => ({
    kcal: add(total.kcal, item.kcal), protein: add(total.protein, item.protein),
    carbs: add(total.carbs, item.carbs), fat: add(total.fat, item.fat),
  }), { kcal: 0, protein: 0, carbs: 0, fat: 0 })
}

export function mealNutrients(meal: Meal): Nutrients {
  return meal.totalsMode === 'calculated' ? sumValues(meal.foods.map(calculateFoodNutrients)) : { ...meal.nutrients }
}

export function sumNutrients(meals: Meal[]): Nutrients {
  return sumValues(meals.map(mealNutrients))
}

export function calorieDifference(totals: Nutrients, limit: number | null): number | null {
  if (!validNutrient(limit) || !Object.values(totals).every(validNutrient) || totals.kcal === null) return null
  return limit - totals.kcal
}

const nutrientFormatter = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 })
export function formatMealNutrient(value: number | null, unit: string) {
  return value === null ? 'Incompleto' : `${nutrientFormatter.format(value)} ${unit}`
}
