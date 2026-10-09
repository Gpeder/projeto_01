import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { loadEnvFile } from 'node:process'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import { createDatabase } from '@projeto/database'
import { buildApp } from '../src/app.js'
import { createCatalogRepository } from '../src/catalog/repository.js'
import { createCatalogService } from '../src/catalog/service.js'
import type { CatalogPage, CatalogRecord } from '../src/catalog/types.js'
import { imported, manual, noUsda } from './catalog.fixtures.js'
import { testDatabaseUrl } from './testDatabaseUrl.js'

try { loadEnvFile(fileURLToPath(new URL('../.env', import.meta.url))) } catch (error) {
  if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) throw new Error('Não foi possível carregar a configuração local de testes.')
}
const connectionString = testDatabaseUrl(process.env)

test('PostgreSQL real: cria, edita, pagina e mantém dados após reabrir backend/client', async () => {
  const open = () => {
    const db = createDatabase(connectionString)
    const app = buildApp(noUsda, createCatalogService(createCatalogRepository(db)))
    app.addHook('onClose', () => db.$disconnect())
    return app
  }
  let app = open()
  try {
    const before = await app.inject('/catalog/foods?pageSize=1')
    assert.equal(before.statusCode, 200, 'Aplique as migrations no banco exclusivo de testes antes de executar esta suíte.')
    const initialCount = before.json<CatalogPage>().totalItems
    const created = await app.inject({ method: 'POST', url: '/catalog/foods', payload: { ...manual, name: `Teste manual ${randomUUID()}` } })
    assert.equal(created.statusCode, 201)
    const food = created.json<CatalogRecord>()
    assert.deepEqual(food.nutrients, manual.nutrients)
    const updated = await app.inject({ method: 'PUT', url: `/catalog/foods/${food.id}`, payload: { ...manual, name: `Editado ${food.id}`, amount: '123.000000000000000000000000000001' } })
    assert.equal(updated.statusCode, 200)
    assert.equal(updated.json<CatalogRecord>().createdAt, food.createdAt)
    for (let i = 0; i < 2; i++) {
      const payload = structuredClone(imported)
      payload.name = `USDA personalizado ${i} ${randomUUID()}`
      payload.amount = '200'
      payload.usda!.referenceReviewed = true
      const response = await app.inject({ method: 'POST', url: '/catalog/foods', payload })
      assert.equal(response.statusCode, 201)
      const record = response.json<CatalogRecord>()
      assert.deepEqual(record.usda?.original, imported.usda!.original)
      assert.equal(record.usda?.referenceReviewed, true)
      assert.deepEqual(record.usda?.modifiedFields, ['name', 'amount'])
      const edit = await app.inject({ method: 'PUT', url: `/catalog/foods/${record.id}`, payload: { ...payload, brand: 'Marca revisada' } })
      assert.equal(edit.statusCode, 200)
      assert.deepEqual(edit.json<CatalogRecord>().usda?.original, imported.usda!.original)
    }
    await app.close()
    app = open()
    const first = (await app.inject('/catalog/foods?page=1&pageSize=2')).json<CatalogPage>()
    const second = (await app.inject('/catalog/foods?page=2&pageSize=2')).json<CatalogPage>()
    assert.equal(first.totalItems, initialCount + 3)
    assert.equal(new Set([...first.items, ...second.items].map(item => item.id)).size, first.items.length + second.items.length)
    const persisted = [...first.items, ...second.items].find(item => item.id === food.id)
    assert.ok(persisted)
    assert.equal(persisted.amount, '123.000000000000000000000000000001')
    assert.deepEqual(persisted.nutrients, manual.nutrients)
    const missing = await app.inject({ method: 'PUT', url: `/catalog/foods/${randomUUID()}`, payload: manual })
    assert.equal(missing.statusCode, 404)
    const invalid = await app.inject({ method: 'POST', url: '/catalog/foods', payload: { ...manual, amount: '1e-31' } })
    assert.equal(invalid.statusCode, 400)
    assert.equal((await app.inject('/catalog/foods')).json<CatalogPage>().totalItems, initialCount + 3)
  } finally { await app.close() }
  // Mantém os registros no banco de testes: nenhum DELETE, TRUNCATE, DROP ou reset.
})
