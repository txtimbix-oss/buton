import { computed, ref } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from '@/api'
import { createAuthAddressBoundary } from '@/stores/auth-addresses'
import type { AddressPayload, IAddress } from '@/types/user-address'
import type { IUser } from '@/types/user-profile-auth'

vi.mock('@/api', () => ({
  api: {
    addAddress: vi.fn(),
    updateAddress: vi.fn(),
    deleteAddress: vi.fn(),
  },
}))

function makeAddress(overrides: Partial<IAddress> = {}): IAddress {
  return {
    _id: 'a-1',
    label: 'Дом',
    address: 'Тверская 1',
    isDefault: true,
    ...overrides,
  }
}

function makeUser(overrides: Partial<IUser> = {}): IUser {
  return {
    _id: 'u1',
    email: 'user@example.com',
    firstName: 'Анна',
    lastName: 'Петрова',
    notifications: { orderStatus: true, news: false },
    addresses: [makeAddress()],
    wishlist: ['rose'],
    bonusBalance: 100,
    totalSpent: 1500,
    referralCode: 'REF',
    achievements: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('auth-addresses boundary', () => {
  let user = ref<IUser | null>(null)
  let sync: Array<Partial<IUser>>

  beforeEach(() => {
    setActiveUser()
    sync = []
    vi.clearAllMocks()
  })

  function setActiveUser(overrides: Partial<IUser> = {}) {
    user.value = makeUser(overrides)
  }

  function mergeUserPatch(patch: Partial<IUser>) {
    sync.push(patch)
    if (!user.value) return
    user.value = { ...user.value, ...patch }
  }

  it('вычисляет адреса из user и синхронизирует после добавления', async () => {
    const boundary = createAuthAddressBoundary({ user, mergeUserPatch })

    expect(boundary.addresses.value).toEqual([makeAddress()])

    const payload: AddressPayload = { label: 'Офис', address: 'Новая 1', isDefault: false }
    vi.mocked(api.addAddress).mockResolvedValue({
      ok: true,
      addresses: [
        makeAddress(),
        { ...makeAddress({ _id: 'a-2', label: 'Офис', address: 'Новая 1', isDefault: false }) },
      ],
    })

    const result = await boundary.addAddress(payload)

    expect(api.addAddress).toHaveBeenCalledWith(payload)
    expect(result).toEqual([
      makeAddress(),
      { ...makeAddress({ _id: 'a-2', label: 'Офис', address: 'Новая 1', isDefault: false }) },
    ])
    expect(boundary.addresses.value).toEqual(result)
    expect(sync).toHaveLength(1)
    expect(sync.at(-1)).toEqual({
      addresses: result,
    })
  })

  it('обновляет и удаляет адреса через update/delete + mergeUserPatch', async () => {
    const boundary = createAuthAddressBoundary({ user, mergeUserPatch })

    const afterUpdate = [
      { ...makeAddress(), label: 'Дом', address: 'Ленина 1' },
    ]
    const afterDelete: IAddress[] = []

    vi.mocked(api.updateAddress).mockResolvedValue({ ok: true, addresses: afterUpdate })
    vi.mocked(api.deleteAddress).mockResolvedValue({ ok: true, addresses: afterDelete })

    const updated = await boundary.updateAddress('a-1', { address: 'Ленина 1' })
    expect(updated).toEqual(afterUpdate)
    expect(boundary.addresses.value).toEqual(afterUpdate)

    const deleted = await boundary.deleteAddress('a-1')
    expect(deleted).toEqual(afterDelete)
    expect(boundary.addresses.value).toEqual(afterDelete)

    expect(sync).toHaveLength(2)
    expect(sync[0]).toEqual({ addresses: afterUpdate })
    expect(sync[1]).toEqual({ addresses: afterDelete })
  })

  it('реактивно перестраивает computed адресов при смене пользователя', () => {
    const boundary = createAuthAddressBoundary({ user, mergeUserPatch })
    const addressesCount = computed(() => boundary.addresses.value.length)

    expect(addressesCount.value).toBe(1)

    user.value = { ...user.value!, addresses: [makeAddress({ _id: 'a-3', label: 'Клиент', isDefault: false })] }

    expect(addressesCount.value).toBe(1)
    expect(boundary.addresses.value[0].label).toBe('Клиент')
  })
})
