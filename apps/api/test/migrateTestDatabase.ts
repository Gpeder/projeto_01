import { spawnSync } from 'node:child_process'
import { loadEnvFile } from 'node:process'
import { fileURLToPath } from 'node:url'
import { testDatabaseUrl } from './testDatabaseUrl.js'

try {
  try { loadEnvFile(fileURLToPath(new URL('../.env', import.meta.url))) } catch (error) {
    if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) throw new Error('Não foi possível carregar a configuração local.')
  }
  const url = testDatabaseUrl(process.env)
  const result = spawnSync('pnpm', ['--filter', '@projeto/database', 'migrate'], {
    cwd: fileURLToPath(new URL('../../../', import.meta.url)),
    env: { ...process.env, DATABASE_URL: url }, encoding: 'utf8',
  })
  if (result.status !== 0) throw new Error('Não foi possível aplicar migrations no banco de testes. Confira o servidor, as permissões e TEST_DATABASE_URL.')
  console.log('Migrations aplicadas somente no banco exclusivo de testes.')
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Falha na preparação do banco exclusivo de testes.')
  process.exitCode = 1
}
