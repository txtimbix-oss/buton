import { effectScope, nextTick, ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'

import { useHolidayPageContent } from '~/composables/useHolidayPageContent'
import {
  buildHolidayFaqSchema,
  comboPacks,
  holidayCards,
  normalizeHolidayPageContent,
} from '~/lib/holiday/content'

describe('useHolidayPageContent', () => {
  it('derives page-ready holiday content from reactive settings', () => {
    const settings = ref({
      faqItems: JSON.stringify([
        { q: 'Можно добавить открытку?', a: 'Да, при оформлении заказа.' },
      ]),
    })

    const page = useHolidayPageContent({ settings })
    const expected = normalizeHolidayPageContent(settings.value)

    expect(page.holidayCards.value).toEqual(holidayCards)
    expect(page.comboPacks.value).toEqual(comboPacks)
    expect(page.faqItems.value).toEqual(expected.faqItems)
    expect(page.faqSchema.value).toEqual(buildHolidayFaqSchema(expected.faqItems))
  })

  it('publishes faq schema through injected jsonLd only when faq exists', async () => {
    const jsonLd = vi.fn()
    const settings = ref({ faqItems: '[]' })

    const scope = effectScope()
    let page: ReturnType<typeof useHolidayPageContent> | undefined

    scope.run(() => {
      page = useHolidayPageContent({ settings }, { jsonLd })
    })

    await nextTick()

    expect(page?.faqSchema.value).toBeNull()
    expect(jsonLd).not.toHaveBeenCalled()

    settings.value = {
      faqItems: JSON.stringify([
        { q: 'Есть ли фото перед отправкой?', a: 'Да, пришлем перед доставкой.' },
      ]),
    }

    await nextTick()

    expect(jsonLd).toHaveBeenCalledTimes(1)
    expect(jsonLd).toHaveBeenLastCalledWith(page?.faqSchema.value)
    expect(page?.faqSchema.value).toEqual({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Есть ли фото перед отправкой?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Да, пришлем перед доставкой.',
          },
        },
      ],
    })

    scope.stop()
  })

  it('returns default cards and empty faq for invalid JSON input', () => {
    const settings = ref({
      faqItems: '[{ "q": "Неверный", "a": "JSON" ',
    })
    const page = useHolidayPageContent({ settings })

    expect(page.faqItems.value).toEqual([])
    expect(page.holidayCards.value).toEqual(holidayCards)
    expect(page.comboPacks.value).toEqual(comboPacks)
    expect(page.faqSchema.value).toBe(null)
  })
})
