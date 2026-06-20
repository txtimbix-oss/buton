import { describe, expect, it } from 'vitest'

import type { CatalogCollectionSummary } from '~/constants/catalogCollections'
import {
  countActiveCatalogFilters,
  filterCatalogProducts,
  getBouquetWord,
  getPaginationWindow,
  paginateProducts,
} from '~/lib/catalog/filtering'
import type { CatalogFilterDefinition, CatalogFilterState } from '~/lib/catalog/types'
import { makeProduct } from '~/tests/fixtures/products'

const filters: CatalogFilterDefinition[] = [
  { label: 'Все', type: 'noop', value: '' },
  { label: 'Розы', type: 'flower_type', value: 'роз' },
  { label: 'Сезонные', type: 'season', value: 'весна|пион' },
  { label: 'Со скидкой', type: 'sale', value: '' },
]

const collections: CatalogCollectionSummary[] = [
  {
    name: 'Хиты продаж',
    slug: 'bestsellers',
    tag: 'Хит',
    isActive: true,
  },
]

const products = [
  makeProduct({
    slug: 'rose-hit',
    name: 'Розовый хит',
    meta: 'Розы и эвкалипт',
    description: 'Подходит для дома',
    tag: 'Хит',
    bloom: 'rose',
    price: 4500,
    oldPrice: 5000,
    composition: [{ name: 'Роза кустовая', qty: '7' }],
    inStock: true,
  }),
  makeProduct({
    slug: 'peony-spring',
    name: 'Пионовый сезон',
    meta: 'Пионы и тюльпаны',
    description: 'Весенний букет',
    bloom: 'peony',
    price: 6200,
    composition: [{ name: 'Пион', qty: '9' }],
    tag: 'Новинка',
    inStock: true,
  }),
  makeProduct({
    slug: 'rose-out',
    name: 'Роза вне наличия',
    meta: 'Розы',
    description: 'Недоступен сегодня',
    tag: 'Хит',
    bloom: 'rose',
    price: 4300,
    inStock: false,
  }),
]

function makeState(overrides: Partial<CatalogFilterState> = {}): CatalogFilterState {
  return {
    selectedColors: [],
    selectedCategories: [],
    selectedOccasions: [],
    selectedSeasons: [],
    selectedSeasonKeywords: [],
    selectedCollectionSlug: '',
    priceMin: 1900,
    priceMax: 18000,
    selectedChip: 'Все',
    selectedComposition: [],
    selectedSizes: [],
    showOnlyAvailableToday: false,
    deliveryTodayOnly: false,
    searchQuery: '',
    activeCategoryName: '',
    ...overrides,
  }
}

describe('catalog filtering', () => {
  it('filters by active collection before chip logic', () => {
    const result = filterCatalogProducts(products, {
      state: makeState({ selectedCollectionSlug: 'bestsellers', selectedChip: 'Розы' }),
      filters,
      collections,
      compositionKeywordByName: {},
      occasionKeywordByName: {},
      seasonKeywordByName: {},
      priceBounds: { min: 1900, max: 18000 },
      sortBy: 'popular',
    })

    expect(result.map(product => product.slug)).toEqual(['rose-hit'])
  })

  it('supports legacy season keyword filters when no named season matched', () => {
    const result = filterCatalogProducts(products, {
      state: makeState({ selectedSeasonKeywords: ['пион', 'тюльпан'] }),
      filters,
      collections,
      compositionKeywordByName: {},
      occasionKeywordByName: {},
      seasonKeywordByName: {},
      priceBounds: { min: 1900, max: 18000 },
      sortBy: 'popular',
    })

    expect(result.map(product => product.slug)).toEqual(['peony-spring'])
  })

  it('matches composition filters against keywords and composition item names', () => {
    const result = filterCatalogProducts(products, {
      state: makeState({ selectedComposition: ['Пионы'] }),
      filters,
      collections,
      compositionKeywordByName: { Пионы: 'пион' },
      occasionKeywordByName: {},
      seasonKeywordByName: {},
      priceBounds: { min: 1900, max: 18000 },
      sortBy: 'popular',
    })

    expect(result.map(product => product.slug)).toEqual(['peony-spring'])
  })

  it('sorts sale products first for sale sorting', () => {
    const result = filterCatalogProducts(products, {
      state: makeState(),
      filters,
      collections,
      compositionKeywordByName: {},
      occasionKeywordByName: {},
      seasonKeywordByName: {},
      priceBounds: { min: 1900, max: 18000 },
      sortBy: 'sale',
    })

    expect(result.map(product => product.slug)).toEqual(['rose-hit', 'peony-spring', 'rose-out'])
  })

  it('counts only active filter groups', () => {
    expect(
      countActiveCatalogFilters(
        makeState({
          selectedColors: ['rose'],
          selectedSeasonKeywords: ['пион'],
          selectedChip: 'Розы',
          searchQuery: 'весна',
        }),
        { min: 1900, max: 18000 },
      ),
    ).toBe(4)
  })

  it('ignores whitespace-only search query in active filter count', () => {
    expect(
      countActiveCatalogFilters(
        makeState({
          searchQuery: '   ',
          selectedColors: ['rose'],
        }),
        { min: 1900, max: 18000 },
      ),
    ).toBe(1)
  })

  it('returns pagination helpers with bounded windows', () => {
    expect(paginateProducts(products, 2, 1)).toEqual([products[1]])
    expect(getPaginationWindow(10, 5)).toEqual([3, 4, 5, 6, 7])
    expect(getBouquetWord(21)).toBe('букет')
  })
})
