export type Food = {
  fdcId: number
  source: 'USDA FoodData Central'
  dataType: string | null
  name: string
  brand: string | null
  brandOwner: string | null
  reference: { quantity: number | null; unit: 'g' | 'ml' | null }
  nutrients: {
    energyKcal: number | null
    energyNutrientId: number | null
    proteinG: number | null
    carbohydrateG: number | null
    fatG: number | null
  }
}

export type FoodSearch = {
  items: Food[]
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export type SearchQuery = { query: string; page: string }
export type FoodParams = { id: string }
