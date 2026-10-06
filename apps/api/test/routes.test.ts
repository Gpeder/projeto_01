import assert from 'node:assert/strict'
import { test } from 'node:test'
import { buildApp } from '../src/app.js'
import { createUsdaClient } from '../src/usda/client.js'
import { samples } from './fixtures.js'

test('entradas inválidas são rejeitadas antes de chamar a USDA', async (t) => {
  let calls = 0
  const app = buildApp(createUsdaClient({ apiKey: 'test-only', fetchImpl: async () => { calls++; return Response.json({}) } }))
  t.after(() => app.close())
  for (const url of ['/foods', '/foods?query=', '/foods?query=%20%20', '/foods?query=rice&page=0', '/foods?query=rice&page=-1', '/foods?query=rice&page=1.5', '/foods?query=rice&page=1e2', '/foods?query=rice&page=1000000', '/foods?query=a&query=b', '/foods?query=rice&extra=value', `/foods?query=${'a'.repeat(201)}`, '/foods/abc', '/foods/0', '/foods/1.5', '/foods/9007199254740992']) {
    const response = await app.inject({ method: 'GET', url })
    assert.equal(response.statusCode, 400, url)
    assert.equal(response.json().error.code, 'INVALID_INPUT', url)
  }
  assert.equal(calls, 0)
})

test('busca retorna contrato próprio, paginação e no máximo 20 resultados', async (t) => {
  let requestUrl = ''
  const app = buildApp(createUsdaClient({ apiKey: 'test-only', fetchImpl: async (url) => {
    requestUrl = String(url)
    return Response.json({ foods: Array(25).fill({ ...samples.sr.search, internalField: 'hidden' }), totalHits: 25, totalPages: 2, internalField: 'hidden' })
  } }))
  t.after(() => app.close())
  const response = await app.inject('/foods?query=%20rice%20&page=2')
  assert.equal(response.statusCode, 200)
  const body = response.json()
  assert.equal(body.items.length, 20)
  assert.equal(body.page, 2)
  assert.equal(body.pageSize, 20)
  assert.equal(body.totalItems, 25)
  assert.equal(body.totalPages, 2)
  assert.equal(body.items[0].name, 'Rice noodles, cooked')
  assert.equal(response.body.includes('hidden'), false)
  assert.equal(response.body.includes('foodNutrients'), false)
  assert.equal(new URL(requestUrl).searchParams.get('query'), 'rice')
})

test('busca vazia é sucesso com página padrão 1', async (t) => {
  const app = buildApp(createUsdaClient({ apiKey: 'test-only', fetchImpl: async () => Response.json({ foods: [], totalHits: 0, totalPages: 0 }) }))
  t.after(() => app.close())
  const response = await app.inject('/foods?query=unmatched')
  assert.equal(response.statusCode, 200)
  assert.deepEqual(response.json(), { items: [], page: 1, pageSize: 20, totalItems: 0, totalPages: 0 })
})

test('detalhes retornam alimento normalizado', async (t) => {
  const app = buildApp(createUsdaClient({ apiKey: 'test-only', fetchImpl: async () => Response.json(samples.branded.detail) }))
  t.after(() => app.close())
  const response = await app.inject('/foods/2078244')
  assert.equal(response.statusCode, 200)
  assert.equal(response.json().nutrients.energyKcal, 62)
  assert.deepEqual(response.json().reference, { quantity: 100, unit: 'ml' })
})

test('404, limite e indisponibilidade não expõem a resposta externa', async (t) => {
  for (const [upstream, expected] of [[400, 400], [404, 404], [429, 429], [403, 503], [500, 503]] as const) {
    const app = buildApp(createUsdaClient({ apiKey: 'test-only', fetchImpl: async () => new Response('sensitive test-only', { status: upstream }) }))
    t.after(() => app.close())
    const response = await app.inject('/foods/123')
    assert.equal(response.statusCode, expected)
    assert.equal(response.body.includes('sensitive'), false)
    assert.equal(response.body.includes('test-only'), false)
    assert.deepEqual(Object.keys(response.json()), ['error'])
  }
})

test('payload inválido e ID divergente resultam em 502', async (t) => {
  for (const [url, payload] of [['/foods?query=rice', {}], ['/foods/123', samples.sr.detail]] as const) {
    const app = buildApp(createUsdaClient({ apiKey: 'test-only', fetchImpl: async () => Response.json(payload) }))
    t.after(() => app.close())
    const response = await app.inject(url)
    assert.equal(response.statusCode, 502)
    assert.equal(response.json().error.code, 'USDA_INVALID_RESPONSE')
  }
})

test('falha interna e rota desconhecida têm respostas genéricas', async (t) => {
  const app = buildApp({ searchFoods: async () => { throw new Error('private information') }, getFood: async () => ({}) })
  t.after(() => app.close())
  const response = await app.inject('/foods?query=rice')
  assert.equal(response.statusCode, 500)
  assert.equal(response.body.includes('private'), false)
  const missing = await app.inject('/unknown')
  assert.equal(missing.statusCode, 404)
  assert.equal(missing.json().error.code, 'ROUTE_NOT_FOUND')
})
