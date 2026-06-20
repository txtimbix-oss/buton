import type { CartLine } from '~/lib/cart/types'

export type CheckoutDeliveryMethod = 'courier' | 'scheduled' | 'pickup'

export type CheckoutPromoDiscountType = 'percent' | 'fixed' | 'free_shipping' | 'percent_capped'

export interface CheckoutVolumeRule {
  minQty: number
  discountPct: number
}

export interface CheckoutDeliveryZone {
  id: string
  name: string
  cost: number
}

export interface CheckoutDeliveryConfig {
  freeThreshold: number
  defaultCost: number
}

export interface CheckoutPromoState {
  code: string
  applied: boolean
  discount: number
  discountType: CheckoutPromoDiscountType
  maxDiscountAmount: number
  freeShipping: boolean
  stackable: boolean
  blockBonuses: boolean
}

export interface CheckoutBonusPolicy {
  enabled: boolean
  maxSpendPercent: number
  minSpend: number
  spendMinOrder: number
  withPromo: boolean
  blockedProductSlugs: string[]
}

export interface CheckoutLoyaltyLevel {
  key: string
  name: string
  min: number
  cashbackPercent: number
}

export interface CartQuoteInput {
  items: CartLine[]
  deliveryMethod: CheckoutDeliveryMethod
  deliveryConfig: CheckoutDeliveryConfig
  zone?: CheckoutDeliveryZone | null
  promo: CheckoutPromoState
  promo2: CheckoutPromoState
  bonus: CheckoutBonusPolicy
  bonusBalance: number
  bonusEnabled: boolean
  loyaltyLevels: CheckoutLoyaltyLevel[]
  customerTotalSpent: number
  volumeRulesBySlug: Record<string, CheckoutVolumeRule[]>
}

export type CheckoutBonusBlockReason =
  | 'no_user_balance'
  | 'policy_disabled'
  | 'balance_below_min'
  | 'order_below_min'
  | 'promo_disallowed'
  | 'promo_blocked'
  | 'blocked_product'
  | null

export interface CartQuote {
  subtotal: number
  lineDiscounts: number[]
  lineDiscountPcts: number[]
  volumeDiscount: number
  effectiveSubtotal: number
  freeDeliveryLeft: number
  freeDeliveryProgressPct: number
  hasFreeDelivery: boolean
  deliveryCost: number
  zoneDeliveryCost: number
  hasPromoDiscount: boolean
  hasPromoFreeShipping: boolean
  promoDiscount: number
  promo2Discount: number
  discount: number
  total: number
  canUseBonuses: boolean
  blockedBonusReason: CheckoutBonusBlockReason
  maxBonusUsable: number
  bonusToUse: number
  totalWithBonus: number
  bonusEarned: number
}
