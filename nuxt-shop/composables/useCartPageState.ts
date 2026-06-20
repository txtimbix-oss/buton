import { computed, ref, toValue, watchEffect, type MaybeRefOrGetter } from 'vue'

import type { ShopUser } from '~/composables/useShopUser'
import { useCartCheckoutFlow, type UseCartCheckoutFlowOptions } from '~/composables/useCartCheckoutFlow'
import { useCartDeliveryForm, type UseCartDeliveryFormOptions } from '~/composables/useCartDeliveryForm'
import { useCartQuote, type UseCartQuoteOptions } from '~/composables/useCartQuote'
import {
  buildCartProductImageMap,
  buildCartProductVolumeMap,
  getCartItemWord,
  resolveCartItemImage,
  type CartProductSnapshot,
} from '~/lib/cart/page'
import type { CartLine } from '~/lib/cart/types'

interface DeliveryZone {
  _id: string
  name: string
  keywords: string[]
  cost: number
}

interface LoyaltyLevel {
  key?: string
  name?: string
  icon?: string
  min: number
  cashback?: number
  cashbackPercent?: number
}

type CartSettingsLike = Record<string, unknown> | null | undefined

type CartShopUserLike = ShopUser | {
  _id?: string
  bonusBalance: number
  totalSpent?: number
}

export interface UseCartPageStateOptions {
  settings: MaybeRefOrGetter<CartSettingsLike>
  shopUser: MaybeRefOrGetter<CartShopUserLike | null | undefined>
  items: MaybeRefOrGetter<CartLine[]>
  subtotal: MaybeRefOrGetter<number>
  utm?: MaybeRefOrGetter<Record<string, unknown> | null | undefined>
  updateBalance?: (balance: number) => void
  productSnapshots: MaybeRefOrGetter<CartProductSnapshot[] | null | undefined>
  deliveryZones: MaybeRefOrGetter<DeliveryZone[] | null | undefined>
  loyaltyLevels: MaybeRefOrGetter<LoyaltyLevel[] | null | undefined>
  clearCart?: () => void
}

interface UseCartPageStateDeps {
  createDeliveryForm?: (options: UseCartDeliveryFormOptions) => ReturnType<typeof useCartDeliveryForm>
  createQuote?: (options: UseCartQuoteOptions) => ReturnType<typeof useCartQuote>
  createCheckoutFlow?: (options: UseCartCheckoutFlowOptions) => ReturnType<typeof useCartCheckoutFlow>
}

export function useCartPageState(
  options: UseCartPageStateOptions,
  deps: UseCartPageStateDeps = {},
) {
  const createDeliveryForm = deps.createDeliveryForm ?? useCartDeliveryForm
  const createQuote = deps.createQuote ?? useCartQuote
  const createCheckoutFlow = deps.createCheckoutFlow ?? useCartCheckoutFlow

  const items = computed(() => toValue(options.items))
  const productSnapshots = computed(() => toValue(options.productSnapshots) ?? [])
  const imgErrors = ref<Record<string, boolean>>({})

  const prodImageMap = computed(() => buildCartProductImageMap(productSnapshots.value))
  const prodVolumeMap = computed(() => buildCartProductVolumeMap(productSnapshots.value))
  const itemWord = computed(() => getCartItemWord(items.value.length))

  function cartItemImage(item: { slug: string; image?: string }) {
    return resolveCartItemImage(item, prodImageMap.value)
  }

  const deliveryForm = createDeliveryForm({
    deliveryZones: computed(() => toValue(options.deliveryZones) ?? []),
    settings: computed(() => toValue(options.settings)),
    shopUser: computed(() => toValue(options.shopUser) as ShopUser | null | undefined),
  })

  const checkoutFlowReady = ref(false)
  const quoteEffectiveSubtotal = ref(toValue(options.subtotal))
  const quoteCanUseBonuses = ref(false)
  const quoteBonusToUse = ref(0)

  const checkoutFlow = createCheckoutFlow({
    items,
    effectiveSubtotal: quoteEffectiveSubtotal,
    canUseBonuses: quoteCanUseBonuses,
    bonusToUse: quoteBonusToUse,
    shopUser: computed(() => toValue(options.shopUser) as { _id?: string; bonusBalance: number } | null | undefined),
    updateBalance: options.updateBalance,
    utm: computed(() => toValue(options.utm) ?? null),
    validateForm: deliveryForm.validateForm,
    clearCart: options.clearCart,
    delivery: computed(() => ({
      type: deliveryForm.activeDeliveryType.value,
      address: deliveryForm.form.address || undefined,
      date: deliveryForm.form.date,
      time: deliveryForm.form.time,
      zoneId: deliveryForm.detectedZone.value?._id,
    })),
    recipient: computed(() => ({
      name: deliveryForm.form.name,
      phone: deliveryForm.form.phone,
      email: deliveryForm.form.email,
      cardText: deliveryForm.form.card,
    })),
    isAnonymous: computed(() => deliveryForm.form.isAnonymous),
    enableWatchers: checkoutFlowReady,
  })

  const quote = createQuote({
    items,
    settings: computed(() => toValue(options.settings)),
    shopUser: computed(() => toValue(options.shopUser) as { bonusBalance?: number; totalSpent?: number } | null | undefined),
    deliveryMethod: deliveryForm.activeDeliveryType,
    detectedZone: deliveryForm.detectedZone,
    promo: checkoutFlow.promoState,
    promo2: checkoutFlow.promo2State,
    bonusEnabled: checkoutFlow.bonusEnabled,
    loyaltyLevels: computed(() => toValue(options.loyaltyLevels) ?? []),
    volumeRulesBySlug: prodVolumeMap,
  })

  const deliveryPreviewIsFree = computed(() => (
    quote.freeDeliveryLeft.value === 0 || quote.hasPromoFreeShipping.value
  ))

  const freeDeliveryProgressWidth = computed(
    () => `${Math.min(Math.max(quote.freeDeliveryPct.value, 0), 100)}%`,
  )

  watchEffect(() => {
    quoteEffectiveSubtotal.value = quote.effectiveSubtotal.value
    quoteCanUseBonuses.value = quote.canUseBonuses.value
    quoteBonusToUse.value = quote.bonusToUse.value
    checkoutFlowReady.value = true
  })

  return {
    imgErrors,
    itemWord,
    cartItemImage,
    deliveryPreviewIsFree,
    freeDeliveryProgressWidth,
    ...deliveryForm,
    ...checkoutFlow,
    ...quote,
  }
}
