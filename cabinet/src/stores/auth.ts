import { defineStore } from 'pinia'
import { ref } from 'vue'
import { createAuthAddressBoundary } from '@/stores/auth-addresses'
import { createAuthSessionBoundary } from '@/stores/auth-session'
import { useWishlistStore } from '@/stores/wishlist'
import type { IUser, RegisterPayload } from '@/types/user-profile-auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<IUser | null>(null)
  const loading = ref(false)
  const wishlistStore = useWishlistStore()

  async function withLoading<T>(action: () => Promise<T>) {
    loading.value = true
    try {
      return await action()
    } finally {
      loading.value = false
    }
  }

  const sessionBoundary = createAuthSessionBoundary({
    user,
    resetWishlist: () => wishlistStore.reset(),
  })

  const addressBoundary = createAuthAddressBoundary({
    user,
    mergeUserPatch: sessionBoundary.mergeUserPatch,
  })

  wishlistStore.bindUserWishlistSync(sessionBoundary.syncWishlist)

  async function login(email: string, password: string) {
    return withLoading(() => sessionBoundary.login(email, password))
  }

  async function register(data: RegisterPayload) {
    return withLoading(() => sessionBoundary.register(data))
  }

  function updateUser(updated: IUser) {
    user.value = updated
  }

  return {
    user,
    loading,
    addresses: addressBoundary.addresses,
    fetchMe: sessionBoundary.fetchMe,
    login,
    register,
    logout: sessionBoundary.logout,
    addAddress: addressBoundary.addAddress,
    updateAddress: addressBoundary.updateAddress,
    deleteAddress: addressBoundary.deleteAddress,
    updateUser,
  }
})
