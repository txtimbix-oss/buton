import { computed, onMounted, ref, type Ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

import { api, SHOP_URL } from '@/api'
import { CABINET_ORDER_STATUS_LABELS, useCabinetOrders } from '@/composables/useCabinetOrders'
import { useCabinetOrdersResource } from '@/composables/useCabinetOrdersResource'
import { useCabinetTier } from '@/composables/useCabinetTier'
import { useDashboardNextDelivery } from '@/composables/useDashboardNextDelivery'
import { useDashboardPromos, type ActivePromo, type BirthdayPromo } from '@/composables/useDashboardPromos'
import { useDashboardRecommendations } from '@/composables/useDashboardRecommendations'
import { getErrorMessage } from '@/composables/getErrorMessage'
import { useRepeatOrder } from '@/composables/useRepeatOrder'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import type { CabinetOrder } from '@/types/order'
import type { IProduct } from '@/types/product'
import type { IUser } from '@/types/user-profile-auth'
import { formatShortDate } from '@/utils/formatters'

type DashboardToast = (message: string, type?: 'success' | 'error' | 'info') => void

interface DashboardRepeatOptions {
  target?: 'shop' | 'cart'
  message?: string
  toastType?: 'success' | 'info' | 'error'
}

export interface DashboardViewModelDeps {
  user: Ref<IUser | null>
  orders: Ref<CabinetOrder[]>
  ordersLoading: Ref<boolean>
  loadOrders: (options: { force?: boolean; userId?: string }) => Promise<unknown>
  activePromos: Ref<ActivePromo[]>
  birthdayPromo: Ref<BirthdayPromo | null>
  loadPromos: (userId?: string) => Promise<void>
  recommendations: Ref<IProduct[]>
  loadRecommendations: (wishlist: string[]) => Promise<void>
  duplicateOrder: (id: string) => Promise<unknown>
  repeatOrder: (order: CabinetOrder, options?: DashboardRepeatOptions) => void
  navigate: (path: string) => void
  openExternal: (url: string) => void
  copyText: (text: string) => void
  showToast: DashboardToast
  shopUrl: string
}

/**
 * Testable core дашборда. Все внешние эффекты (api, router, window, clipboard,
 * toast, auth) приходят через `deps`. Чистые reactive-производные (tier/orders/
 * next-delivery) считаются здесь же из инъектированных refs.
 */
export function createDashboardViewModel(deps: DashboardViewModelDeps) {
  const repeatingOrder = ref(false)

  const totalSpent = computed(() => deps.user.value?.totalSpent ?? 0)
  const {
    tierName: loyaltyName,
    tierCashback,
    isMaxLevel,
    nextThreshold,
    nextTierName,
    remainingToNext,
    progressPct,
  } = useCabinetTier(totalSpent)
  const { latestOrder, recentOrders, hasDeliveredOrders: canCreateReview } = useCabinetOrders(deps.orders)
  const { nextDeliveryLabel } = useDashboardNextDelivery(deps.orders)

  const userFirstName = computed(() => deps.user.value?.firstName)
  const bonusBalance = computed(() => deps.user.value?.bonusBalance ?? 0)
  const referralCode = computed(() => deps.user.value?.referralCode)
  const wishlist = computed(() => deps.user.value?.wishlist ?? [])
  const hasLatestOrder = computed(() => Boolean(latestOrder.value))

  const latestOrderStatus = computed(() =>
    latestOrder.value ? CABINET_ORDER_STATUS_LABELS[latestOrder.value.status] : 'Нет заказов',
  )

  const latestOrderSubline = computed(() =>
    latestOrder.value
      ? `${latestOrder.value.orderNumber} · ${formatShortDate(latestOrder.value.createdAt)}`
      : 'Сделайте первый заказ',
  )

  function copyCode(code: string) {
    deps.copyText(code)
    deps.showToast(`Промокод ${code} скопирован`, 'success')
  }

  function handleReferralCopied() {
    deps.showToast('Ссылка скопирована', 'success')
  }

  function openCart() {
    deps.openExternal(`${deps.shopUrl}/cart`)
  }

  function openOrder(orderId: string) {
    deps.navigate(`/orders/${orderId}`)
  }

  function goToReview() {
    if (!canCreateReview.value) {
      deps.showToast('Отзывы доступны после доставки заказа', 'info')
      return
    }

    deps.navigate('/reviews')
  }

  async function repeatLastOrder() {
    if (!latestOrder.value) {
      deps.showToast('Нет заказов для повтора', 'info')
      return
    }

    repeatingOrder.value = true

    try {
      await deps.duplicateOrder(latestOrder.value._id)
      deps.repeatOrder(latestOrder.value, {
        target: 'cart',
        message: 'Заказ скопирован в корзину',
        toastType: 'success',
      })
    } catch (error) {
      deps.showToast(getErrorMessage(error, 'Не удалось повторить заказ'), 'error')
    } finally {
      repeatingOrder.value = false
    }
  }

  async function loadDashboardData() {
    try {
      await deps.loadOrders({ force: true, userId: deps.user.value?._id })
    } catch {}

    await deps.loadPromos(deps.user.value?._id)
    await deps.loadRecommendations(wishlist.value)
  }

  return {
    SHOP_URL: deps.shopUrl,
    activePromos: deps.activePromos,
    birthdayPromo: deps.birthdayPromo,
    bonusBalance,
    canCreateReview,
    copyCode,
    goToReview,
    handleReferralCopied,
    hasLatestOrder,
    isMaxLevel,
    latestOrderStatus,
    latestOrderSubline,
    loading: deps.ordersLoading,
    loadDashboardData,
    loyaltyName,
    nextDeliveryLabel,
    nextThreshold,
    nextTierName,
    openCart,
    openOrder,
    progressPct,
    recentOrders,
    recommendations: deps.recommendations,
    referralCode,
    remainingToNext,
    repeatLastOrder,
    repeatingOrder,
    tierCashback,
    totalSpent,
    userFirstName,
  }
}

/**
 * Runtime wrapper: подставляет реальные auth/router/api/toast/window и грузит
 * данные при mount. Вся логика живёт в `createDashboardViewModel`.
 */
export function useDashboardViewModel() {
  const auth = useAuthStore()
  const toast = useToastStore()
  const router = useRouter()
  const { user } = storeToRefs(auth)
  const { orders, loading, loadOrders } = useCabinetOrdersResource()
  const { activePromos, birthdayPromo, loadPromos } = useDashboardPromos()
  const { recommendations, loadRecommendations } = useDashboardRecommendations()
  const { repeatOrder } = useRepeatOrder()

  const viewModel = createDashboardViewModel({
    user,
    orders,
    ordersLoading: loading,
    loadOrders,
    activePromos,
    birthdayPromo,
    loadPromos,
    recommendations,
    loadRecommendations,
    duplicateOrder: api.duplicateOrder,
    repeatOrder,
    navigate: path => { void router.push(path) },
    openExternal: url => { window.open(url, '_blank') },
    copyText: text => { try { navigator.clipboard.writeText(text) } catch {} },
    showToast: (message, type) => toast.show(message, type),
    shopUrl: SHOP_URL,
  })

  onMounted(() => {
    void viewModel.loadDashboardData()
  })

  return viewModel
}
