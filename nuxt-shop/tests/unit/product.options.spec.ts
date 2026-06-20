import { describe, expect, it } from 'vitest'

import type { BundleOption, CatalogAddon } from '~/lib/product/types'
import {
  buildAddToCartLineInput,
  buildBundleCartLineInput,
  buildInitialProductOptionSelection,
  buildQuickOrderCartLineInput,
  buildProductOptionTotals,
  resolveProductOptionState,
  toggleSelectedAddonIndex,
} from '~/lib/product/options'
import { makeProduct } from '../fixtures/products'

describe('product options helpers', () => {
  const addons: CatalogAddon[] = [
    { id: 'toy', name: 'Мягкая игрушка', price: 1200, display: '+1 200 ₽' },
    { id: 'card', name: 'Открытка', price: 100, display: '+100 ₽' },
    { id: 'ribbon', name: 'Ленточка + бантик', price: 250, display: '+250 ₽' },
  ]

  it('prefers M size and postcard addon when initializing option selection', () => {
    const product = makeProduct({
      sizes: [
        { label: 'S', desc: '40 см', price: 4000 },
        { label: 'M', desc: '50 см', price: 5000 },
        { label: 'L', desc: '60 см', price: 6500 },
      ],
    })

    expect(buildInitialProductOptionSelection(product, addons)).toEqual({
      activeSize: 1,
      selectedAddons: [1],
    })
  })

  it('falls back to first size when M is absent', () => {
    const product = makeProduct({
      sizes: [
        { label: 'S', desc: '40 см', price: 4000 },
        { label: 'L', desc: '60 см', price: 6500 },
      ],
    })

    expect(buildInitialProductOptionSelection(product, addons)).toEqual({
      activeSize: 0,
      selectedAddons: [1],
    })
  })

  it('toggles addon selection without mutating input arrays', () => {
    const initial = [1]

    const withRibbon = toggleSelectedAddonIndex(initial, 2)
    const withoutCard = toggleSelectedAddonIndex(withRibbon, 1)

    expect(initial).toEqual([1])
    expect(withRibbon).toEqual([1, 2])
    expect(withoutCard).toEqual([2])
  })

  it('builds selectors and totals for current option state', () => {
    const product = makeProduct({
      sizes: [
        { label: 'S', desc: '40 см', price: 4000 },
        { label: 'M', desc: '50 см', price: 5000 },
      ],
    })

    const state = resolveProductOptionState({
      product,
      addons,
      activeSize: 1,
      selectedAddons: [1, 2],
      qty: 3,
    })

    expect(state).toEqual({
      activeSize: 1,
      sizeLabel: 'M',
      selectedAddons: [1, 2],
      addonNames: ['Открытка', 'Ленточка + бантик'],
      currentSizePrice: 5000,
      addonsTotal: 350,
      currentTotal: 5350,
      totalPrice: 16050,
      qty: 3,
    })
    expect(buildProductOptionTotals(state)).toEqual({
      currentSizePrice: 5000,
      addonsTotal: 350,
      currentTotal: 5350,
      totalPrice: 16050,
    })
  })

  it('builds add-to-cart line input from current selection', () => {
    const product = makeProduct({
      name: 'Нежный букет',
      slug: 'soft-bouquet',
      bloom: 'rose',
      images: ['/flowers.jpg'],
      sizes: [
        { label: 'S', desc: '40 см', price: 4000 },
        { label: 'M', desc: '50 см', price: 5000 },
      ],
    })

    const input = buildAddToCartLineInput({
      product,
      addons,
      activeSize: 1,
      selectedAddons: [1, 2],
      qty: 2,
    })

    expect(input).toEqual({
      slug: 'soft-bouquet',
      name: 'Нежный букет',
      bloom: 'rose',
      image: '/flowers.jpg',
      meta: 'Размер M',
      sizeLabel: 'M',
      price: 5350,
      qty: 2,
      addons: ['Открытка', 'Ленточка + бантик'],
    })
  })

  it('builds bundle and quick-order cart inputs with merged addons and mode metadata', () => {
    const product = makeProduct({
      name: 'Нежный букет',
      slug: 'soft-bouquet',
      bloom: 'rose',
      images: ['/flowers.jpg'],
      sizes: [
        { label: 'S', desc: '40 см', price: 4000 },
        { label: 'M', desc: '50 см', price: 5000 },
      ],
    })
    const bundle: BundleOption = {
      id: 'bundle-toy',
      title: 'Букет + игрушка',
      description: 'Плюс мягкая игрушка',
      addonIndexes: [0],
      priceLabel: '+1 200 ₽',
    }

    expect(buildBundleCartLineInput({
      product,
      addons,
      activeSize: 1,
      selectedAddons: [1],
      qty: 2,
      bundle,
    })).toEqual({
      slug: 'soft-bouquet',
      name: 'Нежный букет',
      bloom: 'rose',
      image: '/flowers.jpg',
      meta: 'Размер M · Букет + игрушка',
      sizeLabel: 'M · Букет + игрушка',
      price: 6300,
      qty: 2,
      addons: ['Открытка', 'Мягкая игрушка'],
    })

    expect(buildQuickOrderCartLineInput({
      product,
      addons,
      activeSize: 1,
      selectedAddons: [1],
      qty: 2,
      quickDeliveryTime: '14:00–16:00',
    })).toEqual({
      slug: 'soft-bouquet',
      name: 'Нежный букет',
      bloom: 'rose',
      image: '/flowers.jpg',
      meta: 'Размер M · Фото перед отправкой · 14:00–16:00',
      sizeLabel: 'M · Сегодня',
      price: 5100,
      qty: 2,
      addons: ['Открытка', 'Фото перед отправкой', 'Доставка сегодня'],
      mode: 'quick-order',
    })
  })
})
