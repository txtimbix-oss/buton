import { createSSRApp, defineComponent } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { describe, expect, it, vi } from 'vitest'
import ProfileView from '@/views/ProfileView.vue'

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({
    user: {
      _id: 'u1',
      email: 'user@example.com',
      firstName: 'Анна',
      lastName: 'Петрова',
      phone: '+79990000000',
      notifications: { orderStatus: true, news: false },
      addresses: [],
      wishlist: [],
      bonusBalance: 1200,
      totalSpent: 10000,
      referralCode: 'REF',
      achievements: ['vip'],
      createdAt: '2026-01-01',
      avatar: null,
    },
    updateUser: vi.fn(),
  }),
}))

vi.mock('@/stores/toast', () => ({
  useToastStore: () => ({
    show: vi.fn(),
  }),
}))

vi.mock('@/composables/useCabinetTier', () => ({
  useCabinetTier: () => ({
    tierName: { value: 'Rose' },
    tierCashback: { value: 12 },
  }),
}))

vi.mock('@/composables/useProfileNotifications', () => ({
  useProfileNotifications: () => ({
    notif: { orderStatus: true, news: true },
    toggleNotification: vi.fn(),
  }),
}))

vi.mock('@/api', () => ({
  assetUrl: (value: string) => `https://cdn.test/${value}`,
  api: {
    updateProfile: vi.fn(),
    uploadAvatar: vi.fn(),
  },
}))

vi.mock('@/components/AppLayout.vue', () => ({
  default: defineComponent({
    name: 'AppLayoutStub',
    template: '<div class="layout-stub"><slot /></div>',
  }),
}))

vi.mock('@/components/CabSectionHeader.vue', () => ({
  default: defineComponent({
    name: 'CabSectionHeaderStub',
    template: '<div class="cab-section-header-stub"/>',
  }),
}))

vi.mock('@/components/CabReferralCard.vue', () => ({
  default: defineComponent({
    name: 'CabReferralCardStub',
    template: '<div class="cab-referral-card-stub"></div>',
  }),
}))

vi.mock('@/components/profile/ProfileAvatarCard.vue', () => ({
  default: defineComponent({
    name: 'ProfileAvatarCardStub',
    template: '<div class="profile-avatar-card-stub"></div>',
  }),
}))

vi.mock('@/components/profile/ProfileNotificationsSection.vue', () => ({
  default: defineComponent({
    name: 'ProfileNotificationsSectionStub',
    template: '<div class="profile-notifications-section-stub"></div>',
  }),
}))

vi.mock('@/components/profile/ProfilePersonalForm.vue', () => ({
  default: defineComponent({
    name: 'ProfilePersonalFormStub',
    template: '<div class="profile-personal-form-stub"></div>',
  }),
}))

vi.mock('@/components/profile/ProfileAchievementsSection.vue', () => ({
  default: defineComponent({
    name: 'ProfileAchievementsSectionStub',
    template: '<div class="profile-achievements-section-stub"></div>',
  }),
}))

describe('ProfileView', () => {
  it('рендерит shell и основные секции профиля', async () => {
    const app = createSSRApp(ProfileView)
    const html = await renderToString(app)

    expect(html).toContain('Профиль')
    expect(html).toContain('Управляйте личными данными и уведомлениями')
    expect(html).toContain('profile-2col')
  })
})
