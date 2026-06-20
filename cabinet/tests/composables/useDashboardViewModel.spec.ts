import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { createDashboardViewModel, type DashboardViewModelDeps } from '@/composables/useDashboardViewModel'
import type { CabinetOrder } from '@/types/order'
import type { IUser } from '@/types/user-profile-auth'

function makeOrder(overrides: Partial<CabinetOrder> = {}): CabinetOrder {
  return {
    _id: 'o1',
    orderNumber: '1001',
    items: [],
    delivery: { type: 'courier', date: '2026-06-01', time: '10:00' },
    recipient: { name: 'John', phone: '+70000000000' },
    subtotal: 1000,
    deliveryCost: 0,
    discount: 0,
    total: 1000,
    bonusEarned: 50,
    status: 'delivered',
    createdAt: '2026-06-01T00:00:00.000Z',
    ...overrides,
  } as CabinetOrder
}

function makeUser(overrides: Partial<IUser> = {}): IUser {
  return {
    _id: 'u1',
    firstName: 'Анна',
    totalSpent: 10800,
    bonusBalance: 1250,
    referralCode: 'FRIEND500',
    wishlist: ['rose'],
    ...overrides,
  } as IUser
}

function createDeps(overrides: Partial<DashboardViewModelDeps> = {}) {
  const deps: DashboardViewModelDeps = {
    user: ref<IUser | null>(makeUser()),
    orders: ref<CabinetOrder[]>([]),
    ordersLoading: ref(false),
    loadOrders: vi.fn(async () => {}),
    activePromos: ref([]),
    birthdayPromo: ref(null),
    loadPromos: vi.fn(async () => {}),
    recommendations: ref([]),
    loadRecommendations: vi.fn(async () => {}),
    duplicateOrder: vi.fn(async () => ({ ok: true })),
    repeatOrder: vi.fn(),
    navigate: vi.fn(),
    openExternal: vi.fn(),
    copyText: vi.fn(),
    showToast: vi.fn(),
    shopUrl: 'https://shop.test',
    ...overrides,
  }
  return deps
}

describe('createDashboardViewModel', () => {
  it('пробрасывает user-производные в reactive-поля', () => {
    const deps = createDeps()
    const vm = createDashboardViewModel(deps)

    expect(vm.userFirstName.value).toBe('Анна')
    expect(vm.bonusBalance.value).toBe(1250)
    expect(vm.referralCode.value).toBe('FRIEND500')
    expect(vm.totalSpent.value).toBe(10800)
    expect(vm.SHOP_URL).toBe('https://shop.test')
  })

  it('копирует промокод через copyText и показывает toast', () => {
    const deps = createDeps()
    const vm = createDashboardViewModel(deps)

    vm.copyCode('BLOOM')

    expect(deps.copyText).toHaveBeenCalledWith('BLOOM')
    expect(deps.showToast).toHaveBeenCalledWith('Промокод BLOOM скопирован', 'success')
  })

  it('openCart открывает корзину магазина, openOrder навигирует к заказу', () => {
    const deps = createDeps()
    const vm = createDashboardViewModel(deps)

    vm.openCart()
    vm.openOrder('o42')

    expect(deps.openExternal).toHaveBeenCalledWith('https://shop.test/cart')
    expect(deps.navigate).toHaveBeenCalledWith('/orders/o42')
  })

  it('goToReview блокирует переход без доставленных заказов', () => {
    const deps = createDeps({ orders: ref([makeOrder({ status: 'pending' })]) })
    const vm = createDashboardViewModel(deps)

    expect(vm.canCreateReview.value).toBe(false)
    vm.goToReview()

    expect(deps.showToast).toHaveBeenCalledWith('Отзывы доступны после доставки заказа', 'info')
    expect(deps.navigate).not.toHaveBeenCalled()
  })

  it('goToReview переходит на /reviews при наличии доставленного заказа', () => {
    const deps = createDeps({ orders: ref([makeOrder({ status: 'delivered' })]) })
    const vm = createDashboardViewModel(deps)

    expect(vm.canCreateReview.value).toBe(true)
    vm.goToReview()

    expect(deps.navigate).toHaveBeenCalledWith('/reviews')
  })

  it('latestOrderStatus/subline отражают последний заказ', () => {
    const deps = createDeps({
      orders: ref([makeOrder({ _id: 'o9', orderNumber: '9009', status: 'confirmed' })]),
    })
    const vm = createDashboardViewModel(deps)

    expect(vm.hasLatestOrder.value).toBe(true)
    expect(vm.latestOrderStatus.value).toBe('Подтверждён')
    expect(vm.latestOrderSubline.value).toContain('9009')
  })

  it('repeatLastOrder без заказов показывает info-toast', async () => {
    const deps = createDeps({ orders: ref([]) })
    const vm = createDashboardViewModel(deps)

    await vm.repeatLastOrder()

    expect(deps.showToast).toHaveBeenCalledWith('Нет заказов для повтора', 'info')
    expect(deps.duplicateOrder).not.toHaveBeenCalled()
  })

  it('repeatLastOrder дублирует заказ и переносит его в корзину', async () => {
    const order = makeOrder({ _id: 'o5' })
    const deps = createDeps({ orders: ref([order]) })
    const vm = createDashboardViewModel(deps)

    const promise = vm.repeatLastOrder()
    expect(vm.repeatingOrder.value).toBe(true)
    await promise

    expect(deps.duplicateOrder).toHaveBeenCalledWith('o5')
    expect(deps.repeatOrder).toHaveBeenCalledWith(order, {
      target: 'cart',
      message: 'Заказ скопирован в корзину',
      toastType: 'success',
    })
    expect(vm.repeatingOrder.value).toBe(false)
  })

  it('repeatLastOrder сообщает об ошибке дублирования', async () => {
    const deps = createDeps({
      orders: ref([makeOrder({ _id: 'o5' })]),
      duplicateOrder: vi.fn(async () => { throw new Error('boom') }),
    })
    const vm = createDashboardViewModel(deps)

    await vm.repeatLastOrder()

    expect(deps.repeatOrder).not.toHaveBeenCalled()
    expect(deps.showToast).toHaveBeenCalledWith('boom', 'error')
    expect(vm.repeatingOrder.value).toBe(false)
  })

  it('loadDashboardData грузит заказы, промо и рекомендации', async () => {
    const deps = createDeps({ user: ref(makeUser({ _id: 'u7', wishlist: ['lily'] })) })
    const vm = createDashboardViewModel(deps)

    await vm.loadDashboardData()

    expect(deps.loadOrders).toHaveBeenCalledWith({ force: true, userId: 'u7' })
    expect(deps.loadPromos).toHaveBeenCalledWith('u7')
    expect(deps.loadRecommendations).toHaveBeenCalledWith(['lily'])
  })

  it('loadDashboardData продолжает работу даже если loadOrders упал', async () => {
    const deps = createDeps({ loadOrders: vi.fn(async () => { throw new Error('net') }) })
    const vm = createDashboardViewModel(deps)

    await expect(vm.loadDashboardData()).resolves.toBeUndefined()
    expect(deps.loadPromos).toHaveBeenCalled()
    expect(deps.loadRecommendations).toHaveBeenCalled()
  })
})
