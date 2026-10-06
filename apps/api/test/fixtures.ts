import { readFileSync } from 'node:fs'

type Sample = { search: Record<string, unknown>; detail: Record<string, unknown> }

export const { samples } = JSON.parse(
  readFileSync(new URL('./fixtures/usda-foods.json', import.meta.url), 'utf8'),
) as { samples: Record<'foundation' | 'sr' | 'survey' | 'branded', Sample> }
