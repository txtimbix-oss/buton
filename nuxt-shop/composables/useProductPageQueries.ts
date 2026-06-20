import { computed, toValue, type MaybeRefOrGetter, type Ref } from 'vue'

import type { UseProductPurchaseActionsDeps } from '~/composables/useProductPurchaseActions'
import type { Product, Review } from '~/composables/useShop'
import { useStorefrontProductsQuery } from '~/composables/useStorefrontProductsQuery'
import type { ProductReviewSubmissionPayload } from '~/lib/product/types'

type ProductTrackPayload = Parameters<NonNullable<UseProductPurchaseActionsDeps['track']>>[0]
type ProductTrackHandler = NonNullable<UseProductPurchaseActionsDeps['track']>
type ProductReviewSubmitter = (payload: ProductReviewSubmissionPayload) => Promise<unknown> | unknown

export interface UseProductPageQueriesResult {
  product: Ref<Product | null>
  pending: Ref<boolean>
  allProducts: Ref<Product[] | null>
  apiReviews: Ref<Review[] | null>
  trackProductEvent: ProductTrackHandler
  submitProductReview: ProductReviewSubmitter
}

export function useProductPageQueries(slug: MaybeRefOrGetter<string>): UseProductPageQueriesResult {
  const productSlug = computed(() => toValue(slug))
  const apiBase = useRuntimeConfig().public?.apiBase ?? ''

  const { data: product, pending } = useFetch<Product>(() => `/api/products/${productSlug.value}`)
  const { products: allProducts } = useStorefrontProductsQuery()
  const { data: apiReviews } = useFetch<Review[]>(() => `/api/reviews/product/${productSlug.value}`)

  const trackProductEvent: ProductTrackHandler = (payload: ProductTrackPayload) => $fetch(
    `/api/products/${productSlug.value}/track`,
    {
      method: 'POST',
      body: payload,
    },
  )

  const submitProductReview: ProductReviewSubmitter = (payload) => $fetch(
    `${apiBase}/api/reviews`,
    {
      method: 'POST',
      credentials: 'include',
      body: payload,
    },
  )

  return {
    product: product as Ref<Product | null>,
    pending,
    allProducts,
    apiReviews: apiReviews as Ref<Review[] | null>,
    trackProductEvent,
    submitProductReview,
  }
}
