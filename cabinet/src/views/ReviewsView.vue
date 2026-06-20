<template>
  <AppLayout>
    <h1 class="page-title">Мои отзывы</h1>

    <div class="chips-row">
      <ReviewsFilters
        :filters="filters"
        :active-filter="activeFilter"
        @select="selectFilter"
      />
    </div>

    <CabLoadingCards v-if="loading" />

    <CabEmptyState
      v-else-if="filtered.length === 0"
      title="Отзывов пока нет"
      text="После получения заказа вы можете оставить отзыв на купленные букеты"
    >
      <template #icon>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 3l2.6 5.6 6.1.8-4.5 4.2 1.2 6L12 17.8 6.6 19.6l1.2-6L3.3 9.4l6.1-.8L12 3z"/></svg>
      </template>
      <template #action>
        <RouterLink to="/orders" class="btn btn--ghost btn--sm">Перейти к заказам →</RouterLink>
      </template>
    </CabEmptyState>

    <div v-else>
      <ReviewsCardsList :reviews="filtered" />
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import AppLayout from '@/components/AppLayout.vue'
import CabEmptyState from '@/components/CabEmptyState.vue'
import CabLoadingCards from '@/components/CabLoadingCards.vue'
import ReviewsCardsList from '@/components/reviews/ReviewsCardsList.vue'
import ReviewsFilters from '@/components/reviews/ReviewsFilters.vue'
import { useReviewsViewModel } from '@/composables/useReviewsViewModel'

const {
  activeFilter,
  filtered,
  filters,
  loading,
  selectFilter,
} = useReviewsViewModel()
</script>

<style scoped>
.chips-row { padding-top: 20px; }
</style>
