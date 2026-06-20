export interface IReview {
  _id: string
  productSlug: string
  name: string
  rating: number
  text: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

export interface CreateReviewPayload {
  productSlug: string
  rating: number
  text: string
}

export interface ReviewListResponse {
  ok: boolean
  reviews: IReview[]
}

export interface CreateReviewResponse {
  ok: boolean
  review: IReview
}
