import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/api'
import { getErrorMessage } from '@/composables/getErrorMessage'
import type { IUser } from '@/types/user-profile-auth'
import type { WishlistProduct } from '@/types/wishlist'

type WishlistSync = (wishlist: IUser['wishlist']) => void

export const useWishlistStore = defineStore('wishlist', () => {
  const products = ref<WishlistProduct[]>([])
  const loading = ref(false)
  const error = ref('')
  const syncUserWishlist = ref<WishlistSync | null>(null)

  function bindUserWishlistSync(sync: WishlistSync) {
    syncUserWishlist.value = sync
  }

  function reset() {
    products.value = []
    error.value = ''
  }

  async function fetchWishlist() {
    loading.value = true
    error.value = ''

    try {
      const { products: nextProducts } = await api.getWishlist()
      products.value = nextProducts
      return nextProducts
    } catch (cause: unknown) {
      error.value = getErrorMessage(cause, 'Не удалось загрузить избранное')
      throw cause
    } finally {
      loading.value = false
    }
  }

  async function removeFromWishlist(slug: WishlistProduct['slug']) {
    const { wishlist } = await api.removeFromWishlist(slug)
    products.value = products.value.filter(product => product.slug !== slug)
    error.value = ''
    syncUserWishlist.value?.(wishlist)
    return wishlist
  }

  return {
    products,
    loading,
    error,
    bindUserWishlistSync,
    reset,
    fetchWishlist,
    removeFromWishlist,
  }
})
