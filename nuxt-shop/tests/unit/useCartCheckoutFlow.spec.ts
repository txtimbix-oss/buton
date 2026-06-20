import { computed, nextTick, ref } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useCartCheckoutFlow } from '~/composables/useCartCheckoutFlow'
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

function flushPromises() {
  return Promise.resolve().then(() => Promise.resolve())
}

function setup(overrides: {
  items?: CartLine[]
  effectiveSubtotal?: number
  canUseBonuses?: boolean
  bonusToUse?: number
  validateForm?: () => boolean
  shopUser?: { _id?: string; bonusBalance: number } | null
  utm?: Record<string, unknown> | null
  updateBalance?: ReturnType<typeof vi.fn>
  clearCart?: ReturnType<typeof vi.fn>
} = {}) {
  const items = ref(overrides.items ?? [createLine()])
  const effectiveSubtotal = ref(overrides.effectiveSubtotal ?? 3200)
  const canUseBonuses = ref(overrides.canUseBonuses ?? true)
  const bonusToUse = ref(overrides.bonusToUse ?? 0)
  const shopUser = ref(overrides.shopUser ?? { _id: 'user-1', bonusBalance: 700 })
  const utm = ref(overrides.utm ?? null)
  const updateBalance = overrides.updateBalance ?? vi.fn()
  const clearCart = overrides.clearCart ?? vi.fn(() => {
    items.value.splice(0)
  })
  const validateForm = overrides.validateForm ?? vi.fn(() => true)

  const deliveryType = ref<'courier' | 'pickup' | 'scheduled'>('courier')
  const address = ref('Невский, 1')
  const date = ref('2026-06-09')
  const time = ref('10:00-12:00')
  const zoneId = ref('zone-1')
  const isAnonymous = ref(false)

  const flow = useCartCheckoutFlow({
    items,
    effectiveSubtotal,
    canUseBonuses,
    bonusToUse,
    shopUser,
    updateBalance,
    utm,
    validateForm,
    clearCart,
    delivery: computed(() => ({
      type: deliveryType.value,
      address: address.value,
      date: date.value,
      time: time.value,
      zoneId: zoneId.value,
    })),
    recipient: computed(() => ({
      name: 'Анна',
      phone: '+79990000000',
      email: 'anna@example.com',
      cardText: 'С любовью',
    })),
    isAnonymous,
  })

  return {
    flow,
    items,
    canUseBonuses,
    bonusToUse,
    shopUser,
    updateBalance,
    clearCart,
    validateForm,
    deliveryType,
    address,
    date,
    time,
    zoneId,
    isAnonymous,
    utm,
  }
}

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('useCartCheckoutFlow', () => {
  it('applies the first promo code on success', async () => {
    const fetchMock = vi.fn(async () => ({
      valid: true,
      discount: 15,
      discountType: 'percent',
      stackable: true,
      freeShipping: false,
      blockBonuses: true,
    }))
    vi.stubGlobal('$fetch', fetchMock)

    const { flow } = setup({ items: [] })
    flow.promo.value = 'save15'

    await flow.applyPromo()

    expect(fetchMock).toHaveBeenCalledWith('/api/promocodes/check?code=SAVE15&userId=user-1')
    expect(flow.promoApplied.value).toBe(true)
    expect(flow.promoError.value).toBe('')
    expect(flow.promoState.value).toMatchObject({
      code: 'SAVE15',
      applied: true,
      discount: 15,
      discountType: 'percent',
      stackable: true,
      blockBonuses: true,
    })
  })

  it('writes a validation error when promo apply fails', async () => {
    vi.stubGlobal('$fetch', vi.fn(async () => ({
      valid: false,
      discount: 0,
      discountType: 'percent',
      stackable: false,
    })))

    const { flow } = setup({ items: [] })
    flow.promo.value = 'bad'

    await flow.applyPromo()

    expect(flow.promoApplied.value).toBe(false)
    expect(flow.promoError.value).toBe('Промокод не найден или недействителен')
  })

  it('writes a network error when promo check throws', async () => {
    vi.stubGlobal('$fetch', vi.fn(async () => {
      throw new Error('network')
    }))

    const { flow } = setup({ items: [] })
    flow.promo.value = 'oops'

    await flow.applyPromo()

    expect(flow.promoApplied.value).toBe(false)
    expect(flow.promoError.value).toBe('Не удалось проверить промокод')
    expect(flow.promoChecking.value).toBe(false)
  })

  it('does nothing when applying an empty first promo code', async () => {
    const fetchMock = vi.fn(async () => ({
      valid: true,
      discount: 15,
      discountType: 'percent',
      stackable: false,
    }))
    vi.stubGlobal('$fetch', fetchMock)

    const { flow } = setup()
    await flushPromises()

    flow.promo.value = '   '

    await flow.applyPromo()

    expect(fetchMock.mock.calls.some(([url]) => String(url).startsWith('/api/promocodes/check'))).toBe(false)
    expect(flow.promoApplied.value).toBe(false)
    expect(flow.promoError.value).toBe('')
  })

  it('does nothing when applying an empty second promo code', async () => {
    const fetchMock = vi.fn(async () => ({
      valid: true,
      discount: 15,
      discountType: 'percent',
      stackable: true,
    }))
    vi.stubGlobal('$fetch', fetchMock)

    const { flow } = setup()
    await flushPromises()

    flow.promo2.value = '   '
    await flow.applyPromo2()

    expect(fetchMock.mock.calls.some(([url]) => String(url).startsWith('/api/promocodes/check'))).toBe(false)
    expect(fetchMock.mock.calls.some(([url]) => String(url).startsWith('/api/promocodes/check?code=SAVE'))).toBe(false)
    expect(flow.promo2Applied.value).toBe(false)
    expect(flow.promo2Error.value).toBe('')
  })

  it('normalizes first promo code before checking it', async () => {
    const fetchMock = vi.fn(async () => ({
      valid: true,
      discount: 10,
      discountType: 'percent',
      stackable: true,
    }))
    vi.stubGlobal('$fetch', fetchMock)

    const { flow } = setup({ items: [] })

    flow.promo.value = '  save15  '
    await flow.applyPromo()

    expect(flow.promoChecking.value).toBe(false)
    expect(fetchMock).toHaveBeenCalledWith('/api/promocodes/check?code=SAVE15&userId=user-1')
    expect(flow.promoApplied.value).toBe(true)
    expect(flow.promoState.value.code).toBe('SAVE15')
  })

  it('does not mutate applied first promo state when server returns malformed payload', async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      value: 15,
    }))
    vi.stubGlobal('$fetch', fetchMock)

    const { flow } = setup({ items: [] })
    flow.promo.value = 'SAVE15'
    flow.promoApplied.value = true
    flow.promoError.value = 'old'
    flow.discountPct.value = 20
    flow.promoStackable.value = true
    flow.promoBlockBonuses.value = true

    await flow.applyPromo()

    expect(flow.promoApplied.value).toBe(true)
    expect(flow.promoError.value).toBe('Промокод не найден или недействителен')
    expect(flow.discountPct.value).toBe(20)
    expect(flow.promoStackable.value).toBe(true)
    expect(flow.promoBlockBonuses.value).toBe(true)
    expect(flow.promoChecking.value).toBe(false)
  })

  it('normalizes second promo code before checking it', async () => {
    const fetchMock = vi.fn(async () => ({
      valid: true,
      discount: 60,
      discountType: 'percent',
      stackable: true,
    }))
    vi.stubGlobal('$fetch', fetchMock)

    const { flow } = setup()

    flow.promo2.value = '  stack50  '
    await flow.applyPromo2()

    expect(flow.promo2Checking.value).toBe(false)
    expect(fetchMock).toHaveBeenCalledWith('/api/promocodes/check?code=STACK50&userId=user-1')
    expect(flow.promo2Applied.value).toBe(true)
    expect(flow.promo2State.value.code).toBe('STACK50')
  })

  it('keeps second promo error message stable on network failure', async () => {
    vi.stubGlobal('$fetch', vi.fn(async () => {
      throw new Error('network')
    }))

    const { flow } = setup()
    flow.promo2.value = 'bad'

    await flow.applyPromo2()

    expect(flow.promo2Error.value).toBe('Не удалось проверить промокод')
    expect(flow.promo2Applied.value).toBe(false)
    expect(flow.promo2Checking.value).toBe(false)
  })

  it('clears both promo states together when the first promo is removed', () => {
    vi.stubGlobal('$fetch', vi.fn())
    const { flow } = setup({ items: [] })

    flow.promo.value = 'FIRST'
    flow.promoApplied.value = true
    flow.promoError.value = 'x'
    flow.discountPct.value = 10
    flow.promoStackable.value = true
    flow.promoBlockBonuses.value = true
    flow.promo2.value = 'SECOND'
    flow.promo2Applied.value = true
    flow.promo2Error.value = 'y'
    flow.discountPct2.value = 100

    flow.clearPromo()

    expect(flow.promo.value).toBe('')
    expect(flow.promoApplied.value).toBe(false)
    expect(flow.discountPct.value).toBe(0)
    expect(flow.promoStackable.value).toBe(false)
    expect(flow.promoBlockBonuses.value).toBe(false)
    expect(flow.promo2.value).toBe('')
    expect(flow.promo2Applied.value).toBe(false)
    expect(flow.discountPct2.value).toBe(0)
    expect(flow.promo2Error.value).toBe('')
  })

  it('skips auto-apply for an empty cart and applies returned promo data otherwise', async () => {
    const fetchMock = vi.fn(async () => ({
      code: 'AUTO10',
      discount: 10,
      discountType: 'percent',
      stackable: true,
      freeShipping: true,
      blockBonuses: false,
    }))
    vi.stubGlobal('$fetch', fetchMock)

    const empty = setup({ items: [] })
    await empty.flow.tryAutoApply()

    expect(fetchMock).not.toHaveBeenCalled()

    const filled = setup({ effectiveSubtotal: 5400 })
    await filled.flow.tryAutoApply()

    expect(fetchMock).toHaveBeenCalledWith('/api/promocodes/auto-apply?orderAmount=5400&userId=user-1')
    expect(filled.flow.promo.value).toBe('AUTO10')
    expect(filled.flow.promoApplied.value).toBe(true)
    expect(filled.flow.promoFreeShipping.value).toBe(true)
  })

  it('hides the cart trigger when the same promo is already applied', async () => {
    const fetchMock = vi.fn(async (url: string) => {
      if (url.startsWith('/api/promocodes/auto-apply')) {
        return null
      }

      return {
        type: 'reached' as const,
        trigger: {
          minAmount: 5000,
          message: 'Ваш промокод:',
          promoCode: 'MATCH10',
        },
      }
    })
    vi.stubGlobal('$fetch', fetchMock)

    const { flow } = setup({ effectiveSubtotal: 5100 })
    flow.promo.value = 'MATCH10'
    flow.promoApplied.value = true

    await flow.checkCartTrigger()

    expect(fetchMock).toHaveBeenCalledWith('/api/promocodes/cart-triggers?orderAmount=5100')
    expect(flow.cartTriggerResult.value).toBeNull()
  })

  it('keeps cart trigger result when trigger promo differs from current applied promo', async () => {
    const fetchMock = vi.fn(async () => ({
      type: 'approaching' as const,
      trigger: {
        minAmount: 5000,
        message: 'Ваш промокод:',
        promoCode: 'NEXT10',
      },
    }))
    vi.stubGlobal('$fetch', fetchMock)

    const { flow } = setup({ effectiveSubtotal: 5100 })
    flow.promo.value = 'OLD10'
    flow.promoApplied.value = true

    await flow.checkCartTrigger()

    expect(flow.cartTriggerResult.value).toMatchObject({
      type: 'approaching',
      trigger: {
        minAmount: 5000,
        message: 'Ваш промокод:',
        promoCode: 'NEXT10',
      },
    })
  })

  it('accepts a cart trigger promo and moves it into first promo state', async () => {
    vi.stubGlobal('$fetch', vi.fn(async () => ({
      type: 'approaching' as const,
      trigger: {
        minAmount: 7000,
        message: 'Ваш промокод:',
        promoCode: 'NEXT10',
      },
    })))

    const { flow } = setup({ effectiveSubtotal: 5200 })
    await flow.checkCartTrigger()

    expect(flow.cartTriggerResult.value?.trigger.promoCode).toBe('NEXT10')
    expect(flow.promo.value).toBe('')

    flow.acceptCartTriggerPromo()

    expect(flow.promo.value).toBe('NEXT10')
    expect(flow.promoApplied.value).toBe(false)
    expect(flow.cartTriggerResult.value).toBeNull()
  })

  it('does not query cart trigger when cart is empty', async () => {
    const fetchMock = vi.fn(async () => ({
      type: 'approaching' as const,
      trigger: {
        minAmount: 3000,
        message: 'Добрый',
        promoCode: 'EMPTY10',
      },
    }))
    vi.stubGlobal('$fetch', fetchMock)

    const empty = setup({ items: [], effectiveSubtotal: 0 })
    await empty.flow.checkCartTrigger()

    expect(fetchMock).not.toHaveBeenCalled()
    expect(empty.flow.cartTriggerResult.value).toBeNull()
  })

  it('does not mutate promo2 state when applying an invalid second promo', async () => {
    const fetchMock = vi.fn(async () => ({
      valid: false,
      discount: 0,
      discountType: 'percent',
      stackable: true,
    }))
    vi.stubGlobal('$fetch', fetchMock)

    const { flow } = setup()
    flow.promo2.value = 'bad'
    flow.promo2Applied.value = true
    flow.promo2Error.value = 'old'
    flow.discountPct2.value = 20
    flow.promo2Type.value = 'fixed'

    await flow.applyPromo2()

    expect(flow.promo2Applied.value).toBe(true)
    expect(flow.promo2Error.value).toBe('Промокод не найден или недействителен')
    expect(flow.discountPct2.value).toBe(20)
    expect(flow.promo2Type.value).toBe('fixed')
  })

  it('clears only the second promo state via clearPromo2', () => {
    vi.stubGlobal('$fetch', vi.fn(async () => null))
    const { flow } = setup({ items: [] })
    flow.promo.value = 'FIRST'
    flow.promoApplied.value = true
    flow.promoError.value = 'x'
    flow.discountPct.value = 12
    flow.promo2.value = 'SECOND'
    flow.promo2Applied.value = true
    flow.promo2Error.value = 'y'
    flow.discountPct2.value = 8
    flow.promo2Type.value = 'fixed'
    flow.promo2MaxDiscount.value = 100
    flow.promo2FreeShipping.value = true

    flow.clearPromo2()

    expect(flow.promo.value).toBe('FIRST')
    expect(flow.promoApplied.value).toBe(true)
    expect(flow.promoError.value).toBe('x')
    expect(flow.discountPct.value).toBe(12)
    expect(flow.promo2.value).toBe('')
    expect(flow.promo2Applied.value).toBe(false)
    expect(flow.promo2Error.value).toBe('')
    expect(flow.discountPct2.value).toBe(0)
    expect(flow.promo2Type.value).toBe('percent')
    expect(flow.promo2MaxDiscount.value).toBe(0)
    expect(flow.promo2FreeShipping.value).toBe(false)
  })

  it('applies second promo metadata on valid response', async () => {
    const fetchMock = vi.fn(async () => ({
      valid: true,
      discount: 50,
      discountType: 'fixed',
      stackable: true,
      maxDiscountAmount: 90,
      freeShipping: true,
    }))
    vi.stubGlobal('$fetch', fetchMock)

    const { flow } = setup({ items: [] })
    flow.promo2.value = 'stack50'

    await flow.applyPromo2()

    expect(fetchMock).toHaveBeenCalledWith('/api/promocodes/check?code=STACK50&userId=user-1')
    expect(flow.promo2Applied.value).toBe(true)
    expect(flow.promo2Error.value).toBe('')
    expect(flow.discountPct2.value).toBe(50)
    expect(flow.promo2Type.value).toBe('fixed')
    expect(flow.promo2MaxDiscount.value).toBe(90)
    expect(flow.promo2FreeShipping.value).toBe(true)
  })

  it('resets bonusEnabled when bonuses become unavailable', async () => {
    vi.stubGlobal('$fetch', vi.fn())
    const { flow, canUseBonuses } = setup()

    flow.bonusEnabled.value = true
    canUseBonuses.value = false
    await nextTick()

    expect(flow.bonusEnabled.value).toBe(false)
  })

  it('does not submit an order when validation fails', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('$fetch', fetchMock)

    const validateForm = vi.fn(() => false)
    const { flow } = setup({ validateForm, items: [], effectiveSubtotal: 0 })

    await flow.submitOrder()

    expect(validateForm).toHaveBeenCalledTimes(1)
    expect(fetchMock).not.toHaveBeenCalled()
    expect(flow.submitting.value).toBe(false)
  })

  it('stores order result, updates balance, and clears the cart after a successful submit', async () => {
    const fetchMock = vi.fn(async () => ({
      orderNumber: 'A-101',
      total: 5400,
      bonusEarned: 270,
    }))
    vi.stubGlobal('$fetch', fetchMock)

    const updateBalance = vi.fn()
    const clearCart = vi.fn()
    const { flow, items } = setup({
      bonusToUse: 250,
      effectiveSubtotal: 5400,
      shopUser: { _id: 'user-1', bonusBalance: 700 },
      utm: { source: 'telegram', campaign: 'spring' },
      updateBalance,
      clearCart,
    })

    flow.promo.value = 'SAVE10'
    flow.promoApplied.value = true
    flow.promo2.value = 'STACK50'
    flow.promo2Applied.value = true

    await flow.submitOrder()

    expect(fetchMock).toHaveBeenCalledWith('/api/orders', {
      method: 'POST',
      body: {
        items: items.value.map(item => ({
          slug: item.slug,
          name: item.name,
          bloom: item.bloom,
          sizeLabel: item.sizeLabel,
          meta: item.meta,
          price: item.price,
          qty: item.qty,
        })),
        delivery: {
          type: 'courier',
          address: 'Невский, 1',
          date: '2026-06-09',
          time: '10:00-12:00',
          zoneId: 'zone-1',
        },
        recipient: {
          name: 'Анна',
          phone: '+79990000000',
          email: 'anna@example.com',
          cardText: 'С любовью',
        },
        isAnonymous: undefined,
        promoCode: 'SAVE10',
        promoCode2: 'STACK50',
        bonusPointsUsed: 250,
        utm: {
          source: 'telegram',
          campaign: 'spring',
        },
      },
      credentials: 'include',
    })
    expect(flow.orderResult.value).toEqual({
      orderNumber: 'A-101',
      total: 5400,
      bonusEarned: 270,
    })
    expect(updateBalance).toHaveBeenCalledWith(450)
    expect(clearCart).toHaveBeenCalledTimes(1)
    expect(flow.submitError.value).toBe('')
    expect(flow.submitting.value).toBe(false)
  })

  it('does not send second promo when it is not applied and sends anonymous flag only when true', async () => {
    const fetchMock = vi.fn(async () => ({
      orderNumber: 'A-303',
      total: 2600,
    }))
    vi.stubGlobal('$fetch', fetchMock)

    const { flow, isAnonymous } = setup({ bonusToUse: 0 })
    flow.promo.value = 'save10'
    flow.promoApplied.value = true
    isAnonymous.value = true
    flow.promo2.value = 'unused'
    flow.promo2Applied.value = false

    await flow.submitOrder()

    const postCall = fetchMock.mock.calls.find((call): call is [string, any] =>
      typeof call[1] === 'object' && call[1] && 'body' in call[1],
    )
    const body = postCall?.[1]?.body
    expect(body).toMatchObject({
      isAnonymous: true,
      promoCode: 'SAVE10',
    })
    expect(body.promoCode2).toBeUndefined()
  })

  it('writes submitError when order submit fails', async () => {
    vi.stubGlobal('$fetch', vi.fn(async () => {
      throw new Error('backend unavailable')
    }))

    const { flow } = setup()

    await flow.submitOrder()

    expect(flow.orderResult.value).toBeNull()
    expect(flow.submitError.value).toBe('backend unavailable')
    expect(flow.submitting.value).toBe(false)
  })

  it('auto-applies a promo from the immediate cart watcher', async () => {
    vi.stubGlobal('$fetch', vi.fn(async () => ({
      code: 'AUTO15',
      discount: 15,
      discountType: 'percent',
      stackable: false,
    })))

    const { flow } = setup({ effectiveSubtotal: 4800 })
    await flushPromises()

    expect(flow.promo.value).toBe('AUTO15')
    expect(flow.promoApplied.value).toBe(true)
  })

  it('does not auto-apply when first promo already applied', async () => {
    const fetchMock = vi.fn(async () => ({
      code: 'AUTO15',
      discount: 15,
      discountType: 'percent',
      stackable: false,
    }))
    vi.stubGlobal('$fetch', fetchMock)

    const { flow } = setup({ effectiveSubtotal: 4800 })
    await flushPromises()
    flow.promo.value = 'KEEP15'
    flow.promoApplied.value = true
    fetchMock.mockClear()

    await flow.tryAutoApply()

    expect(fetchMock).not.toHaveBeenCalled()
    expect(flow.promo.value).toBe('KEEP15')
  })

  it('ignores auto-apply transport failures and keeps promo untouched', async () => {
    vi.stubGlobal('$fetch', vi.fn(async () => {
      throw new Error('transport down')
    }))

    const { flow } = setup({ effectiveSubtotal: 3900 })

    await flow.tryAutoApply()

    expect(flow.promo.value).toBe('')
    expect(flow.promoApplied.value).toBe(false)
  })

  it('ignores malformed auto-apply payload without changing promo state', async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      value: 15,
    }))
    vi.stubGlobal('$fetch', fetchMock)

    const { flow } = setup({ effectiveSubtotal: 3400 })

    await flow.tryAutoApply()

    expect(fetchMock).toHaveBeenCalledWith('/api/promocodes/auto-apply?orderAmount=3400&userId=user-1')
    expect(flow.promo.value).toBe('')
    expect(flow.promoApplied.value).toBe(false)
  })

  it('sends only first promo when only first promo is applied', async () => {
    const fetchMock = vi.fn(async () => ({
      orderNumber: 'A-500',
      total: 2800,
    }))
    vi.stubGlobal('$fetch', fetchMock)

    const { flow } = setup({ bonusToUse: 0 })
    flow.promo.value = 'save10'
    flow.promoApplied.value = true
    flow.promo2.value = 'stack50'
    flow.promo2Applied.value = false

    await flow.submitOrder()

    const postCall = fetchMock.mock.calls.find((call): call is [string, { body: Record<string, unknown> }] =>
      call[0] === '/api/orders' && typeof call[1] === 'object' && call[1] !== null && 'body' in call[1],
    )
    const payload = postCall?.[1]?.body
    expect(payload).toMatchObject({
      promoCode: 'SAVE10',
    })
    expect(payload.promoCode2).toBeUndefined()
    expect(payload.bonusPointsUsed).toBeUndefined()
  })

  it('sends only second promo when first promo is not applied', async () => {
    const fetchMock = vi.fn(async () => ({
      orderNumber: 'A-501',
      total: 3000,
    }))
    vi.stubGlobal('$fetch', fetchMock)

    const { flow } = setup({ bonusToUse: 0 })
    flow.promo.value = 'save10'
    flow.promoApplied.value = false
    flow.promo2.value = 'stack50'
    flow.promo2Applied.value = true

    await flow.submitOrder()

    const postCall = fetchMock.mock.calls.find((call): call is [string, { body: Record<string, unknown> }] =>
      call[0] === '/api/orders' && typeof call[1] === 'object' && call[1] !== null && 'body' in call[1],
    )
    const payload = postCall?.[1]?.body
    expect(payload).toMatchObject({
      promoCode2: 'STACK50',
    })
    expect(payload.promoCode).toBeUndefined()
  })

  it('sends no promo codes when no promo is applied', async () => {
    const fetchMock = vi.fn(async () => ({
      orderNumber: 'A-502',
      total: 3200,
    }))
    vi.stubGlobal('$fetch', fetchMock)

    const { flow } = setup({ bonusToUse: 0 })
    flow.promo.value = 'save10'
    flow.promoApplied.value = false
    flow.promo2.value = 'stack50'
    flow.promo2Applied.value = false

    await flow.submitOrder()

    const postCall = fetchMock.mock.calls.find((call): call is [string, { body: Record<string, unknown> }] =>
      call[0] === '/api/orders' && typeof call[1] === 'object' && call[1] !== null && 'body' in call[1],
    )
    const payload = postCall?.[1]?.body ?? {}
    expect(payload.promoCode).toBeUndefined()
    expect(payload.promoCode2).toBeUndefined()
  })

  it('does not apply second promo when service returns invalid payload', async () => {
    const fetchMock = vi.fn(async () => ({ status: 'ok' }))
    vi.stubGlobal('$fetch', fetchMock)

    const { flow } = setup()
    flow.promo2.value = 'BAD'

    await flow.applyPromo2()

    expect(flow.promo2Applied.value).toBe(false)
    expect(flow.promo2Error.value).toBe('Промокод не найден или недействителен')
  })

  it('clears cart trigger when payload does not match expected shape', async () => {
    const fetchMock = vi.fn(async () => 7)
    vi.stubGlobal('$fetch', fetchMock)

    const { flow } = setup({ effectiveSubtotal: 9000 })

    await flow.checkCartTrigger()

    expect(flow.cartTriggerResult.value).toBeNull()
  })

  it('sends no bonusPointsUsed when bonus is not used and keeps only applied promo codes in payload', async () => {
    const fetchMock = vi.fn(async () => ({
      orderNumber: 'A-202',
      total: 3200,
    }))
    vi.stubGlobal('$fetch', fetchMock)

    const { flow, items } = setup({ bonusToUse: 0 })

    flow.promo.value = 'save10'
    flow.promoApplied.value = true
    flow.promo2.value = 'stack50'
    flow.promo2Applied.value = true

    await flow.submitOrder()

    expect(fetchMock).toHaveBeenCalledWith('/api/orders', expect.objectContaining({
      body: expect.objectContaining({
        promoCode: 'SAVE10',
        promoCode2: 'STACK50',
      }),
    }))
    const payload = fetchMock.mock.calls[0]?.[1]?.body ?? {}
    expect(Object.hasOwn(payload, 'bonusPointsUsed')).toBe(false)
    expect(Object.hasOwn(payload, 'utm')).toBe(false)
    expect(items.value.length).toBe(0)
  })
})
