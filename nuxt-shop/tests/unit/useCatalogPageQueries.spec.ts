import { ref } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useCatalogPageQueries } from '~/composables/useCatalogPageQueries'

const { useStorefrontProductsQueryMock } = vi.hoisted(() => ({
  useStorefrontProductsQueryMock: vi.fn(),
}))

vi.mock('~/composables/useStorefrontProductsQuery', () => ({
  useStorefrontProductsQuery: useStorefrontProductsQueryMock,
}))

describe('useCatalogPageQueries', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('gets catalog products from the shared storefront query and fetches categories and collections through a typed query boundary', async () => {
    const products = ref([{ slug: 'rose' }])
    const pending = ref(true)
    const categories = ref([{ slug: 'mono' }])
    const collections = ref([{ slug: 'bestsellers' }])

    const useFetchMock = vi.fn((url: string) => {
      if (url === '/api/categories') {
        return { data: categories }
      }

      if (url === '/api/collections') {
        return { data: collections }
      }

      throw new Error(`Unexpected url: ${url}`)
    })

    vi.stubGlobal('useFetch', useFetchMock)
    useStorefrontProductsQueryMock.mockReturnValue({
      products,
      pending,
    })

    const queries = await useCatalogPageQueries()

    expect(useStorefrontProductsQueryMock).toHaveBeenCalledTimes(1)
    expect(useFetchMock).toHaveBeenNthCalledWith(1, '/api/categories')
    expect(useFetchMock).toHaveBeenNthCalledWith(2, '/api/collections')
    expect(useFetchMock).not.toHaveBeenCalledWith('/api/products?all=1')
    expect(queries.allProducts).toBe(products)
    expect(queries.pending).toBe(pending)
    expect(queries.categoriesData).toBe(categories)
    expect(queries.collectionsData).toBe(collections)
  })
})
