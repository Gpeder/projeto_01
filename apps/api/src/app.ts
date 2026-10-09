import Fastify from 'fastify'
import { apiError, publicError } from './errors.js'
import { registerFoodRoutes } from './foods/routes.js'
import { createFoodService } from './foods/service.js'
import type { UsdaClient } from './usda/client.js'
import { registerCatalogRoutes } from './catalog/routes.js'
import type { CatalogService } from './catalog/service.js'

export function buildApp(client: UsdaClient, catalog?: CatalogService) {
  const app = Fastify({
    logger: false,
    ajv: { customOptions: { removeAdditional: false, coerceTypes: false } },
  })

  app.setErrorHandler((error, request, reply) => {
    const invalidInput = error instanceof Error && 'validation' in error
    const catalogInput = request.url.startsWith('/catalog/') && (invalidInput || (error instanceof Error && 'statusCode' in error && [400, 413, 415].includes(Number(error.statusCode))))
    const result = publicError(catalogInput ? apiError('CATALOG_INVALID_INPUT') : invalidInput ? apiError('INVALID_INPUT') : error)
    return reply.code(result.status).send(result.body)
  })

  app.setNotFoundHandler((_request, reply) => {
    const result = publicError(apiError('ROUTE_NOT_FOUND'))
    return reply.code(result.status).send(result.body)
  })

  registerFoodRoutes(app, createFoodService(client))
  if (catalog) registerCatalogRoutes(app, catalog)
  return app
}
