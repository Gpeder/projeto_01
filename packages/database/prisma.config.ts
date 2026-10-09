import { loadEnvFile } from 'node:process'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'prisma/config'

try {
  loadEnvFile(fileURLToPath(new URL('../../apps/api/.env', import.meta.url)))
} catch (error) {
  if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) {
    throw new Error('Não foi possível carregar a configuração do banco em apps/api/.env.')
  }
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  // generate/build não exigem banco; migrate deploy exige DATABASE_URL.
  datasource: { url: process.env.DATABASE_URL ?? '' },
})
