import type { BonusSettings, LoyaltyLevel } from '@/types/bonus'

export type { BonusSettings, BonusTransaction, LoyaltyLevel, LoyaltyTier } from '@/types/bonus'

export const DEFAULT_BONUS_SETTINGS: BonusSettings = {
  enabled: true,
  percentage: 5,
  welcome: 300,
  expireDays: 90,
  freezeDays: 0,
}

export const DEFAULT_LOYALTY_LEVELS: LoyaltyLevel[] = [
  { key: 'novice', name: 'Новичок', icon: '🌱', min: 0, cashback: 3 },
  { key: 'regular', name: 'Постоянный', icon: '🌸', min: 1000, cashback: 5 },
  { key: 'vip', name: 'VIP', icon: '🌺', min: 5000, cashback: 7 },
]
