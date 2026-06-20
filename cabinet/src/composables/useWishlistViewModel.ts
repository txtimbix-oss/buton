import { computed, onMounted, ref, unref } from 'vue'
import { SHOP_URL } from '@/api'
import { getErrorMessage } from '@/composables/getErrorMessage'
import { useToastStore } from '@/stores/toast'
import { useWishlistStore } from '@/stores/wishlist'
import type { WishlistProduct } from '@/types/wishlist'

export function useWishlistViewModel() {
  const wishlistStore = useWishlistStore()
  const toast = useToastStore()
  const removing = ref<WishlistProduct['slug'] | null>(null)
  const confirmSlug = ref<WishlistProduct['slug'] | null>(null)

  const products = computed(() => unref(wishlistStore.products))
  const loading = computed(() => unref(wishlistStore.loading))
  const error = computed(() => unref(wishlistStore.error))

  function askConfirm(slug: WishlistProduct['slug']) {
    confirmSlug.value = slug
  }

  function cancelConfirm() {
    confirmSlug.value = null
  }

  async function confirmRemove() {
    const slug = confirmSlug.value
    if (!slug) return

    confirmSlug.value = null
    removing.value = slug

    try {
      await wishlistStore.removeFromWishlist(slug)
      toast.show('Удалено из избранного', 'info')
    } catch (error: unknown) {
      toast.show(getErrorMessage(error, 'Не удалось удалить товар из избранного. Попробуйте ещё раз.'), 'error')
    } finally {
      removing.value = null
    }
  }

  async function loadWishlist() {
    try {
      await wishlistStore.fetchWishlist()
    } catch (error: unknown) {
      toast.show(getErrorMessage(error, 'Не удалось загрузить избранное. Попробуйте ещё раз.'), 'error')
    }
  }

  onMounted(() => {
    void loadWishlist()
  })

  return {
    SHOP_URL,
    askConfirm,
    cancelConfirm,
    confirmRemove,
    confirmSlug,
    error,
    loadWishlist,
    loading,
    products,
    removing,
  }
}
