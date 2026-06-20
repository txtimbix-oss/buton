import type { Review } from '~/composables/useShop'
import type {
  ProductDisplayReview,
  ProductReviewDraft,
  ProductReviewSubmissionPayload,
} from '~/lib/product/types'

export function formatReviewDate(value: string): string {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ''

  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(parsed).replace(/\s?г\.$/, '')
}

export function buildProductReviews(
  apiReviews: Review[] | null | undefined,
  fallbackReviews: ProductDisplayReview[],
): ProductDisplayReview[] {
  if (!apiReviews?.length) return fallbackReviews

  return apiReviews.map(review => ({
    key: review._id,
    name: review.name,
    date: formatReviewDate(review.createdAt),
    rating: review.rating,
    text: review.text,
  }))
}

export function validateReviewSubmission(review: ProductReviewDraft): string {
  if (!review.name.trim()) return 'Введите ваше имя'
  if (!Number.isInteger(review.rating) || review.rating < 1 || review.rating > 5) {
    return 'Выберите оценку от 1 до 5'
  }
  if (!review.text.trim()) return 'Напишите текст отзыва'
  return ''
}

export function normalizeReviewSubmission(
  productSlug: string,
  review: ProductReviewDraft,
): ProductReviewSubmissionPayload {
  return {
    productSlug,
    name: review.name.trim(),
    rating: review.rating,
    text: review.text.trim(),
  }
}
