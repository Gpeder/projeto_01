const decimal = { type: 'string', minLength: 1, maxLength: 80, pattern: '^\\+?(?:[0-9]+(?:\\.[0-9]*)?|\\.[0-9]+)(?:[eE][+-]?[0-9]{1,3})?$' } as const
const nullableDecimal = { anyOf: [decimal, { type: 'null' }] } as const
const text = (maxLength: number) => ({ type: ['string', 'null'], maxLength })
const originalNumber = { type: ['number', 'null'], minimum: 0 } as const
const original = {
  type: 'object', additionalProperties: false,
  required: ['fdcId', 'source', 'dataType', 'name', 'brand', 'brandOwner', 'reference', 'nutrients'],
  properties: {
    fdcId: { type: 'integer', minimum: 1, maximum: Number.MAX_SAFE_INTEGER },
    source: { const: 'USDA FoodData Central' },
    name: { type: 'string', minLength: 1, maxLength: 1000, pattern: '\\S' },
    dataType: text(100), brand: text(300), brandOwner: text(300),
    reference: { type: 'object', additionalProperties: false, required: ['quantity', 'unit'], properties: {
      quantity: originalNumber, unit: { enum: ['g', 'ml', null] },
    } },
    nutrients: { type: 'object', additionalProperties: false,
      required: ['energyKcal', 'energyNutrientId', 'proteinG', 'carbohydrateG', 'fatG'],
      properties: {
        energyKcal: originalNumber, proteinG: originalNumber, carbohydrateG: originalNumber, fatG: originalNumber,
        energyNutrientId: { type: ['integer', 'null'], minimum: 1, maximum: Number.MAX_SAFE_INTEGER },
      },
    },
  },
} as const
const properties = {
  name: { type: 'string', minLength: 1, maxLength: 1000, pattern: '\\S' },
  brand: text(300), preparation: text(300), amount: decimal,
  unit: { enum: ['g', 'ml', 'unidade', 'fatia', 'porção'] },
  nutrients: { type: 'object', additionalProperties: false, required: ['kcal', 'protein', 'carbs', 'fat'],
    properties: { kcal: nullableDecimal, protein: nullableDecimal, carbs: nullableDecimal, fat: nullableDecimal } },
  source: { enum: ['manual', 'usda'] },
  usda: { type: 'object', additionalProperties: false,
    required: ['original', 'manuallyEdited', 'modifiedFields', 'referenceReviewed'],
    properties: {
      original, manuallyEdited: { type: 'boolean' }, referenceReviewed: { type: 'boolean' },
      modifiedFields: { type: 'array', maxItems: 9, uniqueItems: true, items: { enum: ['name', 'brand', 'preparation', 'amount', 'unit', 'kcal', 'protein', 'carbs', 'fat'] } },
    } },
} as const
export const inputSchema = {
  type: 'object', additionalProperties: false,
  required: ['name', 'brand', 'preparation', 'amount', 'unit', 'nutrients', 'source'], properties,
} as const
export const recordSchema = {
  ...inputSchema,
  required: [...inputSchema.required, 'id', 'fdcId', 'createdAt', 'updatedAt'],
  properties: { ...properties, id: { type: 'string' }, fdcId: { type: ['integer', 'null'] }, createdAt: { type: 'string' }, updatedAt: { type: 'string' } },
} as const
export const paramsSchema = {
  type: 'object', additionalProperties: false, required: ['id'],
  properties: { id: { type: 'string', pattern: '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' } },
} as const
export const listSchema = {
  querystring: { type: 'object', additionalProperties: false, properties: {
    page: { type: 'string', pattern: '^[1-9][0-9]{0,5}$', default: '1' },
    pageSize: { type: 'string', pattern: '^(?:[1-9]|[1-4][0-9]|50)$', default: '20' },
  } },
  response: { 200: { type: 'object', additionalProperties: false,
    required: ['items', 'page', 'pageSize', 'totalItems', 'totalPages'],
    properties: { items: { type: 'array', maxItems: 50, items: recordSchema }, page: { type: 'integer' }, pageSize: { type: 'integer' }, totalItems: { type: 'integer' }, totalPages: { type: 'integer' } },
  } },
} as const
