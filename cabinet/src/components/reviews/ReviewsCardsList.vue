<template>
  <div v-for="review in reviews" :key="review._id" class="rev-card">
    <div class="rev-card__top">
      <div class="rev-card__img">🌸</div>
      <div>
        <div class="rev-card__name">{{ review.productSlug }}</div>
        <div class="rev-card__meta">
          <div class="stars">
            <span
              v-for="star in 5"
              :key="star"
              class="star"
              :class="{ filled: star <= review.rating }"
            >
              ★
            </span>
          </div>
          <span class="rev-card__date">{{ formatLongDate(review.createdAt) }}</span>
          <span :class="['review-status', `review-status--${review.status}`]">
            {{ statusLabel(review.status) }}
          </span>
        </div>
      </div>
    </div>
    <p class="rev-card__text">«{{ review.text }}»</p>
    <div v-if="review.status === 'rejected'" class="rev-card__reject">
      Отклонён: нарушение правил платформы.
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IReview } from '@/types/review'
import { formatLongDate } from '@/utils/formatters'
import { REVIEW_STATUS_LABELS, type ReviewStatus } from './reviewOptions'

defineProps<{
  reviews: IReview[]
}>()

function statusLabel(status: ReviewStatus) {
  return REVIEW_STATUS_LABELS[status] ?? REVIEW_STATUS_LABELS.pending
}
</script>
