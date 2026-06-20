import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import router from '@/router'
import { useAuthStore } from '@/stores/auth'
import { useWishlistStore } from '@/stores/wishlist'
import { api } from '@/api'
import type { IAddress } from '@/types/user-address'
import type { IUser } from '@/types/user-profile-auth'

vi.mock('@/api', () => ({
  api: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    me: vi.fn(),
    addAddress: vi.fn(),
    updateAddress: vi.fn(),
    deleteAddress: vi.fn(),
  },
  SHOP_URL: 'http://localhost:3000',
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
    firstName: 'John',
    lastName: 'Doe',
    notifications: { orderStatus: true, news: true },
    addresses: [],
    wishlist: [],
    bonusBalance: 0,
    totalSpent: 0,
    referralCode: 'REF',
    achievements: [],
    createdAt: '2026-06-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('auth store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    vi.mocked(router.push).mockReset()
  })

  it('логинит пользователя и управляет состоянием loading', async () => {
    vi.mocked(api.login).mockResolvedValue({ ok: true, user: makeUser() })

    const auth = useAuthStore()
    const loginPromise = auth.login('user@example.com', 'secret')

    expect(auth.loading).toBe(true)
    await loginPromise
    expect(auth.loading).toBe(false)
    expect(auth.user).toEqual(makeUser())
  })

  it('регистрация тоже обновляет пользователя и сбрасывает loading', async () => {
    vi.mocked(api.register).mockResolvedValue({ ok: true, user: makeUser({ _id: 'u-new' }) })

    const auth = useAuthStore()
    const registerPromise = auth.register({
      email: 'user@example.com',
      password: '1234',
      firstName: 'John',
      lastName: 'Doe',
    })

    expect(auth.loading).toBe(true)
    await registerPromise
    expect(auth.loading).toBe(false)
    expect(auth.user?._id).toBe('u-new')
  })

  it('сбрасывает loading и не меняет пользователя при ошибке login', async () => {
    vi.mocked(api.login).mockRejectedValue(new Error('Неверный пароль'))

    const auth = useAuthStore()
    auth.user = makeUser({ _id: 'u-existing' })

    const loginPromise = auth.login('user@example.com', 'bad')
    expect(auth.loading).toBe(true)

    await expect(loginPromise).rejects.toThrow('Неверный пароль')

    expect(auth.loading).toBe(false)
    expect(auth.user?._id).toBe('u-existing')
  })

  it('сбрасывает loading и не обновляет пользователя при ошибке register', async () => {
    vi.mocked(api.register).mockRejectedValue(new Error('Email занят'))

    const auth = useAuthStore()
    auth.user = makeUser({ _id: 'u-existing' })

    const registerPromise = auth.register({
      email: 'user@example.com',
      password: '1234',
      firstName: 'John',
      lastName: 'Doe',
    })
    expect(auth.loading).toBe(true)

    await expect(registerPromise).rejects.toThrow('Email занят')

    expect(auth.loading).toBe(false)
    expect(auth.user?._id).toBe('u-existing')
  })

  it('подтягивает текущего пользователя через me()', async () => {
    vi.mocked(api.me).mockResolvedValue({ ok: true, user: makeUser({ phone: '+79990000000' }) })

    const auth = useAuthStore()
    await auth.fetchMe()
    expect(auth.user).toEqual(makeUser({ phone: '+79990000000' }))
  })

  it('работает с адресами пользователя и всегда использует серверный ответ', async () => {
    const baseAddress: IAddress = { _id: 'a1', label: 'Дом', address: 'Тверская 1', isDefault: true }
    const updatedAddress: IAddress = { _id: 'a1', label: 'Офис', address: 'Льва Толстого 10', isDefault: false }

    vi.mocked(api.addAddress).mockResolvedValue({ ok: true, addresses: [baseAddress] })
    vi.mocked(api.updateAddress).mockResolvedValue({ ok: true, addresses: [updatedAddress] })
    vi.mocked(api.deleteAddress).mockResolvedValue({ ok: true, addresses: [] })

    const auth = useAuthStore()
    auth.user = makeUser()

    expect(await auth.addAddress({ label: 'Дом', address: 'Тверская 1' })).toEqual([baseAddress])
    expect(auth.addresses).toEqual([baseAddress])

    await auth.updateAddress('a1', { label: 'Офис' })
    expect(auth.addresses).toEqual([updatedAddress])

    await auth.deleteAddress('a1')
    expect(auth.addresses).toEqual([])
  })

  it('не публикует wishlist API через auth store', () => {
    const auth = useAuthStore()

    expect('wishlistProducts' in auth).toBe(false)
    expect('wishlistLoading' in auth).toBe(false)
    expect('wishlistError' in auth).toBe(false)
    expect('fetchWishlist' in auth).toBe(false)
    expect('removeFromWishlist' in auth).toBe(false)
  })

  it('делает logout и делает редирект на /login', async () => {
    vi.mocked(api.logout).mockResolvedValue({ ok: true })

    const auth = useAuthStore()
    auth.user = makeUser()

    await auth.logout()

    expect(api.logout).toHaveBeenCalled()
    expect(auth.user).toBeNull()
    expect(router.push).toHaveBeenCalledWith('/login')
  })

  it('смена пользователя сбрасывает кэш wishlist store', async () => {
    vi.mocked(api.login).mockResolvedValue({ ok: true, user: makeUser({ _id: 'u2' }) })

    const auth = useAuthStore()
    const wishlist = useWishlistStore()
    auth.user = makeUser({ _id: 'u1', wishlist: ['old'] })
    wishlist.products = [{
      _id: 'p1',
      name: 'Старый',
      slug: 'old',
      meta: '',
      price: 100,
      bloom: 'b',
      images: [],
      inStock: true,
    }]
    wishlist.error = 'old'

    await auth.login('user2@example.com', 'pass')

    expect(wishlist.products).toEqual([])
    expect(wishlist.error).toBe('')
  })
})
