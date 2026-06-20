import { describe, expect, it, vi } from 'vitest'
import { useDashboardRecommendations } from '@/composables/useDashboardRecommendations'
import { api } from '@/api'
import type { IProduct } from '@/types/product'

vi.mock('@/api', () => ({
  api: {
    getProducts: vi.fn(),
  },
}))

function makeProduct(overrides: Partial<IProduct>): IProduct {
  return {
    _id: 'p-default',
    name: 'Product',
    slug: 'product',
    meta: '',
    price: 100,
    bloom: 'red',
    images: [''],
    inStock: true,
    ...overrides,
  }
}

describe('useDashboardRecommendations', () => {
  it('подгружает рекомендации и отсекает already-wishlist', async () => {
    vi.mocked(api.getProducts).mockResolvedValue([
      makeProduct({ _id: 'p1', slug: 'rose' }),
      makeProduct({ _id: 'p2', slug: 'tulip' }),
      makeProduct({ _id: 'p3', slug: 'orchid' }),
      makeProduct({ _id: 'p4', slug: 'lily' }),
      makeProduct({ _id: 'p5', slug: 'daisy' }),
    ])

    const { recommendations, loadRecommendations } = useDashboardRecommendations()
    await loadRecommendations(['rose', 'orchid'])

    expect(recommendations.value.map(item => item.slug)).toEqual(['tulip', 'lily', 'daisy'])
    expect(api.getProducts).toHaveBeenCalledWith({ featured: 'true' })
  })

  it('ограничивает список рекомендаций до 4', async () => {
    vi.mocked(api.getProducts).mockResolvedValue([
      ...Array.from({ length: 6 }, (_, idx) => makeProduct({ _id: `p${idx}`, slug: `slug-${idx}` })),
    ])

    const { recommendations, loadRecommendations } = useDashboardRecommendations()
    await loadRecommendations(['slug-1'])

    expect(recommendations.value).toHaveLength(4)
  })

  it('тихо игнорирует ошибки каталога и очищает список', async () => {
    vi.mocked(api.getProducts).mockRejectedValue(new Error('cat error'))

    const { recommendations, loadRecommendations } = useDashboardRecommendations()
    await loadRecommendations(['rose'])

    expect(recommendations.value).toEqual([])
  })
})
