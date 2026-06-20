import { computed, toValue, watchEffect, type MaybeRefOrGetter } from 'vue'

import {
  buildCareFaqSchema,
  parseCareFaqItems,
  parseCareFlowerTypes,
  parseCareSteps,
} from '~/lib/care/content'

export interface UseCareTipsPageContentOptions {
  careTips: MaybeRefOrGetter<string | undefined>
  flowerTypes: MaybeRefOrGetter<string | undefined>
  faqItems: MaybeRefOrGetter<string | undefined>
}

export interface UseCareTipsPageContentDeps {
  jsonLd?: (schema: object | object[]) => void
  watchEffect?: typeof watchEffect
}

export function useCareTipsPageContent(
  options: UseCareTipsPageContentOptions,
  deps: UseCareTipsPageContentDeps = {},
) {
  const careTips = computed(() => toValue(options.careTips))
  const flowerTypes = computed(() => toValue(options.flowerTypes))
  const faqItems = computed(() => toValue(options.faqItems))

  const careSteps = computed(() => parseCareSteps(careTips.value))
  const careFlowerTypes = computed(() => parseCareFlowerTypes(flowerTypes.value))
  const careFaq = computed(() => parseCareFaqItems(faqItems.value))
  const careFaqSchema = computed(() => buildCareFaqSchema(careFaq.value))

  if (deps.jsonLd) {
    const runWatchEffect = deps.watchEffect ?? watchEffect

    runWatchEffect(() => {
      deps.jsonLd?.(careFaqSchema.value)
    })
  }

  return {
    careSteps,
    careFlowerTypes,
    careFaq,
    careFaqSchema,
  }
}
