import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_BONUS_SETTINGS, DEFAULT_LOYALTY_LEVELS } from '@/constants/loyalty'
import { useBonusViewModel } from '@/composables/useBonusViewModel'
import type { BonusSettings, BonusTransaction, CabinetBonusResponse, LoyaltyLevel } from '@/types/bonus'

const { auth, getBonus } = vi.hoisted(() => ({
  auth: {
    user: {
      _id: 'u1',
      bonusBalance: 100,
      totalSpent: 1500,
    },
    fetchMe: vi.fn(),
    updateUser: vi.fn(),
  },
  getBonus: vi.fn(),
}))

vi.mock('@/api', () => ({
  api: {
    getBonus,
  },
}))

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => auth,
}))

const settings: BonusSettings = {
  enabled: true,
  percentage: 7,
  welcome: 500,
  expireDays: 120,
  freezeDays: 3,
}

const levels: LoyaltyLevel[] = [
  { key: 'silver', name: 'Silver', icon: 'S', min: 0, cashback: 5 },
  { key: 'gold', name: 'Gold', icon: 'G', min: 5000, cashback: 8 },
]

const transaction: BonusTransaction = {
  _id: 'b1',
  type: 'credit',
  reason: 'order',
  description: 'Заказ',
  amount: 300,
  balanceAfter: 800,
  createdAt: '2026-06-01T00:00:00.000Z',
}

function makeBonusResponse(overrides: Partial<CabinetBonusResponse> = {}): CabinetBonusResponse {
  return {
    ok: true,
    transactions: [transaction],
    settings,
    levels,
    balance: 800,
    availableBalance: 800,
    ...overrides,
  }
}

describe('useBonusViewModel', () => {
  beforeEach(() => {
    auth.user = {
      _id: 'u1',
      bonusBalance: 100,
      totalSpent: 1500,
    }
    auth.fetchMe.mockReset().mockResolvedValue(undefined)
    auth.updateUser.mockReset().mockImplementation(user => {
      auth.user = user
    })
    getBonus.mockReset().mockResolvedValue(makeBonusResponse())
  })

  it('loads bonus data, syncs auth balance, and clears loading', async () => {
    const vm = useBonusViewModel()

    await vm.loadBonus()

    expect(getBonus).toHaveBeenCalledOnce()
    expect(auth.fetchMe).toHaveBeenCalledOnce()
    expect(vm.transactions.value).toEqual([transaction])
    expect(vm.settings.value).toEqual(settings)
    expect(vm.levels.value).toEqual(levels)
    expect(auth.updateUser).toHaveBeenCalledWith({ ...auth.user, bonusBalance: 800 })
    expect(vm.bonusBalance.value).toBe(800)
    expect(vm.totalSpent.value).toBe(1500)
    expect(vm.loading.value).toBe(false)
  })

  it('keeps default levels when api returns no levels and tolerates fetchMe failure', async () => {
    auth.fetchMe.mockRejectedValueOnce(new Error('session expired'))
    getBonus.mockResolvedValueOnce(makeBonusResponse({ levels: [] }))

    const vm = useBonusViewModel()

    await vm.loadBonus()

    expect(vm.levels.value).toEqual(DEFAULT_LOYALTY_LEVELS)
    expect(vm.settings.value).not.toEqual(DEFAULT_BONUS_SETTINGS)
    expect(vm.loading.value).toBe(false)
  })
})
