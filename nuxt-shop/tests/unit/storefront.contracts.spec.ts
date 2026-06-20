import { ref } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

const useStorefrontProductsQueryMock = vi.fn()

async function importCatalogQueries() {
  vi.resetModules()

  vi.doMock('~/composables/useStorefrontProductsQuery', () => ({
    useStorefrontProductsQuery: useStorefrontProductsQueryMock,
  }))

  const storefrontProducts = ref([{ slug: 'rose' }])
  const storefrontPending = ref(false)
  useStorefrontProductsQueryMock.mockReturnValue({
    products: storefrontProducts,
    pending: storefrontPending,
  })

  const useFetchMock = vi.fn((url: string | (() => string)) => {
    const path = typeof url === 'function' ? url() : url

    if (url === '/api/categories') return { data: ref([]) }
    if (path === '/api/categories' || path === '/api/collections' || path === '/api/reviews/public?limit=8' || path === '/api/banners/active' || path === '/api/delivery-zones' || path === '/api/bonus/loyalty-levels') {
      return { data: ref([]), pending: ref(false) }
    }

    if (path.startsWith('/api/products/') || path.startsWith('/api/reviews/product/')) {
      return { data: ref([]) }
    }

    throw new Error(`Unexpected url: ${path}`)
  })
  vi.stubGlobal('useFetch', useFetchMock)

  const catalogQueries = (await import('~/composables/useCatalogPageQueries')).useCatalogPageQueries
  const homeQueries = (await import('~/composables/useHomePageQueries')).useHomePageQueries
  const cartQueries = (await import('~/composables/useCartPageQueries')).useCartPageQueries

  vi.stubGlobal('useRuntimeConfig', () => ({ public: { apiBase: 'https://api.buton.test' } }))
  const productQueriesModule = await import('~/composables/useProductPageQueries')
  const productQueries = productQueriesModule.useProductPageQueries

  return {
    useStorefrontProductsQueryMock,
    useFetchMock,
    catalogQueries,
    homeQueries,
    cartQueries,
    productQueries,
  }
}

describe('Storefront boundary contracts', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.resetAllMocks()
  })

  it('centralizes products fetch in useStorefrontProductsQuery and exposes reactive contract', async () => {
    vi.resetModules()
    const useFetchMock = vi.fn((url: string) => {
      if (url === '/api/products?all=1') {
        return {
          data: ref([{ slug: 'rose' }]),
          pending: ref(false),
        }
      }

      throw new Error(`Unexpected url: ${url}`)
    })

    vi.stubGlobal('useFetch', useFetchMock)

    const { useStorefrontProductsQuery } = await import('~/composables/useStorefrontProductsQuery')
    const result = await useStorefrontProductsQuery()

    expect(useFetchMock).toHaveBeenCalledWith('/api/products?all=1')
    expect(Array.isArray(result.products.value) || result.products.value === null).toBe(true)
    expect(typeof result.pending.value).toBe('boolean')
  })

  it('keeps dependent queries on dedicated boundaries and does not duplicate feed calls', async () => {
    const {
      useStorefrontProductsQueryMock,
      useFetchMock,
      catalogQueries,
      homeQueries,
      cartQueries,
      productQueries,
    } = await importCatalogQueries()

    const slug = ref('peony')
    await catalogQueries()
    await homeQueries()
    await cartQueries()
    await productQueries(slug)

    expect(useStorefrontProductsQueryMock).toHaveBeenCalledTimes(4)
    expect(useFetchMock).toHaveBeenCalledWith('/api/categories')
    expect(useFetchMock).toHaveBeenCalledWith('/api/collections')
    expect(useFetchMock).toHaveBeenCalledWith('/api/reviews/public?limit=8')
    expect(useFetchMock).toHaveBeenCalledWith('/api/banners/active')
    expect(useFetchMock).toHaveBeenCalledWith('/api/delivery-zones')
    expect(useFetchMock).toHaveBeenCalledWith('/api/bonus/loyalty-levels')
    expect(useFetchMock).not.toHaveBeenCalledWith('/api/products?all=1')
  })
})
