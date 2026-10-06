import assert from 'node:assert/strict'
import { buildApp } from '../src/app.js'
import { loadConfig } from '../src/config.js'
import type { Food, FoodSearch } from '../src/foods/types.js'
import { createUsdaClient } from '../src/usda/client.js'

let config
try {
  config = loadConfig()
} catch {
  console.error('Validação real bloqueada: configure USDA_API_KEY em apps/api/.env e confira PORT.')
  process.exit(1)
}

const app = buildApp(createUsdaClient({ apiKey: config.usdaApiKey }))
try {
  const searchResponse = await app.inject('/foods?query=rice%20cooked&page=1')
  assert.equal(searchResponse.statusCode, 200)
  const search = searchResponse.json<FoodSearch>()
  assert.equal(search.page, 1)
  assert.ok(search.items.length > 0 && search.items.length <= 20)
  const first = search.items[0]
  assert.ok(first)
  const detailResponse = await app.inject(`/foods/${first.fdcId}`)
  assert.equal(detailResponse.statusCode, 200)
  const detail = detailResponse.json<Food>()
  assert.equal(detail.fdcId, first.fdcId)
  assert.equal(detail.source, 'USDA FoodData Central')
  console.log(`USDA real: busca OK (${search.items.length} resultados); detalhes OK (FDC ${detail.fdcId}).`)
} catch {
  console.error('A validação real não passou. Confira a configuração, a conectividade e a disponibilidade da USDA.')
  process.exitCode = 1
} finally {
  await app.close()
}
