import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { IUser } from '@/types/user-profile-auth'

const { authMock, routeMock, loadOrdersMock, resetOrdersMock, useCabinetOrdersMock } = vi.hoisted(() => ({
  routeMock: {
    path: '/orders',
  },
  authMock: {
    user: null as IUser | null,
    logout: vi.fn(),
  },
  loadOrdersMock: vi.fn(),
  resetOrdersMock: vi.fn(),
  useCabinetOrdersMock: vi.fn(() => ({
    activeOrdersCount: { value: 2 },
  })),
}))

vi.mock('vue-router', () => ({
  useRoute: () => routeMock,
}))

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => authMock,
}))

vi.mock('@/api', () => ({
  SHOP_URL: 'https://shop.test',
  assetUrl: (value: string) => `https://cdn.test/${value}`,
}))

vi.mock('@/composables/useCabinetTier', () => ({
  useCabinetTier: () => ({
    tierName: { value: 'Rose' },
    tierCashback: { value: 12 },
  }),
}))

vi.mock('@/composables/useCabinetOrders', () => ({
  useCabinetOrders: useCabinetOrdersMock,
}))

vi.mock('@/composables/useCabinetOrdersResource', () => ({
  useCabinetOrdersResource: () => ({
    orders: { value: [] },
    loadOrders: loadOrdersMock,
    resetOrders: resetOrdersMock,
  }),
}))

import { useAppLayoutState } from '@/composables/useAppLayoutState'

function makeUser(overrides: Partial<IUser> = {}): IUser {
  return {
    _id: 'u1',
    email: 'user@example.com',
    firstName: 'Anna',
    lastName: 'Petrova',
    notifications: { orderStatus: true, news: false },
    addresses: [],
    wishlist: ['rose'],
    bonusBalance: 1200,
    totalSpent: 10000,
    referralCode: 'REF',
    achievements: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    avatar: 'avatar.jpg',
    ...overrides,
  }
}

describe('useAppLayoutState', () => {
  beforeEach(() => {
    authMock.user = null
    routeMock.path = '/orders'
    loadOrdersMock.mockReset().mockResolvedValue(undefined)
    resetOrdersMock.mockReset()
    authMock.logout.mockReset()
    useCabinetOrdersMock.mockClear()
  })

  it('поднимает значения layout state и грузит ордера только вне страниц dashboard/orders', async () => {
    routeMock.path = '/profile'
    authMock.user = makeUser({ wishlist: ['rose', 'lily'] })

    const state = useAppLayoutState()

    expect(state.SHOP_URL).toBe('https://shop.test')
    expect(state.firstName.value).toBe('Anna')
    expect(state.email.value).toBe('user@example.com')
    expect(state.initial.value).toBe('A')
    expect(state.userTitle.value).toBe('Anna Petrova')
    expect(state.bonusBalance.value).toBe(1200)
    expect(state.wishlistCount.value).toBe(2)
    expect(state.avatarUrl.value).toBe('https://cdn.test/avatar.jpg')
    expect(state.tierName.value).toBe('Rose')
    expect(state.tierCashback.value).toBe(12)
    expect(state.activeOrdersCount.value).toBe(2)

    expect(loadOrdersMock).toHaveBeenCalledWith({ userId: 'u1' })

    state.openMenu()
    expect(state.menuOpen.value).toBe(true)
    state.closeMenu()
    expect(state.menuOpen.value).toBe(false)

    state.logout()
    expect(authMock.logout).toHaveBeenCalled()
  })

  it('не вызывает loadOrders на страницах dashboard и orders, но сбрасывает store при уходе пользователя', async () => {
    routeMock.path = '/dashboard'
    authMock.user = makeUser({ _id: 'u2' })

    useAppLayoutState()

    expect(loadOrdersMock).not.toHaveBeenCalled()

    authMock.user = null
    useAppLayoutState()

    expect(resetOrdersMock).toHaveBeenCalledWith(null)
  })
})
