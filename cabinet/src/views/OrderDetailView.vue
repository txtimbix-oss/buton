<template>
  <AppLayout>
    <RouterLink to="/orders" class="link-clay order-back-link">
      ← Мои заказы
    </RouterLink>

    <div v-if="detailLoading || loading" class="loading-inline"><span class="spinner spinner--ink"></span></div>

    <div v-else-if="!order" class="cab-card">
      <p class="muted-text">Заказ не найден</p>
    </div>

    <template v-else>
      <div class="detail-head">
        <h1 class="page-title detail-title">Заказ {{ order.orderNumber }}</h1>
        <OrderStatusBadge :status="order.status" />
      </div>
      <p class="page-sub">{{ formatDateTime(order.createdAt) }}</p>

      <div v-if="order.status === 'delivered' && order.bonusEarned > 0" class="cab-card order-bonus">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="2" class="order-bonus__ico"><polyline points="20 6 9 17 4 12"/></svg>
        <span>За этот заказ начислено <b class="order-bonus__gain">+{{ order.bonusEarned }} бонусов</b></span>
      </div>

      <div class="detail-2col">
        <div>
          <OrderDetailStatusSection
            :order="order"
            :timeline-steps="timelineSteps"
            :step-class="stepClass"
            :can-cancel="canCancel"
            :cancelling="cancelling"
            @cancel="cancelModal = true"
            @repeat="repeatOrder"
          />

          <OrderDetailItemsSection
            :order="order"
            :reviewed-slugs="reviewedSlugs"
            @review="openReviewModal"
          />
        </div>

        <div>
          <OrderDetailSummarySidebar :order="order" />
        </div>
      </div>
    </template>

    <CabConfirmDialog
      :open="cancelModal"
      title="Отменить заказ?"
      :text="`Заказ ${order?.orderNumber ?? ''} будет отменён. Если вы списывали бонусы, они вернутся.`"
      confirm-label="Да, отменить"
      cancel-label="Не отменять"
      :loading="cancelling"
      @cancel="cancelModal = false"
      @confirm="doCancel"
    />

    <OrderReviewModal
      v-model="reviewForm"
      :open="reviewModal"
      :item="reviewItem"
      :error="reviewError"
      :saving="reviewSaving"
      @close="closeReviewModal"
      @submit="submitReview"
    />
  </AppLayout>
</template>

<script setup lang="ts">
import AppLayout from '@/components/AppLayout.vue'
import CabConfirmDialog from '@/components/CabConfirmDialog.vue'
import OrderStatusBadge from '@/components/OrderStatusBadge.vue'
import OrderDetailItemsSection from '@/components/order-detail/OrderDetailItemsSection.vue'
import OrderReviewModal from '@/components/order-detail/OrderReviewModal.vue'
import OrderDetailStatusSection from '@/components/order-detail/OrderDetailStatusSection.vue'
import OrderDetailSummarySidebar from '@/components/order-detail/OrderDetailSummarySidebar.vue'
import { useOrderDetailViewModel } from '@/composables/useOrderDetailViewModel'
import { formatDateTime } from '@/utils/formatters'

const {
  canCancel,
  cancelModal,
  cancelling,
  closeReviewModal,
  detailLoading,
  doCancel,
  loading,
  openReviewModal,
  order,
  repeatOrder,
  reviewError,
  reviewForm,
  reviewItem,
  reviewModal,
  reviewSaving,
  reviewedSlugs,
  stepClass,
  submitReview,
  timelineSteps,
} = useOrderDetailViewModel()
</script>
