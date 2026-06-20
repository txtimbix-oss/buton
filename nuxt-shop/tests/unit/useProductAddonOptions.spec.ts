import { nextTick, ref } from 'vue'
import { describe, expect, it } from 'vitest'

import { useProductAddonOptions } from '~/composables/useProductAddonOptions'
import {
  buildAddonGroups,
  buildBundleOptions,
  buildCatalogAddons,
  DEFAULT_GIFT_BUNDLES,
} from '~/lib/product/addons'
import type { CatalogAddon, GiftBundleSetting } from '~/lib/product/types'
import { makeProduct } from '~/tests/fixtures/products'

describe('useProductAddonOptions', () => {
  it('parses addon settings and assembles derived product addon options', () => {
    const settings = ref({
      catalogAddons: JSON.stringify([
        { id: 'toy', name: 'Мягкая игрушка', price: 1200, display: '+1 200 ₽' },
        { id: 'candy', name: 'Конфеты ручной работы', price: 650, display: '+650 ₽' },
      ] satisfies CatalogAddon[]),
      giftAddons: JSON.stringify([
        { id: 'bundle-toy', title: 'Игрушка', description: 'Мягкая игрушка к букету', includes: ['Мягкая игрушка'] },
        { id: 'bundle-miss', title: 'Пропустить', description: 'Нет совпадения', includes: ['Шар'] },
      ] satisfies GiftBundleSetting[]),
    })
    const product = ref(makeProduct({
      catalogAddonIds: ['toy'],
    }))

    const addonOptions = useProductAddonOptions({
      settings,
      product,
    })

    const expectedCatalogAddons = buildCatalogAddons({
      allAddons: [
        { id: 'toy', name: 'Мягкая игрушка', price: 1200, display: '+1 200 ₽' },
        { id: 'candy', name: 'Конфеты ручной работы', price: 650, display: '+650 ₽' },
      ],
      catalogAddonIds: ['toy'],
    })
    const expectedGiftBundles = [
      { id: 'bundle-toy', title: 'Игрушка', description: 'Мягкая игрушка к букету', includes: ['Мягкая игрушка'] },
      { id: 'bundle-miss', title: 'Пропустить', description: 'Нет совпадения', includes: ['Шар'] },
    ]

    expect(addonOptions.catalogAddons.value).toEqual(expectedCatalogAddons)
    expect(addonOptions.giftBundles.value).toEqual(expectedGiftBundles)
    expect(addonOptions.bundleOptions.value).toEqual(
      buildBundleOptions(expectedGiftBundles, expectedCatalogAddons),
    )
    expect(addonOptions.addonGroups.value).toEqual(
      buildAddonGroups(expectedCatalogAddons),
    )
  })

  it('falls back to default gift bundles and recomputes when product addon ids change', async () => {
    const settings = ref({
      catalogAddons: JSON.stringify([
        { id: 'toy', name: 'Мягкая игрушка', price: 1200, display: '+1 200 ₽' },
        { id: 'candy', name: 'Конфеты ручной работы', price: 650, display: '+650 ₽' },
      ] satisfies CatalogAddon[]),
      giftAddons: '{',
    })
    const product = ref(makeProduct({
      catalogAddonIds: ['toy'],
    }))

    const addonOptions = useProductAddonOptions({
      settings,
      product,
    })

    expect(addonOptions.giftBundles.value).toEqual(DEFAULT_GIFT_BUNDLES)
    expect(addonOptions.bundleOptions.value).toEqual(
      buildBundleOptions(DEFAULT_GIFT_BUNDLES, addonOptions.catalogAddons.value),
    )

    product.value = makeProduct({
      slug: 'updated-bouquet',
      catalogAddonIds: ['candy'],
    })

    await nextTick()

    const expectedCatalogAddons = buildCatalogAddons({
      allAddons: [
        { id: 'toy', name: 'Мягкая игрушка', price: 1200, display: '+1 200 ₽' },
        { id: 'candy', name: 'Конфеты ручной работы', price: 650, display: '+650 ₽' },
      ],
      catalogAddonIds: ['candy'],
    })

    expect(addonOptions.catalogAddons.value).toEqual(expectedCatalogAddons)
    expect(addonOptions.addonGroups.value).toEqual(
      buildAddonGroups(expectedCatalogAddons),
    )
  })

  it('falls back to both catalog and gift addon defaults when malformed settings are provided', () => {
    const settings = ref({
      catalogAddons: '{',
      giftAddons: '{',
    })
    const product = ref(makeProduct({
      catalogAddonIds: ['photo', 'card'],
    }))

    const addonOptions = useProductAddonOptions({
      settings,
      product,
    })
    const expectedCatalogAddons = [
      { id: '__gift', name: 'Открытка', price: 100, display: '+100 ₽' },
      { id: '__ribbon', name: 'Ленточка + бантик', price: 250, display: '+250 ₽' },
      { id: '__packaging', name: 'Премиум-упаковка', price: 350, display: '+350 ₽' },
    ]

    expect(addonOptions.catalogAddons.value).toEqual(expectedCatalogAddons)
    expect(addonOptions.giftBundles.value).toEqual(DEFAULT_GIFT_BUNDLES)
    expect(addonOptions.bundleOptions.value).toEqual(
      buildBundleOptions(DEFAULT_GIFT_BUNDLES, expectedCatalogAddons),
    )
  })
})
