import { ref } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { ShopUser } from '~/composables/useShopUser'
import { useWishlist } from '~/composables/useWishlist'

function createUseStateMock() {
  const store = new Map<string, ReturnType<typeof ref>>()

  return <T>(key: string, init: () => T) => {
    if (!store.has(key)) {
      store.set(key, ref(init()))
    }
    return store.get(key) as ReturnType<typeof ref<T>>
  }
}

function createLocalStorageMock(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial))
  return {
    getItem: vi.fn((key: string) => (data.has(key) ? data.get(key) : null)),
    setItem: vi.fn((key: string, value: string) => {
      data.set(key, value)
    }),
    removeItem: vi.fn((key: string) => {
      data.delete(key)
    }),
    clear: vi.fn(() => {
      data.clear()
    }),
    _data: data,
  }
}

function withProcessClient(value: boolean) {
  const prev = (process as { client?: boolean }).client
  Object.defineProperty(process, 'client', { value, configurable: true })
  return () => Object.defineProperty(process, 'client', { value: prev, configurable: true })
}

const userFixture: ShopUser = {
  _id: 'u1',
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  bonusBalance: 20,
  addresses: [],
}

describe('useWishlist', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    vi.resetModules()
  })

  it('loads slugs from localStorage on client and persists changed list', async () => {
    const storage = createLocalStorageMock({
      spb_wishlist: JSON.stringify(['alpha', 'beta']),
    })
    const restoreClient = withProcessClient(true)
    vi.stubGlobal('localStorage', storage)
    vi.stubGlobal('useShopUser', () => ({ user: { value: null } }))
    vi.stubGlobal('useState', createUseStateMock())
    vi.stubGlobal('$fetch', vi.fn())

    const wishlist = useWishlist()
    expect(wishlist.slugs.value).toEqual(['alpha', 'beta'])

    await wishlist.toggle('gamma')
    await new Promise(resolve => setTimeout(resolve, 0))
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(storage.setItem).toHaveBeenCalledWith(
      'spb_wishlist',
      JSON.stringify(['alpha', 'beta', 'gamma']),
    )

    restoreClient()
  })

  it('falls back to empty wishlist when localStorage data is invalid', () => {
    const storage = createLocalStorageMock({
      spb_wishlist: '{broken',
    })
    const restoreClient = withProcessClient(true)
    vi.stubGlobal('localStorage', storage)
    vi.stubGlobal('useShopUser', () => ({ user: { value: null } }))
    vi.stubGlobal('useState', createUseStateMock())
    vi.stubGlobal('$fetch', vi.fn())

    const wishlist = useWishlist()
    expect(wishlist.slugs.value).toEqual([])

    restoreClient()
  })

  it('syncFromApi replaces wishlist from server when on client', async () => {
    const restoreClient = withProcessClient(true)
    vi.stubGlobal('localStorage', createLocalStorageMock())
    vi.stubGlobal('useShopUser', () => ({ user: { value: null } }))
    vi.stubGlobal('useState', createUseStateMock())
    vi.stubGlobal('$fetch', vi.fn(async () => ({ ok: true, slugs: ['server-a', 'server-b'] })))

    const wishlist = useWishlist()
    await wishlist.syncFromApi()

    expect(wishlist.slugs.value).toEqual(['server-a', 'server-b'])
    restoreClient()
  })

  it('stays SSR-safe when client storage is unavailable', async () => {
    const restoreClient = withProcessClient(false)
    const fetchMock = vi.fn()
    vi.stubGlobal('useShopUser', () => ({ user: { value: null } }))
    vi.stubGlobal('useState', createUseStateMock())
    vi.stubGlobal('$fetch', fetchMock)

    const wishlist = useWishlist()
    await wishlist.syncFromApi()

    expect(fetchMock).not.toHaveBeenCalled()
    expect(wishlist.slugs.value).toEqual([])
    restoreClient()
  })

  it('toggles slugs and performs user-synced API calls for auth state', async () => {
    const restoreClient = withProcessClient(true)
    vi.stubGlobal('localStorage', createLocalStorageMock())
    const state = createUseStateMock()
    vi.stubGlobal('useShopUser', () => ({ user: state('shop_user', () => null) }))
    vi.stubGlobal('useState', state)

    const user = state<ShopUser | null>('shop_user', () => null)
    user.value = userFixture

    const fetchMock = vi.fn(async () => ({ ok: true }))
    vi.stubGlobal('$fetch', fetchMock)

    vi.stubGlobal('localStorage', createLocalStorageMock())

    const wishlist = useWishlist()

    await wishlist.toggle('rose')
    await wishlist.toggle('rose')

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      '/api/user/wishlist/rose',
      { method: 'POST', credentials: 'include' },
    )
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      '/api/user/wishlist/rose',
      { method: 'DELETE', credentials: 'include' },
    )
    expect(wishlist.has('rose').value).toBe(false)
    expect(wishlist.count.value).toBe(0)
    restoreClient()
  })
})
