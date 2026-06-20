import { computed, ref, toValue, watch, type MaybeRefOrGetter } from 'vue'

import type { CartLine } from '~/lib/cart/types'
import { normalizeApiError } from '~/lib/api/errors'
import type { CheckoutDeliveryMethod, CheckoutPromoState } from '~/lib/checkout/types'

type PromoCheckResult = {
  valid: boolean
  discount: number
  discountType: string
  stackable: boolean
  maxDiscountAmount?: number
  freeShipping?: boolean
  blockBonuses?: boolean
}

type AutoPromoResult = {
  code: string
  discount: number
  discountType: string
  stackable: boolean
  maxDiscountAmount?: number
  freeShipping?: boolean
  blockBonuses?: boolean
}

interface CartTriggerResult {
  type: 'reached' | 'approaching'
  remaining?: number
  trigger: {
    minAmount: number
    message: string
    promoCode: string
  }
}

interface DeliveryPayload {
  type: CheckoutDeliveryMethod
  address?: string
  date: string
  time?: string
  zoneId?: string
}

interface RecipientPayload {
  name: string
  phone: string
  email?: string
  cardText?: string
}

interface ShopUserLike {
  _id?: string
  bonusBalance: number
}

interface OrderResult {
  orderNumber: string
  total: number
  bonusEarned?: number
}

type Fetcher = <T>(url: string, options?: Record<string, unknown>) => Promise<T>

export interface UseCartCheckoutFlowOptions {
  items: MaybeRefOrGetter<CartLine[]>
  effectiveSubtotal: MaybeRefOrGetter<number>
  canUseBonuses: MaybeRefOrGetter<boolean>
  bonusToUse: MaybeRefOrGetter<number>
  shopUser: MaybeRefOrGetter<ShopUserLike | null | undefined>
  utm?: MaybeRefOrGetter<Record<string, unknown> | null | undefined>
  validateForm: () => boolean
  delivery: MaybeRefOrGetter<DeliveryPayload>
  recipient: MaybeRefOrGetter<RecipientPayload>
  isAnonymous?: MaybeRefOrGetter<boolean | undefined>
  updateBalance?: (balance: number) => void
  clearCart?: () => void
  fetch?: Fetcher
  enableWatchers?: MaybeRefOrGetter<boolean | undefined>
}

function createEmptyPromoState(): CheckoutPromoState {
  return {
    code: '',
    applied: false,
    discount: 0,
    discountType: 'percent',
    maxDiscountAmount: 0,
    freeShipping: false,
    stackable: false,
    blockBonuses: false,
  }
}

function isAutoPromoResult(value: unknown): value is AutoPromoResult {
  return typeof value === 'object'
    && value !== null
    && typeof (value as AutoPromoResult).code === 'string'
}

function isCartTriggerResult(value: unknown): value is CartTriggerResult {
  return typeof value === 'object'
    && value !== null
    && typeof (value as CartTriggerResult).type === 'string'
    && typeof (value as CartTriggerResult).trigger?.promoCode === 'string'
}

export function useCartCheckoutFlow(options: UseCartCheckoutFlowOptions) {
  const fetchFn = options.fetch ?? ($fetch as Fetcher)
  const watchersEnabled = computed(() => toValue(options.enableWatchers) ?? true)

  const promo = ref('')
  const promoApplied = ref(false)
  const promoError = ref('')
  const promoChecking = ref(false)
  const discountPct = ref(0)
  const promoDiscountType = ref<CheckoutPromoState['discountType']>('percent')
  const promoMaxDiscount = ref(0)
  const promoFreeShipping = ref(false)
  const promoStackable = ref(false)
  const promoBlockBonuses = ref(false)

  const promo2 = ref('')
  const promo2Applied = ref(false)
  const promo2Error = ref('')
  const promo2Checking = ref(false)
  const discountPct2 = ref(0)
  const promo2Type = ref<CheckoutPromoState['discountType']>('percent')
  const promo2MaxDiscount = ref(0)
  const promo2FreeShipping = ref(false)

  const promoState = computed<CheckoutPromoState>(() => ({
    code: promo.value.trim().toUpperCase(),
    applied: promoApplied.value,
    discount: discountPct.value,
    discountType: promoDiscountType.value,
    maxDiscountAmount: promoMaxDiscount.value,
    freeShipping: promoFreeShipping.value,
    stackable: promoStackable.value,
    blockBonuses: promoBlockBonuses.value,
  }))

  const promo2State = computed<CheckoutPromoState>(() => ({
    code: promo2.value.trim().toUpperCase(),
    applied: promo2Applied.value,
    discount: discountPct2.value,
    discountType: promo2Type.value,
    maxDiscountAmount: promo2MaxDiscount.value,
    freeShipping: promo2FreeShipping.value,
    stackable: false,
    blockBonuses: false,
  }))

  function promoUrl(code: string) {
    const userId = toValue(options.shopUser)?._id
    return `/api/promocodes/check?code=${encodeURIComponent(code)}${userId ? `&userId=${userId}` : ''}`
  }

  function applyPromoResult(result: PromoCheckResult) {
    discountPct.value = result.discount
    promoDiscountType.value = result.discountType as CheckoutPromoState['discountType']
    promoMaxDiscount.value = result.maxDiscountAmount ?? 0
    promoFreeShipping.value = !!result.freeShipping
    promoStackable.value = result.stackable
    promoBlockBonuses.value = !!result.blockBonuses
    promoApplied.value = true
  }

  function applyPromo2Result(result: PromoCheckResult) {
    discountPct2.value = result.discount
    promo2Type.value = result.discountType as CheckoutPromoState['discountType']
    promo2MaxDiscount.value = result.maxDiscountAmount ?? 0
    promo2FreeShipping.value = !!result.freeShipping
    promo2Applied.value = true
  }

  async function applyPromo() {
    const code = promo.value.trim().toUpperCase()
    if (!code) return

    promoError.value = ''
    promoChecking.value = true

    try {
      const result = await fetchFn<PromoCheckResult>(promoUrl(code))
      if (result.valid) {
        applyPromoResult(result)
      } else {
        promoError.value = 'Промокод не найден или недействителен'
      }
    } catch (error) {
      promoError.value = normalizeApiError(error, 'Не удалось проверить промокод')
    } finally {
      promoChecking.value = false
    }
  }

  async function applyPromo2() {
    const code = promo2.value.trim().toUpperCase()
    if (!code) return

    promo2Error.value = ''
    promo2Checking.value = true

    try {
      const result = await fetchFn<PromoCheckResult>(promoUrl(code))
      if (result.valid) {
        applyPromo2Result(result)
      } else {
        promo2Error.value = 'Промокод не найден или недействителен'
      }
    } catch (error) {
      promo2Error.value = normalizeApiError(error, 'Не удалось проверить промокод')
    } finally {
      promo2Checking.value = false
    }
  }

  function clearPromo2() {
    promo2Applied.value = false
    promo2Error.value = ''
    discountPct2.value = 0
    promo2Type.value = 'percent'
    promo2MaxDiscount.value = 0
    promo2FreeShipping.value = false
    promo2.value = ''
  }

  function clearPromo() {
    promoApplied.value = false
    promoError.value = ''
    discountPct.value = 0
    promoDiscountType.value = 'percent'
    promoMaxDiscount.value = 0
    promoFreeShipping.value = false
    promoStackable.value = false
    promoBlockBonuses.value = false
    promo.value = ''
    clearPromo2()
  }

  async function tryAutoApply() {
    const items = toValue(options.items)
    if (promoApplied.value || !items.length) return

    try {
      const userId = toValue(options.shopUser)?._id
      const subtotal = toValue(options.effectiveSubtotal)
      const result = await fetchFn<AutoPromoResult | null>(
        `/api/promocodes/auto-apply?orderAmount=${subtotal}${userId ? `&userId=${userId}` : ''}`,
      )

      if (!isAutoPromoResult(result)) return

      promo.value = result.code
      discountPct.value = result.discount
      promoDiscountType.value = result.discountType as CheckoutPromoState['discountType']
      promoMaxDiscount.value = result.maxDiscountAmount ?? 0
      promoFreeShipping.value = !!result.freeShipping
      promoStackable.value = result.stackable
      promoBlockBonuses.value = !!result.blockBonuses
      promoApplied.value = true
    } catch {
      // Autopromo is a best-effort enhancement and should not block checkout.
    }
  }

  const cartTriggerResult = ref<CartTriggerResult | null>(null)

  async function checkCartTrigger() {
    const items = toValue(options.items)
    const subtotal = toValue(options.effectiveSubtotal)

    if (!items.length || subtotal <= 0) {
      cartTriggerResult.value = null
      return
    }

    try {
      const result = await fetchFn<CartTriggerResult | null>(
        `/api/promocodes/cart-triggers?orderAmount=${subtotal}`,
      )

      if (!isCartTriggerResult(result)) {
        cartTriggerResult.value = null
        return
      }

      if (promoApplied.value && promo.value.trim().toUpperCase() === result.trigger.promoCode) {
        cartTriggerResult.value = null
      } else {
        cartTriggerResult.value = result
      }
    } catch {
      cartTriggerResult.value = null
    }
  }

  function acceptCartTriggerPromo() {
    if (!cartTriggerResult.value) return
    promo.value = cartTriggerResult.value.trigger.promoCode
    cartTriggerResult.value = null
  }

  const bonusEnabled = ref(false)

  watch(
    () => toValue(options.items),
    () => {
      if (!watchersEnabled.value) return
      if (!promoApplied.value) {
        void tryAutoApply()
      }
    },
    { immediate: true, deep: false },
  )

  watch(
    () => toValue(options.effectiveSubtotal),
    () => {
      if (!watchersEnabled.value) return
      void checkCartTrigger()
    },
    { immediate: true },
  )

  watch(
    watchersEnabled,
    (enabled, wasEnabled) => {
      if (!enabled || wasEnabled) return
      if (!promoApplied.value) {
        void tryAutoApply()
      }
      void checkCartTrigger()
    },
    { immediate: true },
  )

  watch(
    () => toValue(options.canUseBonuses),
    (canUseBonuses) => {
      if (!canUseBonuses) {
        bonusEnabled.value = false
      }
    },
  )

  const submitting = ref(false)
  const submitError = ref('')
  const orderResult = ref<OrderResult | null>(null)

  function buildOrderItems(items: CartLine[]) {
    return items.map(item => ({
      slug: item.slug,
      name: item.name,
      bloom: item.bloom,
      sizeLabel: item.sizeLabel,
      meta: item.meta,
      price: item.price,
      qty: item.qty,
    }))
  }

  async function submitOrder() {
    if (!options.validateForm()) return

    submitting.value = true
    submitError.value = ''

    try {
      const items = toValue(options.items)
      const delivery = toValue(options.delivery)
      const recipient = toValue(options.recipient)
      const bonusToUse = toValue(options.bonusToUse)
      const user = toValue(options.shopUser)
      const utm = toValue(options.utm)

      const result = await fetchFn<OrderResult>('/api/orders', {
        method: 'POST',
        body: {
          items: buildOrderItems(items),
          delivery: {
            type: delivery.type,
            address: delivery.address || undefined,
            date: delivery.date,
            time: delivery.time,
            zoneId: delivery.zoneId,
          },
          recipient,
          isAnonymous: toValue(options.isAnonymous) || undefined,
          promoCode: promoApplied.value ? promo.value.trim().toUpperCase() : undefined,
          promoCode2: promo2Applied.value ? promo2.value.trim().toUpperCase() : undefined,
          bonusPointsUsed: bonusToUse > 0 ? bonusToUse : undefined,
          ...(utm?.source ? { utm } : {}),
        },
        credentials: 'include',
      })

      orderResult.value = result

      if (bonusToUse > 0 && user) {
        options.updateBalance?.(Math.max(0, user.bonusBalance - bonusToUse))
      }

      if (options.clearCart) {
        options.clearCart()
      } else {
        items.splice(0)
      }
    } catch (error) {
      submitError.value = normalizeApiError(error, 'Не удалось отправить заказ. Попробуйте ещё раз.')
    } finally {
      submitting.value = false
    }
  }

  return {
    bonusEnabled,
    promo,
    promoApplied,
    promoError,
    promoChecking,
    discountPct,
    promoDiscountType,
    promoMaxDiscount,
    promoFreeShipping,
    promoStackable,
    promoBlockBonuses,
    promo2,
    promo2Applied,
    promo2Error,
    promo2Checking,
    discountPct2,
    promo2Type,
    promo2MaxDiscount,
    promo2FreeShipping,
    promoState,
    promo2State,
    applyPromo,
    applyPromo2,
    clearPromo,
    clearPromo2,
    tryAutoApply,
    cartTriggerResult,
    checkCartTrigger,
    acceptCartTriggerPromo,
    submitting,
    submitError,
    orderResult,
    submitOrder,
    createEmptyPromoState,
  }
}
