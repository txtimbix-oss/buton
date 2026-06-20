import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useReviewsViewModel } from '@/composables/useReviewsViewModel'
import type { IReview } from '@/types/review'

const { getUserReviews } = vi.hoisted(() => ({
  getUserReviews: vi.fn(),
}))

vi.mock('@/api', () => ({
  api: {
    getUserReviews,
  },
}))

function makeReview(overrides: Partial<IReview> = {}): IReview {
  return {
    _id: 'r-default',
    productSlug: 'rose',
    name: 'Розы',
    rating: 5,
    text: 'Отлично',
    status: 'approved',
    createdAt: '2026-06-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('useReviewsViewModel', () => {
  beforeEach(() => {
    getUserReviews.mockReset().mockResolvedValue({ reviews: [] })
  })

  it('filters reviews by selected status and keeps all reviews by default', () => {
    const vm = useReviewsViewModel()
    vm.reviews.value = [
      makeReview({ _id: 'approved', status: 'approved' }),
      makeReview({ _id: 'pending', status: 'pending' }),
      makeReview({ _id: 'rejected', status: 'rejected' }),
    ]

    expect(vm.filtered.value.map(review => review._id)).toEqual(['approved', 'pending', 'rejected'])

    vm.selectFilter('pending')

    expect(vm.activeFilter.value).toBe('pending')
    expect(vm.filtered.value.map(review => review._id)).toEqual(['pending'])
  })

  it('loads reviews from api and clears loading state', async () => {
    getUserReviews.mockResolvedValueOnce({
      reviews: [
        makeReview({ _id: 'r1', status: 'approved' }),
        makeReview({ _id: 'r2', status: 'rejected' }),
      ],
    })

    const vm = useReviewsViewModel()

    await vm.loadReviews()

    expect(getUserReviews).toHaveBeenCalledOnce()
    expect(vm.reviews.value.map(review => review._id)).toEqual(['r1', 'r2'])
    expect(vm.loading.value).toBe(false)
  })
})
