import type { FastifyInstance } from 'fastify'
import { createFoodController } from './controller.js'
import { detailsSchema, searchSchema } from './schema.js'
import type { FoodService } from './service.js'
import type { FoodParams, SearchQuery } from './types.js'

export function registerFoodRoutes(app: FastifyInstance, service: FoodService) {
  const controller = createFoodController(service)
  app.get<{ Querystring: SearchQuery }>('/foods', { schema: searchSchema }, controller.search)
  app.get<{ Params: FoodParams }>('/foods/:id', { schema: detailsSchema }, controller.details)
}
