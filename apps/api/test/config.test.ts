import assert from 'node:assert/strict'
import { test } from 'node:test'
import { databaseUrl, validateConfig } from '../src/config.js'
import { testDatabaseUrl } from './testDatabaseUrl.js'

test('valida URL sem revelar credenciais e protege o destino dos testes', () => {
  assert.throws(() => databaseUrl({ DATABASE_URL: 'https://secret:private@host' }), /Configure DATABASE_URL/)
  assert.equal(databaseUrl({ DATABASE_URL: 'postgresql://local/db' }), 'postgresql://local/db')
  for (const env of [
    {}, { DATABASE_URL: 'postgresql://local/projeto_catalog_dev' },
    { TEST_DATABASE_URL: 'postgresql://local/projeto_catalog_dev' },
    { DATABASE_URL: 'postgresql://dev:password@localhost/projeto_catalog_test', TEST_DATABASE_URL: 'postgresql://test:other@127.0.0.1:5432/projeto_catalog_test' },
  ]) assert.throws(() => testDatabaseUrl(env), /banco exclusivo/)
  const valid = 'postgresql://local/projeto_catalog_test'
  assert.equal(testDatabaseUrl({ DATABASE_URL: 'postgresql://local/projeto_catalog_dev', TEST_DATABASE_URL: valid }), valid)
})

test('exige a chave e não inclui o valor nos erros', () => {
  for (const value of [undefined, '', ' ', 'invalid secret with spaces']) {
    const env = value === undefined ? {} : { USDA_API_KEY: value }
    assert.throws(() => validateConfig(env), {
      message: 'Configure USDA_API_KEY em apps/api/.env com uma chave válida.',
    })
  }
})

test('valida a porta e fornece um padrão local', () => {
  assert.deepEqual(validateConfig({ USDA_API_KEY: 'test-only' }), { usdaApiKey: 'test-only', port: 3001 })
  for (const port of ['0', '65536', '3.5', '3001secret', '']) {
    assert.throws(() => validateConfig({ USDA_API_KEY: 'test-only', PORT: port }), {
      message: 'PORT deve ser um inteiro entre 1 e 65535.',
    })
  }
})
