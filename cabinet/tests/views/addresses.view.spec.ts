import { createSSRApp, defineComponent } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { describe, expect, it, vi } from 'vitest'
import AddressesView from '@/views/AddressesView.vue'

vi.mock('pinia', () => ({
  storeToRefs: (store: any) => ({
    user: { value: store.user ?? null },
    addresses: { value: store.addresses ?? [] },
  }),
}))

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({
    user: {
      _id: 'u1',
      email: 'user@example.com',
      firstName: 'Анна',
      lastName: 'Петрова',
    },
    addresses: [],
    addAddress: vi.fn(),
    updateAddress: vi.fn(),
    deleteAddress: vi.fn(),
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

vi.mock('@/components/addresses/AddressFormModal.vue', () => ({
  default: defineComponent({
    name: 'AddressFormModalStub',
    template: '<div class="address-form-modal-stub"></div>',
  }),
}))

vi.mock('@/components/addresses/AddressesCardsList.vue', () => ({
  default: defineComponent({
    name: 'AddressesCardsListStub',
    template: '<div class="addresses-cards-list-stub"></div>',
  }),
}))

vi.mock('@/components/CabConfirmDialog.vue', () => ({
  default: defineComponent({
    name: 'CabConfirmDialogStub',
    template: '<div class="confirm-dialog-stub"></div>',
  }),
}))

describe('AddressesView', () => {
  it('рендерит экран с заголовком и пустым состоянием адресов', async () => {
    const app = createSSRApp(AddressesView)
    const html = await renderToString(app)

    expect(html).toContain('Адреса доставки')
    expect(html).toContain('Нет сохранённых адресов')
    expect(html).toContain('Добавьте адрес')
  })
})
