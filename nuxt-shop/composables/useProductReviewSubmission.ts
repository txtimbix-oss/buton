import { reactive, ref, toValue, type MaybeRefOrGetter } from 'vue'

import {
  normalizeReviewSubmission,
  validateReviewSubmission,
} from '~/lib/product/reviews'
import type {
  ProductReviewDraft,
  ProductReviewSubmissionPayload,
} from '~/lib/product/types'
import { useAsyncSubmitState } from '~/composables/useAsyncSubmitState'

export interface UseProductReviewSubmissionOptions {
  slug: MaybeRefOrGetter<string>
}

export interface UseProductReviewSubmissionDeps {
  submit: (payload: ProductReviewSubmissionPayload) => Promise<unknown> | unknown
  validate?: (review: ProductReviewDraft) => string
  normalize?: (productSlug: string, review: ProductReviewDraft) => ProductReviewSubmissionPayload
}

function createEmptyReviewDraft(): ProductReviewDraft {
  return {
    name: '',
    rating: 5,
    text: '',
  }
}

export function useProductReviewSubmission(
  options: UseProductReviewSubmissionOptions,
  deps: UseProductReviewSubmissionDeps,
) {
  const newReview = reactive<ProductReviewDraft>(createEmptyReviewDraft())
  const reviewError = ref('')
  const reviewSent = ref(false)
  const submitState = useAsyncSubmitState({
    errorMessage: 'Ошибка отправки, попробуйте ещё раз',
  })

  const validate = deps.validate ?? validateReviewSubmission
  const normalize = deps.normalize ?? normalizeReviewSubmission

  function resetDraft() {
    Object.assign(newReview, createEmptyReviewDraft())
  }

  async function submitReview() {
    reviewError.value = validate(newReview)
    if (reviewError.value) return

    const success = await submitState.run(async () => {
      await deps.submit(normalize(toValue(options.slug), newReview))
      resetDraft()
    })

    reviewSent.value = success
    reviewError.value = submitState.apiError.value
  }

  return {
    newReview,
    reviewError,
    reviewSent,
    submitReview,
  }
}
