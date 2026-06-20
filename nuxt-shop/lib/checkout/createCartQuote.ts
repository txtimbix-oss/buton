import type {
  CartQuote,
  CartQuoteInput,
  CheckoutBonusBlockReason,
  CheckoutLoyaltyLevel,
  CheckoutPromoDiscountType,
  CheckoutVolumeRule,
} from '~/lib/checkout/types'

function normalizePercent(value: number) {
  return Math.max(0, value)
}

function resolveLineDiscountPct(qty: number, rules: CheckoutVolumeRule[]) {
  let pct = 0

  for (const rule of rules) {
    if (qty >= rule.minQty && rule.discountPct > pct) pct = rule.discountPct
  }

  return pct
}

function calcPromoDiscount(
  value: number,
  type: CheckoutPromoDiscountType,
  base: number,
  maxCap: number,
) {
  if (type === 'free_shipping') return 0
  if (type === 'fixed') return Math.min(Math.max(0, value), base)

  const raw = Math.round(base * normalizePercent(value) / 100)

  if (type === 'percent_capped' && maxCap > 0) {
    return Math.min(raw, maxCap, base)
  }

  return Math.min(raw, base)
}

function resolveBlockedBonusReason(input: CartQuoteInput, subtotal: number, hasPromoDiscount: boolean): CheckoutBonusBlockReason {
  const hasBalance = input.bonusBalance > 0
  if (!hasBalance) return 'no_user_balance'
  if (!input.bonus.enabled) return 'policy_disabled'
  if (input.bonusBalance < input.bonus.minSpend) return 'balance_below_min'
  if (input.bonus.blockedProductSlugs.length > 0 && input.items.some(item => input.bonus.blockedProductSlugs.includes(item.slug))) {
    return 'blocked_product'
  }
  if (input.bonus.spendMinOrder > 0 && subtotal < input.bonus.spendMinOrder) return 'order_below_min'
  if (!input.bonus.withPromo && hasPromoDiscount) return 'promo_disallowed'
  if (input.promo.blockBonuses || input.promo2.blockBonuses) return 'promo_blocked'

  return null
}

function resolveCashbackPercent(levels: CheckoutLoyaltyLevel[], customerTotalSpent: number) {
  if (!levels.length) {
    if (customerTotalSpent >= 5000) return 7
    if (customerTotalSpent >= 1000) return 5
    return 3
  }

  const sorted = [...levels].sort((a, b) => b.min - a.min)
  return (sorted.find(level => customerTotalSpent >= level.min) ?? sorted[sorted.length - 1])?.cashbackPercent ?? 3
}

export function createCartQuote(input: CartQuoteInput): CartQuote {
  const subtotal = input.items.reduce((sum, item) => sum + item.price * item.qty, 0)

  const lineDiscountPcts = input.items.map(item => resolveLineDiscountPct(item.qty, input.volumeRulesBySlug[item.slug] ?? []))
  const lineDiscounts = input.items.map((item, index) => {
    const pct = lineDiscountPcts[index] ?? 0
    return pct > 0 ? Math.round(item.price * item.qty * pct / 100) : 0
  })

  const volumeDiscount = lineDiscounts.reduce((sum, value) => sum + value, 0)
  const effectiveSubtotal = Math.max(0, subtotal - volumeDiscount)

  const freeThreshold = Math.max(0, input.deliveryConfig.freeThreshold)
  const freeDeliveryLeft = Math.max(0, freeThreshold - effectiveSubtotal)
  const freeDeliveryProgressPct = freeThreshold > 0
    ? Math.min(100, Math.round(effectiveSubtotal / freeThreshold * 100))
    : 100

  const zoneDeliveryCost = input.zone?.cost ?? input.deliveryConfig.defaultCost
  const hasPromoFreeShipping = !!(input.promo.freeShipping || input.promo2.freeShipping)
  const hasFreeDelivery = input.deliveryMethod === 'pickup' || effectiveSubtotal >= freeThreshold || hasPromoFreeShipping
  const deliveryCost = hasFreeDelivery ? 0 : zoneDeliveryCost

  const promoDiscount = input.promo.applied
    ? calcPromoDiscount(input.promo.discount, input.promo.discountType, effectiveSubtotal, input.promo.maxDiscountAmount)
    : 0
  const promo2Discount = input.promo2.applied
    ? calcPromoDiscount(input.promo2.discount, input.promo2.discountType, effectiveSubtotal, input.promo2.maxDiscountAmount)
    : 0
  const discount = Math.min(effectiveSubtotal, promoDiscount + promo2Discount)
  const hasPromoDiscount = input.promo.applied || input.promo2.applied

  const total = Math.max(0, effectiveSubtotal + deliveryCost - discount)

  const blockedBonusReason = resolveBlockedBonusReason(input, subtotal, hasPromoDiscount)
  const canUseBonuses = blockedBonusReason === null
  const maxBonusUsable = canUseBonuses
    ? Math.floor(Math.max(0, total) * Math.max(0, input.bonus.maxSpendPercent) / 100)
    : 0
  const bonusToUse = input.bonusEnabled && canUseBonuses
    ? Math.min(Math.max(0, input.bonusBalance), maxBonusUsable)
    : 0
  const totalWithBonus = Math.max(0, total - bonusToUse)

  const cashbackPercent = resolveCashbackPercent(input.loyaltyLevels, input.customerTotalSpent)
  const bonusEarned = Math.floor(totalWithBonus * cashbackPercent / 100)

  return {
    subtotal,
    lineDiscounts,
    lineDiscountPcts,
    volumeDiscount,
    effectiveSubtotal,
    freeDeliveryLeft,
    freeDeliveryProgressPct,
    hasFreeDelivery,
    deliveryCost,
    zoneDeliveryCost,
    hasPromoDiscount,
    hasPromoFreeShipping,
    promoDiscount,
    promo2Discount,
    discount,
    total,
    canUseBonuses,
    blockedBonusReason,
    maxBonusUsable,
    bonusToUse,
    totalWithBonus,
    bonusEarned,
  }
}
