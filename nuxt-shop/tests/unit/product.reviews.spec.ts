import { describe, expect, it } from 'vitest'

import type { Review } from '~/composables/useShop'
import {
  buildProductReviews,
  formatReviewDate,
  normalizeReviewSubmission,
  validateReviewSubmission,
} from '~/lib/product/reviews'
import type { ProductDisplayReview, ProductReviewDraft } from '~/lib/product/types'

describe('product review helpers', () => {
  const fallbackReviews: ProductDisplayReview[] = [
    { key: 'fallback-1', name: 'Анна', date: '14 мая 2026', rating: 5, text: 'Очень красиво' },
  ]

  it('maps api reviews into display reviews with formatted dates', () => {
    const apiReviews: Review[] = [
      {
        _id: 'r-1',
        productSlug: 'buket',
        name: 'Ирина',
        rating: 4,
        text: 'Свежие цветы',
        status: 'approved',
        createdAt: '2026-05-20T10:00:00.000Z',
      },
    ]

    expect(buildProductReviews(apiReviews, fallbackReviews)).toEqual([
      {
        key: 'r-1',
        name: 'Ирина',
        date: '20 мая 2026',
        rating: 4,
        text: 'Свежие цветы',
      },
    ])
  })

  it('falls back to static reviews when api reviews are empty', () => {
    expect(buildProductReviews([], fallbackReviews)).toBe(fallbackReviews)
    expect(buildProductReviews(undefined, fallbackReviews)).toBe(fallbackReviews)
  })

  it('formats valid review dates and returns empty string for invalid ones', () => {
    expect(formatReviewDate('2026-04-28T09:30:00.000Z')).toBe('28 апреля 2026')
    expect(formatReviewDate('not-a-date')).toBe('')
  })

  it('validates review submission fields before submit', () => {
    expect(validateReviewSubmission({ name: '  ', rating: 5, text: 'Текст' })).toBe('Введите ваше имя')
    expect(validateReviewSubmission({ name: 'Мария', rating: 0, text: 'Текст' })).toBe('Выберите оценку от 1 до 5')
    expect(validateReviewSubmission({ name: 'Мария', rating: 5, text: '   ' })).toBe('Напишите текст отзыва')
    expect(validateReviewSubmission({ name: 'Мария', rating: 5, text: 'Текст' })).toBe('')
  })

  it('normalizes submit payload by trimming fields and preserving rating', () => {
    const draft: ProductReviewDraft = {
      name: '  Мария  ',
      rating: 4,
      text: '  Очень понравился сервис  ',
    }

    expect(normalizeReviewSubmission('buket', draft)).toEqual({
      productSlug: 'buket',
      name: 'Мария',
      rating: 4,
      text: 'Очень понравился сервис',
    })
  })
})
