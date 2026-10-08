import assert from 'node:assert/strict'
import test from 'node:test'
import { initialNutrition, type CatalogFood, type Food, type Meal } from '../src/pages/student/studentData.ts'
import { importFood, saveFoodDraft } from '../src/pages/student/foodDraft.ts'
import { calculateFoodNutrients, calorieDifference, emptyNutrients, foodCalculationIssue, formatMealNutrient, includeCatalogFood, linkCatalogFood, mealNutrients, sumNutrients } from '../src/pages/student/nutritionCalculations.ts'

// Valores fictícios, exclusivamente para verificar as operações locais.
function catalog(): CatalogFood {
  return { id: 'catalog-1', name: 'Alimento de teste', brand: '', preparation: '', amount: 100, unit: 'g', nutrients: { kcal: 200, protein: 10, carbs: 24.01, fat: 0 } }
}
function calculatedMeal(foods: Food[]): Meal {
  return { id: 'meal', name: 'Refeição', time: '', guidance: '', totalsMode: 'calculated', nutrients: emptyNutrients(), foods }
}

test('calcula proporção, mantendo referência e quantidade da refeição separadas', () => {
  const item = includeCatalogFood(catalog(), 'item-1')
  item.quantity = 150
  assert.deepEqual(calculateFoodNutrients(item), { kcal: 300, protein: 15, carbs: 36.015, fat: 0 })
  assert.deepEqual(item.snapshot?.reference, { quantity: 100, unit: 'g' })
  assert.equal(item.snapshot?.catalogId, 'catalog-1')
  assert.equal(item.snapshot?.source, 'manual')
})

test('aceita quantidades decimais e não arredonda antes de somar', () => {
  const source = catalog()
  source.amount = 2.5
  source.unit = 'fatia'
  source.nutrients = { kcal: 1, protein: 0, carbs: null, fat: 0.125 }
  const item = includeCatalogFood(source, 'one')
  item.quantity = 0.01
  const portion = calculateFoodNutrients(item)
  assert.equal(portion.kcal, 0.004)
  assert.equal(portion.fat, 0.0005)
  const total = mealNutrients(calculatedMeal([item, { ...item, id: 'two' }, { ...item, id: 'three' }]))
  assert.equal(total.kcal, 0.012)
  assert.equal(formatMealNutrient(total.kcal, 'kcal'), '0,01 kcal')
  assert.equal(formatMealNutrient(portion.kcal, 'kcal'), '0 kcal')
})

test('zero permanece conhecido, ausência não se transforma em zero', () => {
  const source = catalog()
  source.nutrients.protein = null
  const item = includeCatalogFood(source, 'one')
  item.quantity = 150.5
  const result = calculateFoodNutrients(item)
  assert.equal(result.kcal, 301)
  assert.equal(result.protein, null)
  assert.equal(result.fat, 0)
})

test('rejeita quantidades e referências inválidas, inclusive não finitas', () => {
  for (const invalid of [0, -0.1, NaN, Infinity, -Infinity]) {
    const item = includeCatalogFood(catalog(), 'one')
    assert.deepEqual(calculateFoodNutrients({ ...item, quantity: invalid }), emptyNutrients())
    assert.match(foodCalculationIssue({ ...item, quantity: invalid })!, /maior que zero/)
    item.snapshot!.reference.quantity = invalid
    assert.deepEqual(calculateFoodNutrients(item), emptyNutrients())
    assert.throws(() => includeCatalogFood({ ...catalog(), amount: invalid }, 'one'), /referência/)
  }
})

test('somente unidades idênticas permitem cálculo, sem converter g, ml ou unidades caseiras', () => {
  for (const unit of ['g', 'ml', 'fatia', 'unidade', 'porção']) {
    const item = includeCatalogFood({ ...catalog(), unit }, 'one')
    assert.equal(calculateFoodNutrients({ ...item, quantity: 50 }).kcal, 100)
    const otherUnit = unit === 'g' ? 'ml' : 'g'
    assert.deepEqual(calculateFoodNutrients({ ...item, unit: otherUnit }), emptyNutrients())
    assert.match(foodCalculationIssue({ ...item, unit: otherUnit })!, /mesma unidade/)
  }
  assert.throws(() => includeCatalogFood({ ...catalog(), unit: 'kg' }, 'one'), /referência/)
  const invalid = includeCatalogFood(catalog(), 'one')
  invalid.snapshot!.reference.unit = ''
  assert.deepEqual(calculateFoodNutrients(invalid), emptyNutrients())
})

test('faltas propagam por nutriente sem apresentar subtotais como totais completos', () => {
  const first = includeCatalogFood(catalog(), 'one')
  const second = includeCatalogFood({ ...catalog(), nutrients: { kcal: 50, protein: null, carbs: 0, fat: 1 } }, 'two')
  assert.deepEqual(mealNutrients(calculatedMeal([first, second])), { kcal: 250, protein: null, carbs: 24.01, fat: 1 })
  second.snapshot!.nutrients.kcal = null
  assert.deepEqual(mealNutrients(calculatedMeal([first, second])), { kcal: null, protein: null, carbs: 24.01, fat: 1 })
})

test('inclusão, alteração de quantidade e remoção recalculam sem totais armazenados', () => {
  const first = includeCatalogFood(catalog(), 'one')
  const second = includeCatalogFood(catalog(), 'two')
  const meal = calculatedMeal([first])
  assert.equal(mealNutrients(meal).kcal, 200)
  meal.foods.push(second)
  assert.equal(mealNutrients(meal).kcal, 400)
  second.quantity = 150
  assert.equal(mealNutrients(meal).kcal, 500)
  meal.foods = meal.foods.filter((food) => food.id !== first.id)
  assert.equal(mealNutrients(meal).kcal, 300)
  assert.deepEqual(meal.nutrients, emptyNutrients())
})

test('refeição calculada vazia e dia vazio não aparentam totais completos de zero', () => {
  assert.deepEqual(mealNutrients(calculatedMeal([])), emptyNutrients())
  assert.deepEqual(sumNutrients([]), emptyNutrients())
  assert.deepEqual(sumNutrients([...initialNutrition.meals, calculatedMeal([])]), emptyNutrients())
})

test('alimentos antigos exigem vinculação explícita, inclusive quando o nome coincide', () => {
  const old: Food = { id: 'legacy', name: catalog().name, quantity: 150, unit: 'g' }
  const meal = calculatedMeal([old, includeCatalogFood(catalog(), 'one')])
  assert.deepEqual(mealNutrients(meal), emptyNutrients())
  assert.match(foodCalculationIssue(old)!, /Vincule/)
  const linked = linkCatalogFood(old, catalog())
  assert.equal(linked.id, old.id)
  assert.equal(linked.quantity, 150)
  assert.equal(calculateFoodNutrients(linked).kcal, 300)
  assert.equal(old.snapshot, undefined)
})

test('vincular outra unidade reinicia na referência sem converter quantidade', () => {
  const old: Food = { id: 'legacy', name: 'Antigo', quantity: 3, unit: 'fatia' }
  const linked = linkCatalogFood(old, catalog())
  assert.equal(linked.quantity, 100)
  assert.equal(linked.unit, 'g')
  assert.equal(old.quantity, 3)
  assert.equal(old.unit, 'fatia')
})

test('refeições existentes continuam manuais e guardam exatamente seus valores', () => {
  const before = structuredClone(initialNutrition)
  assert.ok(initialNutrition.meals.every((meal) => meal.totalsMode === 'manual'))
  assert.deepEqual(sumNutrients(initialNutrition.meals), { kcal: 2100, protein: 140, carbs: 230, fat: 65 })
  for (const meal of initialNutrition.meals) {
    assert.deepEqual(mealNutrients(meal), meal.nutrients)
    assert.deepEqual(mealNutrients({ ...meal, foods: [includeCatalogFood(catalog(), 'one')] }), meal.nutrients)
  }
  assert.deepEqual(initialNutrition, before)
})

test('troca de modo preserva os valores manuais e o total diário usa apenas o modo ativo', () => {
  const manual = structuredClone(initialNutrition.meals[0])
  manual.foods = [includeCatalogFood(catalog(), 'one')]
  const calculated = { ...manual, totalsMode: 'calculated' as const }
  assert.equal(mealNutrients(calculated).kcal, 200)
  assert.equal(mealNutrients({ ...calculated, totalsMode: 'manual' }).kcal, 430)
  assert.deepEqual(calculated.nutrients, initialNutrition.meals[0].nutrients)
  assert.deepEqual(sumNutrients([manual, calculated]), { kcal: 630, protein: 38, carbs: 76.01, fat: 12 })
})

test('cópias manuais são independentes do cadastro e de outras inclusões', () => {
  const source = catalog()
  const first = includeCatalogFood(source, 'one')
  const second = includeCatalogFood(source, 'two')
  source.nutrients.kcal = 800
  source.amount = 50
  source.name = 'Nome posterior'
  assert.equal(calculateFoodNutrients(first).kcal, 200)
  assert.equal(first.snapshot!.reference.quantity, 100)
  first.snapshot!.nutrients.kcal = 100
  assert.equal(calculateFoodNutrients(second).kcal, 200)
  assert.equal(source.nutrients.kcal, 800)
})

test('USDA usa os dados revisados e preserva origem, edições e cópias profundamente independentes', () => {
  const original = { fdcId: 123, source: 'USDA FoodData Central' as const, dataType: 'SR Legacy', name: 'Example', brand: null, brandOwner: null,
    reference: { quantity: 100, unit: 'g' as const }, nutrients: { energyKcal: 200, energyNutrientId: 1008, proteinG: 10, carbohydrateG: null, fatG: 0 } }
  const draft = importFood('usda', original)
  draft.nutrients.protein = '12'
  const source = saveFoodDraft(draft)
  const item = includeCatalogFood(source, 'one')
  item.quantity = 150
  assert.deepEqual(calculateFoodNutrients(item), { kcal: 300, protein: 18, carbs: null, fat: 0 })
  assert.equal(item.snapshot!.source, 'usda')
  assert.equal(item.snapshot!.usda!.manuallyEdited, true)
  assert.deepEqual(item.snapshot!.usda!.modifiedFields, ['protein'])
  const saved = structuredClone(item)
  source.usda!.original.nutrients.energyKcal = 999
  source.usda!.original.reference.quantity = 999
  source.usda!.modifiedFields.push('kcal')
  source.nutrients.protein = 100
  assert.deepEqual(item, saved)
})

test('não publica valores inválidos ou overflow como nutrientes conhecidos', () => {
  for (const invalid of [-1, NaN, Infinity]) {
    const item = includeCatalogFood({ ...catalog(), nutrients: { kcal: invalid, protein: 10, carbs: 0, fat: 0 } }, 'one')
    assert.deepEqual(calculateFoodNutrients(item), { kcal: null, protein: 10, carbs: 0, fat: 0 })
  }
  const item = includeCatalogFood({ ...catalog(), amount: 1, nutrients: { kcal: Number.MAX_VALUE, protein: null, carbs: 0, fat: 0 } }, 'one')
  assert.equal(calculateFoodNutrients({ ...item, quantity: 2 }).kcal, null)
  assert.equal(mealNutrients(calculatedMeal([item, { ...item, id: 'two' }])).kcal, null)
})

test('limite diário só tem comparação conclusiva com dados completos', () => {
  const totals = sumNutrients(initialNutrition.meals)
  assert.equal(calorieDifference(totals, 2200), 100)
  assert.equal(calorieDifference(totals, 2000), -100)
  assert.equal(calorieDifference(totals, 2100), 0)
  for (const missing of ['kcal', 'protein', 'carbs', 'fat'] as const) {
    assert.equal(calorieDifference({ ...totals, [missing]: null }, 2200), null)
  }
  assert.equal(calorieDifference(totals, null), null)
  assert.equal(calorieDifference(emptyNutrients(), 2000), null)
  assert.equal(calorieDifference({ kcal: 0, protein: 0, carbs: 0, fat: 0 }, 0), 0)
})
