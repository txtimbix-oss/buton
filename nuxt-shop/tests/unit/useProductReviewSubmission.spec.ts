import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

import { useProductReviewSubmission } from '~/composables/useProductReviewSubmission'
import type { ProductReviewSubmissionPayload } from '~/lib/product/types'

describe('useProductReviewSubmission', () => {
  it('submits a normalized review, marks it as sent, and resets the draft', async () => {
    const slug = ref('peony-dream')
    const submit = vi.fn<(payload: ProductReviewSubmissionPayload) => Promise<void>>(() => Promise.resolve())

    const review = useProductReviewSubmission({
      slug,
    }, {
      submit,
    })

    review.newReview.name = '  Мария  '
    review.newReview.rating = 4
    review.newReview.text = '  Очень красиво  '

    await review.submitReview()

    expect(submit).toHaveBeenCalledWith({
      productSlug: 'peony-dream',
      name: 'Мария',
      rating: 4,
      text: 'Очень красиво',
    })
    expect(review.reviewSent.value).toBe(true)
    expect(review.reviewError.value).toBe('')
    expect(review.newReview).toEqual({
      name: '',
      rating: 5,
      text: '',
    })
  })

  it('shows validation error and skips submit when draft is invalid', async () => {
    const submit = vi.fn<(payload: ProductReviewSubmissionPayload) => Promise<void>>(() => Promise.resolve())

    const review = useProductReviewSubmission({
      slug: () => 'garden-mix',
    }, {
      submit,
    })

    review.newReview.name = '   '
    review.newReview.rating = 5
    review.newReview.text = 'Текст'

    await review.submitReview()

    expect(submit).not.toHaveBeenCalled()
    expect(review.reviewSent.value).toBe(false)
    expect(review.reviewError.value).toBe('Введите ваше имя')
  })

  it('keeps the draft and exposes a fallback error when submit fails', async () => {
    const submit = vi.fn<(payload: ProductReviewSubmissionPayload) => Promise<void>>(() => Promise.reject(new Error('network')))

    const review = useProductReviewSubmission({
      slug: () => 'rose-cloud',
    }, {
      submit,
    })

    review.newReview.name = 'Ольга'
    review.newReview.rating = 5
    review.newReview.text = 'Все понравилось'

    await review.submitReview()

    expect(submit).toHaveBeenCalledWith({
      productSlug: 'rose-cloud',
      name: 'Ольга',
      rating: 5,
      text: 'Все понравилось',
    })
    expect(review.reviewSent.value).toBe(false)
    expect(review.reviewError.value).toBe('Ошибка отправки, попробуйте ещё раз')
    expect(review.newReview).toEqual({
      name: 'Ольга',
      rating: 5,
      text: 'Все понравилось',
    })
  })

  it('ignores a second submit while the first one is in progress', async () => {
    let resolveSubmit: () => void = () => {}
    const submit = vi.fn<(payload: ProductReviewSubmissionPayload) => Promise<void>>(
      () => new Promise((resolve) => {
        resolveSubmit = resolve
      }),
    )

    const review = useProductReviewSubmission({
      slug: () => 'spring-breeze',
    }, {
      submit,
    })

    review.newReview.name = 'Ирина'
    review.newReview.rating = 5
    review.newReview.text = 'Очень красиво'

    const first = review.submitReview()
    const second = review.submitReview()

    expect(submit).toHaveBeenCalledTimes(1)

    resolveSubmit()
    await first
    await second

    expect(review.reviewSent.value).toBe(true)
    expect(review.reviewError.value).toBe('')
    expect(review.newReview).toEqual({
      name: '',
      rating: 5,
      text: '',
    })
  })

  it('normalizes submit failures into a stable user-facing message', async () => {
    const submit = vi.fn<(payload: ProductReviewSubmissionPayload) => Promise<void>>(() => {
      return Promise.reject('timeout')
    })

    const review = useProductReviewSubmission({
      slug: () => 'rose-cloud',
    }, {
      submit,
    })

    review.newReview.name = 'Анна'
    review.newReview.rating = 5
    review.newReview.text = 'Очень нежно'

    await review.submitReview()

    expect(review.reviewError.value).toBe('Ошибка отправки, попробуйте ещё раз')
    expect(review.reviewSent.value).toBe(false)
    expect(review.newReview).toEqual({
      name: 'Анна',
      rating: 5,
      text: 'Очень нежно',
    })
  })
})
