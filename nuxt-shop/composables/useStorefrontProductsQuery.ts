import { computed, ref, type Ref } from 'vue'

import type { Product } from '~/composables/useShop'

export interface UseStorefrontProductsQueryResult {
  products: Ref<Product[] | null>
  pending: Ref<boolean>
}

export function useStorefrontProductsQuery(): UseStorefrontProductsQueryResult {
  try {
    const { data, pending } = useFetch<unknown>('/api/products?all=1')
    const rawProducts = (data ?? ref<unknown>(null)) as Ref<unknown>
    const normalizedProducts = computed(() => {
      const next = rawProducts.value
      return Array.isArray(next) ? (next as Product[]) : null
    })

    return {
      products: normalizedProducts as Ref<Product[] | null>,
      pending: pending ?? ref(false),
    }
  } catch {
    return {
      products: ref(null),
      pending: ref(false),
    }
  }
}
