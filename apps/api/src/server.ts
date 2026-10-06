import { buildApp } from './app.js'
import { loadConfig } from './config.js'
import { createUsdaClient } from './usda/client.js'

let config
try {
  config = loadConfig()
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Configuração inválida.')
  process.exit(1)
}

const app = buildApp(createUsdaClient({ apiKey: config.usdaApiKey }))

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => {
    void app.close().catch(() => {
      console.error('Não foi possível encerrar o servidor.')
      process.exitCode = 1
    })
  })
}

try {
  await app.listen({ host: '127.0.0.1', port: config.port })
  console.log(`Backend de alimentos em http://127.0.0.1:${config.port}`)
} catch {
  console.error('Não foi possível iniciar o backend. Verifique a configuração e a porta.')
  process.exitCode = 1
  await app.close()
}
