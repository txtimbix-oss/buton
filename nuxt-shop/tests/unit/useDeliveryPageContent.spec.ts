import { effectScope, nextTick, ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'

import { useDeliveryPageContent } from '~/composables/useDeliveryPageContent'
import {
  buildDeliveryFaqSchema,
  normalizeDeliveryPageContent,
} from '~/lib/delivery/content'

describe('useDeliveryPageContent', () => {
  it('derives shell-ready delivery content from reactive settings', () => {
    const settings = ref({
      deliveryOptions: JSON.stringify([
        { icon: 'truck', title: 'Курьер', price: '390 ₽', desc: 'За 2 часа' },
      ]),
      deliveryZones: JSON.stringify([
        { name: 'Центр', price: '390 ₽', areas: 'ЦАО' },
      ]),
      deliveryTiming: JSON.stringify([
        { title: 'Сегодня', desc: 'Доставим до вечера' },
      ]),
      paymentMethods: JSON.stringify([
        { title: 'Карта', desc: 'Онлайн' },
      ]),
      faqItems: JSON.stringify([
        { q: 'Можно сегодня?', a: 'Да, если есть слот.' },
      ]),
    })

    const page = useDeliveryPageContent({ settings })
    const expected = normalizeDeliveryPageContent(settings.value)

    expect(page.deliveryOptions.value).toEqual(expected.deliveryOptions)
    expect(page.deliveryZones.value).toEqual(expected.deliveryZones)
    expect(page.deliveryTiming.value).toEqual(expected.deliveryTiming)
    expect(page.paymentMethods.value).toEqual(expected.paymentMethods)
    expect(page.faqItems.value).toEqual(expected.faqItems)
    expect(page.faqSchema.value).toEqual(buildDeliveryFaqSchema(expected.faqItems))
  })

  it('publishes faq schema through injected jsonLd only when faq exists', async () => {
    const jsonLd = vi.fn()
    const settings = ref({
      deliveryOptions: '[]',
      deliveryZones: '[]',
      deliveryTiming: '[]',
      paymentMethods: '[]',
      faqItems: '[]',
    })

    const scope = effectScope()
    let page: ReturnType<typeof useDeliveryPageContent> | undefined

    scope.run(() => {
      page = useDeliveryPageContent({ settings }, { jsonLd })
    })

    await nextTick()

    expect(jsonLd).not.toHaveBeenCalled()
    expect(page?.faqSchema.value).toBeNull()

    settings.value = {
      ...settings.value,
      faqItems: JSON.stringify([{ q: 'Можно сегодня?', a: 'Да, если есть слот.' }]),
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
          name: 'Можно сегодня?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Да, если есть слот.',
          },
        },
      ],
    })

    scope.stop()
  })

  it('falls back to empty arrays when malformed settings are provided', async () => {
    const jsonLd = vi.fn()
    const settings = ref({
      deliveryOptions: '[{ "icon": "truck", "title": "Курьер" }',
      deliveryZones: '{ "name": "Центр"',
      deliveryTiming: '[]',
      paymentMethods: '"oops"',
      faqItems: '[{ "q": "Вопрос", "a": "Ответ" }',
    })

    const page = useDeliveryPageContent({ settings }, { jsonLd })

    expect(page.deliveryOptions.value).toEqual([])
    expect(page.deliveryZones.value).toEqual([])
    expect(page.deliveryTiming.value).toEqual([])
    expect(page.paymentMethods.value).toEqual([])
    expect(page.faqItems.value).toEqual([])
    expect(page.faqSchema.value).toBe(null)
    expect(jsonLd).not.toHaveBeenCalled()
  })
})
