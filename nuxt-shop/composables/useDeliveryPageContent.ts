import { computed, toValue, watchEffect, type MaybeRefOrGetter } from 'vue'

import {
  buildDeliveryFaqSchema,
  normalizeDeliveryPageContent,
} from '~/lib/delivery/content'

interface DeliveryPageSettings {
  deliveryOptions?: string
  deliveryZones?: string
  deliveryTiming?: string
  paymentMethods?: string
  faqItems?: string
}

export interface UseDeliveryPageContentOptions {
  settings: MaybeRefOrGetter<DeliveryPageSettings | null | undefined>
}

export interface UseDeliveryPageContentDeps {
  jsonLd?: (schema: object | object[]) => void
  watchEffect?: typeof watchEffect
}

export function useDeliveryPageContent(
  options: UseDeliveryPageContentOptions,
  deps: UseDeliveryPageContentDeps = {},
) {
  const settings = computed(() => toValue(options.settings) ?? {})

  const content = computed(() => normalizeDeliveryPageContent(settings.value))
  const deliveryOptions = computed(() => content.value.deliveryOptions)
  const deliveryZones = computed(() => content.value.deliveryZones)
  const deliveryTiming = computed(() => content.value.deliveryTiming)
  const paymentMethods = computed(() => content.value.paymentMethods)
  const faqItems = computed(() => content.value.faqItems)
  const faqSchema = computed(() => buildDeliveryFaqSchema(faqItems.value))

  if (deps.jsonLd) {
    const runWatchEffect = deps.watchEffect ?? watchEffect

    runWatchEffect(() => {
      if (!faqSchema.value) return
      deps.jsonLd?.(faqSchema.value)
    })
  }

  return {
    content,
    deliveryOptions,
    deliveryZones,
    deliveryTiming,
    paymentMethods,
    faqItems,
    faqSchema,
  }
}
