import { ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'

import { useShopUser } from '~/composables/useShopUser'

function createUseStateMock() {
  const store = new Map<string, ReturnType<typeof ref>>()

  return <T>(key: string, init: () => T) => {
    if (!store.has(key)) {
      store.set(key, ref(init()))
    }
    return store.get(key) as ReturnType<typeof ref<T>>
  }
}

describe('useShopUser', () => {
  it('fetches the authenticated user once and marks the state as checked', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      user: {
        _id: 'user-1',
        firstName: 'Anna',
        lastName: 'Ivanova',
        email: 'anna@test.ru',
        bonusBalance: 1200,
        addresses: [],
      },
    })

    vi.stubGlobal('useState', createUseStateMock())
    vi.stubGlobal('$fetch', fetchMock)

    const shopUser = useShopUser()

    await shopUser.fetchUser()
    await shopUser.fetchUser()

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith('/api/user/auth/me', {
      credentials: 'include',
    })
    expect(shopUser.user.value?.email).toBe('anna@test.ru')
    expect(shopUser.checked.value).toBe(true)
  })

  it('falls back to a checked anonymous state when auth request fails', async () => {
    vi.stubGlobal('useState', createUseStateMock())
    vi.stubGlobal('$fetch', vi.fn(async () => {
      throw new Error('unauthorized')
    }))

    const shopUser = useShopUser()

    await shopUser.fetchUser()

    expect(shopUser.user.value).toBeNull()
    expect(shopUser.checked.value).toBe(true)
  })

  it('updates bonus balance without replacing the user identity fields', () => {
    vi.stubGlobal('useState', createUseStateMock())
    vi.stubGlobal('$fetch', vi.fn())

    const shopUser = useShopUser()

    shopUser.user.value = {
      _id: 'user-1',
      firstName: 'Anna',
      lastName: 'Ivanova',
      email: 'anna@test.ru',
      bonusBalance: 1200,
      addresses: [],
    }

    shopUser.updateBalance(1800)

    expect(shopUser.user.value).toMatchObject({
      _id: 'user-1',
      email: 'anna@test.ru',
      bonusBalance: 1800,
    })
  })
})
