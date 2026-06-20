import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { api } from '@/api'
import { useWishlistStore } from '@/stores/wishlist'
import type { WishlistProduct } from '@/types/wishlist'

vi.mock('@/api', () => ({
  api: {
    getWishlist: vi.fn(),
    removeFromWishlist: vi.fn(),
  },
}))

function makeProduct(slug: string): WishlistProduct {
  return {
    slug,
    name: `Product ${slug}`,
    price: 100,
  }
}

describe('useWishlistStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.mocked(api.getWishlist).mockReset()
    vi.mocked(api.removeFromWishlist).mockReset()
  })

  it('загружает wishlist и сохраняет продукты в store', async () => {
    const store = useWishlistStore()
    const products = [makeProduct('rose'), makeProduct('tulip')]
    vi.mocked(api.getWishlist).mockResolvedValue({
      ok: true,
      slugs: products.map(product => product.slug),
      products,
    })

    const result = await store.fetchWishlist()

    expect(result).toEqual(products)
    expect(store.products).toEqual(products)
    expect(store.loading).toBe(false)
    expect(store.error).toBe('')
  })

  it('сохраняет ошибку загрузки и пробрасывает её дальше', async () => {
    const store = useWishlistStore()
    vi.mocked(api.getWishlist).mockRejectedValueOnce(new Error('boom'))

    await expect(store.fetchWishlist()).rejects.toThrow('boom')
    expect(store.loading).toBe(false)
    expect(store.error).toBe('boom')
  })

  it('удаляет продукт, синхронизирует wishlist пользователя и умеет сбрасывать состояние', async () => {
    const store = useWishlistStore()
    const syncUserWishlist = vi.fn()

    store.products = [makeProduct('rose'), makeProduct('tulip')]
    store.bindUserWishlistSync(syncUserWishlist)

    vi.mocked(api.removeFromWishlist).mockResolvedValueOnce({
      ok: true,
      wishlist: ['rose'],
    })

    const wishlist = await store.removeFromWishlist('tulip')

    expect(wishlist).toEqual(['rose'])
    expect(store.products).toEqual([makeProduct('rose')])
    expect(syncUserWishlist).toHaveBeenCalledWith(['rose'])
    expect(store.error).toBe('')

    store.error = 'temporary'
    store.reset()
    expect(store.products).toEqual([])
    expect(store.error).toBe('')
  })
})
