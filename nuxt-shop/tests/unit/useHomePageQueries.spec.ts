import { ref } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { Banner, Product, Review } from '~/composables/useShop'
import { useHomePageQueries } from '~/composables/useHomePageQueries'

const { useStorefrontProductsQueryMock } = vi.hoisted(() => ({
  useStorefrontProductsQueryMock: vi.fn(),
}))

vi.mock('~/composables/useStorefrontProductsQuery', () => ({
  useStorefrontProductsQuery: useStorefrontProductsQueryMock,
}))

describe('useHomePageQueries', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('gets homepage products from the shared storefront query and fetches reviews and banners through the page query boundary', async () => {
    const products = ref<Product[] | null>([])
    const productsPending = ref(true)
    const apiReviews = ref<Review[] | null>([])
    const bannersData = ref<Banner[] | null>([])

    const useFetchMock = vi.fn((url: string) => {
      if (url === '/api/reviews/public?limit=8') {
        return { data: apiReviews, pending: ref(false) }
      }

      if (url === '/api/banners/active') {
        return { data: bannersData, pending: ref(false) }
      }

      throw new Error(`Unexpected useFetch call: ${url}`)
    })

    vi.stubGlobal('useFetch', useFetchMock)
    useStorefrontProductsQueryMock.mockReturnValue({
      products,
      pending: productsPending,
    })

    const queries = await useHomePageQueries()

    expect(useStorefrontProductsQueryMock).toHaveBeenCalledTimes(1)
    expect(useFetchMock).toHaveBeenNthCalledWith(1, '/api/reviews/public?limit=8')
    expect(useFetchMock).toHaveBeenNthCalledWith(2, '/api/banners/active')
    expect(useFetchMock).not.toHaveBeenCalledWith('/api/products?all=1')
    expect(queries.products).toBe(products)
    expect(queries.productsPending).toBe(productsPending)
    expect(queries.apiReviews).toBe(apiReviews)
    expect(queries.bannersData).toBe(bannersData)
  })

  it('falls back to empty refs when Nuxt fetch is unavailable', () => {
    const products = ref<Product[] | null>([])
    const productsPending = ref(true)

    vi.stubGlobal('useFetch', vi.fn(() => {
      throw new Error('Composable has been called outside of a Nuxt instance')
    }))

    useStorefrontProductsQueryMock.mockReturnValue({
      products,
      pending: productsPending,
    })

    const queries = useHomePageQueries()

    expect(queries.products).toBe(products)
    expect(queries.productsPending).toBe(productsPending)
    expect(queries.apiReviews.value).toBeNull()
    expect(queries.bannersData.value).toBeNull()
  })
})
