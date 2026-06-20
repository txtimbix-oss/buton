<template>
  <div>
    <div class="cab-section">
      <h2 class="sec-title">Оплата</h2>
      <div class="cab-card">
        <div class="pay-row"><span>Подытог</span><span>{{ formatPrice(order.subtotal) }}</span></div>
        <div v-if="order.discount > 0" class="pay-row">
          <span class="disc">Скидка {{ order.promoCode ? `(${order.promoCode})` : '' }}</span>
          <span class="disc">−{{ formatPrice(order.discount) }}</span>
        </div>
        <div class="pay-row">
          <span>Доставка</span>
          <span>{{ order.deliveryCost === 0 ? 'бесплатно' : formatPrice(order.deliveryCost) }}</span>
        </div>
        <div class="pay-row total"><span>Итого</span><span>{{ formatPrice(order.total) }}</span></div>
        <div v-if="order.bonusEarned" class="pay-earned">+ {{ order.bonusEarned }} бонусов начислено</div>
      </div>
    </div>

    <div class="cab-section">
      <h2 class="sec-title">Доставка</h2>
      <div class="cab-card info-line">
        <b>{{ order.recipient.name }}</b><br>
        <span class="label">Телефон</span>{{ order.recipient.phone }}<br>
        <span v-if="order.delivery.address"><span class="label">Адрес</span>{{ order.delivery.address }}<br></span>
        <span class="label">Дата / время</span>{{ order.delivery.date }}, {{ order.delivery.time }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import type { CabinetOrder } from '@/types/order'
import { formatPrice } from '@/utils/formatters'

defineProps({
  order: {
    type: Object as PropType<CabinetOrder>,
    required: true,
  },
})
</script>
