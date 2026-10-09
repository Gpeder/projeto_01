import { Prisma, type PrismaClient, type CatalogFood } from '@projeto/database'
import type { CatalogInput, CatalogRecord } from './types.js'

function toRecord(food: CatalogFood): CatalogRecord {
  const base: CatalogRecord = {
    id: food.id, name: food.name, brand: food.brand, preparation: food.preparation,
    amount: food.amount.toFixed(), unit: food.unit as CatalogInput['unit'],
    nutrients: { kcal: food.kcal?.toFixed() ?? null, protein: food.protein?.toFixed() ?? null, carbs: food.carbs?.toFixed() ?? null, fat: food.fat?.toFixed() ?? null },
    source: food.source as CatalogInput['source'], fdcId: food.fdcId === null ? null : Number(food.fdcId),
    createdAt: food.createdAt.toISOString(), updatedAt: food.updatedAt.toISOString(),
  }
  if (food.source === 'usda') base.usda = {
    original: food.original as unknown as NonNullable<CatalogInput['usda']>['original'],
    manuallyEdited: food.manuallyEdited, modifiedFields: food.modifiedFields, referenceReviewed: food.referenceReviewed,
  }
  return base
}

function toData(input: CatalogInput) {
  return {
    name: input.name, brand: input.brand, preparation: input.preparation,
    amount: input.amount, unit: input.unit, ...input.nutrients, source: input.source,
    fdcId: input.usda ? BigInt(input.usda.original.fdcId) : null,
    original: input.usda ? input.usda.original as Prisma.InputJsonValue : Prisma.DbNull,
    manuallyEdited: input.usda?.manuallyEdited ?? false,
    modifiedFields: input.usda?.modifiedFields ?? [], referenceReviewed: input.usda?.referenceReviewed ?? false,
  }
}

export function createCatalogRepository(db: PrismaClient) {
  return {
    async list(page: number, pageSize: number) {
      const [items, totalItems] = await db.$transaction([
        db.catalogFood.findMany({ skip: (page - 1) * pageSize, take: pageSize, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }] }),
        db.catalogFood.count(),
      ], { isolationLevel: 'RepeatableRead' })
      return { items: items.map(toRecord), page, pageSize, totalItems, totalPages: Math.ceil(totalItems / pageSize) }
    },
    async create(input: CatalogInput) { return toRecord(await db.catalogFood.create({ data: toData(input) })) },
    async update(id: string, input: CatalogInput) {
      try { return toRecord(await db.catalogFood.update({ where: { id }, data: toData(input) })) }
      catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') return null
        throw error
      }
    },
  }
}
export type CatalogRepository = ReturnType<typeof createCatalogRepository>
