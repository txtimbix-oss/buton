import { productMatchesCollection } from '~/constants/catalogCollections'
import { productMatchesKeywords } from '~/constants/seasonCollections'
import type { Product } from '~/composables/useShop'
import type {
  CatalogFilterDefinition,
  CatalogFilterState,
  CatalogFilteringContext,
  CatalogPaginationResult,
  CatalogPriceBounds,
} from '~/lib/catalog/types'

export const DEFAULT_PAGE_SIZE = 9

function filterByKeywordMap(
  product: Product,
  selectedValues: string[],
  keywordByName: Record<string, string>,
): boolean {
  return selectedValues.some((value) => {
    const keyword = keywordByName[value]
    if (!keyword) return false
    return productMatchesKeywords(product, keyword)
  })
}

function applyChipFilter(
  products: Product[],
  chip: CatalogFilterDefinition | undefined,
): Product[] {
  if (!chip) return products

  const value = chip.value
  const value2 = chip.value2

  switch (chip.type) {
    case 'price':
    case 'price_max': {
      const max = Number(value)
      return Number.isNaN(max) ? products : products.filter(product => product.price <= max)
    }
    case 'price_range': {
      const min = Number(value)
      const max = Number(value2)
      return products.filter((product) => {
        if (!Number.isNaN(min) && product.price < min) return false
        if (!Number.isNaN(max) && product.price > max) return false
        return true
      })
    }
    case 'composition':
    case 'flower_type':
    case 'occasion':
    case 'season':
      return products.filter(product => productMatchesKeywords(product, value))
    case 'sale':
      return products.filter(product => Boolean(product.oldPrice))
    case 'tag':
      return products.filter(product => product.tag === value)
    case 'bloom':
      return products.filter(product => product.bloom === value)
    case 'size':
      return products.filter(product => product.sizes?.some(size => size.label === value))
    case 'featured':
      return products.filter(product => product.featured)
    case 'in_stock':
      return products.filter(product => product.inStock)
    default:
      return products
  }
}

function applyCatalogSorting(products: Product[], sortBy: CatalogFilteringContext['sortBy']): Product[] {
  const result = [...products]

  if (sortBy === 'price_asc') {
    result.sort((left, right) => left.price - right.price)
  } else if (sortBy === 'price_desc') {
    result.sort((left, right) => right.price - left.price)
  } else if (sortBy === 'new') {
    result.sort((left, right) => Number(right.tag === 'Новинка') - Number(left.tag === 'Новинка'))
  } else if (sortBy === 'sale') {
    result.sort((left, right) => Number(Boolean(right.oldPrice)) - Number(Boolean(left.oldPrice)))
  }

  return result
}

export function filterCatalogProducts(
  products: Product[],
  {
    state,
    filters,
    collections,
    compositionKeywordByName,
    occasionKeywordByName,
    seasonKeywordByName,
    priceBounds,
    sortBy,
  }: CatalogFilteringContext,
): Product[] {
  let list = [...products]

  if (state.searchQuery.trim()) {
    const query = state.searchQuery.trim().toLowerCase()
    list = list.filter(product =>
      product.name.toLowerCase().includes(query)
      || product.meta.toLowerCase().includes(query)
      || product.description?.toLowerCase().includes(query),
    )
  }

  if (state.selectedColors.length || state.selectedCategories.length) {
    const bloomFilters = [...new Set([...state.selectedColors, ...state.selectedCategories])]
    list = list.filter(product => bloomFilters.includes(product.bloom))
  }

  if (state.priceMin > priceBounds.min) {
    list = list.filter(product => product.price >= state.priceMin)
  }
  if (state.priceMax < priceBounds.max) {
    list = list.filter(product => product.price <= state.priceMax)
  }

  if (state.showOnlyAvailableToday || state.deliveryTodayOnly) {
    list = list.filter(product => product.inStock)
  }

  const activeCollection = collections.find(collection => collection.slug === state.selectedCollectionSlug)
  if (activeCollection) {
    list = list.filter(product => productMatchesCollection(product, activeCollection))
  }

  const activeChip = activeCollection
    ? undefined
    : filters.find(filter => filter.label === state.selectedChip)
  list = applyChipFilter(list, activeChip)

  if (state.selectedComposition.length) {
    list = list.filter(product => state.selectedComposition.some((name) => {
      const keyword = compositionKeywordByName[name]
      if (!keyword) return false
      if (productMatchesKeywords(product, keyword)) return true
      return (product.composition ?? []).some(item => item.name.toLowerCase().includes(keyword))
    }))
  }

  if (state.selectedOccasions.length) {
    list = list.filter(product => filterByKeywordMap(product, state.selectedOccasions, occasionKeywordByName))
  }

  if (state.selectedSeasons.length) {
    list = list.filter(product => filterByKeywordMap(product, state.selectedSeasons, seasonKeywordByName))
  }

  if (state.selectedSeasonKeywords.length) {
    list = list.filter(product =>
      state.selectedSeasonKeywords.some(token => productMatchesKeywords(product, token)),
    )
  }

  if (state.selectedSizes.length) {
    list = list.filter(product =>
      state.selectedSizes.some(size => product.sizes?.some(item => item.label === size)),
    )
  }

  return applyCatalogSorting(list, sortBy)
}

export function countActiveCatalogFilters(
  state: CatalogFilterState,
  priceBounds: CatalogPriceBounds,
): number {
  let count = 0

  if (state.selectedColors.length) count++
  if (state.selectedCategories.length) count++
  if (state.selectedOccasions.length) count++
  if (state.selectedSeasons.length) count++
  if (state.selectedSeasonKeywords.length) count++
  if (state.selectedCollectionSlug) count++
  if (state.priceMin > priceBounds.min || state.priceMax < priceBounds.max) count++
  if (state.selectedChip !== 'Все') count++
  if (state.selectedComposition.length) count++
  if (state.selectedSizes.length) count++
  if (state.showOnlyAvailableToday) count++
  if (state.deliveryTodayOnly) count++
  if (state.searchQuery.trim()) count++

  return count
}

export function paginateProducts(
  products: Product[],
  currentPage: number,
  pageSize = DEFAULT_PAGE_SIZE,
): Product[] {
  const start = (currentPage - 1) * pageSize
  return products.slice(start, start + pageSize)
}

export function getTotalPages(totalItems: number, pageSize = DEFAULT_PAGE_SIZE): number {
  return Math.max(1, Math.ceil(totalItems / pageSize))
}

export function getPaginationWindow(totalPages: number, currentPage: number): number[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const half = 2
  let low = Math.max(1, currentPage - half)
  let high = Math.min(totalPages, currentPage + half)

  if (currentPage - half < 1) {
    high = Math.min(totalPages, high + (half - currentPage + 1))
  }
  if (currentPage + half > totalPages) {
    low = Math.max(1, low - (currentPage + half - totalPages))
  }

  const pages: number[] = []
  for (let page = low; page <= high; page++) {
    pages.push(page)
  }
  return pages
}

export function buildCatalogPagination(
  products: Product[],
  currentPage: number,
  pageSize = DEFAULT_PAGE_SIZE,
): CatalogPaginationResult {
  const totalPages = getTotalPages(products.length, pageSize)
  const boundedCurrentPage = Math.min(Math.max(1, currentPage), totalPages)

  return {
    totalPages,
    currentPage: boundedCurrentPage,
    visiblePages: getPaginationWindow(totalPages, boundedCurrentPage),
    pagedProducts: paginateProducts(products, boundedCurrentPage, pageSize),
  }
}

export function getBouquetWord(count: number): string {
  if (count % 10 === 1 && count % 100 !== 11) return 'букет'
  if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return 'букета'
  return 'букетов'
}
