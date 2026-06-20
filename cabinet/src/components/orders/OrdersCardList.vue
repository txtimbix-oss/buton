<template>
  <div class="ord-cards">
    <div
      v-for="{ order, preview } in orderCards"
      :key="order._id"
      class="order-card row-clickable"
      @click="$emit('open', order._id)"
    >
      <div class="order-card__head">
        <span class="order-card__no">{{ order.orderNumber }}</span>
        <span class="order-card__date">{{ preview.createdAtLabel }}</span>
      </div>
      <div class="order-card__body">{{ preview.businessSummary }}</div>
      <div class="order-card__foot">
        <span class="order-card__price">{{ preview.totalLabel }}</span>
        <OrderStatusBadge :status="order.status" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue'
import type { CabinetOrder } from '@/types/order'
import OrderStatusBadge from '@/components/OrderStatusBadge.vue'
import { getOrderPreviewMeta } from './orderPreviewMeta'

const props = defineProps({
  orders: {
    type: Array as PropType<CabinetOrder[]>,
    required: true,
  },
})

const orderCards = computed(() =>
  props.orders.map(order => ({
    order,
    preview: getOrderPreviewMeta(order),
  })),
)

defineEmits<{
  (e: 'open', id: string): void
}>()
</script>
