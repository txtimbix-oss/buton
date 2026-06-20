import { computed, toValue, type MaybeRefOrGetter } from 'vue'

import type { Product } from '~/composables/useShop'
import { parseSettingJSON } from '~/composables/useSettings'
import {
  buildAddonGroups,
  buildBundleOptions,
  buildCatalogAddons,
  DEFAULT_GIFT_BUNDLES,
} from '~/lib/product/addons'
import type {
  AddonGroup,
  BundleOption,
  CatalogAddon,
  GiftBundleSetting,
} from '~/lib/product/types'

interface ProductAddonSettingsSource {
  catalogAddons?: string | null
  giftAddons?: string | null
}

export interface UseProductAddonOptionsOptions {
  settings: MaybeRefOrGetter<ProductAddonSettingsSource | null | undefined>
  product: MaybeRefOrGetter<Product | null | undefined>
}

export function useProductAddonOptions(options: UseProductAddonOptionsOptions) {
  const settings = computed(() => toValue(options.settings))
  const product = computed(() => toValue(options.product))

  const catalogAddons = computed<CatalogAddon[]>(() => {
    const allAddons = parseSettingJSON<CatalogAddon[]>(settings.value?.catalogAddons, [])

    return buildCatalogAddons({
      allAddons,
      catalogAddonIds: product.value?.catalogAddonIds,
    })
  })

  const giftBundles = computed<GiftBundleSetting[]>(() =>
    parseSettingJSON<GiftBundleSetting[]>(
      settings.value?.giftAddons,
      DEFAULT_GIFT_BUNDLES,
    ),
  )

  const bundleOptions = computed<BundleOption[]>(() =>
    buildBundleOptions(giftBundles.value, catalogAddons.value),
  )

  const addonGroups = computed<AddonGroup[]>(() =>
    buildAddonGroups(catalogAddons.value),
  )

  return {
    catalogAddons,
    giftBundles,
    bundleOptions,
    addonGroups,
  }
}
