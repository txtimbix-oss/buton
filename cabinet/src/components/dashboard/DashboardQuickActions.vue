<template>
  <div class="cab-section">
    <CabSectionHeader title="Быстрые действия" />
    <div class="dashboard-quick-actions quick-actions">
      <div class="dashboard-action-card dashboard-action-card--primary quick-action">
        <div class="quick-action__ico dashboard-action-card__ico">↻</div>
        <div class="dashboard-action-card__body">
          <b>Повторить любимый сценарий</b>
          <p>Соберём последний заказ в корзине, чтобы вы оформили его почти без шагов</p>
        </div>
        <button
          class="btn btn--primary btn--sm"
          :disabled="!hasLatestOrder || repeatingOrder"
          @click="emit('repeat-order')"
        >
          <span v-if="repeatingOrder" class="spinner spinner--sm"></span>
          <span v-else>Повторить</span>
        </button>
      </div>
      <div class="dashboard-action-card quick-action">
        <div class="quick-action__ico dashboard-action-card__ico">🛒</div>
        <div class="dashboard-action-card__body">
          <b>Добавить что-то к заказу</b>
          <p>Откройте корзину магазина и быстро соберите новый повод или дополняющие позиции</p>
        </div>
        <button class="btn btn--ghost btn--sm" @click="emit('open-cart')">Открыть корзину</button>
      </div>
      <div class="dashboard-action-card quick-action">
        <div class="quick-action__ico dashboard-action-card__ico">★</div>
        <div class="dashboard-action-card__body">
          <b>Поделиться впечатлением</b>
          <p>Оставьте отзыв по доставленным заказам и помогите нам точнее собирать следующий букет</p>
        </div>
        <button
          class="btn btn--ghost btn--sm"
          :disabled="!canCreateReview"
          @click="emit('go-to-review')"
        >
          Перейти к отзывам
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import CabSectionHeader from '@/components/CabSectionHeader.vue'

defineProps<{
  canCreateReview: boolean
  hasLatestOrder: boolean
  repeatingOrder: boolean
}>()

const emit = defineEmits<{
  'go-to-review': []
  'open-cart': []
  'repeat-order': []
}>()
</script>
