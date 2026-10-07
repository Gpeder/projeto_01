import assert from 'node:assert/strict'
import test from 'node:test'
import type { ApiFood } from '../src/api/foods.ts'
import { hasFoodContent, importFood, needsReferenceReview, saveFoodDraft, toFoodDraft } from '../src/pages/student/foodDraft.ts'
import { sumNutrients, type CatalogFood, type Meal } from '../src/pages/student/studentData.ts'

const original: ApiFood = {
  fdcId: 123, source: 'USDA FoodData Central', dataType: 'SR Legacy', name: 'Example food',
  brand: null, brandOwner: null, reference: { quantity: 100, unit: 'g' },
  nutrients: { energyKcal: 100, energyNutrientId: 1008, proteinG: null, carbohydrateG: 24.01, fatG: 0 },
}

test('importação preserva ausência, zero, precisão e dados originais durante a edição', () => {
  const draft = importFood('local', original)
  assert.equal(draft.nutrients.protein, '')
  assert.equal(draft.nutrients.fat, '0')
  assert.equal(draft.nutrients.carbs, '24.01')
  draft.nutrients.carbs = '22.125'
  draft.name = 'Nome revisado'
  const saved = saveFoodDraft(draft)
  assert.equal(saved.nutrients.carbs, 22.125)
  assert.equal(saved.nutrients.protein, null)
  assert.equal(saved.nutrients.fat, 0)
  assert.equal(saved.usda?.manuallyEdited, true)
  assert.deepEqual(saved.usda?.modifiedFields, ['name', 'carbs'])
  assert.deepEqual(saved.usda?.original, original)
  assert.deepEqual(saveFoodDraft(toFoodDraft(saved)), saved)
})

test('referência desconhecida exige quantidade, unidade e confirmação, sem conversão de macros', () => {
  const draft = importFood('local', { ...original, reference: { quantity: null, unit: null } })
  assert.equal(draft.amount, '')
  assert.equal(draft.unit, '')
  assert.equal(needsReferenceReview(draft), true)
  assert.throws(() => saveFoodDraft(draft), /quantidade de referência/)
  draft.amount = '2.5'
  draft.unit = 'fatia'
  assert.throws(() => saveFoodDraft(draft), /confirme a revisão/)
  draft.usda!.referenceReviewed = true
  const saved = saveFoodDraft(draft)
  assert.equal(saved.amount, 2.5)
  assert.equal(saved.nutrients.carbs, 24.01)
  assert.equal(saved.usda?.original.reference.quantity, null)
})

test('alterar referência importada exige revisão explícita sem recalcular nutrientes', () => {
  const draft = importFood('local', original)
  assert.equal(needsReferenceReview(draft), false)
  draft.amount = '200'
  assert.throws(() => saveFoodDraft(draft), /confirme a revisão/)
  draft.usda!.referenceReviewed = true
  assert.equal(saveFoodDraft(draft).nutrients.kcal, 100)
})

test('cadastro manual diferencia vazio de zero e rejeita números inválidos', () => {
  const food: CatalogFood = { id: 'manual', name: '', brand: '', preparation: '', amount: 100, unit: 'g', nutrients: { kcal: null, protein: null, carbs: null, fat: null } }
  const draft = toFoodDraft(food)
  assert.equal(hasFoodContent(draft), false)
  draft.nutrients.fat = '0'
  assert.equal(hasFoodContent(draft), true)
  draft.name = 'Manual'
  const saved = saveFoodDraft(draft)
  assert.equal(saved.nutrients.kcal, null)
  assert.equal(saved.nutrients.fat, 0)
  assert.equal(saved.usda, undefined)
  for (const invalid of ['-1', 'NaN', 'Infinity', 'abc']) {
    draft.nutrients.protein = invalid
    assert.throws(() => saveFoodDraft(draft), /números válidos/)
  }
  draft.nutrients.protein = '0.125'
  for (const invalid of ['', '0', '-1']) {
    draft.amount = invalid
    assert.throws(() => saveFoodDraft(draft))
  }
})

test('ausência em total planejado torna apenas aquele nutriente incompleto', () => {
  const meal: Meal = { id: 'meal', name: 'Refeição', time: '', guidance: '', foods: [], nutrients: { kcal: 10, protein: null, carbs: 0, fat: 1.5 } }
  const totals = sumNutrients([meal, { ...meal, nutrients: { kcal: 20, protein: 2, carbs: 0, fat: 0 } }])
  assert.deepEqual(totals, { kcal: 30, protein: null, carbs: 0, fat: 1.5 })
})
