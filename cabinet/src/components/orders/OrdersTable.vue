<template>
  <table class="ord-table">
    <thead>
      <tr>
        <th>Заказ</th><th>Дата</th><th>Состав</th><th>Сумма</th><th>Статус</th><th></th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="{ order, preview } in orderRows" :key="order._id" @click="$emit('open', order._id)">
        <td><b>{{ order.orderNumber }}</b></td>
        <td>{{ preview.createdAtLabel }}</td>
        <td class="order-items">{{ preview.businessSummary }}</td>
        <td>{{ preview.totalLabel }}</td>
        <td><OrderStatusBadge :status="order.status" /></td>
        <td class="row-arrow">›</td>
      </tr>
    </tbody>
  </table>
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

const orderRows = computed(() =>
  props.orders.map(order => ({
    order,
    preview: getOrderPreviewMeta(order),
  })),
)

defineEmits<{
  (e: 'open', id: string): void
}>()
</script>
