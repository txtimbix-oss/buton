import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { SHOP_URL, assetUrl } from '@/api'
import { useCabinetOrders } from '@/composables/useCabinetOrders'
import { useCabinetOrdersResource } from '@/composables/useCabinetOrdersResource'
import { useCabinetTier } from '@/composables/useCabinetTier'
import { useAuthStore } from '@/stores/auth'

export function useAppLayoutState() {
  const auth = useAuthStore()
  const route = useRoute()
  const menuOpen = ref(false)
  const userId = computed(() => auth.user?._id ?? null)
  const firstName = computed(() => auth.user?.firstName)
  const email = computed(() => auth.user?.email)
  const bonusBalance = computed(() => auth.user?.bonusBalance)
  const wishlistCount = computed(() => auth.user?.wishlist.length)
  const initial = computed(() => auth.user?.firstName?.[0] ?? '?')

  const userTitle = computed(() => {
    const firstNamePart = auth.user?.firstName ?? ''
    const lastNamePart = auth.user?.lastName ?? ''

    return `${firstNamePart} ${lastNamePart}`.trim()
  })

  const avatarUrl = computed(() => auth.user?.avatar ? assetUrl(auth.user.avatar) : null)
  const { tierName, tierCashback } = useCabinetTier(computed(() => auth.user?.totalSpent))
  const { orders, loadOrders, resetOrders } = useCabinetOrdersResource()
  const { activeOrdersCount } = useCabinetOrders(orders)

  const pageHandlesOrdersRefresh = computed(() =>
    route.path === '/dashboard' || route.path === '/orders' || route.path.startsWith('/orders/'),
  )

  function openMenu() {
    menuOpen.value = true
  }

  function closeMenu() {
    menuOpen.value = false
  }

  function logout() {
    auth.logout()
  }

  watch(userId, (nextUserId) => {
    if (!nextUserId) {
      resetOrders(null)
      return
    }

    if (pageHandlesOrdersRefresh.value) return

    void loadOrders({ userId: nextUserId }).catch(() => {})
  }, { immediate: true })

  return {
    SHOP_URL,
    activeOrdersCount,
    avatarUrl,
    bonusBalance,
    closeMenu,
    email,
    firstName,
    initial,
    logout,
    menuOpen,
    openMenu,
    tierCashback,
    tierName,
    userTitle,
    wishlistCount,
  }
}
