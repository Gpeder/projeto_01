const nullableNumber = { type: ['number', 'null'], minimum: 0 } as const
const nullableString = { type: ['string', 'null'] } as const

const food = {
  type: 'object',
  additionalProperties: false,
  required: ['fdcId', 'source', 'dataType', 'name', 'brand', 'brandOwner', 'reference', 'nutrients'],
  properties: {
    fdcId: { type: 'integer' },
    source: { type: 'string', const: 'USDA FoodData Central' },
    dataType: nullableString,
    name: { type: 'string' },
    brand: nullableString,
    brandOwner: nullableString,
    reference: {
      type: 'object', additionalProperties: false, required: ['quantity', 'unit'],
      properties: { quantity: nullableNumber, unit: { enum: ['g', 'ml', null] } },
    },
    nutrients: {
      type: 'object', additionalProperties: false,
      required: ['energyKcal', 'energyNutrientId', 'proteinG', 'carbohydrateG', 'fatG'],
      properties: {
        energyKcal: nullableNumber,
        energyNutrientId: { type: ['integer', 'null'] },
        proteinG: nullableNumber,
        carbohydrateG: nullableNumber,
        fatG: nullableNumber,
      },
    },
  },
} as const

export const searchSchema = {
  querystring: {
    type: 'object', additionalProperties: false, required: ['query'],
    properties: {
      query: { type: 'string', minLength: 1, maxLength: 200, pattern: '\\S' },
      page: { type: 'string', pattern: '^[1-9][0-9]{0,5}$', default: '1' },
    },
  },
  response: {
    200: {
      type: 'object', additionalProperties: false,
      required: ['items', 'page', 'pageSize', 'totalItems', 'totalPages'],
      properties: {
        items: { type: 'array', maxItems: 20, items: food },
        page: { type: 'integer' },
        pageSize: { type: 'integer' },
        totalItems: { type: 'integer' },
        totalPages: { type: 'integer' },
      },
    },
  },
} as const

export const detailsSchema = {
  params: {
    type: 'object', additionalProperties: false, required: ['id'],
    properties: { id: { type: 'string', pattern: '^[1-9][0-9]*$', maxLength: 16 } },
  },
  response: { 200: food },
} as const
