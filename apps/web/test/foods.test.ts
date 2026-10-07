import assert from 'node:assert/strict'
import test from 'node:test'
import { createFoodApi, FoodApiError } from '../src/api/foods.ts'
import { createLatestRequest } from '../src/api/latestRequest.ts'

test('HTTP usa somente a API interna, codifica query e passa sinal de cancelamento', async () => {
  const controller = new AbortController()
  const api = createFoodApi({ fetchImpl: async (url, options) => {
    assert.equal(String(url), '/api/foods?query=rice+%26+beans&page=2')
    assert.equal(options?.signal?.aborted, false)
    assert.deepEqual(options?.headers, { Accept: 'application/json' })
    return Response.json({ items: [], page: 2, pageSize: 20, totalItems: 0, totalPages: 0 })
  } })
  assert.deepEqual((await api.search('rice & beans', 2, controller.signal)).items, [])
})

test('erros conhecidos têm mensagem em português, sem expor mensagens arbitrárias do servidor', async () => {
  for (const [code, status, text] of [
    ['USDA_RATE_LIMIT', 429, /Limite de consultas/], ['USDA_TIMEOUT', 504, /demorou/],
    ['USDA_UNAVAILABLE', 503, /indisponível/], ['FOOD_NOT_FOUND', 404, /não está mais disponível/],
  ] as const) {
    const api = createFoodApi({ fetchImpl: async () => Response.json({ error: { code, message: 'server internals' } }, { status }) })
    await assert.rejects(api.details(1, new AbortController().signal), (error: unknown) => {
      assert.ok(error instanceof FoodApiError)
      assert.match(error.message, text)
      assert.doesNotMatch(error.message, /server internals/)
      return true
    })
  }
})

test('rede indisponível e resposta inválida não viram resultados vazios', async () => {
  const offline = createFoodApi({ fetchImpl: async () => { throw new TypeError('network') } })
  await assert.rejects(offline.search('rice', 1, new AbortController().signal), /conectar à API/)
  const invalid = createFoodApi({ fetchImpl: async () => Response.json({ items: [{ fdcId: 1 }], page: 1, pageSize: 20, totalItems: 1, totalPages: 1 }) })
  await assert.rejects(invalid.search('rice', 1, new AbortController().signal), /ler os dados/)
})

test('timeout e cancelamento são distinguidos inclusive durante leitura do corpo', async () => {
  const pending: typeof fetch = async (_url, options) => new Response(new ReadableStream({
    start(stream) {
      options?.signal?.addEventListener('abort', () => stream.error(options.signal?.reason), { once: true })
    },
  }))
  const keepAlive = setInterval(() => undefined, 100)
  try {
    const api = createFoodApi({ fetchImpl: pending, timeoutMs: 5 })
    await assert.rejects(api.details(1, new AbortController().signal), /demorou/)
    const controller = new AbortController()
    const promise = createFoodApi({ fetchImpl: pending }).details(1, controller.signal)
    controller.abort()
    await assert.rejects(promise, { name: 'AbortError' })
  } finally { clearInterval(keepAlive) }
})

test('resposta antiga não pode aplicar dados nem finalizar uma requisição mais recente', async () => {
  const requests = createLatestRequest()
  let resolveOld!: () => void
  const oldResponse = new Promise<void>((resolve) => { resolveOld = resolve })
  const old = requests.begin('old')
  const applied: string[] = []
  const oldWork = oldResponse.then(() => { if (old.isCurrent()) applied.push('old'); old.finish() })
  const latest = requests.begin('latest')
  assert.equal(old.signal.aborted, true)
  assert.equal(requests.isPending('latest'), true)
  resolveOld()
  await oldWork
  assert.equal(latest.isCurrent(), true)
  if (latest.isCurrent()) applied.push('latest')
  assert.deepEqual(applied, ['latest'])
  requests.cancel()
  assert.equal(latest.signal.aborted, true)
  assert.equal(latest.isCurrent(), false)
  assert.equal(requests.isPending('latest'), false)
})
