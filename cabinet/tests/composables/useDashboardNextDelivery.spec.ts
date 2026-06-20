import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { useDashboardNextDelivery } from '@/composables/useDashboardNextDelivery'
import type { CabinetOrder } from '@/types/order'

function mkOrder(overrides: Partial<CabinetOrder>): CabinetOrder {
  return {
    _id: 'o-default',
    orderNumber: '100',
    items: [],
    delivery: { type: 'courier', date: '2026-06-10', time: '10:00' },
    recipient: { name: 'John', phone: '+1' },
    subtotal: 0,
    deliveryCost: 0,
    discount: 0,
    total: 0,
    bonusEarned: 0,
    status: 'pending',
    createdAt: '2026-06-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('useDashboardNextDelivery', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 5, 10, 12, 0, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('выбирает ближайший активный заказ по дате и времени', () => {
    const orders = ref<CabinetOrder[]>([
      mkOrder({ _id: 'future', delivery: { type: 'courier', date: '2026-06-11', time: '09:00' }, status: 'confirmed' }),
      mkOrder({ _id: 'todayNoTime', delivery: { type: 'courier', date: '2026-06-10', time: '' }, status: 'pending' }),
      mkOrder({ _id: 'delivered', delivery: { type: 'courier', date: '2026-06-10', time: '08:00' }, status: 'delivered' }),
    ])

    const { nextDeliveryOrder, nextDeliveryLabel } = useDashboardNextDelivery(orders)

    expect(nextDeliveryOrder.value?._id).toBe('todayNoTime')
    expect(nextDeliveryLabel.value).toContain('уточняется')
  })

  it('возвращает нет если нет активных доставок', () => {
    const orders = ref<CabinetOrder[]>([
      mkOrder({ status: 'delivered' }),
      mkOrder({ status: 'cancelled' }),
    ])

    const { nextDeliveryLabel, nextDeliveryOrder } = useDashboardNextDelivery(orders)

    expect(nextDeliveryOrder.value).toBeNull()
    expect(nextDeliveryLabel.value).toBe('нет')
  })

  it('возвращает label с исходной датой при некорректном времени', () => {
    const orders = ref<CabinetOrder[]>([
      mkOrder({
        _id: 'bad-time',
        delivery: { type: 'courier', date: '2026-06-11', time: 'bad' },
        status: 'pending',
      }),
    ])

    const { nextDeliveryOrder, nextDeliveryLabel } = useDashboardNextDelivery(orders)

    expect(nextDeliveryOrder.value?._id).toBe('bad-time')
    expect(nextDeliveryLabel.value).toContain('11')
    expect(nextDeliveryLabel.value).toContain('уточняется')
  })
})
