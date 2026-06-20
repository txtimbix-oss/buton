import { describe, expect, it } from 'vitest'
import { nextTick, ref } from 'vue'

import { useProductConfigurator } from '~/composables/useProductConfigurator'
import type { CatalogAddon } from '~/lib/product/types'
import { makeProduct } from '../fixtures/products'

describe('useProductConfigurator', () => {
  function createAddons(): CatalogAddon[] {
    return [
      { id: 'toy', name: 'Мягкая игрушка', price: 1200, display: '+1 200 ₽' },
      { id: 'card', name: 'Открытка', price: 100, display: '+100 ₽' },
      { id: 'ribbon', name: 'Ленточка + бантик', price: 250, display: '+250 ₽' },
    ]
  }

  function createProduct(overrides: Parameters<typeof makeProduct>[0] = {}) {
    return makeProduct({
      name: 'Романтичный букет',
      slug: 'romantic-bouquet',
      price: 5000,
      oldPrice: 6250,
      tag: 'Новинка',
      description: 'Романтичный букет для дома в премиум оформлении',
      meta: 'Для любимой, уют дома',
      composition: [
        { name: 'Роза', qty: '15' },
        { name: 'Эвкалипт', qty: '3' },
      ],
      sizes: [
        { label: 'S', desc: '11 стеблей · 45 см · 0.8 кг', price: 4200 },
        { label: 'M', desc: '19 стеблей · 55 см · 1.2 кг', price: 6200 },
      ],
      ...overrides,
    })
  }

  it('initializes default selection, totals, and derived metadata from product and addon sources', () => {
    const product = ref(createProduct())
    const addons = ref(createAddons())

    const configurator = useProductConfigurator({
      product: () => product.value,
      addons: () => addons.value,
    })

    expect(configurator.activeSize.value).toBe(1)
    expect(configurator.selectedAddons.value).toEqual([1])
    expect(configurator.qty.value).toBe(1)
    expect(configurator.quickDeliveryTime.value).toBe('12:00–14:00')
    expect(configurator.quickDeliveryTimes).toEqual([
      '12:00–14:00',
      '14:00–16:00',
      '16:00–18:00',
      '18:00–20:00',
      '20:00–22:00',
    ])

    expect(configurator.optionState.value).toEqual(expect.objectContaining({
      activeSize: 1,
      sizeLabel: 'M',
      selectedAddons: [1],
      addonNames: ['Открытка'],
      currentSizePrice: 6200,
      addonsTotal: 100,
      currentTotal: 6300,
      totalPrice: 6300,
      qty: 1,
    }))
    expect(configurator.optionTotals.value).toEqual({
      currentSizePrice: 6200,
      addonsTotal: 100,
      currentTotal: 6300,
      totalPrice: 6300,
    })

    expect(configurator.activeSizeLabel.value).toBe('M')
    expect(configurator.sizeStemText.value).toBe('19 стеблей')
    expect(configurator.sizeHeight.value).toBe('55 см')
    expect(configurator.sizeWeight.value).toBe('1.2 кг')
    expect(configurator.packagingHint.value).toBe('премиум-упаковка')
    expect(configurator.forWho.value).toEqual(['Для любимого человека', 'Для дома'])
    expect(configurator.isTopPick.value).toBe(true)
    expect(configurator.isPopular.value).toBe(true)
    expect(configurator.discountPct.value).toBe(20)
    expect(configurator.productFlowerText.value).toBe('Роза, Эвкалипт')
  })

  it('updates totals when toggling addons and changing quantity', () => {
    const configurator = useProductConfigurator({
      product: ref(createProduct()),
      addons: ref(createAddons()),
    })

    configurator.toggleAddon(2)
    configurator.qty.value = 2

    expect(configurator.selectedAddons.value).toEqual([1, 2])
    expect(configurator.addonsTotal.value).toBe(350)
    expect(configurator.currentTotal.value).toBe(6550)
    expect(configurator.totalPrice.value).toBe(13100)
  })

  it('resets size and addon selection when product slug changes', async () => {
    const product = ref(createProduct())
    const addons = ref(createAddons())
    const configurator = useProductConfigurator({ product, addons })

    configurator.activeSize.value = 0
    configurator.selectedAddons.value = [0, 2]

    product.value = createProduct({
      slug: 'garden-bouquet',
      sizes: [
        { label: 'S', desc: '9 стеблей · 40 см · 0.6 кг', price: 3900 },
        { label: 'L', desc: '25 стеблей · 65 см · 1.5 кг', price: 7100 },
      ],
    })

    await nextTick()

    expect(configurator.activeSize.value).toBe(0)
    expect(configurator.selectedAddons.value).toEqual([1])
    expect(configurator.activeSizeLabel.value).toBe('S')
  })

  it('rebuilds default addon selection when addon catalog changes and keeps the chosen size', async () => {
    const product = ref(createProduct())
    const addons = ref(createAddons())
    const configurator = useProductConfigurator({ product, addons })

    configurator.activeSize.value = 0
    configurator.selectedAddons.value = [0, 2]

    addons.value = [
      { id: 'card-v2', name: 'Открытка ручной работы', price: 200, display: '+200 ₽' },
      { id: 'toy', name: 'Мягкая игрушка', price: 1200, display: '+1 200 ₽' },
    ]

    await nextTick()

    expect(configurator.activeSize.value).toBe(0)
    expect(configurator.selectedAddons.value).toEqual([0])
    expect(configurator.addonsTotal.value).toBe(200)
    expect(configurator.currentTotal.value).toBe(4400)
  })
})
