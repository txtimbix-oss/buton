<template>
  <section class="container reviews-section">
    <div class="sec__head product-reviews-head">
      <div>
        <div class="eyebrow">Покупатели о букете</div>
        <h2 class="product-reviews-title">
          Отзывы
          <span class="product-reviews-title-count">{{ product.reviewCount }}</span>
        </h2>
      </div>
      <div class="review-summary">
        <div class="product-rating-big">{{ product.rating }}</div>
        <div>
          <div class="stars-row stars-row--lg">
            <span v-for="n in 5" :key="n" class="star" :class="n <= Math.round(product.rating) ? 'star--fill' : ''">★</span>
          </div>
          <div class="product-reviews-small">{{ product.reviewCount }} отзывов</div>
        </div>
      </div>
    </div>

    <div class="reviews-grid">
      <div v-for="rev in reviews" :key="rev.key" class="review-card">
        <div class="review-card__head">
          <div class="review-avatar">{{ rev.name[0] }}</div>
          <div>
            <div class="review-card__name">{{ rev.name }}</div>
            <div class="review-card__date">{{ rev.date }}</div>
          </div>
          <div class="stars-row product-review-stars">
            <span v-for="n in 5" :key="n" class="star" :class="n <= rev.rating ? 'star--fill' : ''">★</span>
          </div>
        </div>
        <p class="product-review-text">{{ rev.text }}</p>
        <div class="product-review-meta">
          <span class="product-review-verified">✓ Подтверждённая покупка</span>
        </div>
      </div>
    </div>

    <!-- ФОРМА ОТЗЫВА -->
    <div class="review-form-wrap">
      <h3 class="review-form-title">Оставить отзыв</h3>

      <Transition name="review-sent">
        <div v-if="reviewSent" class="review-sent">
          <span class="review-success-icon">🌸</span>
          <div>
            <div class="review-success-title">Спасибо за отзыв!</div>
            <div class="review-success-text">Отзыв отправлен на модерацию и появится после одобрения</div>
          </div>
        </div>
        <form v-else class="review-form" @submit.prevent="emit('submit')">
          <!-- Звёзды -->
          <div class="review-stars-pick">
            <span class="review-rating-label">Оценка:</span>
            <button
              v-for="n in 5" :key="n" type="button"
              class="star star-pick"
              :class="[
                n <= newReview.rating ? 'star--fill' : '',
                { 'star-pick--active': n <= (hoverRating || newReview.rating) },
              ]"
              @click="newReview.rating = n"
              @mouseenter="hoverRating = n"
              @mouseleave="hoverRating = 0"
            >★</button>
          </div>

          <div class="review-form__fields">
            <div class="field">
              <label>Ваше имя *</label>
              <input v-model="newReview.name" class="input" type="text" placeholder="Как вас зовут" required />
            </div>
            <div class="field review-form__field">
              <label>Ваш отзыв *</label>
              <textarea
                v-model="newReview.text"
                class="input area review-form-textarea"
                placeholder="Расскажите о своём опыте — качество, доставка, впечатления получателя…"
                required
              />
            </div>
          </div>

          <div v-if="reviewError" class="review-form-error">{{ reviewError }}</div>
          <button type="submit" class="btn btn--ink">
            Опубликовать отзыв <span class="arr">→</span>
          </button>
        </form>
      </Transition>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Product } from '~/composables/useShop'
import type { ProductDisplayReview, ProductReviewDraft } from '~/lib/product/types'

defineProps<{
  product: Product
  reviews: ProductDisplayReview[]
  newReview: ProductReviewDraft
  reviewSent: boolean
  reviewError: string
}>()

const emit = defineEmits<{
  submit: []
}>()

const hoverRating = ref(0)
</script>
