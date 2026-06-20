import { describe, expect, it } from 'vitest'

import {
  buildDeliveryFaqSchema,
  normalizeDeliveryPageContent,
} from '~/lib/delivery/content'

describe('delivery content helpers', () => {
  it('normalizes delivery page arrays from flat settings json with safe fallbacks', () => {
    const settings = {
      deliveryOptions: JSON.stringify([
        { icon: 'truck', title: 'Курьер', price: '390 ₽', desc: 'За 2 часа' },
      ]),
      deliveryZones: 'not-json',
      deliveryTiming: JSON.stringify([
        { title: 'Сегодня', desc: 'Доставим до вечера' },
      ]),
      paymentMethods: 'null',
      faqItems: JSON.stringify([
        { q: 'Можно сегодня?', a: 'Да, если есть слот.' },
      ]),
    }

    const content = normalizeDeliveryPageContent(settings)

    expect(content.deliveryOptions).toEqual([
      { icon: 'truck', title: 'Курьер', price: '390 ₽', desc: 'За 2 часа' },
    ])
    expect(content.deliveryZones).toEqual([])
    expect(content.deliveryTiming).toEqual([
      { title: 'Сегодня', desc: 'Доставим до вечера' },
    ])
    expect(content.paymentMethods).toEqual([])
    expect(content.faqItems).toEqual([
      { q: 'Можно сегодня?', a: 'Да, если есть слот.' },
    ])
  })

  it('builds faq schema only when faq items are present', () => {
    expect(buildDeliveryFaqSchema([])).toBeNull()
    expect(buildDeliveryFaqSchema([
      { q: 'Можно сегодня?', a: 'Да, если есть слот.' },
      { q: 'Есть анонимная доставка?', a: 'Да.' },
    ])).toEqual({
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
        {
          '@type': 'Question',
          name: 'Есть анонимная доставка?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Да.',
          },
        },
      ],
    })
  })
})
