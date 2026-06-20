import { describe, expect, it } from 'vitest'

import {
  CARE_TIPS_DEFAULT_FAQ,
  CARE_TIPS_DEFAULT_FLOWER_TYPES,
  CARE_TIPS_DEFAULT_STEPS,
  buildCareFaqSchema,
  parseCareFaqItems,
  parseCareFlowerTypes,
  parseCareSteps,
} from '~/lib/care/content'

describe('care content helpers', () => {
  it('falls back to default care steps and flower types when settings are missing', () => {
    expect(parseCareSteps(undefined)).toEqual(CARE_TIPS_DEFAULT_STEPS)
    expect(parseCareFlowerTypes(undefined)).toEqual(CARE_TIPS_DEFAULT_FLOWER_TYPES)
    expect(parseCareSteps('null')).toEqual(CARE_TIPS_DEFAULT_STEPS)
    expect(parseCareFlowerTypes('null')).toEqual(CARE_TIPS_DEFAULT_FLOWER_TYPES)
  })

  it('keeps only flower-care faqs from settings and falls back when none match', () => {
    const rawFaqItems = JSON.stringify([
      { q: 'Как ухаживать за цветами дома?', a: 'Меняйте воду каждый день.' },
      { q: 'Как оплатить заказ?', a: 'Картой на сайте.' },
    ])

    expect(parseCareFaqItems(rawFaqItems)).toEqual([
      { q: 'Как ухаживать за цветами дома?', a: 'Меняйте воду каждый день.' },
    ])
    expect(parseCareFaqItems(JSON.stringify([{ q: 'Доставка ночью?', a: 'По запросу.' }]))).toEqual(CARE_TIPS_DEFAULT_FAQ)
  })

  it('builds faq page schema from faq items', () => {
    expect(buildCareFaqSchema([
      { q: 'Когда менять воду?', a: 'Каждый день.' },
    ])).toEqual({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Когда менять воду?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Каждый день.',
          },
        },
      ],
    })
  })
})
