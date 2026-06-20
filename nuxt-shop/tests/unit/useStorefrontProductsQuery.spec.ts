import { ref } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { Product } from '~/composables/useShop'
import { useStorefrontProductsQuery } from '~/composables/useStorefrontProductsQuery'

describe('useStorefrontProductsQuery', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('fetches the shared storefront product feed through a dedicated query boundary', async () => {
    const products = ref<Product[] | null>([])
    const pending = ref(true)
    const useFetchMock = vi.fn((url: string) => {
      if (url === '/api/products?all=1') {
        return { data: products, pending }
      }

      throw new Error(`Unexpected useFetch call: ${url}`)
    })

    vi.stubGlobal('useFetch', useFetchMock)

    const query = await useStorefrontProductsQuery()

    expect(useFetchMock).toHaveBeenCalledWith('/api/products?all=1')
    expect(query.products.value).toBe(products.value)
    expect(query.pending).toBe(pending)
  })

  it('supports null product payload without throwing', async () => {
    const nullProducts = ref<Product[] | null>(null)
    const pending = ref(false)
    const useFetchMock = vi.fn((url: string) => {
      if (url === '/api/products?all=1') {
        return { data: nullProducts, pending }
      }

      throw new Error(`Unexpected useFetch call: ${url}`)
    })

    vi.stubGlobal('useFetch', useFetchMock)

    const query = await useStorefrontProductsQuery()

    expect(query.products.value).toBeNull()
    expect(query.pending).toBe(pending)
  })

  it('normalizes non-array payloads to null', async () => {
    const pending = ref(false)
    const useFetchMock = vi.fn((url: string) => {
      if (url === '/api/products?all=1') {
        return { data: ref({ slug: 'rose' } as Record<string, unknown>), pending }
      }

      throw new Error(`Unexpected useFetch call: ${url}`)
    })

    vi.stubGlobal('useFetch', useFetchMock)

    const query = await useStorefrontProductsQuery()

    expect(query.products.value).toBeNull()
    expect(query.pending).toBe(pending)
  })

  it('falls back to null payload when products request fails', async () => {
    const useFetchMock = vi.fn(() => {
      throw new Error('api unavailable')
    })

    vi.stubGlobal('useFetch', useFetchMock)

    const query = await useStorefrontProductsQuery()

    expect(query.products.value).toBeNull()
    expect(query.pending.value).toBe(false)
  })
})
