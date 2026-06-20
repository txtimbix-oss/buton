import { computed, type Ref } from 'vue'
import type { CabinetOrder } from '@/types/order'
import { isActiveCabinetOrder } from '@/composables/useCabinetOrders'
import { formatShortDate } from '@/utils/formatters'

export function useDashboardNextDelivery(orders: Ref<CabinetOrder[]>) {
  const nextDeliveryOrder = computed<CabinetOrder | null>(() => {
    const now = Date.now()
    const candidates = orders.value
      .filter(isActiveCabinetOrder)
      .map(order => ({ order, date: getDeliveryDateTime(order, { keepDateOnlyAvailableToday: true }) }))
      .filter((candidate): candidate is { order: CabinetOrder; date: Date } => candidate.date !== null && candidate.date.getTime() >= now)
      .sort((a, b) => a.date.getTime() - b.date.getTime())

    return candidates[0]?.order ?? null
  })

  const nextDeliveryLabel = computed(() => {
    if (!nextDeliveryOrder.value) return 'нет'

    const dt = getDeliveryDateTime(nextDeliveryOrder.value)
    if (!dt) return nextDeliveryOrder.value.delivery.date

    const deliveryTime = formatDeliveryTime(nextDeliveryOrder.value.delivery.time)

    return `${formatShortDate(dt)}, ${deliveryTime}`
  })

  return {
    nextDeliveryLabel,
    nextDeliveryOrder,
  }
}

function getDeliveryDateTime(
  order: CabinetOrder,
  options: { keepDateOnlyAvailableToday?: boolean } = {},
): Date | null {
  if (!order.delivery.date) return null

  const match = order.delivery.time?.match(/\d{1,2}:\d{2}/)?.[0]
  const dt = match
    ? new Date(`${order.delivery.date}T${match}:00`)
    : options.keepDateOnlyAvailableToday && order.delivery.date === getLocalDateKey(new Date())
      ? new Date(`${order.delivery.date}T23:59:59.999`)
    : new Date(order.delivery.date)

  return Number.isNaN(dt.getTime()) ? null : dt
}

function getLocalDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function formatDeliveryTime(rawTime: string) {
  const match = rawTime?.match(/^\d{1,2}:\d{2}$/)?.[0]
  return match ?? 'уточняется'
}
