import { computed, onMounted, ref, type Ref } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '@/api'
import { useCabinetOrdersResource } from '@/composables/useCabinetOrdersResource'
import { getErrorMessage } from '@/composables/getErrorMessage'
import { useRepeatOrder } from '@/composables/useRepeatOrder'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import type { CabinetOrder, CabinetOrderItem } from '@/types/order'

const TIMELINE_STEPS = [
  { key: 'pending', label: 'Принят в работу' },
  { key: 'confirmed', label: 'Подтверждён флористом' },
  { key: 'delivering', label: 'Передан курьеру' },
  { key: 'delivered', label: 'Доставлен' },
]

const STATUS_ORDER: Record<string, number> = {
  pending: 0,
  confirmed: 1,
  delivering: 2,
  delivered: 3,
  cancelled: -1,
}

export interface OrderDetailViewModelDeps {
  orderId: Ref<string>
  orders: Ref<CabinetOrder[]>
  ordersLoading: Ref<boolean>
  loadOrders: (options: { force?: boolean; userId?: string }) => Promise<unknown>
  replaceOrder: (order: CabinetOrder) => void
  cancelOrder: (id: string) => Promise<{ order: CabinetOrder }>
  createReview: (payload: { productSlug: string; rating: number; text: string }) => Promise<unknown>
  repeatOrder: (order: CabinetOrder) => void
  getUserId: () => string | undefined
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void
}

/**
 * Testable core карточки заказа. Источник заказа (`orderId`), shared-resource и
 * внешние эффекты (api cancel/review, repeat, toast) приходят через `deps` —
 * core не знает про `useRoute/useRouter`.
 */
export function createOrderDetailViewModel(deps: OrderDetailViewModelDeps) {
  const detailLoading = ref(true)
  const cancelModal = ref(false)
  const cancelling = ref(false)
  const reviewedSlugs = ref<Set<string>>(new Set())
  const reviewModal = ref(false)
  const reviewItem = ref<CabinetOrderItem | null>(null)
  const reviewForm = ref({ rating: 0, text: '' })
  const reviewError = ref('')
  const reviewSaving = ref(false)

  const order = computed<CabinetOrder | null>(() =>
    deps.orders.value.find((candidate) => candidate._id === deps.orderId.value) ?? null,
  )

  const timelineSteps = computed(() =>
    order.value?.status === 'cancelled'
      ? [{ key: 'cancelled', label: 'Отменён' }]
      : TIMELINE_STEPS,
  )

  const canCancel = computed(() =>
    order.value ? ['pending', 'confirmed'].includes(order.value.status) : false,
  )

  function stepClass(key: string): 'done' | 'current' | 'upcoming' | 'cancelled' {
    if (!order.value) return 'upcoming'
    const status = order.value.status
    if (status === 'cancelled' && key === 'cancelled') return 'current'
    const stepIdx = STATUS_ORDER[key] ?? 99
    const curIdx = STATUS_ORDER[status] ?? 99
    if (stepIdx < curIdx) return 'done'
    if (stepIdx === curIdx) return 'current'
    return 'upcoming'
  }

  async function doCancel() {
    if (!order.value) return
    cancelling.value = true

    try {
      const res = await deps.cancelOrder(order.value._id)
      deps.replaceOrder(res.order)
      cancelModal.value = false
      deps.showToast('Заказ отменён', 'info')
    } catch (cause: unknown) {
      deps.showToast(getErrorMessage(cause, 'Не удалось отменить заказ. Обновите страницу и попробуйте ещё раз.'), 'error')
    } finally {
      cancelling.value = false
    }
  }

  function repeatOrder() {
    if (!order.value) return
    deps.repeatOrder(order.value)
  }

  function openReviewModal(item: CabinetOrderItem) {
    reviewItem.value = item
    reviewForm.value = { rating: 0, text: '' }
    reviewError.value = ''
    reviewModal.value = true
  }

  function closeReviewModal() {
    reviewModal.value = false
  }

  async function submitReview() {
    if (!reviewItem.value || !reviewForm.value.rating || !reviewForm.value.text.trim()) return
    reviewSaving.value = true
    reviewError.value = ''

    try {
      await deps.createReview({
        productSlug: reviewItem.value.slug,
        rating: reviewForm.value.rating,
        text: reviewForm.value.text.trim(),
      })
      reviewedSlugs.value.add(reviewItem.value.slug)
      reviewModal.value = false
      deps.showToast('Отзыв отправлен на модерацию', 'success')
    } catch (cause: unknown) {
      reviewError.value = getErrorMessage(cause, 'Не удалось отправить отзыв. Проверьте текст и попробуйте ещё раз.')
    } finally {
      reviewSaving.value = false
    }
  }

  async function loadData() {
    try {
      await deps.loadOrders({ force: true, userId: deps.getUserId() })
    } catch {
    } finally {
      detailLoading.value = false
    }
  }

  return {
    canCancel,
    cancelModal,
    cancelling,
    closeReviewModal,
    detailLoading,
    doCancel,
    loadData,
    loading: deps.ordersLoading,
    openReviewModal,
    order,
    repeatOrder,
    reviewError,
    reviewForm,
    reviewItem,
    reviewModal,
    reviewSaving,
    reviewedSlugs,
    stepClass,
    submitReview,
    timelineSteps,
  }
}

/**
 * Runtime wrapper: подставляет route/auth/api/toast/shared-resource и грузит
 * заказы при mount. Вся логика живёт в `createOrderDetailViewModel`.
 */
export function useOrderDetailViewModel() {
  const auth = useAuthStore()
  const route = useRoute()
  const toast = useToastStore()
  const { orders, loading, loadOrders, replaceOrder } = useCabinetOrdersResource()
  const { repeatOrder } = useRepeatOrder()

  const viewModel = createOrderDetailViewModel({
    orderId: computed(() => String(route.params.id ?? '')),
    orders,
    ordersLoading: loading,
    loadOrders,
    replaceOrder,
    cancelOrder: id => api.cancelOrder(id),
    createReview: payload => api.createReview(payload),
    repeatOrder,
    getUserId: () => auth.user?._id,
    showToast: (message, type) => toast.show(message, type),
  })

  onMounted(() => {
    void viewModel.loadData()
  })

  return viewModel
}
