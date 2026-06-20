import { createSSRApp, defineComponent, ref } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import OrdersView from '@/views/OrdersView.vue'

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

const deps = {
  orders: ref([] as any[]),
  loading: ref(false),
  loadOrders: vi.fn(),
}

vi.mock('@/composables/useCabinetOrdersResource', () => ({
  useCabinetOrdersResource: () => ({
    orders: deps.orders,
    loading: deps.loading,
    loadOrders: deps.loadOrders,
  }),
}))

vi.mock('@/composables/useCabinetOrders', () => ({
  isActiveCabinetOrder: () => true,
}))

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({
    user: {
      _id: 'u1',
      email: 'user@example.com',
      firstName: 'Анна',
      lastName: 'Петрова',
      notifications: { orderStatus: true, news: false },
      addresses: [],
      wishlist: [],
      bonusBalance: 100,
      totalSpent: 1000,
      referralCode: 'REF',
      achievements: [],
      createdAt: '2026-06-01',
    },
  }),
}))

vi.mock('@/components/AppLayout.vue', () => ({
  default: defineComponent({
    name: 'AppLayoutStub',
    template: '<div class="layout-stub"><slot /></div>',
  }),
}))

vi.mock('@/components/CabEmptyState.vue', () => ({
  default: defineComponent({
    name: 'CabEmptyStateStub',
    props: ['title', 'text'],
    template: '<div class="empty-state-stub">{{ title }}{{ text }}</div>',
  }),
}))

vi.mock('@/components/CabLoadingCards.vue', () => ({
  default: defineComponent({
    name: 'CabLoadingCardsStub',
    template: '<div class="loading-stub"></div>',
  }),
}))

vi.mock('@/components/orders/OrdersCardList.vue', () => ({
  default: defineComponent({
    name: 'OrdersCardListStub',
    template: '<div class="orders-card-list-stub"></div>',
  }),
}))

vi.mock('@/components/orders/OrdersTable.vue', () => ({
  default: defineComponent({
    name: 'OrdersTableStub',
    template: '<div class="orders-table-stub"></div>',
  }),
}))

vi.mock('@/components/orders/OrdersPagination.vue', () => ({
  default: defineComponent({
    name: 'OrdersPaginationStub',
    template: '<div class="orders-pagination-stub"></div>',
  }),
}))

describe('OrdersView', () => {
  beforeEach(() => {
    deps.orders.value = []
    deps.loading.value = false
    deps.loadOrders = vi.fn().mockResolvedValue(undefined)
  })

  it('рендерит страницу заказов и пустое состояние', async () => {
    const app = createSSRApp(OrdersView)
    const html = await renderToString(app)

    expect(html).toContain('Мои заказы')
    expect(html).toContain('0')
    expect(html).toContain('Заказов пока нет')
  })
})
