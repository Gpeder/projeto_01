import { loadEnvFile } from 'node:process'
import { fileURLToPath } from 'node:url'

export type ApiConfig = {
  usdaApiKey: string
  port: number
}

export function validateConfig(env: NodeJS.ProcessEnv): ApiConfig {
  const usdaApiKey = env.USDA_API_KEY?.trim()
  if (!usdaApiKey || !/^[A-Za-z0-9_-]+$/.test(usdaApiKey)) {
    throw new Error('Configure USDA_API_KEY em apps/api/.env com uma chave válida.')
  }

  const port = env.PORT ?? '3001'
  if (!/^\d+$/.test(port) || Number(port) < 1 || Number(port) > 65535) {
    throw new Error('PORT deve ser um inteiro entre 1 e 65535.')
  }

  return { usdaApiKey, port: Number(port) }
}

export function loadConfig(): ApiConfig {
  try {
    loadEnvFile(fileURLToPath(new URL('../.env', import.meta.url)))
  } catch (error) {
    if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) {
      throw new Error('Não foi possível carregar apps/api/.env.')
    }
  }
  return validateConfig(process.env)
}
