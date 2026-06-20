import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { useOrdersViewModel } from '@/composables/useOrdersViewModel'
import type { CabinetOrder } from '@/types/order'

const { auth, loadOrders, orders, router } = vi.hoisted(() => ({
  auth: {
    user: { _id: 'u1' },
  },
  loadOrders: vi.fn().mockResolvedValue(undefined),
  orders: {
    value: [] as CabinetOrder[],
  },
  router: {
    push: vi.fn(),
  },
}))

vi.mock('vue-router', () => ({
  useRouter: () => router,
}))

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => auth,
}))

vi.mock('@/composables/useCabinetOrdersResource', () => ({
  useCabinetOrdersResource: () => ({
    orders,
    loading: { value: false },
    loadOrders,
  }),
}))

function makeOrder(overrides: Partial<CabinetOrder> = {}): CabinetOrder {
  return {
    _id: 'o-default',
    orderNumber: 'ORD-100',
    items: [],
    delivery: { type: 'courier', date: '2026-06-10', time: '10:00' },
    recipient: { name: 'Анна', phone: '+79990000000' },
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

describe('useOrdersViewModel', () => {
  beforeEach(() => {
    orders.value = []
    loadOrders.mockClear()
    router.push.mockClear()
    auth.user = { _id: 'u1' }
  })

  it('filters active orders and searches by order number case-insensitively', () => {
    orders.value = [
      makeOrder({ _id: 'pending', orderNumber: 'ORD-Alpha', status: 'pending' }),
      makeOrder({ _id: 'delivered', orderNumber: 'ORD-Beta', status: 'delivered' }),
      makeOrder({ _id: 'cancelled', orderNumber: 'ORD-alpha-cancelled', status: 'cancelled' }),
    ]

    const vm = useOrdersViewModel()
    vm.selectFilter('active')
    vm.searchQuery.value = 'alpha'

    expect(vm.filtered.value.map(order => order._id)).toEqual(['pending'])
  })

  it('resets page when filter or search changes', async () => {
    orders.value = Array.from({ length: 12 }, (_, index) => makeOrder({ _id: `o-${index}`, orderNumber: `ORD-${index}` }))

    const vm = useOrdersViewModel()
    vm.selectPage(2)
    expect(vm.page.value).toBe(2)

    vm.selectFilter('delivered')
    await nextTick()
    expect(vm.page.value).toBe(1)

    vm.selectPage(2)
    vm.searchQuery.value = 'ORD-1'
    await nextTick()
    expect(vm.page.value).toBe(1)
  })

  it('builds stable pagination window and paginated rows', () => {
    orders.value = Array.from({ length: 95 }, (_, index) => makeOrder({ _id: `o-${index}`, orderNumber: `ORD-${index}` }))

    const vm = useOrdersViewModel()
    vm.selectPage(5)

    expect(vm.totalPages.value).toBe(10)
    expect(vm.pageNumbers.value).toEqual([1, -1, 4, 5, 6, -1, 10])
    expect(vm.paginated.value[0]._id).toBe('o-40')
  })

  it('pluralizes order count and opens order route', () => {
    const vm = useOrdersViewModel()

    expect(vm.pluralOrders(1)).toBe('заказ')
    expect(vm.pluralOrders(2)).toBe('заказа')
    expect(vm.pluralOrders(5)).toBe('заказов')
    expect(vm.pluralOrders(11)).toBe('заказов')

    vm.openOrder('o1')
    expect(router.push).toHaveBeenCalledWith('/orders/o1')
  })
})
