import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { api } from '@/api'
import { useCabinetOrdersStore } from '@/stores/cabinetOrders'
import type { CabinetOrder } from '@/types/order'

vi.mock('@/api', () => ({
  api: {
    getOrders: vi.fn(),
  },
}))

function makeOrder(overrides: Partial<CabinetOrder> = {}): CabinetOrder {
  return {
    _id: 'o-1',
    orderNumber: 'ORD-1',
    items: [
      {
        slug: 'rose',
        name: 'Роза',
        sizeLabel: 'M',
        qty: 1,
        price: 1200,
        bloom: 'red',
        meta: 'Нежная',
      },
    ],
    delivery: {
      type: 'courier',
      address: 'ул. Садовая 1',
      date: '2026-06-01',
      time: '12:00',
    },
    recipient: {
      name: 'Аня',
      phone: '+79990000000',
      email: 'a@example.com',
    },
    subtotal: 1200,
    deliveryCost: 0,
    discount: 0,
    total: 1200,
    bonusEarned: 120,
    status: 'pending',
    createdAt: '2026-06-01T10:00:00.000Z',
    ...overrides,
  }
}

describe('cabinetOrders store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('loadOrders грузит заказы и управляет состояниями loading/loaded', async () => {
    const store = useCabinetOrdersStore()
    vi.mocked(api.getOrders).mockResolvedValue([makeOrder(), makeOrder({ _id: 'o-2', orderNumber: 'ORD-2' })])

    const promise = store.loadOrders()
    expect(store.loading).toBe(true)

    const nextOrders = await promise
    expect(api.getOrders).toHaveBeenCalledTimes(1)
    expect(store.loading).toBe(false)
    expect(store.loaded).toBe(true)
    expect(store.orders).toEqual(nextOrders)
  })

  it('loadOrders дедуплицируется во время pending запроса', async () => {
    let release: ((orders: CabinetOrder[]) => void) | null = null
    const pending = new Promise<CabinetOrder[]>((resolve) => {
      release = resolve
    })
    vi.mocked(api.getOrders).mockReturnValue(pending)

    const store = useCabinetOrdersStore()
    const first = store.loadOrders()
    const second = store.loadOrders()

    release?.([makeOrder({ _id: 'o-3' }), makeOrder({ _id: 'o-4' })])

    const dataFirst = await first
    const dataSecond = await second
    expect(dataFirst).toEqual(dataSecond)
    expect(api.getOrders).toHaveBeenCalledTimes(1)

    expect(dataFirst).toEqual(store.orders)
    expect(store.loading).toBe(false)
    expect(store.loaded).toBe(true)
  })

  it('resetOrders очищает кэш и переносит ownerId на новый userId', async () => {
    const store = useCabinetOrdersStore()
    vi.mocked(api.getOrders).mockResolvedValue([makeOrder()])

    await store.loadOrders({ userId: 'u-1' })
    expect(store.orders.length).toBe(1)
    expect(store.loaded).toBe(true)

    store.resetOrders('u-2')

    expect(store.orders).toEqual([])
    expect(store.loading).toBe(false)
    expect(store.loaded).toBe(false)

    vi.mocked(api.getOrders).mockResolvedValue([makeOrder({ _id: 'u2-1' })])
    const next = await store.loadOrders({ userId: 'u-2' })

    expect(api.getOrders).toHaveBeenCalledTimes(2)
    expect(next[0]._id).toBe('u2-1')
  })

  it('replaceOrder добавляет новый и заменяет существующий', () => {
    const store = useCabinetOrdersStore()
    store.orders = [makeOrder({ _id: 'o-old', orderNumber: 'ORD-1', total: 100 })]

    const inserted = makeOrder({ _id: 'o-new', orderNumber: 'ORD-2', total: 200 })
    store.replaceOrder(inserted)

    expect(store.orders).toEqual([inserted, makeOrder({ _id: 'o-old', orderNumber: 'ORD-1', total: 100 })])

    const updated = makeOrder({ _id: 'o-old', orderNumber: 'ORD-1', total: 333 })
    store.replaceOrder(updated)

    expect(store.orders).toEqual([inserted, updated])
    expect(store.loaded).toBe(true)
  })

  it('invalidateOrders сбрасывает флаг loaded и новый loadOrders повторно дергает API', async () => {
    const store = useCabinetOrdersStore()
    vi.mocked(api.getOrders).mockResolvedValue([makeOrder({ _id: 'o-1' })])

    await store.loadOrders({ userId: 'u-1' })
    expect(api.getOrders).toHaveBeenCalledTimes(1)
    expect(store.loaded).toBe(true)

    store.invalidateOrders()
    expect(store.loaded).toBe(false)

    vi.mocked(api.getOrders).mockResolvedValue([makeOrder({ _id: 'o-2' })])
    await store.loadOrders()

    expect(api.getOrders).toHaveBeenCalledTimes(2)
  })
})
