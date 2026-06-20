<template>
  <span class="badge" :class="`badge--${status}`">{{ label }}</span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { OrderStatus } from '@/types/order'

const props = defineProps<{ status: OrderStatus }>()

const LABELS: Record<OrderStatus, string> = {
  pending:    'Ожидает',
  confirmed:  'Подтверждён',
  delivering: 'Доставляется',
  delivered:  'Доставлен',
  cancelled:  'Отменён',
  refunded:   'Возврат',
}

const label = computed(() => LABELS[props.status] ?? props.status)
</script>
