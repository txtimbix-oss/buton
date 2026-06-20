import { ref } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

const { storefrontProductsQueryMock } = vi.hoisted(() => ({
  storefrontProductsQueryMock: vi.fn(),
}))

vi.mock('~/composables/useStorefrontProductsQuery', () => ({
  useStorefrontProductsQuery: storefrontProductsQueryMock,
}))

import { useCartPageQueries } from '~/composables/useCartPageQueries'

describe('useCartPageQueries', () => {
  afterEach(() => {
    vi.clearAllMocks()
    vi.unstubAllGlobals()
  })

  it('requests cart lookup datasets through a single typed boundary', async () => {
    const productSnapshots = ref([{ slug: 'rose', images: ['/rose.jpg'] }])
    const deliveryZones = ref([{ _id: 'zone-1', name: 'Центр', keywords: ['невский'], cost: 390 }])
    const loyaltyLevels = ref([{ key: 'base', name: 'Base', icon: 'leaf', min: 0, cashback: 3 }])

    storefrontProductsQueryMock.mockReturnValue({
      products: productSnapshots,
      pending: ref(false),
    })

    const useFetchMock = vi.fn((url: string) => {
      if (url === '/api/delivery-zones') {
        return { data: deliveryZones }
      }

      if (url === '/api/bonus/loyalty-levels') {
        return { data: loyaltyLevels }
      }

      throw new Error(`Unexpected url: ${url}`)
    })

    vi.stubGlobal('useFetch', useFetchMock)

    const queries = await useCartPageQueries()

    expect(storefrontProductsQueryMock).toHaveBeenCalledOnce()
    expect(useFetchMock).toHaveBeenNthCalledWith(1, '/api/delivery-zones')
    expect(useFetchMock).toHaveBeenNthCalledWith(2, '/api/bonus/loyalty-levels')
    expect(queries.productSnapshots.value).toEqual(productSnapshots.value)
    expect(queries.deliveryZones.value).toEqual(deliveryZones.value)
    expect(queries.loyaltyLevels.value).toEqual(loyaltyLevels.value)
    expect(useFetchMock).not.toHaveBeenCalledWith('/api/products?all=1')
  })

  it('survives malformed storefront payloads and still returns other datasets', async () => {
    const productSnapshots = ref(null)
    const deliveryZones = ref([{ _id: 'zone-1', name: 'Центр', keywords: ['невский'], cost: 390 }])
    const loyaltyLevels = ref([{ key: 'base', name: 'Base', icon: 'leaf', min: 0, cashback: 3 }])
    const storefrontPending = ref(false)

    storefrontProductsQueryMock.mockReturnValue({
      products: productSnapshots,
      pending: storefrontPending,
    })

    vi.doMock('~/composables/useStorefrontProductsQuery', () => ({
      useStorefrontProductsQuery: storefrontProductsQueryMock,
    }))

    const useFetchMock = vi.fn((url: string) => {
      if (url === '/api/delivery-zones') {
        return { data: deliveryZones }
      }

      if (url === '/api/bonus/loyalty-levels') {
        return { data: loyaltyLevels }
      }

      throw new Error(`Unexpected url: ${url}`)
    })

    vi.stubGlobal('useFetch', useFetchMock)

    const queries = await useCartPageQueries()

    expect(storefrontProductsQueryMock).toHaveBeenCalledOnce()
    expect(queries.productSnapshots.value).toBeNull()
    expect(queries.deliveryZones.value).toEqual(deliveryZones.value)
    expect(queries.loyaltyLevels.value).toEqual(loyaltyLevels.value)
    expect(useFetchMock).toHaveBeenCalledTimes(2)
    expect(useFetchMock).not.toHaveBeenCalledWith('/api/products?all=1')
  })

  it('normalizes storefront snapshots, zones, and bonus payloads to stable contracts', async () => {
    const productSnapshots = ref([
      {
        _id: 'p1',
        slug: 'rose-dream',
        images: ['/rose.jpg', '/rose2.jpg'],
        volumeRules: [{ minQty: 2, discountPct: 15 }],
      },
      {
        _id: 'p2',
        images: 'bad-images',
        volumeRules: [{ minQty: '4', discountPct: '5' }],
      },
      {
        _id: 'p3',
        slug: '',
        images: ['/bad.jpg'],
      },
    ])

    const deliveryZones = ref([
      {
        _id: 'zone-center',
        name: 'Центр',
        cost: '390',
        keywords: 'центр, нева',
      },
      {
        _id: 'zone-up',
        name: 'Север',
        cost: 450,
        keywords: ['север', 'маршрут'],
      },
    ])

    const loyaltyLevels = ref([
      { key: 'base', name: 'Базовый', icon: 'leaf', min: '0', cashback: '3' },
      { key: '', name: 'Неполный', icon: 'leaf', min: 10, cashback: 5 },
      { _id: 'id-2', key: 'vip', name: 12, icon: 'medal', min: 100, cashback: '8' },
      { key: 'gold', name: 'Золотой', icon: 'crown', min: 0, cashback: 0 },
    ])

    storefrontProductsQueryMock.mockReturnValue({
      products: productSnapshots,
      pending: ref(false),
    })

    const useFetchMock = vi.fn((url: string) => {
      if (url === '/api/delivery-zones') return { data: deliveryZones }
      if (url === '/api/bonus/loyalty-levels') return { data: loyaltyLevels }
      throw new Error(`Unexpected url: ${url}`)
    })

    vi.stubGlobal('useFetch', useFetchMock)

    const queries = await useCartPageQueries()

    expect(queries.productSnapshots.value).toEqual([
      {
        slug: 'rose-dream',
        images: ['/rose.jpg', '/rose2.jpg'],
        volumeRules: [{ minQty: 2, discountPct: 15 }],
      },
    ])

    expect(queries.deliveryZones.value).toEqual([
      {
        _id: 'zone-center',
        name: 'Центр',
        keywords: ['центр', 'нева'],
        cost: 390,
      },
      {
        _id: 'zone-up',
        name: 'Север',
        cost: 450,
        keywords: ['север', 'маршрут'],
      },
    ])

    expect(queries.loyaltyLevels.value).toEqual([
      {
        key: 'base',
        name: 'Базовый',
        icon: 'leaf',
        min: 0,
        cashback: 3,
      },
      {
        key: 'gold',
        name: 'Золотой',
        icon: 'crown',
        min: 0,
        cashback: 0,
      },
    ])
  })
})
