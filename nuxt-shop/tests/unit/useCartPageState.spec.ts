import { computed, effectScope, nextTick, reactive, ref, toValue } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useCartPageState } from '~/composables/useCartPageState'
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

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useCartPageState', () => {
  it('derives item wording and resolves cart item images through snapshot maps', () => {
    const items = ref([
      createLine({ slug: 'rose' }),
      createLine({ lineId: 'line-2', lineKey: 'tulip-s', slug: 'tulip', image: '/custom/tulip.jpg' }),
    ])

    const scope = effectScope()
    const state = scope.run(() => useCartPageState({
      settings: ref({ deliveryCost: '390' }),
      shopUser: ref({ _id: 'user-1', bonusBalance: 500, totalSpent: 10000 }),
      items,
      subtotal: ref(6400),
      productSnapshots: ref([
        { slug: 'rose', images: ['/img/rose.jpg'], volumeRules: [{ minQty: 3, discountPct: 10 }] },
        { slug: 'tulip', images: ['/img/tulip.jpg'] },
      ]),
      deliveryZones: ref([]),
      loyaltyLevels: ref([]),
    }, {
      createDeliveryForm: () => createDeliveryFormStub(),
      createQuote: (options) => {
        expect(toValue(options.volumeRulesBySlug)).toEqual({
          rose: [{ minQty: 3, discountPct: 10 }],
        })
        return createQuoteStub()
      },
      createCheckoutFlow: () => createCheckoutFlowStub(),
    }))!

    expect(state.itemWord.value).toBe('букета')
    expect(state.cartItemImage(items.value[0]!)).toBe('/img/rose.jpg')
    expect(state.cartItemImage(items.value[1]!)).toBe('/custom/tulip.jpg')

    scope.stop()
  })

  it('bridges quote state into checkout flow and derives free-delivery preview', async () => {
    const items = ref([createLine()])
    const quoteStub = createQuoteStub()
    const captured: { checkout?: Record<string, unknown> } = {}

    const scope = effectScope()
    const state = scope.run(() => useCartPageState({
      settings: ref({ deliveryCost: '390' }),
      shopUser: ref({ _id: 'user-1', bonusBalance: 500, totalSpent: 10000 }),
      items,
      subtotal: ref(3200),
      productSnapshots: ref([]),
      deliveryZones: ref([]),
      loyaltyLevels: ref([]),
    }, {
      createDeliveryForm: () => createDeliveryFormStub(),
      createQuote: () => quoteStub,
      createCheckoutFlow: (options) => {
        captured.checkout = options as unknown as Record<string, unknown>
        return createCheckoutFlowStub()
      },
    }))!

    expect(toValue(captured.checkout?.effectiveSubtotal)).toBe(6100)
    expect(toValue(captured.checkout?.canUseBonuses)).toBe(true)
    expect(toValue(captured.checkout?.bonusToUse)).toBe(250)
    expect(toValue(captured.checkout?.enableWatchers)).toBe(true)
    expect(state.deliveryPreviewIsFree.value).toBe(true)

    quoteStub.effectiveSubtotal.value = 5400
    quoteStub.canUseBonuses.value = false
    quoteStub.bonusToUse.value = 0
    quoteStub.freeDeliveryLeft.value = 400
    quoteStub.hasPromoFreeShipping.value = false
    await nextTick()

    expect(toValue(captured.checkout?.effectiveSubtotal)).toBe(5400)
    expect(toValue(captured.checkout?.canUseBonuses)).toBe(false)
    expect(toValue(captured.checkout?.bonusToUse)).toBe(0)
    expect(state.deliveryPreviewIsFree.value).toBe(false)

    quoteStub.hasPromoFreeShipping.value = true
    await nextTick()

    expect(state.deliveryPreviewIsFree.value).toBe(true)

    scope.stop()
  })

  it('clamps free-delivery progress width between 0% and 100%', async () => {
    const items = ref([createLine()])
    const quoteStub = createQuoteStub()

    const scope = effectScope()
    const state = scope.run(() => useCartPageState({
      settings: ref({ deliveryCost: '390' }),
      shopUser: ref({ _id: 'user-1', bonusBalance: 500, totalSpent: 10000 }),
      items,
      subtotal: ref(3200),
      productSnapshots: ref([]),
      deliveryZones: ref([]),
      loyaltyLevels: ref([]),
    }, {
      createDeliveryForm: () => createDeliveryFormStub(),
      createQuote: () => quoteStub,
      createCheckoutFlow: () => createCheckoutFlowStub(),
    }))!

    quoteStub.freeDeliveryPct.value = -25
    await nextTick()
    expect(state.freeDeliveryProgressWidth.value).toBe('0%')

    quoteStub.freeDeliveryPct.value = 42
    await nextTick()
    expect(state.freeDeliveryProgressWidth.value).toBe('42%')

    quoteStub.freeDeliveryPct.value = 180
    await nextTick()
    expect(state.freeDeliveryProgressWidth.value).toBe('100%')

    scope.stop()
  })
})

function createDeliveryFormStub() {
  return {
    DEFAULT_DELIVERY_COST: computed(() => 390),
    form: reactive({
      name: 'Анна',
      phone: '+79990000000',
      email: 'anna@example.com',
      address: 'Невский, 1',
      date: '2026-06-10',
      time: '10:00 - 12:00',
      card: 'С любовью',
      isAnonymous: false,
    }),
    formErrors: reactive({
      name: '',
      phone: '',
      address: '',
      date: '',
    }),
    hasProfileAddress: computed(() => false),
    timeSlots: computed(() => ['10:00 - 12:00']),
    deliveries: computed(() => [
      { label: 'Курьером', desc: 'за 2 часа', type: 'courier' as const },
      { label: 'Ко времени', desc: 'в удобный интервал', type: 'scheduled' as const },
      { label: 'Самовывоз', desc: 'бесплатно', type: 'pickup' as const },
    ]),
    activeDelivery: ref(0),
    activeDeliveryType: computed(() => 'courier' as const),
    detectedZone: ref(null),
    validateForm: vi.fn(() => true),
    todayStr: computed(() => '2026-06-08'),
    dpOpen: ref(false),
    dpFieldRef: ref<HTMLElement | null>(null),
    dpMonthLabel: computed(() => 'Июнь 2026'),
    dpCells: computed(() => []),
    dpPrevMonth: vi.fn(),
    dpNextMonth: vi.fn(),
    selectDate: vi.fn(),
    fmtDateRu: vi.fn((value: string) => value),
  }
}

function createQuoteStub() {
  return {
    bonusMaxSpendPercent: ref(30),
    canUseBonuses: ref(true),
    bonusToUse: ref(250),
    total: ref(6200),
    totalWithBonus: ref(5950),
    bonusEarned: ref(180),
    discount: ref(300),
    deliveryCost: ref(390),
    zoneDeliveryCost: ref(390),
    effectiveSubtotal: ref(6100),
    freeDeliveryLeft: ref(0),
    freeDeliveryPct: ref(100),
    volumeDiscount: ref(150),
    volumeDiscountItems: ref([150]),
    getVolumeDiscountPct: vi.fn(() => 10),
    hasPromoFreeShipping: ref(false),
  }
}

function createCheckoutFlowStub() {
  return {
    bonusEnabled: ref(false),
    promo: ref(''),
    promoApplied: ref(false),
    promoError: ref(''),
    promoChecking: ref(false),
    discountPct: ref(0),
    promoDiscountType: ref('percent'),
    promoMaxDiscount: ref(0),
    promoStackable: ref(false),
    promo2: ref(''),
    promo2Applied: ref(false),
    promo2Error: ref(''),
    promo2Checking: ref(false),
    discountPct2: ref(0),
    promo2Type: ref('percent'),
    promoState: computed(() => ({ code: '', applied: false, discount: 0, discountType: 'percent' })),
    promo2State: computed(() => ({ code: '', applied: false, discount: 0, discountType: 'percent' })),
    applyPromo: vi.fn(),
    applyPromo2: vi.fn(),
    clearPromo: vi.fn(),
    clearPromo2: vi.fn(),
    cartTriggerResult: ref(null),
    acceptCartTriggerPromo: vi.fn(),
    submitting: ref(false),
    submitError: ref(''),
    orderResult: ref(null),
    submitOrder: vi.fn(),
  }
}
