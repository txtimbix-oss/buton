<template>
  <section class="dashboard-orders">
    <CabSectionHeader title="Последние заказы" action-label="Все →" to="/orders" />

    <div v-if="loading" class="dashboard-orders__loading">
      <CabLoadingCards />
    </div>

    <template v-else-if="recentOrders.length === 0">
      <div class="dashboard-orders__empty">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="dashboard-orders__empty-icon"><path d="M3 7l9-4 9 4v10l-9 4-9-4V7z"/></svg>
        <p class="dashboard-orders__empty-text">Заказов пока нет</p>
        <a :href="shopUrl" class="btn btn--ghost btn--sm">В магазин</a>
      </div>
    </template>

    <template v-else>
      <article
        v-for="order in recentOrders"
        :key="order._id"
        class="dashboard-order-card"
        @click="emit('open-order', order._id)"
      >
        <div class="dashboard-order-card__media">🌸</div>
        <div class="dashboard-order-card__body">
          <div class="dashboard-order-card__head">
            <div class="dashboard-order-card__number">{{ order.orderNumber }}</div>
            <div class="dashboard-order-card__date">{{ formatShortDate(order.createdAt) }}</div>
          </div>
          <div class="dashboard-order-card__meta">{{ order.items.map(item => item.name).join(', ') }}</div>
          <div class="dashboard-order-card__status">
            <OrderStatusBadge :status="order.status" />
          </div>
        </div>
        <div class="dashboard-order-card__aside">
          <div class="dashboard-order-card__price">{{ formatPrice(order.total) }}</div>
        </div>
      </article>
    </template>
  </section>
</template>

<script setup lang="ts">
import CabLoadingCards from '@/components/CabLoadingCards.vue'
import CabSectionHeader from '@/components/CabSectionHeader.vue'
import OrderStatusBadge from '@/components/OrderStatusBadge.vue'
import type { CabinetOrder } from '@/types/order'
import { formatPrice, formatShortDate } from '@/utils/formatters'

defineProps<{
  loading: boolean
  recentOrders: CabinetOrder[]
  shopUrl: string
}>()

const emit = defineEmits<{
  'open-order': [id: string]
}>()
</script>
