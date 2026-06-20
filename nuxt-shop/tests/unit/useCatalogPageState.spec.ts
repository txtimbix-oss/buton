import { computed, nextTick, ref } from 'vue'
import { describe, expect, it } from 'vitest'
import type { LocationQuery } from 'vue-router'

import { useCatalogPageState } from '~/composables/useCatalogPageState'
import type { Category } from '~/composables/useShop'
import type { CatalogCollectionSummary } from '~/constants/catalogCollections'
import type { CatalogFilterDefinition } from '~/lib/catalog/types'
import { makeProduct } from '~/tests/fixtures/products'

const filters: CatalogFilterDefinition[] = [
  { label: 'До 5 000 ₽', type: 'price', value: '5000' },
  { label: 'Розы', type: 'flower_type', value: 'роз' },
  { label: 'Пионы', type: 'flower_type', value: 'пион' },
  { label: 'Свадебные', type: 'occasion', value: 'свадеб' },
  { label: 'Мини-букеты', type: 'size', value: 'S' },
  { label: 'Для дома', type: 'occasion', value: 'дом' },
  { label: 'Сезонные', type: 'season', value: 'весна|лет|осень|зима' },
  { label: 'Со скидкой', type: 'sale', value: '' },
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
  {
    name: 'Архив',
    slug: 'archive',
    tag: 'Архив',
    isActive: false,
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
    sizes: [{ label: 'S', desc: 'Small', price: 4500 }],
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
    sizes: [{ label: 'M', desc: 'Medium', price: 6200 }],
  }),
  makeProduct({
    slug: 'field-exclusive',
    name: 'Полевой эксклюзив',
    meta: 'Полевые цветы',
    description: 'Авторский букет',
    bloom: 'mix',
    price: 8100,
    composition: [{ name: 'Полевые цветы', qty: '11' }],
    inStock: false,
    sizes: [{ label: 'XL', desc: 'Large', price: 8100 }],
  }),
]

function makeSettings(overrides: Record<string, string> = {}) {
  return {
    catalogFilters: JSON.stringify(filters),
    catalogComposition: JSON.stringify([
      { name: 'Пионы', keyword: 'пион' },
      { name: 'Розы', keyword: 'роз' },
      { name: 'Полевые', keyword: 'полевые' },
    ]),
    catalogOccasions: JSON.stringify([
      { name: 'Свадебный', keyword: 'свадеб' },
      { name: 'Для дома', keyword: 'дом' },
    ]),
    catalogSizes: JSON.stringify(['M', 'S']),
    seasonalCollections: JSON.stringify([
      { name: 'Весна', keyword: 'весна|пион' },
      { name: 'Лето', keyword: 'лето' },
    ]),
    ...overrides,
  }
}

function createCatalogPageState(query: LocationQuery = {}, settings: Record<string, string> = makeSettings()) {
  const route = ref({
    fullPath: `/catalog?${new URLSearchParams(query as Record<string, string>).toString()}`,
    query,
  })

  const state = useCatalogPageState({
    settings: computed(() => settings),
    allProducts: ref(products),
    categories: ref(categories),
    collections: ref(collections),
    route,
  })

  return { state, route }
}

describe('useCatalogPageState', () => {
  it('derives active collections and filter option lists from settings and products', () => {
    const { state } = createCatalogPageState()

    expect(state.activeCollections.value.map(collection => collection.slug)).toEqual(['bestsellers'])
    expect(state.quickFilterChips.value).toEqual([
      'Розы',
      'Пионы',
      'Свадебные',
      'Мини-букеты',
      'Для дома',
      'Сезонные',
      'До 5 000 ₽',
      'Со скидкой',
    ])
    expect(state.compositionOptions.value).toEqual(['Пионы', 'Розы', 'Полевые'])
    expect(state.occasionOptions.value).toEqual(['Свадебный', 'Для дома'])
    expect(state.seasonOptions.value).toEqual(['Весна', 'Лето'])
    expect(state.sizeOptions.value).toEqual(['M', 'S', 'XL'])
  })

  it('falls back to setting defaults when catalog settings are malformed or missing', async () => {
    const { state, route } = createCatalogPageState({}, {
      catalogFilters: '{',
      catalogComposition: '{',
      catalogOccasions: '{',
      catalogSizes: '{',
      seasonalCollections: '{',
    })

    expect(state.quickFilterChips.value).toEqual([
      'Розы',
      'Пионы',
      'Свадебные',
      'Мини-букеты',
      'Для дома',
      'Сезонные',
      'До 5 000 ₽',
      'Со скидкой',
    ])
    expect(state.compositionOptions.value).toEqual(['Пионы', 'Розы', 'Ранункулюс', 'Гортензия', 'Полевые'])
    expect(state.occasionOptions.value).toEqual([
      'Свадебный',
      'День рождения',
      'Поздравление',
      'Для дома',
      'Универсальный',
    ])
    expect(state.seasonOptions.value).toEqual(['Весна', 'Лето', 'Осень', 'Зима', 'Пионы сезона'])
    expect(state.sizeOptions.value).toEqual(['S', 'M', 'L'])

    route.value = {
      fullPath: '/catalog?season=весна|пион',
      query: { season: 'весна|пион' },
    }
    await nextTick()

    expect(state.selectedSeasons.value).toEqual(['Весна', 'Пионы сезона'])
    expect(state.selectedSeasonKeywords.value).toEqual([])
  })

  it('syncs route state into presets and named season filters', async () => {
    const { state, route } = createCatalogPageState({ cat: 'pink' })

    expect(state.selectedColors.value).toEqual(['rose'])
    expect(state.activePresetLabel.value).toBe('Розовые')
    expect(state.selectedChip.value).toBe('Все')

    route.value = {
      fullPath: '/catalog?season=%D0%B2%D0%B5%D1%81%D0%BD%D0%B0',
      query: { season: 'весна' },
    }
    await nextTick()

    expect(state.selectedColors.value).toEqual([])
    expect(state.activePresetLabel.value).toBe('')
    expect(state.selectedSeasons.value).toEqual(['Весна'])
    expect(state.selectedSeasonKeywords.value).toEqual([])
  })

  it('resets conflicting route fields when season filter changes', async () => {
    const { state, route } = createCatalogPageState({ cat: 'pink' })

    expect(state.selectedColors.value).toEqual(['rose'])
    expect(state.activePresetLabel.value).toBe('Розовые')

    route.value = {
      fullPath: '/catalog?season=%D0%BB%D0%B5%D1%82%D0%BE',
      query: { season: 'лето' },
    }
    await nextTick()

    expect(state.selectedColors.value).toEqual([])
    expect(state.selectedSeasonKeywords.value).toEqual([])
    expect(state.selectedSeasons.value).toEqual(['Лето'])
    expect(state.selectedCollectionSlug.value).toBe('')
    expect(state.activeCategoryName.value).toBe('')
    expect(state.selectedChip.value).toBe('Все')

    route.value = {
      fullPath: '/catalog?season=%D1%85%D1%80%D0%BE%D0%BC%D0%B8',
      query: { season: 'хр' },
    }
    await nextTick()

    expect(state.selectedSeasons.value).toEqual([])
    expect(state.selectedSeasonKeywords.value).toEqual(['хр'])
    expect(state.selectedColors.value).toEqual([])
    expect(state.selectedChip.value).toBe('Все')
  })

  it('resets preset state when selecting a quick filter chip and supports full reset', () => {
    const { state } = createCatalogPageState({ cat: 'pink' })

    state.searchQuery.value = 'пион'
    state.selectChip('Пионы')

    expect(state.selectedChip.value).toBe('Пионы')
    expect(state.selectedColors.value).toEqual([])
    expect(state.activePresetLabel.value).toBe('')

    state.resetAll()

    expect(state.selectedChip.value).toBe('Все')
    expect(state.searchQuery.value).toBe('')
    expect(state.activeFiltersCount.value).toBe(0)
  })

  it('filters products, resets pagination on filter changes, and exposes bouquet wording', async () => {
    const { state } = createCatalogPageState()

    state.currentPage.value = 2
    state.searchQuery.value = 'пион'
    await nextTick()

    expect(state.filteredProducts.value.map(product => product.slug)).toEqual(['peony-spring'])
    expect(state.currentPage.value).toBe(1)
    expect(state.pagedProducts.value.map(product => product.slug)).toEqual(['peony-spring'])
    expect(state.totalPages.value).toBe(1)
    expect(state.bouquetWord.value).toBe('букет')
  })

  it('counts active filter groups from composed page state', () => {
    const { state } = createCatalogPageState()

    state.toggleColor('rose')
    state.toggleOccasion('Для дома')
    state.showOnlyAvailableToday.value = true
    state.searchQuery.value = 'дом'

    expect(state.activeFiltersCount.value).toBe(4)
  })

  it('rebuilds query-derived shell state on route transition without leaving stale fields', async () => {
    const { state, route } = createCatalogPageState({ season: 'весна' })

    expect(state.selectedSeasons.value).toEqual(['Весна'])
    expect(state.selectedSeasonKeywords.value).toEqual([])
    state.currentPage.value = 4
    state.searchQuery.value = 'другое'

    route.value = {
      fullPath: '/catalog?chip=%D0%A1%D0%BE%20%D1%81%D0%BA%D0%B8%D0%B4%D0%BA%D0%BE%D0%B9',
      query: {
        chip: 'Со скидкой',
      },
    }
    await nextTick()

    expect(state.selectedChip.value).toBe('Со скидкой')
    expect(state.searchQuery.value).toBe('')
    expect(state.activeCategoryName.value).toBe('')
    expect(state.currentPage.value).toBe(1)
    expect(state.selectedSeasonKeywords.value).toEqual([])
    expect(state.selectedSeasons.value).toEqual([])
    expect(state.selectedCollectionSlug.value).toBe('')
  })
})
