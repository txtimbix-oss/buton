import { createSSRApp, defineComponent } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { describe, expect, it, vi } from 'vitest'
import SecurityView from '@/views/SecurityView.vue'

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({
    logout: vi.fn(),
  }),
}))

vi.mock('@/api', () => ({
  api: {
    changePassword: vi.fn().mockResolvedValue(undefined),
  },
}))

vi.mock('@/components/AppLayout.vue', () => ({
  default: defineComponent({
    name: 'AppLayoutStub',
    template: '<div class="layout-stub"><slot /></div>',
  }),
}))

vi.mock('@/components/security/SecurityPasswordSection.vue', () => ({
  default: defineComponent({
    name: 'SecurityPasswordSectionStub',
    template: '<div class="security-password-section-stub"></div>',
  }),
}))

vi.mock('@/components/security/SecurityLogoutBlock.vue', () => ({
  default: defineComponent({
    name: 'SecurityLogoutBlockStub',
    template: '<div class="security-logout-block-stub"></div>',
  }),
}))

describe('SecurityView', () => {
  it('рендерит shell и секции безопасности', async () => {
    const app = createSSRApp(SecurityView)
    const html = await renderToString(app)

    expect(html).toContain('Безопасность')
    expect(html).toContain('Управляйте паролем и сессиями')
    expect(html).toContain('security-password-section-stub')
    expect(html).toContain('security-logout-block-stub')
  })
})
