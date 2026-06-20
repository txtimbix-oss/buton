import { computed, ref, toValue, watch, type MaybeRefOrGetter } from 'vue'

import type { Product } from '~/composables/useShop'
import {
  buildInitialProductOptionSelection,
  buildProductOptionTotals,
  resolveProductOptionState,
  toggleSelectedAddonIndex,
} from '~/lib/product/options'
import { deriveProductMetadata } from '~/lib/product/seo'
import type { CatalogAddon } from '~/lib/product/types'

const DEFAULT_QUICK_DELIVERY_TIMES = [
  '12:00–14:00',
  '14:00–16:00',
  '16:00–18:00',
  '18:00–20:00',
  '20:00–22:00',
] as const

export interface UseProductConfiguratorOptions {
  product: MaybeRefOrGetter<Product | null | undefined>
  addons: MaybeRefOrGetter<CatalogAddon[] | null | undefined>
  quickDeliveryTimes?: readonly string[]
}

export function useProductConfigurator(options: UseProductConfiguratorOptions) {
  const activeSize = ref(0)
  const selectedAddons = ref<number[]>([])
  const qty = ref(1)
  const quickDeliveryTimes = options.quickDeliveryTimes ?? DEFAULT_QUICK_DELIVERY_TIMES
  const quickDeliveryTime = ref(quickDeliveryTimes[0] ?? '')

  const product = computed(() => toValue(options.product))
  const addons = computed(() => toValue(options.addons) ?? [])

  watch(() => product.value?.slug, () => {
    if (!product.value) return
    const initialSelection = buildInitialProductOptionSelection(product.value, addons.value)
    activeSize.value = initialSelection.activeSize
    selectedAddons.value = initialSelection.selectedAddons
  }, { immediate: true })

  watch(() => addons.value.map(addon => addon.id).join('|'), (nextKey, prevKey) => {
    if (!product.value || !nextKey || nextKey === prevKey) return
    const initialSelection = buildInitialProductOptionSelection(product.value, addons.value)
    selectedAddons.value = initialSelection.selectedAddons
  })

  function toggleAddon(index: number) {
    selectedAddons.value = toggleSelectedAddonIndex(selectedAddons.value, index)
  }

  const optionState = computed(() => {
    if (!product.value) return null

    return resolveProductOptionState({
      product: product.value,
      addons: addons.value,
      activeSize: activeSize.value,
      selectedAddons: selectedAddons.value,
      qty: qty.value,
    })
  })

  const optionTotals = computed(() => optionState.value ? buildProductOptionTotals(optionState.value) : null)
  const currentSizePrice = computed(() => optionTotals.value?.currentSizePrice ?? 0)
  const addonsTotal = computed(() => optionTotals.value?.addonsTotal ?? 0)
  const totalPrice = computed(() => optionTotals.value?.totalPrice ?? 0)
  const currentTotal = computed(() => optionTotals.value?.currentTotal ?? 0)

  const productMetadata = computed(() => product.value ? deriveProductMetadata(product.value, activeSize.value) : null)
  const activeSizeLabel = computed(() => productMetadata.value?.activeSizeLabel ?? '')
  const sizeStemText = computed(() => productMetadata.value?.sizeStemText ?? '—')
  const sizeHeight = computed(() => productMetadata.value?.sizeHeight ?? '—')
  const sizeWeight = computed(() => productMetadata.value?.sizeWeight ?? '—')
  const packagingHint = computed(() => productMetadata.value?.packagingHint ?? 'крафт + лента')
  const forWho = computed(() => productMetadata.value?.forWho ?? [])
  const isTopPick = computed(() => productMetadata.value?.isTopPick ?? false)
  const isPopular = computed(() => productMetadata.value?.isPopular ?? false)
  const discountPct = computed(() => productMetadata.value?.discountPct ?? 0)
  const productFlowerText = computed(() => productMetadata.value?.productFlowerText ?? 'сезонные цветы и зелень')

  return {
    activeSize,
    selectedAddons,
    qty,
    quickDeliveryTime,
    quickDeliveryTimes,
    toggleAddon,
    optionState,
    optionTotals,
    currentSizePrice,
    addonsTotal,
    totalPrice,
    currentTotal,
    productMetadata,
    activeSizeLabel,
    sizeStemText,
    sizeHeight,
    sizeWeight,
    packagingHint,
    forWho,
    isTopPick,
    isPopular,
    discountPct,
    productFlowerText,
  }
}
