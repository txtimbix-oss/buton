import { computed, ref, toValue, watch, type MaybeRefOrGetter } from 'vue'
import type { LocationQuery } from 'vue-router'

import type { Category, Product } from '~/composables/useShop'
import { parseSettingJSON } from '~/composables/useSettings'
import type { CatalogCollectionSummary } from '~/constants/catalogCollections'
import { parseSeasonFilters } from '~/constants/seasonCollections'
import {
  buildQuickFilterChips,
  createCatalogFilterState,
  parseCatalogRouteState,
} from '~/lib/catalog/filterState'
import {
  buildCatalogPagination,
  countActiveCatalogFilters,
  filterCatalogProducts,
  getBouquetWord,
} from '~/lib/catalog/filtering'
import type {
  CatalogFilterDefinition,
  CatalogFilterState,
  CatalogOption,
  CatalogSortBy,
} from '~/lib/catalog/types'

interface CatalogCompositionItem {
  name: string
  keyword: string
}

interface CatalogPageSettings {
  catalogFilters?: string
  catalogComposition?: string
  catalogOccasions?: string
  catalogSizes?: string
  seasonalCollections?: string
}

interface CatalogPageRoute {
  fullPath?: string
  query: LocationQuery
}

export interface UseCatalogPageStateOptions {
  settings: MaybeRefOrGetter<CatalogPageSettings | null | undefined>
  allProducts: MaybeRefOrGetter<Product[] | null | undefined>
  categories: MaybeRefOrGetter<Category[] | null | undefined>
  collections: MaybeRefOrGetter<CatalogCollectionSummary[] | null | undefined>
  route: MaybeRefOrGetter<CatalogPageRoute | null | undefined>
}

export const CATALOG_PRICE_MIN = 1900
export const CATALOG_PRICE_MAX = 18000
export const CATALOG_PAGE_SIZE = 9

export const catalogSortOptions: Array<{ value: CatalogSortBy; label: string }> = [
  { value: 'popular', label: 'Популярные' },
  { value: 'price_asc', label: 'Дешевле' },
  { value: 'price_desc', label: 'Дороже' },
  { value: 'new', label: 'Новинки' },
  { value: 'sale', label: 'Со скидкой' },
]

export function useCatalogPageState(options: UseCatalogPageStateOptions) {
  const settings = computed(() => toValue(options.settings) ?? {})
  const allProducts = computed(() => toValue(options.allProducts) ?? [])
  const categories = computed(() => toValue(options.categories) ?? [])
  const collections = computed(() => toValue(options.collections) ?? [])
  const route = computed<CatalogPageRoute>(() => toValue(options.route) ?? { query: {} })

  const activeCollections = computed(() =>
    collections.value.filter(collection => collection.isActive),
  )

  const catalogFilters = computed<CatalogFilterDefinition[]>(() =>
    parseSettingJSON<CatalogFilterDefinition[]>(settings.value.catalogFilters, [
      { label: 'До 5 000 ₽', type: 'price', value: '5000' },
      { label: 'Розы', type: 'flower_type', value: 'роза' },
      { label: 'Пионы', type: 'flower_type', value: 'пион' },
      { label: 'Свадебные', type: 'occasion', value: 'свадеб' },
      { label: 'Мини-букеты', type: 'size', value: 'S' },
      { label: 'Для дома', type: 'occasion', value: 'дом' },
      { label: 'Сезонные', type: 'season', value: 'весна|лет|осень|зима' },
      { label: 'Со скидкой', type: 'sale', value: '' },
    ]),
  )

  const quickFilterChips = computed(() => buildQuickFilterChips(catalogFilters.value))

  const catalogCompositionItems = computed<CatalogCompositionItem[]>(() =>
    parseSettingJSON<CatalogCompositionItem[]>(settings.value.catalogComposition, [
      { name: 'Пионы', keyword: 'пион' },
      { name: 'Розы', keyword: 'роз' },
      { name: 'Ранункулюс', keyword: 'ранункулюс' },
      { name: 'Гортензия', keyword: 'гортензия' },
      { name: 'Полевые', keyword: 'полевые' },
    ]),
  )

  const occasionFilters = computed<CatalogOption[]>(() =>
    parseSettingJSON<CatalogOption[]>(settings.value.catalogOccasions, [
      { name: 'Свадебный', keyword: 'свадеб' },
      { name: 'День рождения', keyword: 'день рождения' },
      { name: 'Поздравление', keyword: 'поздрав' },
      { name: 'Для дома', keyword: 'домашн' },
      { name: 'Универсальный', keyword: 'универсальн' },
    ]),
  )

  const seasonFilters = computed<CatalogOption[]>(() =>
    parseSeasonFilters(settings.value.seasonalCollections),
  )

  const catalogSizesState = computed(() => {
    const raw = settings.value.catalogSizes
    const defaultSizes = ['S', 'M', 'L']
    if (!raw) {
      return { catalogOrder: defaultSizes, useProductSizes: false }
    }

    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.every(item => typeof item === 'string')) {
        return { catalogOrder: parsed, useProductSizes: true }
      }
    } catch {
      // fall back to defaults on malformed JSON
    }

    return { catalogOrder: defaultSizes, useProductSizes: false }
  })

  const compositionOptions = computed(() =>
    catalogCompositionItems.value.map(item => item.name),
  )
  const occasionOptions = computed(() => occasionFilters.value.map(item => item.name))
  const seasonOptions = computed(() => seasonFilters.value.map(item => item.name))
  const sizeOptions = computed<string[]>(() => {
    const { catalogOrder, useProductSizes } = catalogSizesState.value
    const inProducts = new Set<string>()

    allProducts.value.forEach(product => product.sizes?.forEach(size => inProducts.add(size.label)))

    const result = catalogOrder.filter(size => inProducts.has(size))
    if (!useProductSizes) {
      return catalogOrder
    }

    inProducts.forEach((size) => {
      if (!catalogOrder.includes(size)) {
        result.push(size)
      }
    })

    return result.length ? result : catalogOrder
  })

  const selectedColors = ref<string[]>([])
  const selectedCategories = ref<string[]>([])
  const selectedOccasions = ref<string[]>([])
  const selectedSeasons = ref<string[]>([])
  const selectedSeasonKeywords = ref<string[]>([])
  const selectedCollectionSlug = ref('')
  const priceMin = ref(CATALOG_PRICE_MIN)
  const priceMax = ref(CATALOG_PRICE_MAX)
  const selectedChip = ref('Все')
  const selectedComposition = ref<string[]>([])
  const selectedSizes = ref<string[]>([])
  const showOnlyAvailableToday = ref(false)
  const deliveryTodayOnly = ref(false)
  const sortBy = ref<CatalogSortBy>('popular')
  const filterDrawerOpen = ref(false)
  const searchQuery = ref('')
  const activeCategoryName = ref('')
  const currentPage = ref(1)

  const selectedCollection = computed(() =>
    activeCollections.value.find(collection => collection.slug === selectedCollectionSlug.value) ?? null,
  )
  const activePresetLabel = computed(() =>
    activeCategoryName.value || selectedCollection.value?.name || '',
  )

  const catalogState = computed<CatalogFilterState>(() => ({
    selectedColors: selectedColors.value,
    selectedCategories: selectedCategories.value,
    selectedOccasions: selectedOccasions.value,
    selectedSeasons: selectedSeasons.value,
    selectedSeasonKeywords: selectedSeasonKeywords.value,
    selectedCollectionSlug: selectedCollectionSlug.value,
    priceMin: priceMin.value,
    priceMax: priceMax.value,
    selectedChip: selectedChip.value,
    selectedComposition: selectedComposition.value,
    selectedSizes: selectedSizes.value,
    showOnlyAvailableToday: showOnlyAvailableToday.value,
    deliveryTodayOnly: deliveryTodayOnly.value,
    searchQuery: searchQuery.value,
    activeCategoryName: activeCategoryName.value,
  }))

  function toggleValue(list: typeof selectedColors.value, value: string) {
    const index = list.indexOf(value)

    if (index >= 0) {
      list.splice(index, 1)
    } else {
      list.push(value)
    }
  }

  function selectChip(chip: string) {
    selectedChip.value = chip
    activeCategoryName.value = ''
    selectedCollectionSlug.value = ''
    selectedColors.value = []
  }

  function toggleColor(value: string) {
    toggleValue(selectedColors.value, value)
  }

  function toggleCategory(value: string) {
    toggleValue(selectedCategories.value, value)
  }

  function toggleOccasion(value: string) {
    toggleValue(selectedOccasions.value, value)
  }

  function toggleSeason(value: string) {
    toggleValue(selectedSeasons.value, value)
  }

  function toggleComposition(value: string) {
    toggleValue(selectedComposition.value, value)
  }

  function toggleSize(value: string) {
    toggleValue(selectedSizes.value, value)
  }

  function resetFilters() {
    selectedColors.value = []
    selectedCategories.value = []
    selectedOccasions.value = []
    selectedSeasons.value = []
    selectedSeasonKeywords.value = []
    selectedCollectionSlug.value = ''
    priceMin.value = CATALOG_PRICE_MIN
    priceMax.value = CATALOG_PRICE_MAX
    selectedComposition.value = []
    selectedSizes.value = []
    showOnlyAvailableToday.value = false
    deliveryTodayOnly.value = false
    activeCategoryName.value = ''
  }

  function resetAll() {
    resetFilters()
    selectedChip.value = 'Все'
    searchQuery.value = ''
  }

  function applyCatalogState(nextState: CatalogFilterState) {
    selectedColors.value = nextState.selectedColors
    selectedCategories.value = nextState.selectedCategories
    selectedOccasions.value = nextState.selectedOccasions
    selectedSeasons.value = nextState.selectedSeasons
    selectedSeasonKeywords.value = nextState.selectedSeasonKeywords
    selectedCollectionSlug.value = nextState.selectedCollectionSlug
    priceMin.value = nextState.priceMin
    priceMax.value = nextState.priceMax
    selectedChip.value = nextState.selectedChip
    selectedComposition.value = nextState.selectedComposition
    selectedSizes.value = nextState.selectedSizes
    showOnlyAvailableToday.value = nextState.showOnlyAvailableToday
    deliveryTodayOnly.value = nextState.deliveryTodayOnly
    searchQuery.value = nextState.searchQuery
    activeCategoryName.value = nextState.activeCategoryName
  }

  function applyRouteState(query: LocationQuery) {
    const nextState = parseCatalogRouteState(query, {
      categories: categories.value,
      collections: activeCollections.value,
      filters: catalogFilters.value,
      seasonFilters: seasonFilters.value,
    })

    applyCatalogState({
      ...createCatalogFilterState(CATALOG_PRICE_MIN, CATALOG_PRICE_MAX),
      ...nextState,
      priceMin: nextState.priceMin || CATALOG_PRICE_MIN,
      priceMax: nextState.priceMax || CATALOG_PRICE_MAX,
    })
  }

  watch(() => route.value.fullPath, () => applyRouteState(route.value.query), { immediate: true })

  const activeFiltersCount = computed(() =>
    countActiveCatalogFilters(catalogState.value, {
      min: CATALOG_PRICE_MIN,
      max: CATALOG_PRICE_MAX,
    }),
  )

  const compositionKeywordByName = computed<Record<string, string>>(() =>
    Object.fromEntries(catalogCompositionItems.value.map(item => [item.name, item.keyword])),
  )
  const occasionKeywordByName = computed<Record<string, string>>(() =>
    Object.fromEntries(occasionFilters.value.map(item => [item.name, item.keyword])),
  )
  const seasonKeywordByName = computed<Record<string, string>>(() =>
    Object.fromEntries(seasonFilters.value.map(item => [item.name, item.keyword])),
  )

  const filteredProducts = computed(() =>
    filterCatalogProducts(allProducts.value, {
      state: catalogState.value,
      filters: catalogFilters.value,
      collections: activeCollections.value,
      compositionKeywordByName: compositionKeywordByName.value,
      occasionKeywordByName: occasionKeywordByName.value,
      seasonKeywordByName: seasonKeywordByName.value,
      priceBounds: { min: CATALOG_PRICE_MIN, max: CATALOG_PRICE_MAX },
      sortBy: sortBy.value,
    }),
  )

  const pagination = computed(() =>
    buildCatalogPagination(filteredProducts.value, currentPage.value, CATALOG_PAGE_SIZE),
  )
  const totalPages = computed(() => pagination.value.totalPages)
  const pagedProducts = computed(() => pagination.value.pagedProducts)
  const visiblePages = computed(() => pagination.value.visiblePages)

  watch(filteredProducts, () => {
    currentPage.value = 1
  })

  watch(currentPage, () => {
    if (import.meta.client) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  })

  const bouquetWord = computed(() => getBouquetWord(filteredProducts.value.length))

  return {
    PRICE_MIN: CATALOG_PRICE_MIN,
    PRICE_MAX: CATALOG_PRICE_MAX,
    sortOptions: catalogSortOptions,
    activeCollections,
    catalogFilters,
    quickFilterChips,
    compositionOptions,
    occasionOptions,
    seasonOptions,
    sizeOptions,
    selectedColors,
    selectedCategories,
    selectedOccasions,
    selectedSeasons,
    selectedSeasonKeywords,
    selectedCollectionSlug,
    priceMin,
    priceMax,
    selectedChip,
    selectedComposition,
    selectedSizes,
    showOnlyAvailableToday,
    deliveryTodayOnly,
    sortBy,
    filterDrawerOpen,
    searchQuery,
    activeCategoryName,
    currentPage,
    selectedCollection,
    activePresetLabel,
    catalogState,
    activeFiltersCount,
    filteredProducts,
    pagination,
    totalPages,
    pagedProducts,
    visiblePages,
    bouquetWord,
    selectChip,
    toggleColor,
    toggleCategory,
    toggleOccasion,
    toggleSeason,
    toggleComposition,
    toggleSize,
    resetFilters,
    resetAll,
    applyCatalogState,
    applyRouteState,
  }
}
