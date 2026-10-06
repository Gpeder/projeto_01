import assert from 'node:assert/strict'
import { test } from 'node:test'
import { validateConfig } from '../src/config.js'

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
