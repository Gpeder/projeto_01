import assert from 'node:assert/strict'
import { test } from 'node:test'
import { publicError } from '../src/errors.js'
import { createUsdaClient } from '../src/usda/client.js'

test('busca pagina com limite fixo e envia a credencial apenas no header', async () => {
  let calls = 0
  const client = createUsdaClient({
    apiKey: 'test-only',
    fetchImpl: async (input, init) => {
      calls++
      const url = new URL(String(input))
      assert.equal(url.origin, 'https://api.nal.usda.gov')
      assert.equal(url.pathname, '/fdc/v1/foods/search')
      assert.equal(url.searchParams.get('query'), 'rice & beans')
      assert.equal(url.searchParams.get('pageNumber'), '2')
      assert.equal(url.searchParams.get('pageSize'), '20')
      assert.equal(url.searchParams.has('api_key'), false)
      assert.equal(new Headers(init?.headers).get('X-Api-Key'), 'test-only')
      assert.equal(init?.redirect, 'error')
      return Response.json({ foods: [] })
    },
  })
  assert.deepEqual(await client.searchFoods('rice & beans', 2), { foods: [] })
  assert.equal(calls, 1)
})

test('detalhes solicitam o formato completo', async () => {
  const client = createUsdaClient({
    apiKey: 'test-only',
    fetchImpl: async (input) => {
      const url = new URL(String(input))
      assert.equal(url.pathname, '/fdc/v1/food/123')
      assert.equal(url.searchParams.get('format'), 'full')
      return Response.json({ fdcId: 123 })
    },
  })
  assert.deepEqual(await client.getFood(123), { fdcId: 123 })
})

test('erros externos são sanitizados e não causam novas tentativas', async () => {
  for (const [status, code] of [[400, 'INVALID_INPUT'], [404, 'FOOD_NOT_FOUND'], [429, 'USDA_RATE_LIMIT'], [403, 'USDA_UNAVAILABLE'], [500, 'USDA_UNAVAILABLE']] as const) {
    let calls = 0
    const client = createUsdaClient({
      apiKey: 'test-only',
      fetchImpl: async () => {
        calls++
        return new Response('sensitive upstream response', { status })
      },
    })
    await assert.rejects(client.getFood(123), (error: unknown) => {
      assert.equal(publicError(error).body.error.code, code)
      assert.equal(JSON.stringify(publicError(error)).includes('sensitive'), false)
      return true
    })
    assert.equal(calls, 1)
  }
})

test('falha de rede e JSON inválido têm respostas controladas', async () => {
  const failed = createUsdaClient({ apiKey: 'test-only', fetchImpl: async () => { throw new Error('secret') } })
  await assert.rejects(failed.getFood(123), (error: unknown) => publicError(error).body.error.code === 'USDA_UNAVAILABLE')
  const malformed = createUsdaClient({ apiKey: 'test-only', fetchImpl: async () => new Response('not json') })
  await assert.rejects(malformed.getFood(123), (error: unknown) => publicError(error).body.error.code === 'USDA_INVALID_RESPONSE')
})

test('timeout interrompe a chamada externa', async () => {
  const keepAlive = setTimeout(() => undefined, 1000)
  try {
    const client = createUsdaClient({
      apiKey: 'test-only',
      timeoutMs: 10,
      fetchImpl: async (_input, init) => new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => reject(new Error('aborted')), { once: true })
      }),
    })
    await assert.rejects(client.getFood(123), (error: unknown) => publicError(error).body.error.code === 'USDA_TIMEOUT')
  } finally {
    clearTimeout(keepAlive)
  }
})
