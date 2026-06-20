import { ref, type Ref } from 'vue'

import type { Banner, Product, Review } from '~/composables/useShop'
import { useStorefrontProductsQuery } from '~/composables/useStorefrontProductsQuery'

export interface UseHomePageQueriesResult {
  products: Ref<Product[] | null>
  productsPending: Ref<boolean>
  apiReviews: Ref<Review[] | null>
  bannersData: Ref<Banner[] | null>
}

function safeHomePageFetch<T>(url: string): {
  data: Ref<T[] | null>
  pending: Ref<boolean>
} {
  try {
    const { data, pending } = useFetch<T[]>(url)

    return {
      data: (data as Ref<T[] | null>) ?? ref<T[] | null>(null),
      pending: (pending as Ref<boolean>) ?? ref(false),
    }
  } catch {
    return {
      data: ref<T[] | null>(null),
      pending: ref(false),
    }
  }
}

export function useHomePageQueries(): UseHomePageQueriesResult {
  const { products, pending: productsPending } = useStorefrontProductsQuery()
  const { data: apiReviews } = safeHomePageFetch<Review>('/api/reviews/public?limit=8')
  const { data: bannersData } = safeHomePageFetch<Banner>('/api/banners/active')

  return {
    products: products as Ref<Product[] | null>,
    productsPending,
    apiReviews: apiReviews as Ref<Review[] | null>,
    bannersData: bannersData as Ref<Banner[] | null>,
  }
}
