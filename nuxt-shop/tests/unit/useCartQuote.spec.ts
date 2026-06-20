import { ref } from 'vue'
import { describe, expect, it } from 'vitest'

import { useCartQuote } from '~/composables/useCartQuote'
import type { CartLine } from '~/lib/cart/types'

function createLine(overrides: Partial<CartLine> = {}): CartLine {
  return {
    lineId: overrides.lineId ?? 'line-1',
    lineKey: overrides.lineKey ?? 'rose-m',
    slug: overrides.slug ?? 'rose',
    name: overrides.name ?? 'Розы',
    bloom: overrides.bloom ?? 'rose',
    image: overrides.image,
    meta: overrides.meta ?? 'Размер M',
    sizeLabel: overrides.sizeLabel ?? 'M',
    price: overrides.price ?? 3200,
    qty: overrides.qty ?? 1,
    addons: overrides.addons ?? [],
  }
}

describe('useCartQuote', () => {
  it('reads delivery thresholds/costs from nested and legacy settings', () => {
    const items = ref([createLine(), createLine({ slug: 'peony', price: 2600, qty: 1 })])

    const quote = useCartQuote({
      items,
      settings: ref({
        delivery: { freeThreshold: 12000, cost: 600 },
        deliveryFreeThreshold: '999',
        deliveryCost: '100',
      }),
    })

    expect(quote.freeDeliveryPct.value).toBe(48)
    expect(quote.freeDeliveryLeft.value).toBe(6200)
    expect(quote.zoneDeliveryCost.value).toBe(600)
    expect(quote.deliveryCost.value).toBe(600)
  })

  it('resolves legacy bonus settings and blocked products from strings', () => {
    const settings = ref({
      bonusSpendEnabled: 'true',
      bonusWithPromo: 'false',
      bonusMaxSpendPercent: '50',
      bonusMinSpend: '100',
      bonusSpendMinOrder: '2000',
      bonusBlockedProducts: '["blocked"]',
    })

    const quote = useCartQuote({
      items: ref([
        createLine({ slug: 'blocked', price: 6000, qty: 1 }),
        createLine({ slug: 'rose', price: 500, qty: 1, lineId: 'line-2', lineKey: 'rose-s' }),
      ]),
      promo: { applied: true, discount: 10, discountType: 'percent', maxDiscountAmount: 0, code: 'SAVE', freeShipping: false, blockBonuses: false },
      bonusEnabled: ref(true),
      bonusBalance: ref(700),
      settings,
      customerTotalSpent: ref(7500),
      loyaltyLevels: ref([]),
      volumeRulesBySlug: {
        rose: [{ minQty: 2, discountPct: 5 }],
      },
    })

    expect(quote.bonusMaxSpendPercent.value).toBe(50)
    expect(quote.canUseBonuses.value).toBe(false)
    expect(quote.bonusToUse.value).toBe(0)
    expect(quote.discount.value).toBe(650)
  })

  it('uses detected zone as fallback when explicit zone is not set', () => {
    const items = ref([createLine({ price: 2000, qty: 1 })])
    const quote = useCartQuote({
      items,
      detectedZone: ref({
        name: 'Север',
        cost: 450,
      }),
      settings: ref({
        delivery: { freeThreshold: 4000, cost: 390 },
      }),
    })

    expect(quote.zoneDeliveryCost.value).toBe(450)
    expect(quote.deliveryCost.value).toBe(450)
    expect(quote.freeDeliveryLeft.value).toBe(2000)
    expect(quote.total.value).toBe(2450)
  })

  it('supports legacy string payload in loyalty levels and resolves missing levels', () => {
    const quote = useCartQuote({
      items: ref([createLine({ price: 6000, qty: 1 })]),
      shopUser: ref({ totalSpent: 5500 }),
      bonusEnabled: ref(true),
      bonusBalance: ref(100),
      settings: ref({
        bonus: {
          spendEnabled: true,
          maxSpendPercent: 10,
          minSpend: 100,
          spendMinOrder: 0,
          withPromo: true,
          blockedProducts: [],
        },
      }),
      loyaltyLevels: ref([
        { min: 5000, cashback: 7, key: 'vip', name: 'VIP' },
      ]),
    })

    expect(quote.bonusEarned.value).toBe(413)
    expect(quote.bonusToUse.value).toBe(100)
  })

  it('reads lines when items are not provided', () => {
    const lines = ref([
      createLine({ lineId: 'line-10', lineKey: 'rose-x', slug: 'rose', price: 2100, qty: 2 }),
    ])

    const quote = useCartQuote({
      lines,
      settings: ref(null),
      bonusEnabled: false,
    })

    expect(quote.subtotal.value).toBe(4200)
    expect(quote.hasPromoFreeShipping.value).toBe(false)
    expect(quote.freeDeliveryLeft.value).toBe(800)
  })

  it('returns 0 for unknown line ids in getVolumeDiscountPct', () => {
    const line = createLine({ lineId: 'line-a', price: 5000, qty: 3 })
    const quote = useCartQuote({
      items: ref([line]),
      volumeRulesBySlug: {
        rose: [{ minQty: 2, discountPct: 10 }],
      },
      settings: ref(null),
    })

    expect(quote.getVolumeDiscountPct(line)).toBe(10)
    expect(quote.getVolumeDiscountPct(0)).toBe(10)
    expect(quote.getVolumeDiscountPct('line-unknown' as never)).toBe(0)
  })
})
