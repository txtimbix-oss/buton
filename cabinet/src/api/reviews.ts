import { http, unwrap } from './client'
import type { CreateReviewPayload, CreateReviewResponse, ReviewListResponse } from '@/types/api'

export const reviewApi = {
  getUserReviews: () =>
    unwrap(http.get<ReviewListResponse>('/reviews')),

  createReview: (data: CreateReviewPayload) =>
    unwrap(http.post<CreateReviewResponse>('/reviews', data)),
}
