import { computed, toValue, watchEffect, type MaybeRefOrGetter } from 'vue'

import {
  buildHolidayFaqSchema,
  normalizeHolidayPageContent,
} from '~/lib/holiday/content'

interface HolidayPageSettings {
  faqItems?: string
}

export interface UseHolidayPageContentOptions {
  settings: MaybeRefOrGetter<HolidayPageSettings | null | undefined>
}

export interface UseHolidayPageContentDeps {
  jsonLd?: (schema: object | object[]) => void
  watchEffect?: typeof watchEffect
}

export function useHolidayPageContent(
  options: UseHolidayPageContentOptions,
  deps: UseHolidayPageContentDeps = {},
) {
  const settings = computed(() => toValue(options.settings) ?? {})

  const content = computed(() => normalizeHolidayPageContent(settings.value))
  const holidayCards = computed(() => content.value.holidayCards)
  const comboPacks = computed(() => content.value.comboPacks)
  const faqItems = computed(() => content.value.faqItems)
  const faqSchema = computed(() => buildHolidayFaqSchema(faqItems.value))

  if (deps.jsonLd) {
    const runWatchEffect = deps.watchEffect ?? watchEffect

    runWatchEffect(() => {
      if (!faqSchema.value) return
      deps.jsonLd?.(faqSchema.value)
    })
  }

  return {
    content,
    holidayCards,
    comboPacks,
    faqItems,
    faqSchema,
  }
}
