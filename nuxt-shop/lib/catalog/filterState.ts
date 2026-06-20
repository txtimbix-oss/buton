import type { LocationQuery, LocationQueryValue } from 'vue-router'

import { findCollectionByLegacyQuery } from '~/constants/catalogCollections'
import { resolveSeasonNames, splitKeywordTokens } from '~/constants/seasonCollections'
import type {
  CatalogFilterDefinition,
  CatalogFilterState,
  CatalogQuickFilterKey,
  CatalogRouteStateDependencies,
} from '~/lib/catalog/types'

export const DEFAULT_SELECTED_CHIP = 'Все'

export const PREFERRED_QUICK_FILTER_ORDER: CatalogQuickFilterKey[] = [
  'rose',
  'peony',
  'wedding',
  'mini',
  'home',
  'seasonal',
]

export const DEFAULT_CATALOG_ROUTE_STATE: CatalogFilterState = {
  selectedColors: [],
  selectedCategories: [],
  selectedOccasions: [],
  selectedSeasons: [],
  selectedSeasonKeywords: [],
  selectedCollectionSlug: '',
  priceMin: 0,
  priceMax: 0,
  selectedChip: DEFAULT_SELECTED_CHIP,
  selectedComposition: [],
  selectedSizes: [],
  showOnlyAvailableToday: false,
  deliveryTodayOnly: false,
  searchQuery: '',
  activeCategoryName: '',
}

export function createCatalogFilterState(priceMin: number, priceMax: number): CatalogFilterState {
  return {
    ...DEFAULT_CATALOG_ROUTE_STATE,
    priceMin,
    priceMax,
  }
}

export function resolveQuickFilterKey(filter: CatalogFilterDefinition): CatalogQuickFilterKey | null {
  const value = filter.value.toLowerCase()

  if (filter.type === 'flower_type' && value.includes('роз')) return 'rose'
  if (filter.type === 'flower_type' && value.includes('пион')) return 'peony'
  if (filter.type === 'occasion' && value.includes('свад')) return 'wedding'
  if (filter.type === 'size' && value === 's') return 'mini'
  if (filter.type === 'occasion' && value.includes('дом')) return 'home'
  if (filter.type === 'season') return 'seasonal'

  return null
}

export function findLegacyChipLabel(
  rawCategory: string,
  filters: CatalogFilterDefinition[],
): string | null {
  const legacyKeyMap: Record<string, CatalogQuickFilterKey | 'budget' | 'sale'> = {
    rose: 'rose',
    roses: 'rose',
    rosebuds: 'rose',
    piony: 'peony',
    peonies: 'peony',
    wedding: 'wedding',
    weddings: 'wedding',
    'mini-bouquets': 'mini',
    mini: 'mini',
    home: 'home',
    house: 'home',
    seasonal: 'seasonal',
    seasonalb: 'seasonal',
    budget: 'budget',
    cheap: 'budget',
    sale: 'sale',
    discount: 'sale',
  }

  const quickFilterKey = legacyKeyMap[rawCategory.toLowerCase()]
  if (!quickFilterKey) return null

  if (quickFilterKey === 'sale') {
    return filters.find(filter => filter.type === 'sale')?.label ?? null
  }

  if (quickFilterKey === 'budget') {
    return filters.find(filter => filter.type === 'price' || filter.type === 'price_max')?.label ?? null
  }

  return filters.find(filter => resolveQuickFilterKey(filter) === quickFilterKey)?.label ?? null
}

export function buildQuickFilterChips(filters: CatalogFilterDefinition[]): string[] {
  const labels = filters.map(filter => filter.label)
  const prioritized = PREFERRED_QUICK_FILTER_ORDER
    .map(key => filters.find(filter => resolveQuickFilterKey(filter) === key)?.label)
    .filter((label): label is string => Boolean(label))
  const combined = [...prioritized, ...labels.filter(label => !prioritized.includes(label))]

  return combined.filter((chip, index) => combined.indexOf(chip) === index)
}

export function getQueryValue(value: LocationQueryValue | LocationQueryValue[] | undefined) {
  if (Array.isArray(value)) {
    return value.find((item): item is string => typeof item === 'string')
  }

  return typeof value === 'string' ? value : undefined
}

export function parseCatalogRouteState(
  query: LocationQuery,
  { categories, collections, filters, seasonFilters }: CatalogRouteStateDependencies,
): CatalogFilterState {
  const state = { ...DEFAULT_CATALOG_ROUTE_STATE }
  const q = getQueryValue(query.q)
  const chip = getQueryValue(query.chip)
  const cat = getQueryValue(query.cat)
  const season = getQueryValue(query.season)

  if (q) {
    state.searchQuery = q
  }

  if (chip && filters.some(filter => filter.label === chip)) {
    state.selectedChip = chip
  } else if (cat) {
    const mappedChip = findLegacyChipLabel(cat, filters)
    const collection = findCollectionByLegacyQuery(collections, cat)

    if (mappedChip) {
      state.selectedChip = mappedChip
    } else if (collection) {
      state.selectedCollectionSlug = collection.slug
    } else {
      const category = categories.find(item => item.slug.toLowerCase() === cat.toLowerCase())
      if (category) {
        state.selectedColors = [category.bloom]
        state.activeCategoryName = category.name
      }
    }
  }

  if (season) {
    const names = resolveSeasonNames(season, seasonFilters)
    if (names.length) {
      state.selectedSeasons = names
    } else {
      state.selectedSeasonKeywords = splitKeywordTokens(season)
    }

    if (names.length || state.selectedSeasonKeywords.length) {
      state.selectedChip = DEFAULT_SELECTED_CHIP
      state.activeCategoryName = ''
      state.selectedCollectionSlug = ''
      state.selectedColors = []
      state.selectedCategories = []
    }
  }

  return state
}
