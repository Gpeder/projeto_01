import type { FastifyReply, FastifyRequest } from 'fastify'
import { apiError } from '../errors.js'
import type { FoodService } from './service.js'
import type { FoodParams, SearchQuery } from './types.js'

export function createFoodController(service: FoodService) {
  return {
    async search(request: FastifyRequest<{ Querystring: SearchQuery }>, reply: FastifyReply) {
      return reply.send(await service.search(request.query.query.trim(), Number(request.query.page)))
    },
    async details(request: FastifyRequest<{ Params: FoodParams }>, reply: FastifyReply) {
      const id = Number(request.params.id)
      if (!Number.isSafeInteger(id)) throw apiError('INVALID_INPUT')
      return reply.send(await service.getById(id))
    },
  }
}
