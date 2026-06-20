import { describe, expect, it } from 'vitest'

import type { Category } from '~/composables/useShop'
import type { CatalogCollectionSummary } from '~/constants/catalogCollections'
import { DEFAULT_CATALOG_ROUTE_STATE, buildQuickFilterChips, parseCatalogRouteState } from '~/lib/catalog/filterState'
import type { CatalogFilterDefinition } from '~/lib/catalog/types'

const filters: CatalogFilterDefinition[] = [
  { label: 'До 5 000 ₽', type: 'price', value: '5000' },
  { label: 'Розы', type: 'flower_type', value: 'роза' },
  { label: 'Пионы', type: 'flower_type', value: 'пион' },
  { label: 'Свадебные', type: 'occasion', value: 'свадеб' },
  { label: 'Мини-букеты', type: 'size', value: 'S' },
  { label: 'Для дома', type: 'occasion', value: 'дом' },
  { label: 'Сезонные', type: 'season', value: 'весна|лет|осень|зима' },
  { label: 'Со скидкой', type: 'sale', value: '' },
]

const seasonFilters = [
  { name: 'Весна', keyword: 'весна' },
  { name: 'Лето', keyword: 'лето' },
]

const categories: Category[] = [
  {
    _id: 'cat-1',
    name: 'Розовые',
    slug: 'pink',
    count: '12',
    bloom: 'rose',
    image: '/img/pink.jpg',
  },
]

const collections: CatalogCollectionSummary[] = [
  {
    name: 'Хиты продаж',
    slug: 'bestsellers',
    tag: 'Хит',
    isActive: true,
  },
]

describe('catalog filterState', () => {
  it('prioritizes canonical quick-filter order but keeps other chips', () => {
    const chips = buildQuickFilterChips(filters)

    expect(chips).toEqual([
      'Розы',
      'Пионы',
      'Свадебные',
      'Мини-букеты',
      'Для дома',
      'Сезонные',
      'До 5 000 ₽',
      'Со скидкой',
    ])
  })

  it('maps legacy category aliases to quick filters', () => {
    const state = parseCatalogRouteState(
      { cat: 'discount' },
      { categories, collections, filters, seasonFilters },
    )

    expect(state).toMatchObject({
      selectedChip: 'Со скидкой',
      activeCategoryName: '',
      selectedCollectionSlug: '',
    })
  })

  it('resolves legacy collection queries to collection slug state', () => {
    const state = parseCatalogRouteState(
      { cat: 'bestsellers' },
      { categories, collections, filters, seasonFilters },
    )

    expect(state).toMatchObject({
      selectedChip: 'Все',
      selectedCollectionSlug: 'bestsellers',
      activeCategoryName: '',
    })
  })

  it('falls back to category bloom filters when cat points to category slug', () => {
    const state = parseCatalogRouteState(
      { cat: 'pink' },
      { categories, collections, filters, seasonFilters },
    )

    expect(state).toMatchObject({
      selectedColors: ['rose'],
      activeCategoryName: 'Розовые',
      selectedCollectionSlug: '',
    })
  })

  it('resolves known season query to named season filters and clears presets', () => {
    const state = parseCatalogRouteState(
      { cat: 'bestsellers', season: 'весна' },
      { categories, collections, filters, seasonFilters },
    )

    expect(state).toMatchObject({
      selectedChip: 'Все',
      selectedCollectionSlug: '',
      activeCategoryName: '',
      selectedSeasons: ['Весна'],
      selectedSeasonKeywords: [],
    })
  })

  it('clears category bloom preset when season query takes over the route state', () => {
    const state = parseCatalogRouteState(
      { cat: 'pink', season: 'весна' },
      { categories, collections, filters, seasonFilters },
    )

    expect(state).toMatchObject({
      selectedColors: [],
      activeCategoryName: '',
      selectedCollectionSlug: '',
      selectedSeasons: ['Весна'],
    })
  })

  it('keeps unknown season query as keyword tokens for legacy compatibility', () => {
    const state = parseCatalogRouteState(
      { season: 'пион|тюльпан' },
      { categories, collections, filters, seasonFilters },
    )

    expect(state).toMatchObject({
      selectedSeasons: [],
      selectedSeasonKeywords: ['пион', 'тюльпан'],
    })
  })

  it('returns clean defaults for empty query', () => {
    expect(
      parseCatalogRouteState({}, { categories, collections, filters, seasonFilters }),
    ).toEqual(DEFAULT_CATALOG_ROUTE_STATE)
  })
})
