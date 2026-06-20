import { computed, toValue, type MaybeRefOrGetter } from 'vue'

import type { CartLine } from '~/lib/cart/types'
import { createCartQuote } from '~/lib/checkout/createCartQuote'
import type {
  CartQuote,
  CheckoutBonusPolicy,
  CheckoutDeliveryConfig,
  CheckoutDeliveryMethod,
  CheckoutDeliveryZone,
  CheckoutLoyaltyLevel,
  CheckoutPromoState,
  CheckoutVolumeRule,
} from '~/lib/checkout/types'

interface RawSettingsLike {
  delivery?: Partial<{
    freeThreshold: number
    cost: number
  }>
  bonus?: Partial<{
    spendEnabled: boolean
    maxSpendPercent: number
    minSpend: number
    spendMinOrder: number
    withPromo: boolean
    blockedProducts: string[]
  }>
  deliveryFreeThreshold?: number | string
  deliveryCost?: number | string
  bonusSpendEnabled?: boolean | string
  bonusMaxSpendPercent?: number | string
  bonusMinSpend?: number | string
  bonusSpendMinOrder?: number | string
  bonusWithPromo?: boolean | string
  bonusBlockedProducts?: string
}

interface ShopUserLike {
  bonusBalance?: number
  totalSpent?: number
}

interface LoyaltyLevelLike {
  key?: string
  name?: string
  min: number
  cashback?: number
  cashbackPercent?: number
}

interface DeliveryZoneLike {
  _id?: string
  id?: string
  name: string
  cost: number
}

interface PromoStateInput extends Partial<CheckoutPromoState> {}

export interface UseCartQuoteOptions {
  items?: MaybeRefOrGetter<CartLine[]>
  lines?: MaybeRefOrGetter<CartLine[]>
  settings?: MaybeRefOrGetter<RawSettingsLike | null | undefined>
  shopUser?: MaybeRefOrGetter<ShopUserLike | null | undefined>
  deliveryMethod?: MaybeRefOrGetter<CheckoutDeliveryMethod | null | undefined>
  detectedZone?: MaybeRefOrGetter<DeliveryZoneLike | null | undefined>
  zone?: MaybeRefOrGetter<CheckoutDeliveryZone | null | undefined>
  promo?: MaybeRefOrGetter<PromoStateInput | null | undefined>
  promo2?: MaybeRefOrGetter<PromoStateInput | null | undefined>
  bonusEnabled?: MaybeRefOrGetter<boolean | null | undefined>
  bonusBalance?: MaybeRefOrGetter<number | null | undefined>
  loyaltyLevels?: MaybeRefOrGetter<LoyaltyLevelLike[] | null | undefined>
  customerTotalSpent?: MaybeRefOrGetter<number | null | undefined>
  volumeRulesBySlug?: MaybeRefOrGetter<Record<string, CheckoutVolumeRule[]> | null | undefined>
}

function readNumber(value: unknown, fallback: number) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function readBoolean(value: unknown, fallback: boolean) {
  if (typeof value === 'boolean') return value
  if (value == null || value === '') return fallback
  return value === 'true'
}

function readStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string')
  }

  if (typeof value !== 'string' || !value.trim()) return []

  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string')
      : []
  } catch {
    return []
  }
}

function resolveLines(options: UseCartQuoteOptions) {
  return toValue(options.items) ?? toValue(options.lines) ?? []
}

function resolveDeliveryConfig(settings: RawSettingsLike | null | undefined): CheckoutDeliveryConfig {
  const delivery = settings?.delivery

  return {
    freeThreshold: readNumber(delivery?.freeThreshold ?? settings?.deliveryFreeThreshold, 5000),
    defaultCost: readNumber(delivery?.cost ?? settings?.deliveryCost, 390),
  }
}

function resolveBonusPolicy(settings: RawSettingsLike | null | undefined): CheckoutBonusPolicy {
  const bonus = settings?.bonus

  return {
    enabled: readBoolean(bonus?.spendEnabled ?? settings?.bonusSpendEnabled, true),
    maxSpendPercent: readNumber(bonus?.maxSpendPercent ?? settings?.bonusMaxSpendPercent, 100),
    minSpend: readNumber(bonus?.minSpend ?? settings?.bonusMinSpend, 1),
    spendMinOrder: readNumber(bonus?.spendMinOrder ?? settings?.bonusSpendMinOrder, 0),
    withPromo: readBoolean(bonus?.withPromo ?? settings?.bonusWithPromo, true),
    blockedProductSlugs: readStringArray(bonus?.blockedProducts ?? settings?.bonusBlockedProducts),
  }
}

function createPromoState(input: PromoStateInput | null | undefined): CheckoutPromoState {
  return {
    code: input?.code ?? '',
    applied: input?.applied ?? false,
    discount: readNumber(input?.discount, 0),
    discountType: input?.discountType ?? 'percent',
    maxDiscountAmount: readNumber(input?.maxDiscountAmount, 0),
    freeShipping: input?.freeShipping ?? false,
    stackable: input?.stackable ?? false,
    blockBonuses: input?.blockBonuses ?? false,
  }
}

function resolveZone(options: UseCartQuoteOptions): CheckoutDeliveryZone | null {
  const explicitZone = toValue(options.zone)
  if (explicitZone) return explicitZone

  const detectedZone = toValue(options.detectedZone)
  if (!detectedZone) return null

  return {
    id: detectedZone.id ?? detectedZone._id ?? detectedZone.name,
    name: detectedZone.name,
    cost: detectedZone.cost,
  }
}

function resolveBonusBalance(options: UseCartQuoteOptions) {
  const explicitBalance = toValue(options.bonusBalance)
  if (explicitBalance != null) return readNumber(explicitBalance, 0)

  return readNumber(toValue(options.shopUser)?.bonusBalance, 0)
}

function resolveCustomerTotalSpent(options: UseCartQuoteOptions) {
  const explicitTotalSpent = toValue(options.customerTotalSpent)
  if (explicitTotalSpent != null) return readNumber(explicitTotalSpent, 0)

  return readNumber(toValue(options.shopUser)?.totalSpent, 0)
}

function resolveLoyaltyLevels(options: UseCartQuoteOptions): CheckoutLoyaltyLevel[] {
  return (toValue(options.loyaltyLevels) ?? []).map((level, index) => ({
    key: level.key ?? `level-${index}`,
    name: level.name ?? level.key ?? `Level ${index + 1}`,
    min: readNumber(level.min, 0),
    cashbackPercent: readNumber(level.cashbackPercent ?? level.cashback, 0),
  }))
}

export function useCartQuote(options: UseCartQuoteOptions) {
  const quote = computed<CartQuote>(() => {
    const settings = toValue(options.settings)

    return createCartQuote({
      items: resolveLines(options),
      deliveryMethod: toValue(options.deliveryMethod) ?? 'courier',
      deliveryConfig: resolveDeliveryConfig(settings),
      zone: resolveZone(options),
      promo: createPromoState(toValue(options.promo)),
      promo2: createPromoState(toValue(options.promo2)),
      bonus: resolveBonusPolicy(settings),
      bonusBalance: resolveBonusBalance(options),
      bonusEnabled: toValue(options.bonusEnabled) ?? false,
      loyaltyLevels: resolveLoyaltyLevels(options),
      customerTotalSpent: resolveCustomerTotalSpent(options),
      volumeRulesBySlug: toValue(options.volumeRulesBySlug) ?? {},
    })
  })

  const bonusMaxSpendPercent = computed(() => {
    const settings = toValue(options.settings)
    return resolveBonusPolicy(settings).maxSpendPercent
  })

  const volumeDiscountItems = computed(() => quote.value.lineDiscounts)

  function getVolumeDiscountPct(target: number | CartLine) {
    const index = typeof target === 'number'
      ? target
      : resolveLines(options).findIndex(line => line.lineId === target.lineId)

    return index >= 0 ? (quote.value.lineDiscountPcts[index] ?? 0) : 0
  }

  return {
    quote,
    subtotal: computed(() => quote.value.subtotal),
    bonusMaxSpendPercent,
    canUseBonuses: computed(() => quote.value.canUseBonuses),
    bonusToUse: computed(() => quote.value.bonusToUse),
    total: computed(() => quote.value.total),
    totalWithBonus: computed(() => quote.value.totalWithBonus),
    bonusEarned: computed(() => quote.value.bonusEarned),
    discount: computed(() => quote.value.discount),
    deliveryCost: computed(() => quote.value.deliveryCost),
    zoneDeliveryCost: computed(() => quote.value.zoneDeliveryCost),
    effectiveSubtotal: computed(() => quote.value.effectiveSubtotal),
    freeDeliveryLeft: computed(() => quote.value.freeDeliveryLeft),
    freeDeliveryPct: computed(() => quote.value.freeDeliveryProgressPct),
    volumeDiscount: computed(() => quote.value.volumeDiscount),
    volumeDiscountItems,
    getVolumeDiscountPct,
    hasPromoFreeShipping: computed(() => quote.value.hasPromoFreeShipping),
  }
}
