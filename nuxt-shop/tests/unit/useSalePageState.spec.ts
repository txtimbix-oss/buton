import { computed, ref } from 'vue'
import { describe, expect, it } from 'vitest'

import { useSalePageState } from '~/composables/useSalePageState'
import { makeProduct } from '~/tests/fixtures/products'

const products = [
  makeProduct({
    slug: 'rose-discount',
    price: 3200,
    oldPrice: 3900,
    tag: 'Хит',
  }),
  makeProduct({
    slug: 'field-regular',
    price: 2800,
  }),
  makeProduct({
    slug: 'premium-regular',
    price: 5100,
    tag: 'Премиум',
  }),
]

describe('useSalePageState', () => {
  it('exposes sorted products, chip selection, and reset semantics', () => {
    const state = useSalePageState({
      allProducts: ref(products),
    }, {
      now: () => new Date(2026, 5, 3, 9, 21, 55),
    })

    expect(state.activeChip.value).toBe('Все')
    expect(state.saleProducts.value.map(product => product.slug)).toEqual([
      'rose-discount',
      'field-regular',
      'premium-regular',
    ])

    state.selectChip('Сезонное')
    expect(state.saleProducts.value.map(product => product.slug)).toEqual([
      'rose-discount',
      'field-regular',
    ])

    state.selectChip('Хиты')
    expect(state.saleProducts.value.map(product => product.slug)).toEqual(['rose-discount'])

    state.resetFilters()
    expect(state.activeChip.value).toBe('Все')
    expect(state.saleProducts.value.map(product => product.slug)).toEqual([
      'rose-discount',
      'field-regular',
      'premium-regular',
    ])
  })

  it('reports empty state when the active chip yields no products', () => {
    const allProducts = computed(() => [
      makeProduct({
        slug: 'premium-only',
        price: 5100,
        tag: 'Премиум',
      }),
    ])

    const state = useSalePageState({ allProducts })

    state.selectChip('Сезонное')

    expect(state.saleProducts.value).toEqual([])
    expect(state.hasSaleProducts.value).toBe(false)
  })

  it('refreshes countdown segments from injected clock helpers', () => {
    const now = ref(new Date(2026, 5, 8, 0, 0, 0))
    const state = useSalePageState({
      allProducts: [],
    }, {
      now: () => now.value,
    })

    expect(state.timer.value).toEqual([
      { value: '07', label: 'дня' },
      { value: '00', label: 'часа' },
      { value: '00', label: 'мин' },
      { value: '00', label: 'сек' },
    ])

    now.value = new Date(2026, 5, 14, 23, 59, 59)
    state.refreshTimer()

    expect(state.timer.value).toEqual([
      { value: '00', label: 'дня' },
      { value: '00', label: 'часа' },
      { value: '00', label: 'мин' },
      { value: '01', label: 'сек' },
    ])
  })
})
