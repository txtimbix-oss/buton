import { computed } from 'vue'

import { usePersistentState } from '~/lib/storage/persistentState'

const STORAGE_KEY = 'spb_wishlist'

export function useWishlist() {
  const { user } = useShopUser()
  const slugs = usePersistentState<string[]>('wishlist', STORAGE_KEY, () => [])

  async function syncFromApi() {
    if (!process.client) return
    try {
      const data = await $fetch<{ ok: boolean; slugs: string[] }>('/api/user/wishlist', {
        credentials: 'include',
      })
      slugs.value = data.slugs ?? []
    } catch {}
  }

  async function toggle(slug: string) {
    const i = slugs.value.indexOf(slug)
    if (i >= 0) {
      slugs.value.splice(i, 1)
      if (user.value) {
        $fetch(`/api/user/wishlist/${slug}`, { method: 'DELETE', credentials: 'include' }).catch(() => {})
      }
    } else {
      slugs.value.push(slug)
      if (user.value) {
        $fetch(`/api/user/wishlist/${slug}`, { method: 'POST', credentials: 'include' }).catch(() => {})
      }
    }
  }

  function has(slug: string) {
    return computed(() => slugs.value.includes(slug))
  }

  const count = computed(() => slugs.value.length)

  return { slugs, toggle, has, count, syncFromApi }
}
