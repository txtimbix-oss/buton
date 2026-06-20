import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useWishlistViewModel } from '@/composables/useWishlistViewModel'
import type { WishlistProduct } from '@/types/wishlist'

const { toast, wishlistStore } = vi.hoisted(() => ({
  toast: {
    show: vi.fn(),
  },
  wishlistStore: {
    products: [] as WishlistProduct[],
    loading: false,
    error: '',
    fetchWishlist: vi.fn(),
    removeFromWishlist: vi.fn(),
  },
}))

vi.mock('@/stores/wishlist', () => ({
  useWishlistStore: () => wishlistStore,
}))

vi.mock('@/stores/toast', () => ({
  useToastStore: () => toast,
}))

function makeProduct(overrides: Partial<WishlistProduct> = {}): WishlistProduct {
  return {
    slug: 'rose',
    name: 'Розы',
    price: 3000,
    ...overrides,
  }
}

describe('useWishlistViewModel', () => {
  beforeEach(() => {
    wishlistStore.products = []
    wishlistStore.loading = false
    wishlistStore.error = ''
    wishlistStore.fetchWishlist.mockReset().mockResolvedValue([])
    wishlistStore.removeFromWishlist.mockReset().mockResolvedValue([])
    toast.show.mockClear()
  })

  it('exposes wishlist store state and loads wishlist with retry-friendly action', async () => {
    wishlistStore.products = [makeProduct({ slug: 'rose' })]
    wishlistStore.error = 'old error'

    const vm = useWishlistViewModel()

    expect(vm.products.value.map(product => product.slug)).toEqual(['rose'])
    expect(vm.error.value).toBe('old error')

    await vm.loadWishlist()

    expect(wishlistStore.fetchWishlist).toHaveBeenCalledOnce()
  })

  it('confirms removal, clears pending dialog, and exposes removing slug during API call', async () => {
    let resolveRemove!: () => void
    wishlistStore.removeFromWishlist.mockReturnValueOnce(new Promise<string[]>(resolve => {
      resolveRemove = () => resolve([])
    }))

    const vm = useWishlistViewModel()
    vm.askConfirm('rose')

    const removal = vm.confirmRemove()

    expect(vm.confirmSlug.value).toBeNull()
    expect(vm.removing.value).toBe('rose')
    expect(wishlistStore.removeFromWishlist).toHaveBeenCalledWith('rose')

    resolveRemove()
    await removal

    expect(vm.removing.value).toBeNull()
    expect(toast.show).toHaveBeenCalledWith('Удалено из избранного', 'info')
  })

  it('cancels pending removal and maps load/remove failures to toast messages', async () => {
    const vm = useWishlistViewModel()
    vm.askConfirm('rose')
    vm.cancelConfirm()

    expect(vm.confirmSlug.value).toBeNull()

    wishlistStore.fetchWishlist.mockRejectedValueOnce(new Error('load failed'))
    await vm.loadWishlist()
    expect(toast.show).toHaveBeenCalledWith('load failed', 'error')

    wishlistStore.removeFromWishlist.mockRejectedValueOnce(new Error('remove failed'))
    vm.askConfirm('rose')
    await vm.confirmRemove()

    expect(vm.removing.value).toBeNull()
    expect(toast.show).toHaveBeenCalledWith('remove failed', 'error')
  })
})
