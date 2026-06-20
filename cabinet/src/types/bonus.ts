export interface LoyaltyTier {
  key: string
  name: string
  min: number
  cashback: number
}

export interface LoyaltyLevel extends LoyaltyTier {
  icon: string
}

export type BonusTransactionType = 'credit' | 'debit'

export type BonusTransactionReason =
  | 'registration'
  | 'order'
  | 'purchase'
  | 'expiry'
  | 'manual'
  | 'referral'

export interface BonusTransaction {
  _id: string
  type: BonusTransactionType
  reason: BonusTransactionReason
  description: string
  amount: number
  balanceAfter: number
  orderId?: string
  expiresAt?: string
  frozenUntil?: string
  expired?: boolean
  createdAt: string
}

export interface BonusSettings {
  enabled: boolean
  percentage: number
  welcome: number
  expireDays: number
  freezeDays: number
}

export interface CabinetBonusResponse {
  ok: boolean
  transactions: BonusTransaction[]
  settings: BonusSettings
  levels: LoyaltyLevel[]
  balance: number
  availableBalance: number
}

export type BonusResponse = CabinetBonusResponse
