import { computed, onMounted, ref } from 'vue'
import { api } from '@/api'
import { REVIEW_FILTERS, type ReviewFilterValue } from '@/components/reviews/reviewOptions'
import type { IReview } from '@/types/review'

export function useReviewsViewModel() {
  const loading = ref(true)
  const reviews = ref<IReview[]>([])
  const activeFilter = ref<ReviewFilterValue>('all')

  const filtered = computed(() => {
    if (activeFilter.value === 'all') return reviews.value
    return reviews.value.filter(review => review.status === activeFilter.value)
  })

  function selectFilter(filter: ReviewFilterValue) {
    activeFilter.value = filter
  }

  async function loadReviews() {
    try {
      const response = await api.getUserReviews()
      reviews.value = response.reviews
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    void loadReviews()
  })

  return {
    activeFilter,
    filtered,
    filters: REVIEW_FILTERS,
    loadReviews,
    loading,
    reviews,
    selectFilter,
  }
}
