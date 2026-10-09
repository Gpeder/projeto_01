import assert from 'node:assert/strict'
import test from 'node:test'
import { createCatalogApi, type CatalogRecord } from '../src/api/catalog.ts'
import { importFood, toCatalogInput, toFoodDraft } from '../src/pages/student/foodDraft.ts'
import { includeCatalogFood, calculateFoodNutrients } from '../src/pages/student/nutritionCalculations.ts'

const record: CatalogRecord = {
  id: 'a5bf982d-f5ea-4709-b736-6507db139f2e', name: 'Manual', brand: '', preparation: '',
  amount: '100.000000000000000000000000000001', unit: 'g',
  nutrients: { kcal: '12.123456789012345678901234567891', protein: null, carbs: '20', fat: '0' },
  source: 'manual', fdcId: null, createdAt: '2026-10-08T12:00:00.000Z', updatedAt: '2026-10-08T12:00:00.000Z',
}

test('rascunho preserva todos os dígitos decimais após carregar, editar e salvar', () => {
  const draft = toFoodDraft(record)
  draft.name = 'Renomeado'
  const input = toCatalogInput(draft)
  assert.equal(input.amount, record.amount)
  assert.deepEqual(input.nutrients, record.nutrients)
  assert.equal('id' in input, false)
  assert.equal('createdAt' in input, false)
  draft.nutrients.fat = ''
  assert.equal(toCatalogInput(draft).nutrients.fat, null)
  draft.amount = '1e-31'
  assert.throws(() => toCatalogInput(draft), /30 casas decimais/)
})

test('alteração de referência USDA abaixo da precisão de Number ainda exige revisão', () => {
  const draft = importFood('', {
    fdcId: 123, source: 'USDA FoodData Central', name: 'Original', brand: null, brandOwner: null, dataType: null,
    reference: { quantity: 100, unit: 'g' }, nutrients: { energyKcal: 100, energyNutrientId: 1008, proteinG: null, carbohydrateG: 20, fatG: 0 },
  })
  draft.amount = record.amount
  assert.throws(() => toCatalogInput(draft), /confirme a revisão/)
  draft.usda!.referenceReviewed = true
  assert.equal(toCatalogInput(draft).amount, record.amount)
})

test('HTTP pagina, envia POST/PUT apenas ao salvar e usa registro retornado pelo servidor', async () => {
  const calls: { url: string; options?: RequestInit }[] = []
  const api = createCatalogApi({ fetchImpl: async (url, options) => {
    calls.push({ url: String(url), options })
    return Response.json(options?.method ? { ...record, name: 'Nome do servidor' }
      : { items: [record], page: 2, pageSize: 20, totalItems: 21, totalPages: 2 })
  } })
  const page = await api.list(2, new AbortController().signal)
  assert.equal(page.items[0].id, record.id)
  assert.match(calls[0].url, /page=2&pageSize=20/)
  const input = toCatalogInput(toFoodDraft(record))
  assert.equal((await api.save(input)).name, 'Nome do servidor')
  await api.save(input, record.id)
  assert.equal(calls[1].options?.method, 'POST')
  assert.equal(calls[2].options?.method, 'PUT')
  const body = JSON.parse(calls[1].options!.body as string)
  assert.equal(body.amount, record.amount)
  assert.equal(body.brand, null)
  assert.equal(body.nutrients.fat, '0')
  assert.equal(body.nutrients.protein, null)
})

test('falhas de listagem/salvamento, respostas inválidas e cancelamento não viram sucesso', async () => {
  const draft = toFoodDraft(record)
  const before = structuredClone(draft)
  const api = createCatalogApi({ fetchImpl: async () => Response.json({ error: { code: 'CATALOG_UNAVAILABLE', message: 'private password' } }, { status: 503 }) })
  await assert.rejects(api.list(1, new AbortController().signal), /Não foi possível acessar/)
  await assert.rejects(api.save(toCatalogInput(draft)), error => error instanceof Error && !error.message.includes('private'))
  assert.deepEqual(draft, before)
  for (const payload of [{}, { ...record, nutrients: { ...record.nutrients, fat: 0 } }]) {
    const invalid = createCatalogApi({ fetchImpl: async () => Response.json(payload) })
    await assert.rejects(invalid.save(toCatalogInput(draft)), /resposta do catálogo/)
  }
  const controller = new AbortController()
  const cancelled = createCatalogApi({ fetchImpl: async () => { controller.abort(); throw new Error() } })
  await assert.rejects(cancelled.list(1, controller.signal), { name: 'AbortError' })
})

test('editar registro persistido não modifica cópias nutricionais nas refeições', () => {
  const catalog = structuredClone(record)
  const mealFood = includeCatalogFood(catalog, 'meal-food')
  const snapshot = structuredClone(mealFood)
  const before = calculateFoodNutrients(mealFood)
  catalog.amount = '1'
  catalog.nutrients.kcal = '999'
  catalog.name = 'Nome alterado'
  assert.deepEqual(mealFood, snapshot)
  assert.deepEqual(calculateFoodNutrients(mealFood), before)
  assert.equal(mealFood.snapshot!.catalogId, record.id)
})
