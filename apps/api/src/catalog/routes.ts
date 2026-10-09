import type { FastifyInstance } from 'fastify'
import { createCatalogController } from './controller.js'
import { inputSchema, listSchema, paramsSchema, recordSchema } from './schema.js'
import type { CatalogService } from './service.js'
import type { CatalogInput, CatalogQuery } from './types.js'

export function registerCatalogRoutes(app: FastifyInstance, service: CatalogService) {
  const controller = createCatalogController(service)
  app.get<{ Querystring: CatalogQuery }>('/catalog/foods', { schema: listSchema }, controller.list)
  app.post<{ Body: CatalogInput }>('/catalog/foods', { bodyLimit: 64 * 1024, schema: { body: inputSchema, response: { 201: recordSchema } } }, controller.create)
  app.put<{ Body: CatalogInput; Params: { id: string } }>('/catalog/foods/:id', {
    bodyLimit: 64 * 1024, schema: { params: paramsSchema, body: inputSchema, response: { 200: recordSchema } },
  }, controller.update)
}
