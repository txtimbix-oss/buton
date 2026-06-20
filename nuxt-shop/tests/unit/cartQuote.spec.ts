import { describe, expect, it } from 'vitest'

import type { CartLine } from '~/lib/cart/types'
import { createCartQuote } from '~/lib/checkout/createCartQuote'
import type {
  CartQuoteInput,
  CheckoutBonusPolicy,
  CheckoutDeliveryMethod,
  CheckoutPromoState,
} from '~/lib/checkout/types'

function createLine(overrides: Partial<CartLine> = {}): CartLine {
  return {
    lineId: overrides.lineId ?? 'line-1',
    lineKey: overrides.lineKey ?? 'rose-m',
    slug: overrides.slug ?? 'rose',
    name: overrides.name ?? 'Rose',
    bloom: overrides.bloom ?? 'rose',
    image: overrides.image,
    meta: overrides.meta ?? 'Размер M',
    sizeLabel: overrides.sizeLabel ?? 'M',
    price: overrides.price ?? 3000,
    qty: overrides.qty ?? 1,
    addons: overrides.addons ?? [],
  }
}

function createPromo(overrides: Partial<CheckoutPromoState> = {}): CheckoutPromoState {
  return {
    code: overrides.code ?? '',
    applied: overrides.applied ?? false,
    discount: overrides.discount ?? 0,
    discountType: overrides.discountType ?? 'percent',
    maxDiscountAmount: overrides.maxDiscountAmount ?? 0,
    freeShipping: overrides.freeShipping ?? false,
    stackable: overrides.stackable ?? false,
    blockBonuses: overrides.blockBonuses ?? false,
  }
}

function createBonusPolicy(overrides: Partial<CheckoutBonusPolicy> = {}): CheckoutBonusPolicy {
  return {
    enabled: overrides.enabled ?? true,
    maxSpendPercent: overrides.maxSpendPercent ?? 100,
    minSpend: overrides.minSpend ?? 1,
    spendMinOrder: overrides.spendMinOrder ?? 0,
    withPromo: overrides.withPromo ?? true,
    blockedProductSlugs: overrides.blockedProductSlugs ?? [],
  }
}

function createInput(overrides: Partial<CartQuoteInput> = {}): CartQuoteInput {
  return {
    items: overrides.items ?? [],
    deliveryMethod: overrides.deliveryMethod ?? 'courier',
    deliveryConfig: overrides.deliveryConfig ?? {
      freeThreshold: 5000,
      defaultCost: 390,
    },
    zone: overrides.zone,
    promo: overrides.promo ?? createPromo(),
    promo2: overrides.promo2 ?? createPromo(),
    bonus: overrides.bonus ?? createBonusPolicy(),
    bonusBalance: overrides.bonusBalance ?? 0,
    bonusEnabled: overrides.bonusEnabled ?? false,
    loyaltyLevels: overrides.loyaltyLevels ?? [],
    customerTotalSpent: overrides.customerTotalSpent ?? 0,
    volumeRulesBySlug: overrides.volumeRulesBySlug ?? {},
  }
}

describe('createCartQuote', () => {
  it('calculates subtotal, per-line volume discounts, free delivery progress and totals', () => {
    const quote = createCartQuote(createInput({
      items: [
        createLine({ slug: 'rose', price: 3000, qty: 2 }),
        createLine({ lineId: 'line-2', lineKey: 'peony-l', slug: 'peony', price: 2500, qty: 1, sizeLabel: 'L' }),
      ],
      volumeRulesBySlug: {
        rose: [{ minQty: 2, discountPct: 10 }],
      },
      deliveryMethod: 'courier',
      zone: { id: 'z1', name: 'Center', cost: 450 },
    }))

    expect(quote.subtotal).toBe(8500)
    expect(quote.volumeDiscount).toBe(600)
    expect(quote.effectiveSubtotal).toBe(7900)
    expect(quote.lineDiscounts).toEqual([600, 0])
    expect(quote.freeDeliveryLeft).toBe(0)
    expect(quote.freeDeliveryProgressPct).toBe(100)
    expect(quote.hasFreeDelivery).toBe(true)
    expect(quote.deliveryCost).toBe(0)
    expect(quote.total).toBe(7900)
    expect(quote.totalWithBonus).toBe(7900)
  })

  it('uses zone delivery cost below threshold and applies capped plus fixed promo discounts', () => {
    const quote = createCartQuote(createInput({
      items: [createLine({ price: 4000, qty: 1 })],
      deliveryMethod: 'scheduled',
      zone: { id: 'z1', name: 'Center', cost: 500 },
      promo: createPromo({
        code: 'SAVE20',
        applied: true,
        discount: 20,
        discountType: 'percent_capped',
        maxDiscountAmount: 500,
        stackable: true,
      }),
      promo2: createPromo({
        code: 'LESS100',
        applied: true,
        discount: 100,
        discountType: 'fixed',
      }),
    }))

    expect(quote.deliveryCost).toBe(500)
    expect(quote.discount).toBe(600)
    expect(quote.promoDiscount).toBe(500)
    expect(quote.promo2Discount).toBe(100)
    expect(quote.total).toBe(3900)
    expect(quote.hasPromoDiscount).toBe(true)
    expect(quote.hasPromoFreeShipping).toBe(false)
  })

  it('lets promo free shipping zero the delivery cost without changing promo discount amount', () => {
    const quote = createCartQuote(createInput({
      items: [createLine({ price: 3500, qty: 1 })],
      deliveryMethod: 'courier',
      zone: { id: 'z1', name: 'Center', cost: 500 },
      promo: createPromo({
        code: 'SHIPFREE',
        applied: true,
        discount: 0,
        discountType: 'free_shipping',
        freeShipping: true,
      }),
    }))

    expect(quote.deliveryCost).toBe(0)
    expect(quote.hasPromoFreeShipping).toBe(true)
    expect(quote.discount).toBe(0)
    expect(quote.total).toBe(3500)
  })

  it('uses free shipping from secondary promo as delivery waiver', () => {
    const quote = createCartQuote(createInput({
      items: [createLine({ price: 1200, qty: 2 })],
      deliveryMethod: 'courier',
      zone: { id: 'z1', name: 'Center', cost: 600 },
      promo2: createPromo({
        code: 'SHIP2',
        applied: true,
        discount: 5,
        discountType: 'percent',
        freeShipping: true,
      }),
    }))

    expect(quote.hasPromoFreeShipping).toBe(true)
    expect(quote.deliveryCost).toBe(0)
    expect(quote.hasFreeDelivery).toBe(true)
    expect(quote.discount).toBe(120)
    expect(quote.total).toBe(2280)
  })

  it('applies bonuses with limits against total after delivery and promo discounts', () => {
    const quote = createCartQuote(createInput({
      items: [createLine({ price: 7000, qty: 1 })],
      deliveryMethod: 'courier',
      bonusBalance: 600,
      bonusEnabled: true,
      bonus: createBonusPolicy({
        maxSpendPercent: 5,
      }),
    }))

    expect(quote.canUseBonuses).toBe(true)
    expect(quote.maxBonusUsable).toBe(350)
    expect(quote.bonusToUse).toBe(350)
    expect(quote.total).toBe(7000)
    expect(quote.totalWithBonus).toBe(6650)
  })

  it('forces pickup to use free delivery regardless of zone cost or free-threshold', () => {
    const quote = createCartQuote(createInput({
      items: [createLine({ price: 4500, qty: 1 })],
      deliveryMethod: 'pickup',
      deliveryConfig: {
        freeThreshold: 7000,
        defaultCost: 900,
      },
      zone: { id: 'z-pickup', name: 'Pickup', cost: 1200 },
      promo: createPromo({
        applied: true,
        discount: 5,
        discountType: 'percent',
      }),
      bonusEnabled: true,
      bonusBalance: 200,
      bonus: createBonusPolicy({ maxSpendPercent: 5 }),
    }))

    expect(quote.hasFreeDelivery).toBe(true)
    expect(quote.deliveryCost).toBe(0)
    expect(quote.hasPromoDiscount).toBe(true)
    expect(quote.total).toBe(4275)
    expect(quote.totalWithBonus).toBe(4075)
  })

  it('chooses loyalty cashback level by spent threshold order-independent', () => {
    const quote = createCartQuote(createInput({
      items: [createLine({ price: 5000, qty: 1 })],
      loyaltyLevels: [
        { key: 'silver', name: 'Silver', min: 0, cashbackPercent: 3 },
        { key: 'gold', name: 'Gold', min: 2000, cashbackPercent: 5 },
        { key: 'vip', name: 'VIP', min: 4000, cashbackPercent: 8 },
        { key: 'max', name: 'Max', min: 6000, cashbackPercent: 12 },
      ],
      customerTotalSpent: 5000,
      deliveryMethod: 'scheduled',
      bonusEnabled: true,
      bonusBalance: 1000,
      bonus: createBonusPolicy({ maxSpendPercent: 10 }),
      zone: { id: 'z2', name: 'Scheduled', cost: 500 },
    }))

    expect(quote.bonusEarned).toBe(360)
    expect(quote.bonusToUse).toBe(500)
  })

  it('blocks bonuses when policy or items disallow them and still computes earned cashback', () => {
    const quote = createCartQuote(createInput({
      items: [createLine({ slug: 'blocked', price: 6000, qty: 1 })],
      deliveryMethod: 'pickup' satisfies CheckoutDeliveryMethod,
      bonusBalance: 1000,
      bonusEnabled: true,
      bonus: createBonusPolicy({
        withPromo: false,
        blockedProductSlugs: ['blocked'],
      }),
      promo: createPromo({
        code: 'SAVE10',
        applied: true,
        discount: 10,
        discountType: 'percent',
      }),
      loyaltyLevels: [
        { key: 'base', name: 'Base', min: 0, cashbackPercent: 3 },
        { key: 'vip', name: 'VIP', min: 5000, cashbackPercent: 7 },
      ],
      customerTotalSpent: 8000,
    }))

    expect(quote.canUseBonuses).toBe(false)
    expect(quote.bonusToUse).toBe(0)
    expect(quote.blockedBonusReason).toBe('blocked_product')
    expect(quote.total).toBe(5400)
    expect(quote.totalWithBonus).toBe(5400)
    expect(quote.bonusEarned).toBe(378)
  })

  it('blocks bonuses when promo has blockBonuses flag', () => {
    const quote = createCartQuote(createInput({
      items: [createLine({ price: 4000, qty: 1 })],
      deliveryMethod: 'courier',
      bonusBalance: 1000,
      bonusEnabled: true,
      promo: createPromo({
        code: 'FORBID',
        applied: true,
        discount: 10,
        discountType: 'percent',
        blockBonuses: true,
      }),
      bonus: createBonusPolicy({
        withPromo: true,
        enabled: true,
      }),
    }))

    expect(quote.canUseBonuses).toBe(false)
    expect(quote.blockedBonusReason).toBe('promo_blocked')
    expect(quote.bonusToUse).toBe(0)
    expect(quote.discount).toBe(400)
    expect(quote.total).toBe(3990)
  })

  it('blocks bonuses when policy does not allow bonuses with active promo', () => {
    const quote = createCartQuote(createInput({
      items: [createLine({ price: 4000, qty: 1 })],
      deliveryMethod: 'courier',
      bonusBalance: 1000,
      bonusEnabled: true,
      promo: createPromo({
        code: 'BLOCK',
        applied: true,
        discount: 10,
        discountType: 'percent',
      }),
      bonus: createBonusPolicy({
        withPromo: false,
      }),
    }))

    expect(quote.canUseBonuses).toBe(false)
    expect(quote.blockedBonusReason).toBe('promo_disallowed')
    expect(quote.bonusToUse).toBe(0)
    expect(quote.discount).toBe(400)
    expect(quote.total).toBe(3990)
  })

  it('caps percent-capped discount by subtotal when amount exceeds it', () => {
    const quote = createCartQuote(createInput({
      items: [createLine({ price: 1000, qty: 1 })],
      promo: createPromo({
        code: 'BIG',
        applied: true,
        discount: 100,
        discountType: 'percent_capped',
        maxDiscountAmount: 9000,
      }),
      promo2: createPromo({
        code: 'EXTRA',
        applied: true,
        discount: 100,
        discountType: 'fixed',
      }),
      deliveryMethod: 'pickup',
    }))

    expect(quote.promoDiscount).toBe(1000)
    expect(quote.promo2Discount).toBe(100)
    expect(quote.discount).toBe(1000)
    expect(quote.total).toBe(0)
  })

  it('keeps current arithmetic when first promo is marked non-stackable', () => {
    const quote = createCartQuote(createInput({
      items: [createLine({ price: 1500, qty: 1 })],
      promo: createPromo({
        code: 'BIG',
        applied: true,
        discount: 50,
        discountType: 'percent',
        stackable: false,
      }),
      promo2: createPromo({
        code: 'FIX',
        applied: true,
        discount: 200,
        discountType: 'fixed',
      }),
      deliveryMethod: 'pickup',
    }))

    expect(quote.promoDiscount).toBe(750)
    expect(quote.promo2Discount).toBe(200)
    expect(quote.discount).toBe(950)
    expect(quote.total).toBe(550)
  })
})
