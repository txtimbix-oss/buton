import { describe, expect, it } from 'vitest'

import {
  buildHolidayFaqSchema,
  holidayCards,
  comboPacks,
  normalizeHolidayPageContent,
} from '~/lib/holiday/content'

describe('holiday content helpers', () => {
  it('returns static holiday cards and combo packs with faq limited to four items', () => {
    const content = normalizeHolidayPageContent({
      faqItems: JSON.stringify([
        { q: 'Q1', a: 'A1' },
        { q: 'Q2', a: 'A2' },
        { q: 'Q3', a: 'A3' },
        { q: 'Q4', a: 'A4' },
        { q: 'Q5', a: 'A5' },
      ]),
    })

    expect(content.holidayCards).toEqual(holidayCards)
    expect(content.comboPacks).toEqual(comboPacks)
    expect(content.faqItems).toEqual([
      { q: 'Q1', a: 'A1' },
      { q: 'Q2', a: 'A2' },
      { q: 'Q3', a: 'A3' },
      { q: 'Q4', a: 'A4' },
    ])
  })

  it('builds faq schema only when faq items exist', () => {
    expect(buildHolidayFaqSchema([])).toBeNull()
    expect(buildHolidayFaqSchema([{ q: 'Когда лучше оформить?', a: 'За 1-2 дня.' }])).toEqual({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Когда лучше оформить?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'За 1-2 дня.',
          },
        },
      ],
    })
  })
})
