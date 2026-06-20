import { createSSRApp, defineComponent } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { describe, expect, it, vi } from 'vitest'
import DashboardView from '@/views/DashboardView.vue'

vi.mock('@/composables/useDashboardViewModel', () => ({
  useDashboardViewModel: () => ({
    SHOP_URL: 'https://shop.test',
    activePromos: [{ code: 'BLOOM', title: 'Персональное предложение', detail: '300 ₽' }],
    birthdayPromo: null,
    bonusBalance: 1250,
    canCreateReview: true,
    copyCode: vi.fn(),
    goToReview: vi.fn(),
    handleReferralCopied: vi.fn(),
    hasLatestOrder: true,
    isMaxLevel: false,
    latestOrderStatus: 'Собираем букет',
    latestOrderSubline: 'Заказ #1001 · сегодня',
    loading: false,
    loyaltyName: 'Rose',
    nextDeliveryLabel: 'Сегодня, 19:00',
    nextThreshold: 15000,
    nextTierName: 'Peony',
    openCart: vi.fn(),
    openOrder: vi.fn(),
    progressPct: 65,
    recentOrders: [],
    recommendations: [],
    referralCode: 'FRIEND500',
    remainingToNext: 4200,
    repeatLastOrder: vi.fn(),
    repeatingOrder: false,
    tierCashback: 7,
    totalSpent: 10800,
    userFirstName: 'Анна',
  }),
}))

vi.mock('@/components/AppLayout.vue', () => ({
  default: defineComponent({
    name: 'AppLayoutStub',
    template: '<div class="layout-stub"><slot /></div>',
  }),
}))

vi.mock('@/components/CabReferralCard.vue', () => ({
  default: defineComponent({
    name: 'CabReferralCardStub',
    template: '<div class="referral-stub"></div>',
  }),
}))

vi.mock('@/components/dashboard/DashboardPromosSection.vue', () => ({
  default: defineComponent({
    name: 'DashboardPromosSectionStub',
    template: '<div class="promos-stub"></div>',
  }),
}))

vi.mock('@/components/dashboard/DashboardRecentOrdersSection.vue', () => ({
  default: defineComponent({
    name: 'DashboardRecentOrdersSectionStub',
    template: '<div class="orders-stub"></div>',
  }),
}))

vi.mock('@/components/dashboard/DashboardLoyaltySection.vue', () => ({
  default: defineComponent({
    name: 'DashboardLoyaltySectionStub',
    template: '<div class="loyalty-stub"></div>',
  }),
}))

vi.mock('@/components/dashboard/DashboardRecommendationsSection.vue', () => ({
  default: defineComponent({
    name: 'DashboardRecommendationsSectionStub',
    template: '<div class="recommendations-stub"></div>',
  }),
}))

describe('DashboardView', () => {
  it('renders the refreshed hero shell and grouped quick actions', async () => {
    const app = createSSRApp(DashboardView)
    app.component('RouterLink', defineComponent({
      name: 'RouterLinkStub',
      props: {
        to: {
          type: [String, Object],
          default: '/',
        },
      },
      template: '<a :href="typeof to === \'string\' ? to : \'/\'"><slot /></a>',
    }))
    const html = await renderToString(app)

    expect(html).toContain('dashboard-hero')
    expect(html).toContain('dashboard-hero__headline')
    expect(html).toContain('dashboard-hero__metrics')
    expect(html).toContain('dashboard-status-card')
    expect(html).toContain('dashboard-quick-actions')
  })
})
