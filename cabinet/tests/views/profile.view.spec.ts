import { computed, createSSRApp, defineComponent, reactive, ref } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { describe, expect, it, vi } from 'vitest'
import ProfileView from '@/views/ProfileView.vue'

// Новый ProfileView: тёмный баннер + прогресс уровня + карточки + медали достижений.
// Мокаем композаблы, на которых он построен.

vi.mock('@/components/AppLayout.vue', () => ({
  default: defineComponent({
    name: 'AppLayoutStub',
    template: '<div class="layout-stub"><slot /></div>',
  }),
}))

vi.mock('@/composables/useProfileViewModel', () => ({
  useProfileViewModel: () => ({
    avatarSrc: computed(() => null),
    avatarUploading: ref(false),
    earnedAchievements: computed(() => ['first_order']),
    error: ref(''),
    form: reactive({ firstName: 'Анна', lastName: 'Петрова', phone: '+79990000000', email: 'user@example.com' }),
    fullName: computed(() => 'Анна Петрова'),
    handleReferralCopied: vi.fn(),
    initials: computed(() => 'АП'),
    notif: reactive({ orderStatus: true, news: false }),
    onAvatarSelected: vi.fn(),
    referralCode: computed(() => 'REF123'),
    reset: vi.fn(),
    save: vi.fn(),
    saving: ref(false),
    success: ref(''),
    toggleNotification: vi.fn(),
  }),
}))

vi.mock('@/composables/useCabinetTier', () => ({
  useCabinetTier: () => ({
    tierName: computed(() => 'Новичок'),
    tierCashback: computed(() => 3),
    isMaxLevel: computed(() => false),
    nextLevel: computed(() => ({ key: 'regular', name: 'Постоянный', min: 1000, cashback: 5 })),
    nextTierName: computed(() => 'Постоянный'),
    nextThreshold: computed(() => 1000),
    remainingToNext: computed(() => 1000),
    progressPct: computed(() => 0),
  }),
}))

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({
    user: { bonusBalance: 300, totalSpent: 0, createdAt: '2026-01-01' },
  }),
}))

vi.mock('@/api/achievements', () => ({
  achievementsApi: {
    get: vi.fn().mockResolvedValue({ summary: { earned: 0, total: 4 }, earnedKeys: [], items: [] }),
  },
}))

describe('ProfileView', () => {
  it('рендерит профиль (баннер, личные данные, достижения)', async () => {
    const app = createSSRApp(ProfileView)
    const html = await renderToString(app)

    expect(html).toContain('Анна Петрова')
    expect(html).toContain('Личные данные')
    expect(html).toContain('Достижения')
  })
})
