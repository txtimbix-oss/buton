import { ref } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from '@/api'
import router from '@/router'
import { createAuthSessionBoundary } from '@/stores/auth-session'
import type { IUser } from '@/types/user-profile-auth'

vi.mock('@/api', () => ({
  api: {
    me: vi.fn(),
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  },
}))

vi.mock('@/router', () => ({
  default: {
    push: vi.fn(),
  },
}))

function makeUser(overrides: Partial<IUser> = {}): IUser {
  return {
    _id: 'u1',
    email: 'user@example.com',
    firstName: 'Анна',
    lastName: 'Петрова',
    notifications: {
      orderStatus: true,
      news: false,
    },
    addresses: [],
    wishlist: ['rose'],
    bonusBalance: 100,
    totalSpent: 1500,
    referralCode: 'REF',
    achievements: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('auth-session boundary', () => {
  beforeEach(() => {
    setActiveMocks()
  })

  function setActiveMocks() {
    vi.clearAllMocks()
    vi.mocked(api.login).mockReset()
    vi.mocked(api.register).mockReset()
    vi.mocked(api.me).mockReset()
    vi.mocked(api.logout).mockReset()
    vi.mocked(router.push).mockReset()
  }

  it('mergeUserPatch не меняет null-пользователя и сливает patch в существующего пользователя', () => {
    const user = ref<IUser | null>(null)
    const boundary = createAuthSessionBoundary({ user, resetWishlist: vi.fn() })

    boundary.mergeUserPatch({ firstName: 'X' })
    expect(user.value).toBeNull()

    user.value = makeUser({ firstName: 'Старая' })
    boundary.mergeUserPatch({ firstName: 'Новая', bonusBalance: 500 })

    expect(user.value).toMatchObject({
      firstName: 'Новая',
      bonusBalance: 500,
    })
  })

  it('заменяет пользователя и сбрасывает wishlist только при смене id', async () => {
    const user = ref<IUser | null>(makeUser({ _id: 'u-old' }))
    const resetWishlist = vi.fn()
    const boundary = createAuthSessionBoundary({ user, resetWishlist })

    vi.mocked(api.login).mockResolvedValue({ ok: true, user: makeUser({ _id: 'u-old' }) })
    await boundary.login('user@example.com', 'secret')
    expect(resetWishlist).toHaveBeenCalledTimes(0)

    vi.mocked(api.login).mockResolvedValue({ ok: true, user: makeUser({ _id: 'u-new' }) })
    await boundary.login('user@example.com', 'secret')
    expect(resetWishlist).toHaveBeenCalledTimes(1)
    expect(user.value?._id).toBe('u-new')
  })

  it('fetchMe, register и logout обновляют сессию корректно', async () => {
    const user = ref<IUser | null>(null)
    const resetWishlist = vi.fn()
    const boundary = createAuthSessionBoundary({ user, resetWishlist })

    vi.mocked(api.me).mockResolvedValue({ ok: true, user: makeUser({ _id: 'u-fetch' }) })
    vi.mocked(api.register).mockResolvedValue({ ok: true, user: makeUser({ _id: 'u-reg' }) })
    vi.mocked(api.logout).mockResolvedValue({ ok: true })

    await boundary.fetchMe()
    expect(user.value?._id).toBe('u-fetch')
    expect(resetWishlist).toHaveBeenCalledTimes(1)

    await boundary.register({
      email: 'new@example.com',
      password: 'secret',
      firstName: 'New',
      lastName: 'User',
    })
    expect(user.value?._id).toBe('u-reg')

    await boundary.logout()
    expect(api.logout).toHaveBeenCalledTimes(1)
    expect(user.value).toBeNull()
    expect(router.push).toHaveBeenCalledWith('/login')
  })

  it('не меняет пользователя и не сбрасывает wishlist при ошибке login', async () => {
    const user = ref<IUser | null>(makeUser({ _id: 'u-existing' }))
    const resetWishlist = vi.fn()
    const boundary = createAuthSessionBoundary({ user, resetWishlist })

    vi.mocked(api.login).mockRejectedValue(new Error('Ошибка авторизации'))

    await expect(boundary.login('user@example.com', 'bad')).rejects.toThrow('Ошибка авторизации')

    expect(user.value?._id).toBe('u-existing')
    expect(resetWishlist).not.toHaveBeenCalled()
  })

  it('не меняет пользователя и не делает редирект при ошибке logout', async () => {
    const user = ref<IUser | null>(makeUser({ _id: 'u-existing' }))
    const resetWishlist = vi.fn()
    const boundary = createAuthSessionBoundary({ user, resetWishlist })

    vi.mocked(api.logout).mockRejectedValue(new Error('Сервер недоступен'))

    await expect(boundary.logout()).rejects.toThrow('Сервер недоступен')

    expect(user.value?._id).toBe('u-existing')
    expect(router.push).not.toHaveBeenCalled()
  })

  it('после успешного logout очищает cookie и делает редирект', async () => {
    const user = ref<IUser | null>(makeUser({ _id: 'u-existing' }))
    const resetWishlist = vi.fn()
    const boundary = createAuthSessionBoundary({ user, resetWishlist })
    const setCookie = vi.fn()
    const originalCookieDescriptor = Object.getOwnPropertyDescriptor(document, 'cookie')

    Object.defineProperty(document, 'cookie', {
      configurable: true,
      get: () => '',
      set: setCookie,
    })

    vi.mocked(api.logout).mockResolvedValue({ ok: true })

    await boundary.logout()

    expect(user.value).toBeNull()
    expect(router.push).toHaveBeenCalledWith('/login')
    expect(setCookie).toHaveBeenCalledTimes(1)
    expect(setCookie.mock.calls[0][0]).toContain('user_token')
    expect(setCookie.mock.calls[0][0]).toContain('Max-Age=0')

    if (originalCookieDescriptor) {
      Object.defineProperty(document, 'cookie', originalCookieDescriptor)
    } else {
      Object.defineProperty(document, 'cookie', {
        configurable: true,
        get: () => '',
      })
    }
  })
})
