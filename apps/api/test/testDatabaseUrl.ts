// A suíte de integração nunca assume DATABASE_URL como destino de testes.
export function testDatabaseUrl(env: NodeJS.ProcessEnv): string {
  try {
    const raw = env.TEST_DATABASE_URL
    if (!raw) throw new Error()
    const test = new URL(raw)
    if (!['postgres:', 'postgresql:'].includes(test.protocol) || !/^\/projeto_catalog_test$/.test(test.pathname)) throw new Error()
    if (env.DATABASE_URL) {
      const development = new URL(env.DATABASE_URL)
      const host = (url: URL) => url.searchParams.get('host') || (['localhost', '127.0.0.1', '::1'].includes(url.hostname) ? 'local' : url.hostname)
      if (host(test) === host(development) && (test.port || '5432') === (development.port || '5432') && test.pathname === development.pathname) throw new Error()
    }
    return raw
  } catch { throw new Error('Configure TEST_DATABASE_URL para o banco exclusivo projeto_catalog_test, diferente do banco de desenvolvimento. Nenhum dado foi alterado.') }
}
