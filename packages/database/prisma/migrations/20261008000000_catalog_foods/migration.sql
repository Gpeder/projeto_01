-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "CatalogFood" (
    "id" UUID NOT NULL,
    "name" VARCHAR(1000) NOT NULL,
    "brand" VARCHAR(300),
    "preparation" VARCHAR(300),
    "amount" DECIMAL(65,30) NOT NULL,
    "unit" VARCHAR(10) NOT NULL,
    "kcal" DECIMAL(65,30),
    "protein" DECIMAL(65,30),
    "carbs" DECIMAL(65,30),
    "fat" DECIMAL(65,30),
    "source" VARCHAR(6) NOT NULL,
    "fdcId" BIGINT,
    "original" JSONB,
    "manuallyEdited" BOOLEAN NOT NULL DEFAULT false,
    "modifiedFields" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "referenceReviewed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "CatalogFood_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "CatalogFood_amount_check" CHECK ("amount" > 0),
    CONSTRAINT "CatalogFood_nutrients_check" CHECK ("kcal" >= 0 AND "protein" >= 0 AND "carbs" >= 0 AND "fat" >= 0),
    CONSTRAINT "CatalogFood_unit_check" CHECK ("unit" IN ('g', 'ml', 'unidade', 'fatia', 'porção')),
    CONSTRAINT "CatalogFood_source_check" CHECK (
      ("source" = 'manual' AND "fdcId" IS NULL AND "original" IS NULL AND NOT "manuallyEdited" AND NOT "referenceReviewed" AND cardinality("modifiedFields") = 0)
      OR ("source" = 'usda' AND "fdcId" > 0 AND "original" IS NOT NULL)
    ),
    CONSTRAINT "CatalogFood_original_size_check" CHECK (octet_length("original"::text) <= 32768)
);

-- CreateIndex
CREATE INDEX "CatalogFood_createdAt_id_idx" ON "CatalogFood"("createdAt" DESC, "id" DESC);
