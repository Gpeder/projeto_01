import assert from 'node:assert/strict'
import { test } from 'node:test'
import { normalizeFood } from '../src/foods/normalize.js'
import { samples } from './fixtures.js'

test('normaliza exemplos reais dos quatro tipos, preservando descrição e preparo', () => {
  const expectations = [
    ['foundation', 'Flour, rice, brown', 365.25, 7.19, 75.5, 3.85, 'g'],
    ['sr', 'Rice noodles, cooked', 108, 1.79, 24.01, 0.2, 'g'],
    ['survey', 'Rice noodles, cooked', 107, 1.78, 23.9, 0.2, 'g'],
    ['branded', 'MILK', 62, 3.75, 4.58, 3.33, 'ml'],
  ] as const
  for (const [name, description, energy, protein, carbs, fat, unit] of expectations) {
    const food = normalizeFood(samples[name].detail, 'detail')
    assert.equal(food.name, description)
    assert.equal(food.source, 'USDA FoodData Central')
    assert.deepEqual(food.reference, { quantity: 100, unit })
    assert.deepEqual(food.nutrients, { energyKcal: energy, energyNutrientId: 1008, proteinG: protein, carbohydrateG: carbs, fatG: fat })
  }
})

test('interpreta os formatos reais de busca e detalhes separadamente', () => {
  const search = normalizeFood(samples.foundation.search, 'search')
  const detail = normalizeFood(samples.foundation.detail, 'detail')
  assert.equal(search.fdcId, detail.fdcId)
  assert.equal(search.nutrients.energyKcal, 365)
  assert.equal(detail.nutrients.energyKcal, 365.25)
  assert.equal(normalizeFood(samples.sr.search, 'search').nutrients.carbohydrateG, 24)
  assert.equal(normalizeFood(samples.sr.detail, 'detail').nutrients.carbohydrateG, 24.01)
  assert.equal(normalizeFood(samples.survey.search, 'search').nutrients.carbohydrateG, 23.87)
  assert.equal(normalizeFood(samples.survey.detail, 'detail').nutrients.carbohydrateG, 23.9)
  assert.deepEqual(normalizeFood(samples.branded.search, 'search'), normalizeFood(samples.branded.detail, 'detail'))
})

test('preserva marca e proprietário sem misturar porção do rótulo com referência', () => {
  const food = normalizeFood(samples.branded.detail, 'detail')
  assert.equal(food.brand, 'WINN-DIXIE')
  assert.equal(food.brandOwner, 'Winn-Dixie Stores, Inc.')
  assert.deepEqual(food.reference, { quantity: 100, unit: 'ml' })
  assert.equal(food.nutrients.energyKcal, 62)
  assert.equal('labelNutrients' in food, false)
  assert.equal('servingSize' in food, false)
})

test('ausências e valores inválidos são null; zero declarado continua zero', () => {
  const food = normalizeFood({
    fdcId: 1, description: 'Food, cooked', dataType: 'Branded',
    foodNutrients: [
      { nutrientId: 1003, unitName: 'G', value: 0 },
      { nutrientId: 1004, unitName: 'G', value: null },
      { nutrientId: 1005, unitName: 'G', value: '10' },
    ],
  }, 'search')
  assert.deepEqual(food.reference, { quantity: null, unit: null })
  assert.equal(food.brand, null)
  assert.deepEqual(food.nutrients, { energyKcal: null, energyNutrientId: null, proteinG: 0, carbohydrateG: null, fatG: null })
  const absent = normalizeFood({ fdcId: 1, description: 'Food' }, 'detail')
  assert.equal(absent.nutrients.proteinG, null)
})

test('energia somente em kJ não vira kcal, nem pela posição nem pelo nome', () => {
  const base = { fdcId: 1, description: 'Food', dataType: 'Foundation' }
  for (const entry of [
    { nutrientId: 1062, nutrientName: 'Energy', unitName: 'kJ', value: 418.4 },
    { nutrientId: 1008, nutrientName: 'Energy', unitName: 'kJ', value: 418.4 },
    { nutrientId: 9999, nutrientName: 'Energy', unitName: 'kcal', value: 100 },
  ]) {
    assert.equal(normalizeFood({ ...base, foodNutrients: [entry] }, 'search').nutrients.energyKcal, null)
  }
})

test('Foundation prioriza Atwater específico, depois geral e depois energia legada', () => {
  const entries = [
    { nutrient: { id: 1008, unitName: 'kcal' }, amount: 100 },
    { nutrient: { id: 2047, unitName: 'kcal' }, amount: 101 },
    { nutrient: { id: 2048, unitName: 'kcal' }, amount: 102 },
  ]
  const make = (foodNutrients: unknown[]) => normalizeFood({ fdcId: 1, description: 'Food', dataType: 'Foundation', foodNutrients }, 'detail')
  assert.equal(make(entries).nutrients.energyNutrientId, 2048)
  assert.equal(make(entries).nutrients.energyKcal, 102)
  assert.equal(make(entries.slice(0, 2)).nutrients.energyNutrientId, 2047)
  assert.equal(make(entries.slice(0, 1)).nutrients.energyNutrientId, 1008)
})

test('confere unidades, valores finitos, limite de quantificação e duplicatas conflitantes', () => {
  const food = normalizeFood({
    fdcId: 1, description: 'Food',
    foodNutrients: [
      { nutrientId: 1003, unitName: 'mg', value: 20 },
      { nutrientId: 1004, unitName: 'g', value: Infinity },
      { nutrientId: 1004, unitName: 'g', value: -1 },
      { nutrientId: 1005, unitName: 'g', value: 0, loq: 0.03 },
      { nutrientId: 1008, unitName: 'kcal', value: 10 },
      { nutrientId: 1008, unitName: 'kcal', value: 20 },
    ],
  }, 'search')
  assert.deepEqual(food.nutrients, { energyKcal: null, energyNutrientId: null, proteinG: null, carbohydrateG: null, fatG: null })
})

test('reconhece unidades padronizadas e mantém referência desconhecida como null', () => {
  for (const [unit, expected] of [['g', 'g'], ['GRM', 'g'], ['MLT', 'ml'], ['mL', 'ml'], ['oz', null]] as const) {
    const food = normalizeFood({ ...samples.branded.detail, servingSizeUnit: unit }, 'detail')
    assert.deepEqual(food.reference, { quantity: expected === null ? null : 100, unit: expected })
  }
  assert.deepEqual(normalizeFood({ ...samples.sr.detail, dataType: 'Unknown' }, 'detail').reference, { quantity: null, unit: null })
})

test('recusa alimentos sem identificação ou descrição utilizável', () => {
  for (const invalid of [null, [], {}, { fdcId: 1 }, { fdcId: 0, description: 'Food' }, { fdcId: 1, description: ' ', foodNutrients: [] }, { fdcId: 1, description: 'Food', foodNutrients: {} }]) {
    assert.throws(() => normalizeFood(invalid, 'detail'), { message: 'Resposta inválida do serviço de alimentos.' })
  }
})
