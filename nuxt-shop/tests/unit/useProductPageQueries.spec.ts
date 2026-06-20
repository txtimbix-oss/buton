import { ref } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useProductPageQueries } from '~/composables/useProductPageQueries'
import type { ProductReviewSubmissionPayload } from '~/lib/product/types'

const { useStorefrontProductsQueryMock } = vi.hoisted(() => ({
  useStorefrontProductsQueryMock: vi.fn(),
}))

vi.mock('~/composables/useStorefrontProductsQuery', () => ({
  useStorefrontProductsQuery: useStorefrontProductsQueryMock,
}))

describe('useProductPageQueries', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('requests product page datasets through a typed query boundary', async () => {
    const product = ref({ slug: 'peony-dream', name: 'Peony Dream' })
    const pending = ref(true)
    const allProducts = ref([{ slug: 'peony-dream' }, { slug: 'garden-mix' }])
    const apiReviews = ref([{
      _id: 'review-1',
      productSlug: 'peony-dream',
      name: 'Анна',
      rating: 5,
      text: 'Очень понравилось',
      status: 'approved',
      createdAt: '2026-06-01T10:00:00.000Z',
    }])

    const useFetchMock = vi.fn((url: string | (() => string)) => {
      if (typeof url !== 'function') {
        throw new Error(`Unexpected url: ${url}`)
      }

      const resolvedUrl = url()

      if (resolvedUrl.startsWith('/api/products/')) {
        return { data: product, pending }
      }

      if (resolvedUrl.startsWith('/api/reviews/product/')) {
        return { data: apiReviews }
      }

      throw new Error(`Unexpected url: ${resolvedUrl}`)
    })

    vi.stubGlobal('useFetch', useFetchMock)
    vi.stubGlobal('useRuntimeConfig', () => ({
      public: {
        apiBase: 'https://api.buton.test',
      },
    }))
    useStorefrontProductsQueryMock.mockReturnValue({
      products: allProducts,
      pending: ref(false),
    })

    const slug = ref('peony-dream')
    const queries = await useProductPageQueries(slug)

    expect(useFetchMock).toHaveBeenNthCalledWith(1, expect.any(Function))
    expect(useFetchMock).toHaveBeenNthCalledWith(2, expect.any(Function))
    expect(useStorefrontProductsQueryMock).toHaveBeenCalledTimes(1)

    const productUrl = useFetchMock.mock.calls[0]?.[0]
    const reviewsUrl = useFetchMock.mock.calls[1]?.[0]

    expect(typeof productUrl).toBe('function')
    expect(typeof reviewsUrl).toBe('function')
    expect(productUrl()).toBe('/api/products/peony-dream')
    expect(reviewsUrl()).toBe('/api/reviews/product/peony-dream')

    slug.value = 'rose-cloud'

    expect(productUrl()).toBe('/api/products/rose-cloud')
    expect(reviewsUrl()).toBe('/api/reviews/product/rose-cloud')
    expect(queries.product).toBe(product)
    expect(queries.pending).toBe(pending)
    expect(queries.allProducts).toBe(allProducts)
    expect(queries.apiReviews).toBe(apiReviews)
    expect(useFetchMock).not.toHaveBeenCalledWith('/api/products?all=1')
  })

  it('wraps product tracking and review submission behind the query boundary', async () => {
    const useFetchMock = vi.fn(() => ({
      data: ref(null),
      pending: ref(false),
    }))
    const fetchMock = vi.fn(() => Promise.resolve({ ok: true }))

    vi.stubGlobal('useFetch', useFetchMock)
    vi.stubGlobal('$fetch', fetchMock)
    vi.stubGlobal('useRuntimeConfig', () => ({
      public: {
        apiBase: 'https://api.buton.test',
      },
    }))
    useStorefrontProductsQueryMock.mockReturnValue({
      products: ref([]),
      pending: ref(false),
    })

    const slug = ref('peony-dream')
    const queries = await useProductPageQueries(slug)
    const reviewPayload: ProductReviewSubmissionPayload = {
      productSlug: 'peony-dream',
      name: 'Мария',
      rating: 5,
      text: 'Очень красивый букет',
    }

    slug.value = 'garden-mix'

    await queries.trackProductEvent({
      event: 'bundle',
      bundle: 'gift-wrap',
    })
    await queries.submitProductReview(reviewPayload)

    expect(fetchMock).toHaveBeenNthCalledWith(1, '/api/products/garden-mix/track', {
      method: 'POST',
      body: {
        event: 'bundle',
        bundle: 'gift-wrap',
      },
    })
    expect(fetchMock).toHaveBeenNthCalledWith(2, 'https://api.buton.test/api/reviews', {
      method: 'POST',
      credentials: 'include',
      body: reviewPayload,
    })
  })
})
