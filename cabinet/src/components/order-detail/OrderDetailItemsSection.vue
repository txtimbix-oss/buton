<template>
  <div class="cab-section">
    <h2 class="sec-title">Состав заказа</h2>
    <div class="cab-card">
      <div v-for="item in order.items" :key="item.slug + item.sizeLabel" class="line-item">
        <div class="line-item__img">🌸</div>
        <div>
          <b>{{ item.name }} · {{ item.sizeLabel }}</b>
          <div class="line-item__meta">{{ item.meta }}</div>
        </div>
        <div class="line-item__total">
          {{ formatPrice(item.price * item.qty) }}
          <div class="line-item__qty">× {{ item.qty }}</div>
          <div v-if="order.status === 'delivered'" class="line-item__review">
            <button
              v-if="!reviewedSlugs.has(item.slug)"
              class="btn btn--ghost btn--sm"
              @click="$emit('review', item)"
            >
              Отзыв
            </button>
            <span v-else class="line-item__reviewed">✓ Отзыв</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import type { CabinetOrder, CabinetOrderItem } from '@/types/order'
import { formatPrice } from '@/utils/formatters'

defineProps({
  order: {
    type: Object as PropType<CabinetOrder>,
    required: true,
  },
  reviewedSlugs: {
    type: Object as PropType<Set<string>>,
    required: true,
  },
})

defineEmits<{
  (e: 'review', item: CabinetOrderItem): void
}>()
</script>
