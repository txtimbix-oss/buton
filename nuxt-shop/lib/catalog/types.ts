import type { Category, Product } from '~/composables/useShop'
import type { CatalogCollectionSummary } from '~/constants/catalogCollections'
import type { FilterOption } from '~/lib/settings/types'

export type { CatalogCollectionSummary }
export type CatalogFilterDefinition = import('~/lib/settings/types').CatalogFilter
export type CatalogOption = FilterOption

export type CatalogSortBy = 'popular' | 'price_asc' | 'price_desc' | 'new' | 'sale'
export type CatalogQuickFilterKey = 'rose' | 'peony' | 'wedding' | 'mini' | 'home' | 'seasonal'

export interface CatalogFilterState {
  selectedColors: string[]
  selectedCategories: string[]
  selectedOccasions: string[]
  selectedSeasons: string[]
  selectedSeasonKeywords: string[]
  selectedCollectionSlug: string
  priceMin: number
  priceMax: number
  selectedChip: string
  selectedComposition: string[]
  selectedSizes: string[]
  showOnlyAvailableToday: boolean
  deliveryTodayOnly: boolean
  searchQuery: string
  activeCategoryName: string
}

export interface CatalogRouteStateDependencies {
  categories: Category[]
  collections: CatalogCollectionSummary[]
  filters: CatalogFilterDefinition[]
  seasonFilters: CatalogOption[]
}

export interface CatalogPriceBounds {
  min: number
  max: number
}

export interface CatalogFilteringContext {
  state: CatalogFilterState
  filters: CatalogFilterDefinition[]
  collections: CatalogCollectionSummary[]
  compositionKeywordByName: Record<string, string>
  occasionKeywordByName: Record<string, string>
  seasonKeywordByName: Record<string, string>
  priceBounds: CatalogPriceBounds
  sortBy: CatalogSortBy
}

export interface CatalogPaginationResult {
  totalPages: number
  currentPage: number
  visiblePages: number[]
  pagedProducts: Product[]
}

export interface CatalogCollectionPageCollection {
  name: string
  slug: string
  tag?: string
  priceMax?: number
  description?: string
  metaTitle?: string
  metaDescription?: string
  isActive?: boolean
}

export interface CatalogCollectionReason {
  title: string
  text: string
}

export interface CatalogCollectionHeroThumb {
  slug: string
  name: string
  src: string
}
