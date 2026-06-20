import type { Product } from '~/composables/useShop'
import { parseSettingJSON } from '~/composables/useSettings'
import type { RouteLocationRaw } from 'vue-router'

export interface SeasonFilterOption {
  name: string
  keyword: string
}

export interface HomeSeasonalCollection {
  key: string
  title: string
  description: string
  query: string
  productsCount: number
  to: RouteLocationRaw
}

type SeasonFilterKey = 'spring' | 'summer' | 'autumn' | 'winter' | 'peony'

interface SeasonFilterBlueprint {
  key: SeasonFilterKey
  name: string
  keyword: string
  matchTokens: string[]
}

interface HomeSeasonalCollectionDefinition {
  key: string
  seasonKey: SeasonFilterKey
  title: string
  description: string
  fallbackQuery: string
}

const SEASON_FILTER_BLUEPRINTS: SeasonFilterBlueprint[] = [
  { key: 'spring', name: 'Весна', keyword: 'весна', matchTokens: ['весн', 'тюльпан'] },
  { key: 'summer', name: 'Лето', keyword: 'лет', matchTokens: ['лет'] },
  { key: 'autumn', name: 'Осень', keyword: 'осень', matchTokens: ['осен', 'золот', 'террак'] },
  { key: 'winter', name: 'Зима', keyword: 'зима', matchTokens: ['зим', 'новогод', 'рождеств'] },
  { key: 'peony', name: 'Пионы сезона', keyword: 'пион', matchTokens: ['пион'] },
]

export const DEFAULT_SEASON_FILTERS: SeasonFilterOption[] = SEASON_FILTER_BLUEPRINTS.map(({ name, keyword }) => ({
  name,
  keyword,
}))

const HOME_SEASONAL_COLLECTIONS: HomeSeasonalCollectionDefinition[] = [
  {
    key: 'spring-bouquets',
    seasonKey: 'spring',
    title: 'Весенние букеты',
    description: 'Лёгкие и воздушные цвета для романтических и повседневных поводов',
    fallbackQuery: 'весна|пион|тюльпан',
  },
  {
    key: 'season-peonies',
    seasonKey: 'peony',
    title: 'Пионы сезона',
    description: 'Нежная и пышная подборка для свиданий, юбилеев и тёплых поздравлений',
    fallbackQuery: 'пион',
  },
  {
    key: 'autumn-shades',
    seasonKey: 'autumn',
    title: 'Осенние оттенки',
    description: 'Тёплая гамма с насыщенными зелёными и персиковыми акцентами',
    fallbackQuery: 'осень|север|золот|террак',
  },
  {
    key: 'holiday-arrangements',
    seasonKey: 'winter',
    title: 'Новогодние композиции',
    description: 'Элегантные букеты с акцентами для торжественных новогодних поздравлений',
    fallbackQuery: 'новогод|празднич|зима',
  },
]

export function parseSeasonFilters(rawValue?: string): SeasonFilterOption[] {
  return parseSettingJSON<SeasonFilterOption[]>(rawValue, DEFAULT_SEASON_FILTERS)
}

export function splitKeywordTokens(value: string): string[] {
  return String(value || '')
    .toLowerCase()
    .split(/[,;|]/)
    .map(token => token.trim())
    .filter(Boolean)
}

export function buildProductSearchText(product: Product): string {
  return [
    product.name,
    product.meta,
    product.description ?? '',
    (product.composition ?? []).map(item => item.name).join(' '),
    product.tag ?? '',
  ]
    .join(' ')
    .toLowerCase()
}

export function productMatchesKeywords(product: Product, rawValue: string): boolean {
  const tokens = splitKeywordTokens(rawValue)
  if (!tokens.length) return false

  const haystack = buildProductSearchText(product)
  return tokens.some(token => haystack.includes(token))
}

export function resolveSeasonNames(rawValue: string, seasonFilters: SeasonFilterOption[]): string[] {
  const tokens = splitKeywordTokens(rawValue)
  const matchedNames = new Set<string>()

  seasonFilters.forEach((season) => {
    const haystack = [season.name.toLowerCase(), ...splitKeywordTokens(season.keyword)]
    if (tokens.some(token => haystack.some(value => value.includes(token) || token.includes(value)))) {
      matchedNames.add(season.name)
    }
  })

  return Array.from(matchedNames)
}

function resolveSeasonKey(option: SeasonFilterOption): SeasonFilterKey | null {
  const haystack = [option.name.toLowerCase(), ...splitKeywordTokens(option.keyword)]
  const match = SEASON_FILTER_BLUEPRINTS.find((blueprint) =>
    blueprint.matchTokens.some(token =>
      haystack.some(value => value.includes(token) || token.includes(value))
    )
  )

  return match?.key ?? null
}

function buildSeasonKeywordLookup(seasonFilters: SeasonFilterOption[]) {
  return seasonFilters.reduce<Partial<Record<SeasonFilterKey, string>>>((lookup, option) => {
    const key = resolveSeasonKey(option)
    if (key && !lookup[key]) {
      lookup[key] = option.keyword
    }
    return lookup
  }, {})
}

function resolveSeasonQuery(
  seasonFilters: SeasonFilterOption[],
  seasonKey: SeasonFilterKey,
  fallbackQuery: string,
): string {
  return buildSeasonKeywordLookup(seasonFilters)[seasonKey] || fallbackQuery
}

export function buildHomeSeasonalCollections(
  products: Product[],
  seasonFilters: SeasonFilterOption[],
): HomeSeasonalCollection[] {
  return HOME_SEASONAL_COLLECTIONS.map((definition) => {
    const query = resolveSeasonQuery(seasonFilters, definition.seasonKey, definition.fallbackQuery)
    return {
      key: definition.key,
      title: definition.title,
      description: definition.description,
      query,
      productsCount: products.filter(product => productMatchesKeywords(product, query)).length,
      to: { path: '/catalog', query: { season: query } },
    }
  })
}
