import { createSSRApp, defineComponent } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { describe, expect, it, vi } from 'vitest'
import ReviewsView from '@/views/ReviewsView.vue'

vi.mock('@/api', () => ({
  api: {
    getUserReviews: vi.fn().mockResolvedValue({ reviews: [] }),
  },
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
    template: '<div class="empty-state-stub"></div>',
  }),
}))

vi.mock('@/components/CabLoadingCards.vue', () => ({
  default: defineComponent({
    name: 'CabLoadingCardsStub',
    template: '<div class="loading-stub"></div>',
  }),
}))

vi.mock('@/components/reviews/ReviewsCardsList.vue', () => ({
  default: defineComponent({
    name: 'ReviewsCardsListStub',
    template: '<div class="reviews-cards-list-stub"></div>',
  }),
}))

vi.mock('@/components/reviews/ReviewsFilters.vue', () => ({
  default: defineComponent({
    name: 'ReviewsFiltersStub',
    template: '<div class="reviews-filters-stub"></div>',
    props: {
      filters: {
        type: Array,
        default: () => [],
      },
      activeFilter: {
        type: String,
        default: 'all',
      },
    },
    emits: ['select'],
  }),
}))

describe('ReviewsView', () => {
  it('рендерит shell, чипы фильтров и загрузочный placeholder', async () => {
    const app = createSSRApp(ReviewsView)
    const html = await renderToString(app)

    expect(html).toContain('Мои отзывы')
    expect(html).toContain('reviews-filters-stub')
    expect(html).toContain('loading-stub')
  })
})
