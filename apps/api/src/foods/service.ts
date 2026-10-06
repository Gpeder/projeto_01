import { apiError } from '../errors.js'
import { PAGE_SIZE } from '../usda/client.js'
import type { UsdaClient } from '../usda/client.js'
import { isRecord, normalizeFood } from './normalize.js'
import type { Food, FoodSearch } from './types.js'

export function createFoodService(client: UsdaClient) {
  return {
    async search(query: string, page: number): Promise<FoodSearch> {
      const payload = await client.searchFoods(query, page)
      if (!isRecord(payload) || !Array.isArray(payload.foods)
        || !Number.isSafeInteger(payload.totalHits) || Number(payload.totalHits) < 0
        || !Number.isSafeInteger(payload.totalPages) || Number(payload.totalPages) < 0) {
        throw apiError('USDA_INVALID_RESPONSE')
      }
      return {
        items: payload.foods.slice(0, PAGE_SIZE).map((food) => normalizeFood(food, 'search')),
        page,
        pageSize: PAGE_SIZE,
        totalItems: Number(payload.totalHits),
        totalPages: Number(payload.totalPages),
      }
    },
    async getById(id: number): Promise<Food> {
      const food = normalizeFood(await client.getFood(id), 'detail')
      if (food.fdcId !== id) throw apiError('USDA_INVALID_RESPONSE')
      return food
    },
  }
}

export type FoodService = ReturnType<typeof createFoodService>
