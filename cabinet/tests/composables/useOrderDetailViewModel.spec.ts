import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { createOrderDetailViewModel, useOrderDetailViewModel, type OrderDetailViewModelDeps } from '@/composables/useOrderDetailViewModel'
import type { CabinetOrder, CabinetOrderItem } from '@/types/order'

const { api, auth, loadOrders, orders, replaceOrder, repeatOrder, route, toast } = vi.hoisted(() => ({
  api: {
    cancelOrder: vi.fn(),
    createReview: vi.fn(),
  },
  auth: {
    user: { _id: 'u1' },
  },
  loadOrders: vi.fn().mockResolvedValue(undefined),
  orders: {
    value: [] as CabinetOrder[],
  },
  replaceOrder: vi.fn((order: CabinetOrder) => {
    orders.value = orders.value.map((candidate) => candidate._id === order._id ? order : candidate)
  }),
  repeatOrder: vi.fn(),
  route: {
    params: { id: 'o1' },
  },
  toast: {
    show: vi.fn(),
  },
}))

vi.mock('vue-router', () => ({
  useRoute: () => route,
}))

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => auth,
}))

vi.mock('@/stores/toast', () => ({
  useToastStore: () => toast,
}))

vi.mock('@/api', () => ({
  api,
}))

vi.mock('@/composables/useCabinetOrdersResource', () => ({
  useCabinetOrdersResource: () => ({
    orders,
    loading: { value: false },
    loadOrders,
    replaceOrder,
  }),
}))

vi.mock('@/composables/useRepeatOrder', () => ({
  useRepeatOrder: () => ({ repeatOrder }),
}))

function makeItem(overrides: Partial<CabinetOrderItem> = {}): CabinetOrderItem {
  return {
    slug: 'rose',
    name: 'Роза',
    sizeLabel: 'L',
    qty: 1,
    price: 1000,
    bloom: 'red',
    meta: '',
    ...overrides,
  }
}

function makeOrder(overrides: Partial<CabinetOrder> = {}): CabinetOrder {
  return {
    _id: 'o1',
    orderNumber: '100',
    items: [makeItem()],
    delivery: { type: 'courier', date: '2026-06-10', time: '10:00' },
    recipient: { name: 'Анна', phone: '+79990000000' },
    subtotal: 1000,
    deliveryCost: 0,
    discount: 0,
    total: 1000,
    bonusEarned: 0,
    status: 'pending',
    createdAt: '2026-06-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('useOrderDetailViewModel', () => {
  beforeEach(() => {
    orders.value = [makeOrder()]
    route.params.id = 'o1'
    toast.show.mockClear()
    api.cancelOrder.mockReset()
    api.createReview.mockReset()
    replaceOrder.mockClear()
    repeatOrder.mockClear()
    loadOrders.mockClear()
  })

  it('resolves selected order and timeline state from route id', () => {
    const vm = useOrderDetailViewModel()

    expect(vm.order.value?._id).toBe('o1')
    expect(vm.canCancel.value).toBe(true)
    expect(vm.stepClass('pending')).toBe('current')
    expect(vm.stepClass('confirmed')).toBe('upcoming')
  })

  it('cancels order through API and replaces shared order resource', async () => {
    const cancelled = makeOrder({ status: 'cancelled' })
    api.cancelOrder.mockResolvedValue({ ok: true, order: cancelled })

    const vm = useOrderDetailViewModel()
    await vm.doCancel()

    expect(api.cancelOrder).toHaveBeenCalledWith('o1')
    expect(replaceOrder).toHaveBeenCalledWith(cancelled)
    expect(toast.show).toHaveBeenCalledWith('Заказ отменён', 'info')
  })

  it('submits review and marks product slug as reviewed', async () => {
    api.createReview.mockResolvedValue({ ok: true })
    const item = makeItem({ slug: 'rose' })
    const vm = useOrderDetailViewModel()

    vm.openReviewModal(item)
    vm.reviewForm.value = { rating: 5, text: 'Отлично' }
    await vm.submitReview()

    expect(api.createReview).toHaveBeenCalledWith({
      productSlug: 'rose',
      rating: 5,
      text: 'Отлично',
    })
    expect(vm.reviewedSlugs.value.has('rose')).toBe(true)
    expect(vm.reviewModal.value).toBe(false)
  })
})

function createDeps(overrides: Partial<OrderDetailViewModelDeps> = {}): OrderDetailViewModelDeps {
  return {
    orderId: ref('o1'),
    orders: ref<CabinetOrder[]>([makeOrder()]),
    ordersLoading: ref(false),
    loadOrders: vi.fn(async () => {}),
    replaceOrder: vi.fn(),
    cancelOrder: vi.fn(async () => ({ order: makeOrder({ status: 'cancelled' }) })),
    createReview: vi.fn(async () => ({ ok: true })),
    repeatOrder: vi.fn(),
    getUserId: vi.fn(() => 'u1'),
    showToast: vi.fn(),
    ...overrides,
  }
}

describe('createOrderDetailViewModel', () => {
  it('резолвит заказ и состояние таймлайна по orderId', () => {
    const deps = createDeps()
    const vm = createOrderDetailViewModel(deps)

    expect(vm.order.value?._id).toBe('o1')
    expect(vm.canCancel.value).toBe(true)
    expect(vm.stepClass('pending')).toBe('current')
    expect(vm.stepClass('confirmed')).toBe('upcoming')
  })

  it('order = null если orderId не совпадает', () => {
    const deps = createDeps({ orderId: ref('missing') })
    const vm = createOrderDetailViewModel(deps)

    expect(vm.order.value).toBeNull()
    expect(vm.canCancel.value).toBe(false)
  })

  it('timelineSteps схлопывается до «Отменён» для отменённого заказа', () => {
    const deps = createDeps({ orders: ref([makeOrder({ status: 'cancelled' })]) })
    const vm = createOrderDetailViewModel(deps)

    expect(vm.timelineSteps.value).toEqual([{ key: 'cancelled', label: 'Отменён' }])
    expect(vm.stepClass('cancelled')).toBe('current')
  })

  it('doCancel отменяет заказ и подменяет shared resource', async () => {
    const cancelled = makeOrder({ status: 'cancelled' })
    const deps = createDeps({ cancelOrder: vi.fn(async () => ({ order: cancelled })) })
    const vm = createOrderDetailViewModel(deps)
    vm.cancelModal.value = true

    await vm.doCancel()

    expect(deps.cancelOrder).toHaveBeenCalledWith('o1')
    expect(deps.replaceOrder).toHaveBeenCalledWith(cancelled)
    expect(deps.showToast).toHaveBeenCalledWith('Заказ отменён', 'info')
    expect(vm.cancelModal.value).toBe(false)
    expect(vm.cancelling.value).toBe(false)
  })

  it('doCancel показывает ошибку при отказе API', async () => {
    const deps = createDeps({ cancelOrder: vi.fn(async () => { throw new Error('cancel failed') }) })
    const vm = createOrderDetailViewModel(deps)

    await vm.doCancel()

    expect(deps.replaceOrder).not.toHaveBeenCalled()
    expect(deps.showToast).toHaveBeenCalledWith('cancel failed', 'error')
    expect(vm.cancelling.value).toBe(false)
  })

  it('repeatOrder передаёт текущий заказ в deps.repeatOrder', () => {
    const order = makeOrder()
    const deps = createDeps({ orders: ref([order]) })
    const vm = createOrderDetailViewModel(deps)

    vm.repeatOrder()

    expect(deps.repeatOrder).toHaveBeenCalledWith(order)
  })

  it('submitReview игнорирует пустую форму', async () => {
    const deps = createDeps()
    const vm = createOrderDetailViewModel(deps)

    vm.openReviewModal(makeItem())
    await vm.submitReview()

    expect(deps.createReview).not.toHaveBeenCalled()
    expect(vm.reviewModal.value).toBe(true)
  })

  it('submitReview отправляет отзыв и помечает slug', async () => {
    const deps = createDeps()
    const vm = createOrderDetailViewModel(deps)

    vm.openReviewModal(makeItem({ slug: 'rose' }))
    vm.reviewForm.value = { rating: 5, text: '  Отлично  ' }
    await vm.submitReview()

    expect(deps.createReview).toHaveBeenCalledWith({ productSlug: 'rose', rating: 5, text: 'Отлично' })
    expect(vm.reviewedSlugs.value.has('rose')).toBe(true)
    expect(vm.reviewModal.value).toBe(false)
    expect(deps.showToast).toHaveBeenCalledWith('Отзыв отправлен на модерацию', 'success')
  })

  it('submitReview выставляет reviewError при отказе', async () => {
    const deps = createDeps({ createReview: vi.fn(async () => { throw new Error('review failed') }) })
    const vm = createOrderDetailViewModel(deps)

    vm.openReviewModal(makeItem())
    vm.reviewForm.value = { rating: 4, text: 'ok' }
    await vm.submitReview()

    expect(vm.reviewError.value).toBe('review failed')
    expect(vm.reviewModal.value).toBe(true)
  })

  it('loadData грузит заказы с userId и снимает detailLoading', async () => {
    const deps = createDeps()
    const vm = createOrderDetailViewModel(deps)

    expect(vm.detailLoading.value).toBe(true)
    await vm.loadData()

    expect(deps.loadOrders).toHaveBeenCalledWith({ force: true, userId: 'u1' })
    expect(vm.detailLoading.value).toBe(false)
  })

  it('loadData снимает detailLoading даже при падении загрузки', async () => {
    const deps = createDeps({ loadOrders: vi.fn(async () => { throw new Error('net') }) })
    const vm = createOrderDetailViewModel(deps)

    await vm.loadData()

    expect(vm.detailLoading.value).toBe(false)
  })
})
