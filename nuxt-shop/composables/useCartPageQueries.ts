import { computed, toValue, type Ref } from 'vue'

import type {
  StorefrontDeliveryZone,
  StorefrontLoyaltyLevel,
  StorefrontProductSnapshot,
} from '~/lib/storefront/types'
import {
  normalizeStorefrontDeliveryZones,
  normalizeStorefrontLoyaltyLevels,
  normalizeStorefrontProductSnapshot,
} from '~/lib/storefront/types'
import { useStorefrontProductsQuery } from '~/composables/useStorefrontProductsQuery'

export interface UseCartPageQueriesResult {
  productSnapshots: Ref<StorefrontProductSnapshot[] | null>
  deliveryZones: Ref<StorefrontDeliveryZone[] | null>
  loyaltyLevels: Ref<StorefrontLoyaltyLevel[] | null>
}

export function useCartPageQueries(): UseCartPageQueriesResult {
  const { products } = useStorefrontProductsQuery()
  const { data: deliveryZones } = useFetch<StorefrontDeliveryZone[]>('/api/delivery-zones')
  const { data: loyaltyLevels } = useFetch<StorefrontLoyaltyLevel[]>('/api/bonus/loyalty-levels')
  const productSnapshots = computed(() => {
    const next = toValue(products)
    if (!Array.isArray(next)) return null

    return next
      .map(normalizeStorefrontProductSnapshot)
      .filter((snapshot): snapshot is StorefrontProductSnapshot => snapshot !== null)
  })

  const normalizedDeliveryZones = computed(() => {
    const next = toValue(deliveryZones)
    return normalizeStorefrontDeliveryZones(next)
  })
  const normalizedLoyaltyLevels = computed(() => {
    const next = toValue(loyaltyLevels)
    return normalizeStorefrontLoyaltyLevels(next)
  })

  return {
    productSnapshots: productSnapshots as Ref<StorefrontProductSnapshot[] | null>,
    deliveryZones: normalizedDeliveryZones,
    loyaltyLevels: normalizedLoyaltyLevels as Ref<StorefrontLoyaltyLevel[] | null>,
  }
}
