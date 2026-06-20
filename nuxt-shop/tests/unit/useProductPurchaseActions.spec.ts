import { afterEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

import { useProductPurchaseActions } from '~/composables/useProductPurchaseActions'
import type { BundleOption, CatalogAddon } from '~/lib/product/types'
import { makeProduct } from '../fixtures/products'

function createCartLineStub() {
  let index = 0

  return vi.fn((input: {
    slug: string
    name: string
    bloom: string
    image?: string
    meta: string
    sizeLabel: string
    price: number
    qty?: number
    addons?: string[]
    mode?: string
  }) => ({
    lineId: `line-${++index}`,
    lineKey: `${input.slug}-${index}`,
    qty: input.qty ?? 1,
    addons: input.addons ?? [],
    ...input,
  }))
}

function createDeferredNavigate() {
  let resolve!: () => void
  const promise = new Promise<void>((nextResolve) => {
    resolve = nextResolve
  })

  return {
    resolve,
    navigate: vi.fn(() => promise),
  }
}

function setup() {
  const product = ref(makeProduct({
    name: 'Нежный букет',
    slug: 'soft-bouquet',
    bloom: 'rose',
    images: ['/flowers.jpg'],
    sizes: [
      { label: 'S', desc: '40 см', price: 4000 },
      { label: 'M', desc: '50 см', price: 5000 },
    ],
  }))
  const addons = ref<CatalogAddon[]>([
    { id: 'toy', name: 'Мягкая игрушка', price: 1200, display: '+1 200 ₽' },
    { id: 'card', name: 'Открытка', price: 100, display: '+100 ₽' },
    { id: 'ribbon', name: 'Ленточка + бантик', price: 250, display: '+250 ₽' },
  ])
  const bundle: BundleOption = {
    id: 'bundle-toy',
    title: 'Букет + игрушка',
    description: 'Плюс мягкая игрушка',
    addonIndexes: [0],
    priceLabel: '+1 200 ₽',
  }

  const addLine = vi.fn()
  const showToast = vi.fn()
  const track = vi.fn(() => Promise.resolve())
  const createCartLine = createCartLineStub()

  const actions = useProductPurchaseActions({
    product,
    addons,
    activeSize: ref(1),
    selectedAddons: ref([1, 2]),
    qty: ref(2),
    quickDeliveryTime: ref('14:00–16:00'),
  }, {
    addLine,
    showToast,
    track,
    navigate: vi.fn(),
    createCartLine,
  })

  return {
    actions,
    addLine,
    showToast,
    track,
    bundle,
  }
}

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('useProductPurchaseActions', () => {
  it('adds the current product selection to cart, tracks it, and resets just-added state after timeout', async () => {
    vi.useFakeTimers()
    const { actions, addLine, showToast, track } = setup()

    actions.addToCart()

    expect(addLine).toHaveBeenCalledTimes(1)
    expect(addLine).toHaveBeenCalledWith(expect.objectContaining({
      slug: 'soft-bouquet',
      sizeLabel: 'M',
      price: 5350,
      qty: 2,
      addons: ['Открытка', 'Ленточка + бантик'],
    }))
    expect(showToast).toHaveBeenCalledWith('Нежный букет · Размер M')
    expect(track).toHaveBeenCalledWith({ event: 'cart' })
    expect(actions.justAdded.value).toBe(true)

    vi.advanceTimersByTime(1999)
    expect(actions.justAdded.value).toBe(true)

    vi.advanceTimersByTime(1)
    expect(actions.justAdded.value).toBe(false)
  })

  it('adds bundles with bundle-specific toast and tracking payload', async () => {
    vi.useFakeTimers()
    const { actions, addLine, showToast, track, bundle } = setup()

    actions.addBundleToCart(bundle)

    expect(addLine).toHaveBeenCalledTimes(1)
    expect(addLine).toHaveBeenCalledWith(expect.objectContaining({
      slug: 'soft-bouquet',
      sizeLabel: 'M · Букет + игрушка',
      price: 6550,
      qty: 2,
      addons: ['Открытка', 'Ленточка + бантик', 'Мягкая игрушка'],
    }))
    expect(showToast).toHaveBeenCalledWith('Букет + игрушка: Нежный букет · x2')
    expect(track).toHaveBeenCalledWith({ event: 'bundle', bundle: 'bundle-toy' })
    expect(actions.justAdded.value).toBe(true)

    vi.advanceTimersByTime(2000)
    expect(actions.justAdded.value).toBe(false)
  })

  it('marks quick order pending during navigation and ignores duplicate submissions', async () => {
    const navigate = createDeferredNavigate()
    const addLine = vi.fn()
    const showToast = vi.fn()
    const track = vi.fn(() => Promise.resolve())
    const createCartLine = createCartLineStub()

    const actions = useProductPurchaseActions({
      product: ref(makeProduct({
        name: 'Нежный букет',
        slug: 'soft-bouquet',
        bloom: 'rose',
        images: ['/flowers.jpg'],
        sizes: [
          { label: 'S', desc: '40 см', price: 4000 },
          { label: 'M', desc: '50 см', price: 5000 },
        ],
      })),
      addons: ref<CatalogAddon[]>([
        { id: 'card', name: 'Открытка', price: 100, display: '+100 ₽' },
      ]),
      activeSize: ref(1),
      selectedAddons: ref([0]),
      qty: ref(2),
      quickDeliveryTime: ref('14:00–16:00'),
    }, {
      addLine,
      showToast,
      track,
      navigate: navigate.navigate,
      createCartLine,
    })

    const firstCall = actions.placeQuickOrder()
    const secondCall = actions.placeQuickOrder()

    expect(actions.quickOrderPending.value).toBe(true)
    expect(addLine).toHaveBeenCalledTimes(1)
    expect(addLine).toHaveBeenCalledWith(expect.objectContaining({
      slug: 'soft-bouquet',
      sizeLabel: 'M · Сегодня',
      price: 5100,
      qty: 2,
      addons: ['Открытка', 'Фото перед отправкой', 'Доставка сегодня'],
      mode: 'quick-order',
    }))
    expect(showToast).toHaveBeenCalledWith('Быстрый заказ: Нежный букет')
    expect(track).not.toHaveBeenCalled()
    expect(navigate.navigate).toHaveBeenCalledTimes(1)

    navigate.resolve()
    await firstCall
    await secondCall

    expect(actions.quickOrderPending.value).toBe(false)
  })
})
