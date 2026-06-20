import { computed, unref, type ComputedRef, type Ref } from 'vue'
import type { CabinetOrder } from '@/types/order'
import { useCabinetOrdersResource } from '@/composables/useCabinetOrdersResource'

type MaybeValue<T> = T | Ref<T> | ComputedRef<T>

export const ACTIVE_CABINET_ORDER_STATUSES: CabinetOrder['status'][] = [
  'pending',
  'confirmed',
  'delivering',
]

export const CABINET_ORDER_STATUS_LABELS: Record<CabinetOrder['status'], string> = {
  pending: 'Принят',
  confirmed: 'Подтверждён',
  delivering: 'Доставляется',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
  refunded: 'Возвращён',
}

export function isActiveCabinetOrder(order: CabinetOrder) {
  return ACTIVE_CABINET_ORDER_STATUSES.includes(order.status)
}

export function useCabinetOrders(ordersInput: MaybeValue<CabinetOrder[]> = useCabinetOrdersResource().orders) {
  const orders = computed(() => unref(ordersInput))
  const latestOrder = computed(() => orders.value[0] ?? null)
  const recentOrders = computed(() => orders.value.slice(0, 3))
  const activeOrdersCount = computed(() => orders.value.filter(isActiveCabinetOrder).length)
  const hasDeliveredOrders = computed(() => orders.value.some(order => order.status === 'delivered'))

  return {
    orders,
    latestOrder,
    recentOrders,
    activeOrdersCount,
    hasDeliveredOrders,
  }
}
