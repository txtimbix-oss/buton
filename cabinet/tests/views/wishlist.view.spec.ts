import { createSSRApp, defineComponent, ref } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import WishlistView from '@/views/WishlistView.vue'

const wishlistDeps = {
  products: ref<Array<{ slug: string }>>([]),
  loading: ref(false),
  error: ref(''),
}

vi.mock('@/stores/wishlist', () => ({
  useWishlistStore: () => ({
    products: wishlistDeps.products,
    loading: wishlistDeps.loading,
    error: wishlistDeps.error,
    fetchWishlist: vi.fn(),
    removeFromWishlist: vi.fn(),
  }),
}))

vi.mock('@/stores/toast', () => ({
  useToastStore: () => ({
    show: vi.fn(),
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

vi.mock('@/components/wishlist/WishlistMeta.vue', () => ({
  default: defineComponent({
    name: 'WishlistMetaStub',
    template: '<div class="wishlist-meta-stub"></div>',
  }),
}))

vi.mock('@/components/wishlist/WishlistGrid.vue', () => ({
  default: defineComponent({
    name: 'WishlistGridStub',
    template: '<div class="wishlist-grid-stub"></div>',
  }),
}))

vi.mock('@/components/CabConfirmDialog.vue', () => ({
  default: defineComponent({
    name: 'CabConfirmDialogStub',
    template: '<div class="confirm-dialog-stub"></div>',
  }),
}))

describe('WishlistView', () => {
  beforeEach(() => {
    wishlistDeps.products.value = []
    wishlistDeps.loading.value = false
    wishlistDeps.error.value = ''
  })

  it('рендерит shell и пустое состояние избранного', async () => {
    const app = createSSRApp(WishlistView)
    const html = await renderToString(app)

    expect(html).toContain('Избранное')
    expect(html).toContain('В избранном пока пусто')
    expect(html).toContain('Сохраняйте понравившиеся')
  })
})
