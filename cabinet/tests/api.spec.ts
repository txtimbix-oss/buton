import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import axios from 'axios'
import AxiosMockAdapter from 'axios-mock-adapter'

type ApiModule = typeof import('@/api')

let api: ApiModule['api']
let assetUrl: ApiModule['assetUrl']
let privateClient: AxiosMockAdapter
let publicClient: AxiosMockAdapter
let uploadsBase = ''

beforeAll(async () => {
  const originalCreate = axios.create.bind(axios)
  const createdConfigs: Array<Record<string, unknown> | undefined> = []

  vi.spyOn(axios, 'create').mockImplementation((config?: any) => {
    const instance = originalCreate(config)
    createdConfigs.push(config)

    if (createdConfigs.length === 1) {
      privateClient = new AxiosMockAdapter(instance)
    } else if (createdConfigs.length === 2) {
      publicClient = new AxiosMockAdapter(instance)
    }

    return instance
  })

  const apiModule = await import('@/api')
  api = apiModule.api
  assetUrl = apiModule.assetUrl

  expect(createdConfigs).toHaveLength(2)
  expect(String(createdConfigs[0]?.baseURL ?? '')).toMatch(/\/api\/user$/)
  expect(createdConfigs[0]?.withCredentials).toBe(true)
  expect(String(createdConfigs[1]?.baseURL ?? '')).toMatch(/\/api$/)
  expect(createdConfigs[1]?.withCredentials).toBe(true)
  uploadsBase = String(createdConfigs[1]?.baseURL ?? '').replace(/\/api\/?$/, '')
})

beforeEach(() => {
  privateClient.resetHandlers()
  privateClient.resetHistory()
  publicClient.resetHandlers()
  publicClient.resetHistory()
})

afterEach(() => {
  vi.clearAllMocks()
  vi.unstubAllEnvs()
})

afterAll(() => {
  vi.restoreAllMocks()
})

function parsePayload<T>(payload: unknown): T {
  return typeof payload === 'string' ? JSON.parse(payload) as T : payload as T
}

describe('api client', () => {
  it('uses configured API base for private and public API clients', async () => {
    vi.stubEnv('VITE_API_BASE', 'https://api.butonshop.ru')
    vi.resetModules()

    const { BASE, apiUrl } = await import('../src/api/client')

    expect(BASE).toBe('https://api.butonshop.ru')
    expect(apiUrl('/api/inquiries')).toBe('https://api.butonshop.ru/api/inquiries')
    expect(apiUrl('api/inquiries')).toBe('https://api.butonshop.ru/api/inquiries')
  })

  it('builds asset URLs safely', () => {
    expect(assetUrl('https://cdn.example.com/p.png')).toBe('https://cdn.example.com/p.png')
    expect(assetUrl('blob:local-123')).toBe('blob:local-123')
    expect(assetUrl('/uploads/test.webp')).toBe(`${uploadsBase}/uploads/test.webp`)
    expect(assetUrl(undefined)).toBe('')
  })

  it('calls auth endpoints and sends correct payloads', async () => {
    privateClient.onPost('/auth/login').reply((config) => {
      const payload = parsePayload<{ email: string; password: string }>(config.data)
      expect(payload).toMatchObject({ email: 'user@example.com', password: 'secret' })
      return [200, { ok: true, user: { _id: 'u1', email: 'user@example.com' } }]
    })

    privateClient.onPost('/auth/register').reply(200, {
      ok: true,
      user: {
        _id: 'u2',
        email: 'user2@example.com',
        firstName: 'Иван',
        lastName: 'Иванов',
        phone: '+70000000000',
        notifications: { orderStatus: true, news: true },
        addresses: [],
        wishlist: [],
        bonusBalance: 0,
        totalSpent: 0,
        referralCode: 'PROMO',
        achievements: [],
        createdAt: '2026-06-01T00:00:00.000Z',
      },
    })

    privateClient.onPost('/auth/forgot-password').reply(200, { ok: true })
    privateClient.onPost('/auth/reset-password').reply(200, { ok: true })

    await expect(api.login('user@example.com', 'secret')).resolves.toMatchObject({ ok: true, user: { _id: 'u1' } })
    await expect(api.register({
      email: 'user2@example.com',
      password: '123456',
      firstName: 'Иван',
      lastName: 'Иванов',
      phone: '+70000000000',
      referralCode: 'PROMO',
    })).resolves.toMatchObject({ ok: true, user: { _id: 'u2' } })
    await expect(api.forgotPassword('user2@example.com')).resolves.toMatchObject({ ok: true })
    await expect(api.resetPassword('reset-token', 'new-password')).resolves.toMatchObject({ ok: true })

    expect(privateClient.history.post.map(item => item.url)).toEqual([
      '/auth/login',
      '/auth/register',
      '/auth/forgot-password',
      '/auth/reset-password',
    ])
  })

  it('calls profile, address, wishlist and bonus endpoints', async () => {
    privateClient.onGet('/auth/me').reply(200, {
      ok: true,
      user: {
        _id: 'u1',
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        notifications: { orderStatus: true, news: true },
        addresses: [{ _id: 'a1', label: 'Дом', address: 'Тверская', isDefault: true }],
        wishlist: ['p1'],
        bonusBalance: 100,
        totalSpent: 1000,
        referralCode: 'REF1',
        achievements: [],
        createdAt: '2026-06-01T00:00:00.000Z',
      },
    })
    privateClient.onGet('/orders').reply(200, [{
      _id: 'o1',
      orderNumber: '1001',
      items: [],
      delivery: { type: 'courier', date: '2026-06-01', time: '10:00' },
      recipient: { name: 'John', phone: '+70000000000' },
      subtotal: 1000,
      deliveryCost: 0,
      discount: 0,
      total: 1000,
      bonusEarned: 50,
      status: 'delivered',
      createdAt: '2026-06-01T00:00:00.000Z',
    }])
    privateClient.onGet('/reviews').reply(200, {
      ok: true,
      reviews: [{
        _id: 'r1',
        productSlug: 'p1',
        name: 'Роза',
        rating: 5,
        text: 'top',
        status: 'approved',
        createdAt: '2026-06-01T00:00:00.000Z',
      }],
    })
    privateClient.onGet('/wishlist').reply(200, {
      ok: true,
      slugs: ['p1'],
      products: [{ _id: 'p1', name: 'Роза', slug: 'roza', meta: '', price: 500, bloom: 'red', images: ['x'], inStock: true }],
    })
    privateClient.onPost('/wishlist/p2').reply(200, { ok: true, wishlist: ['p1', 'p2'] })
    privateClient.onDelete('/wishlist/p1').reply(200, { ok: true, wishlist: [] })
    privateClient.onPost('/addresses').reply((config) => {
      const payload = parsePayload<{ label: string; address: string; isDefault?: boolean }>(config.data)
      expect(payload.label).toBe('Офис')
      return [200, {
        ok: true,
        addresses: [{ _id: 'a2', label: payload.label, address: payload.address, isDefault: Boolean(payload.isDefault) }],
      }]
    })
    privateClient.onPut('/addresses/a2').reply(200, {
      ok: true,
      addresses: [{ _id: 'a2', label: 'Офис-2', address: 'Новая', isDefault: true }],
    })
    privateClient.onDelete('/addresses/a2').reply(200, { ok: true, addresses: [] })
    privateClient.onGet('/bonus').reply(200, {
      ok: true,
      transactions: [],
      settings: { enabled: true, percentage: 5, welcome: 300, expireDays: 90 },
      levels: [],
      balance: 42,
    })

    await api.me()
    await api.getOrders()
    await api.getUserReviews()
    await api.getWishlist()
    await api.addToWishlist('p2')
    await api.removeFromWishlist('p1')
    await api.addAddress({ label: 'Офис', address: 'ул. Пушкина 7', isDefault: false })
    await api.updateAddress('a2', { label: 'Офис-2' })
    await api.deleteAddress('a2')
    await api.getBonus()

    expect(privateClient.history.get).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ url: '/auth/me' }),
        expect.objectContaining({ url: '/orders' }),
        expect.objectContaining({ url: '/reviews' }),
        expect.objectContaining({ url: '/wishlist' }),
        expect.objectContaining({ url: '/bonus' }),
      ]),
    )

    expect(privateClient.history.post).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ url: '/wishlist/p2' }),
        expect.objectContaining({ url: '/addresses' }),
      ]),
    )

    expect(privateClient.history.put).toEqual(expect.arrayContaining([expect.objectContaining({ url: '/addresses/a2' })]))
    expect(privateClient.history.delete).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ url: '/wishlist/p1' }),
        expect.objectContaining({ url: '/addresses/a2' }),
      ]),
    )
  })

  it('calls order/review mutating endpoints and validates payloads', async () => {
    privateClient.onPost('/orders/o1/duplicate').reply(200, {
      ok: true,
      _id: 'o1-copy',
      orderNumber: '2002',
    })
    privateClient.onPatch('/orders/o1/cancel').reply(200, {
      ok: true,
      order: {
        _id: 'o1',
        orderNumber: '2001',
        items: [],
        delivery: { type: 'courier', date: '2026-06-01', time: '10:00' },
        recipient: { name: 'John', phone: '+7' },
        subtotal: 1000,
        deliveryCost: 0,
        discount: 0,
        total: 1000,
        bonusEarned: 0,
        status: 'cancelled',
        createdAt: '2026-06-01T00:00:00.000Z',
      },
    })
    privateClient.onPost('/reviews').reply((config) => {
      const payload = parsePayload<{ productSlug: string; rating: number; text: string }>(config.data)
      expect(payload.productSlug).toBe('rose')
      expect(payload.rating).toBe(5)
      return [200, { ok: true, review: { _id: 'rev-1', ...payload, status: 'pending', createdAt: '2026-06-08T00:00:00.000Z' } }]
    })
    privateClient.onGet('/birthday-promo').reply(200, {
      ok: true,
      promo: { code: 'BIRTHDAY', discount: 500 },
    })

    await expect(api.duplicateOrder('o1')).resolves.toMatchObject({ ok: true, _id: 'o1-copy' })
    await expect(api.cancelOrder('o1')).resolves.toMatchObject({ ok: true })
    await expect(api.createReview({ productSlug: 'rose', rating: 5, text: 'Great' })).resolves.toMatchObject({
      ok: true,
      review: { productSlug: 'rose' },
    })
    await expect(api.checkBirthdayPromo()).resolves.toMatchObject({
      ok: true,
      promo: { code: 'BIRTHDAY', discount: 500 },
    })

    expect(privateClient.history.post).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ url: '/orders/o1/duplicate' }),
        expect.objectContaining({ url: '/reviews' }),
      ]),
    )
    expect(privateClient.history.patch).toEqual(expect.arrayContaining([expect.objectContaining({ url: '/orders/o1/cancel' })]))
    expect(privateClient.history.get).toEqual(expect.arrayContaining([expect.objectContaining({ url: '/birthday-promo' })]))
  })

  it('uploads avatar and extracts first url from upload response', async () => {
    privateClient.onPost('/upload').reply((config) => {
      expect(config.data).toBeInstanceOf(FormData)
      return [200, { urls: ['https://cdn.example.com/avatar-sm.webp', 'https://cdn.example.com/avatar-md.webp'] }]
    })

    const file = new File(['file'], 'avatar.png', { type: 'image/png' })
    await expect(api.uploadAvatar(file)).resolves.toBe('https://cdn.example.com/avatar-sm.webp')
  })

  it('calls public catalog/promo endpoints and validates params', async () => {
    publicClient.onGet('/products').reply((config) => {
      expect(config.params).toEqual({ bloom: 'red', featured: 'true', limit: 4 })
      return [200, [{ _id: 'p2', name: 'Роза', slug: 'rose', meta: '', price: 300, bloom: 'red', images: [], inStock: true }]]
    })
    publicClient.onGet('/promocodes/auto-apply').reply((config) => {
      expect(config.params).toMatchObject({ userId: 'u1' })
      return [200, { code: 'AUTO10', discount: 10, discountType: 'percent' }]
    })

    await expect(api.getProducts({ bloom: 'red', featured: 'true', limit: 4 })).resolves.toEqual([
      { _id: 'p2', name: 'Роза', slug: 'rose', meta: '', price: 300, bloom: 'red', images: [], inStock: true },
    ])

    await expect(api.getAutoApplyPromo({ userId: 'u1' })).resolves.toMatchObject({
      code: 'AUTO10',
      discount: 10,
      discountType: 'percent',
    })

    expect(publicClient.history.get).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ url: '/products' }),
        expect.objectContaining({ url: '/promocodes/auto-apply' }),
      ]),
    )
  })

  it('maps backend error messages to thrown errors', async () => {
    privateClient.onGet('/bonus').reply(400, { error: 'Нет доступа к бонусам' })
    publicClient.onGet('/promocodes/auto-apply').reply(500, { error: 'Сервис недоступен' })

    await expect(api.getBonus()).rejects.toThrow('Нет доступа к бонусам')
    await expect(api.getAutoApplyPromo({ userId: 'u1' })).rejects.toThrow('Сервис недоступен')
  })
})
