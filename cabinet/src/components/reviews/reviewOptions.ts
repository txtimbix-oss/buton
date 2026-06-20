import type { IReview } from '@/types/review'

export type ReviewStatus = IReview['status']
export type ReviewFilterValue = 'all' | ReviewStatus

export interface ReviewFilterOption {
  label: string
  value: ReviewFilterValue
}

export const REVIEW_STATUS_LABELS: Record<ReviewStatus, string> = {
  pending: 'На модерации',
  approved: 'Опубликован',
  rejected: 'Отклонён',
}

export const REVIEW_FILTERS: ReviewFilterOption[] = [
  { label: 'Все', value: 'all' },
  { label: REVIEW_STATUS_LABELS.pending, value: 'pending' },
  { label: REVIEW_STATUS_LABELS.approved, value: 'approved' },
  { label: REVIEW_STATUS_LABELS.rejected, value: 'rejected' },
]
