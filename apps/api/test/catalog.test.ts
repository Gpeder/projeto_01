import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { test } from 'node:test'
import { buildApp } from '../src/app.js'
import { createCatalogService } from '../src/catalog/service.js'
import { manual, imported, memoryRepository, noUsda } from './catalog.fixtures.js'

test('cria e edita manual, mantém precisão, null e zero e gera ID no servidor', async t => {
  const app = buildApp(noUsda, createCatalogService(memoryRepository()))
  t.after(() => app.close())
  const response = await app.inject({ method: 'POST', url: '/catalog/foods', payload: { ...manual, name: '  Manual  ' } })
  assert.equal(response.statusCode, 201)
  const record = response.json()
  assert.match(record.id, /^[\da-f-]{36}$/)
  assert.equal(record.name, 'Manual')
  assert.deepEqual(record.nutrients, manual.nutrients)
  assert.equal(record.fdcId, null)
  const edited = await app.inject({ method: 'PUT', url: `/catalog/foods/${record.id}`, payload: { ...manual, name: 'Editado', amount: '1.25e2' } })
  assert.equal(edited.statusCode, 200)
  assert.equal(edited.json().amount, '125')
  assert.equal(edited.json().id, record.id)
  assert.equal(edited.json().createdAt, record.createdAt)
})

test('preserva original USDA, deriva campos editados e exige revisão da referência', async t => {
  const app = buildApp(noUsda, createCatalogService(memoryRepository()))
  t.after(() => app.close())
  const payload = structuredClone(imported)
  payload.amount = '100.000000000000000000000000000001'
  const denied = await app.inject({ method: 'POST', url: '/catalog/foods', payload })
  assert.equal(denied.statusCode, 400)
  assert.equal(denied.json().error.code, 'CATALOG_REVIEW_REQUIRED')
  payload.usda!.referenceReviewed = true
  payload.nutrients.carbs = '0'
  const response = await app.inject({ method: 'POST', url: '/catalog/foods', payload })
  assert.equal(response.statusCode, 201)
  const saved = response.json()
  assert.deepEqual(saved.usda.original, imported.usda!.original)
  assert.deepEqual(saved.usda.modifiedFields, ['amount', 'carbs'])
  assert.equal(saved.usda.manuallyEdited, true)
  assert.equal(saved.usda.referenceReviewed, true)
  const edited = await app.inject({ method: 'PUT', url: `/catalog/foods/${saved.id}`, payload: { ...payload, name: 'Personalizado' } })
  assert.equal(edited.statusCode, 200)
  assert.deepEqual(edited.json().usda.original, imported.usda!.original)
  const duplicateFdc = await app.inject({ method: 'POST', url: '/catalog/foods', payload: imported })
  assert.equal(duplicateFdc.statusCode, 201)
  assert.notEqual(duplicateFdc.json().id, saved.id)
})

test('rejeita entradas inválidas, limites, origem incoerente e nutrientes não finitos', async t => {
  const app = buildApp(noUsda, createCatalogService(memoryRepository()))
  t.after(() => app.close())
  for (const patch of [
    { name: '' }, { name: ' ' }, { name: 'x'.repeat(1001) }, { brand: 'x'.repeat(301) }, { preparation: 'x'.repeat(301) },
    { amount: '0' }, { amount: '-1' }, { amount: 'Infinity' }, { amount: 'NaN' }, { amount: 100 }, { amount: '1e35' }, { amount: '1e-31' },
    { unit: 'kg' }, { source: 'usda' }, { usda: imported.usda }, { id: randomUUID() },
    { nutrients: { ...manual.nutrients, fat: '-1' } }, { nutrients: { ...manual.nutrients, fat: '' } },
    { nutrients: { ...manual.nutrients, protein: '1e999' } }, { nutrients: {} },
  ]) {
    const response = await app.inject({ method: 'POST', url: '/catalog/foods', payload: { ...manual, ...patch } })
    assert.equal(response.statusCode, 400, JSON.stringify(patch))
  }
  const badOriginal = structuredClone(imported)
  badOriginal.usda!.original.nutrients.energyKcal = -1
  assert.equal((await app.inject({ method: 'POST', url: '/catalog/foods', payload: badOriginal })).statusCode, 400)
  const overflow = JSON.stringify(imported).replace('"energyKcal":100', '"energyKcal":1e999')
  assert.equal((await app.inject({ method: 'POST', url: '/catalog/foods', headers: { 'content-type': 'application/json' }, payload: overflow })).statusCode, 400)
  const extra = { ...imported, usda: { ...imported.usda, original: { ...imported.usda!.original, rawResponse: 'não salvar' } } }
  assert.equal((await app.inject({ method: 'POST', url: '/catalog/foods', payload: extra })).statusCode, 400)
})

test('lista paginada, vazia e 404 têm contratos distintos; limites são obrigatórios', async t => {
  const app = buildApp(noUsda, createCatalogService(memoryRepository()))
  t.after(() => app.close())
  assert.deepEqual((await app.inject('/catalog/foods')).json(), { items: [], page: 1, pageSize: 20, totalItems: 0, totalPages: 0 })
  for (let i = 0; i < 3; i++) await app.inject({ method: 'POST', url: '/catalog/foods', payload: { ...manual, name: String(i) } })
  const first = (await app.inject('/catalog/foods?pageSize=2')).json()
  const second = (await app.inject('/catalog/foods?page=2&pageSize=2')).json()
  assert.equal(first.items.length, 2)
  assert.equal(second.items.length, 1)
  assert.equal(first.totalItems, 3)
  assert.equal(new Set([...first.items, ...second.items].map(item => item.id)).size, 3)
  assert.deepEqual((await app.inject('/catalog/foods?pageSize=2')).json(), first)
  for (const query of ['page=0', 'pageSize=51', 'page=1.5', 'pageSize=0', 'page=1000000', 'extra=1']) {
    assert.equal((await app.inject(`/catalog/foods?${query}`)).statusCode, 400)
  }
  const missing = await app.inject({ method: 'PUT', url: `/catalog/foods/${randomUUID()}`, payload: manual })
  assert.equal(missing.statusCode, 404)
  assert.equal(missing.json().error.code, 'CATALOG_NOT_FOUND')
})

test('indisponibilidade do banco não vira catálogo vazio e não expõe detalhes', async t => {
  const repository = memoryRepository()
  repository.list = async () => { throw new Error('postgresql://private:secret@db') }
  const app = buildApp(noUsda, createCatalogService(repository))
  t.after(() => app.close())
  const response = await app.inject('/catalog/foods')
  assert.equal(response.statusCode, 503)
  assert.equal(response.json().error.code, 'CATALOG_UNAVAILABLE')
  assert.equal(response.body.includes('secret'), false)
  assert.equal(response.json().items, undefined)
})
