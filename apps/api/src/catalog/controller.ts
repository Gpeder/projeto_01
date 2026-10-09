import type { FastifyReply, FastifyRequest } from 'fastify'
import type { CatalogService } from './service.js'
import type { CatalogInput, CatalogQuery } from './types.js'

export function createCatalogController(service: CatalogService) {
  return {
    list: (request: FastifyRequest<{ Querystring: CatalogQuery }>, reply: FastifyReply) =>
      service.list(Number(request.query.page), Number(request.query.pageSize)).then((data) => reply.send(data)),
    create: (request: FastifyRequest<{ Body: CatalogInput }>, reply: FastifyReply) =>
      service.create(request.body).then((data) => reply.code(201).send(data)),
    update: (request: FastifyRequest<{ Body: CatalogInput; Params: { id: string } }>, reply: FastifyReply) =>
      service.update(request.params.id, request.body).then((data) => reply.send(data)),
  }
}
