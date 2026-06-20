import { ref } from 'vue'
import { describe, expect, it } from 'vitest'
import { useCabinetOrders } from '@/composables/useCabinetOrders'
import type { CabinetOrder } from '@/types/order'

function makeOrder(overrides: Partial<CabinetOrder>): CabinetOrder {
  return {
    _id: 'o-default',
    orderNumber: '100',
    items: [],
    delivery: { type: 'courier', date: '2026-06-01', time: '12:00' },
    recipient: { name: 'John', phone: '+79990000000' },
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

describe('useCabinetOrders', () => {
  it('вычисляет текущее, последние 3 и количество активных заказов', () => {
    const orders = ref([
      makeOrder({ _id: '1', status: 'delivered' }),
      makeOrder({ _id: '2', status: 'confirmed' }),
      makeOrder({ _id: '3', status: 'delivering' }),
      makeOrder({ _id: '4', status: 'cancelled' }),
      makeOrder({ _id: '5', status: 'pending' }),
    ])

    const { latestOrder, recentOrders, activeOrdersCount, hasDeliveredOrders } = useCabinetOrders(orders)

    expect(latestOrder.value?._id).toBe('1')
    expect(recentOrders.value).toHaveLength(3)
    expect(recentOrders.value[2]._id).toBe('3')
    expect(activeOrdersCount.value).toBe(3) // confirmed/delivering/pending
    expect(hasDeliveredOrders.value).toBe(true)
  })

  it('реактивно пересчитывает при изменении списка заказов', () => {
    const orders = ref([makeOrder({ _id: '1', status: 'pending' })])
    const { latestOrder, activeOrdersCount, hasDeliveredOrders } = useCabinetOrders(orders)

    expect(latestOrder.value?._id).toBe('1')
    expect(activeOrdersCount.value).toBe(1)
    expect(hasDeliveredOrders.value).toBe(false)

    orders.value = [
      makeOrder({ _id: '2', status: 'delivered' }),
      makeOrder({ _id: '3', status: 'delivered' }),
    ]

    expect(latestOrder.value?._id).toBe('2')
    expect(activeOrdersCount.value).toBe(0)
    expect(hasDeliveredOrders.value).toBe(true)
  })
})
