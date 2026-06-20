import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useCabinetOrdersResource } from '@/composables/useCabinetOrdersResource'
import { api } from '@/api'
import type { CabinetOrder } from '@/types/order'

vi.mock('@/api', () => ({
  api: {
    getOrders: vi.fn(),
  },
}))

function makeOrder(overrides: Partial<CabinetOrder>): CabinetOrder {
  return {
    _id: 'o-default',
    orderNumber: '100',
    items: [],
    delivery: { type: 'courier', date: '2026-06-10', time: '12:00' },
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

describe('useCabinetOrdersResource', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.mocked(api.getOrders).mockReset()
  })

  it('загружает заказы с API и кэширует результат', async () => {
    vi.mocked(api.getOrders).mockResolvedValue([makeOrder({ _id: '1' })])
    const { loadOrders, orders, loading, loaded } = useCabinetOrdersResource()

    const promise = loadOrders({ userId: 'u1' })
    expect(loading.value).toBe(true)
    const result = await promise

    expect(result).toEqual([makeOrder({ _id: '1' })])
    expect(loading.value).toBe(false)
    expect(orders.value).toEqual([makeOrder({ _id: '1' })])
    expect(loaded.value).toBe(true)

    const cached = await loadOrders()
    expect(cached).toEqual([makeOrder({ _id: '1' })])
    expect(api.getOrders).toHaveBeenCalledTimes(1)
  })

  it('сбрасывает кэш при смене владельца', async () => {
    vi.mocked(api.getOrders)
      .mockResolvedValueOnce([makeOrder({ _id: 'old' })])
      .mockResolvedValueOnce([makeOrder({ _id: 'new' })])

    const { loadOrders, orders } = useCabinetOrdersResource()

    await loadOrders({ userId: 'u1', force: true })
    expect(orders.value).toEqual([makeOrder({ _id: 'old' })])

    await loadOrders({ userId: 'u2', force: true })
    expect(orders.value).toEqual([makeOrder({ _id: 'new' })])
    expect(api.getOrders).toHaveBeenCalledTimes(2)
  })

  it('игнорирует устаревший ответ после смены пользователя', async () => {
    const first = { resolve: (value: CabinetOrder[]) => {}, reject: (error: Error) => {} }
    const second = { resolve: (value: CabinetOrder[]) => {}, reject: (error: Error) => {} }

    const firstRequest = new Promise<CabinetOrder[]>((resolve, reject) => {
      first.resolve = resolve
      first.reject = reject
    })

    const secondRequest = new Promise<CabinetOrder[]>((resolve, reject) => {
      second.resolve = resolve
      second.reject = reject
    })

    vi.mocked(api.getOrders).mockReturnValueOnce(firstRequest).mockReturnValueOnce(secondRequest)

    const { loadOrders, orders } = useCabinetOrdersResource()

    const firstPromise = loadOrders({ userId: 'u1' })
    const secondPromise = loadOrders({ userId: 'u2' })

    second.resolve([makeOrder({ _id: 'second' })])
    expect(await secondPromise).toEqual([makeOrder({ _id: 'second' })])

    first.resolve([makeOrder({ _id: 'first' })])
    await firstPromise

    expect(orders.value).toEqual([makeOrder({ _id: 'second' })])
    expect(api.getOrders).toHaveBeenCalledTimes(2)
  })

  it('обновляет существующий заказ и добавляет новый', async () => {
    vi.mocked(api.getOrders).mockResolvedValue([makeOrder({ _id: '1', status: 'pending' })])

    const { loadOrders, replaceOrder, orders } = useCabinetOrdersResource()
    await loadOrders({ userId: 'u1', force: true })

    replaceOrder(makeOrder({ _id: '1', status: 'delivered' }))
    expect(orders.value[0]).toMatchObject({ _id: '1', status: 'delivered' })

    replaceOrder(makeOrder({ _id: '2', status: 'confirmed', total: 200 }))
    expect(orders.value[0]._id).toBe('2')
  })
})
