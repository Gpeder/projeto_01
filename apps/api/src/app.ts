import Fastify from 'fastify'
import { apiError, publicError } from './errors.js'
import { registerFoodRoutes } from './foods/routes.js'
import { createFoodService } from './foods/service.js'
import type { UsdaClient } from './usda/client.js'

export function buildApp(client: UsdaClient) {
  const app = Fastify({
    logger: false,
    ajv: { customOptions: { removeAdditional: false, coerceTypes: false } },
  })

  app.setErrorHandler((error, _request, reply) => {
    const invalidInput = error instanceof Error && 'validation' in error
    const result = publicError(invalidInput ? apiError('INVALID_INPUT') : error)
    return reply.code(result.status).send(result.body)
  })

  app.setNotFoundHandler((_request, reply) => {
    const result = publicError(apiError('ROUTE_NOT_FOUND'))
    return reply.code(result.status).send(result.body)
  })

  registerFoodRoutes(app, createFoodService(client))
  return app
}
