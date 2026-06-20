<template>
  <div class="order-success">
    <div class="cart-success__icon">🌷</div>
    <h2 class="cart-success__title">Заказ принят!</h2>
    <p class="cart-success__sum">
      Номер заказа: <strong>{{ orderResult.orderNumber }}</strong>
    </p>
    <p class="cart-success__text">
      Свяжемся с вами в течение 15 минут для подтверждения.
      Письмо с деталями отправлено на ваш email.
    </p>
    <p v-if="orderResult.bonusEarned" class="cart-success__bonus">
      🎁 Начислим +{{ orderResult.bonusEarned }} бонусных баллов после доставки
    </p>
    <div class="cart-success__actions">
      <NuxtLink to="/catalog" class="btn btn--ink">Продолжить покупки <span class="arr">→</span></NuxtLink>
      <NuxtLink to="/orders/track" class="btn btn--ghost">Отследить заказ →</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  orderResult: { orderNumber: string; bonusEarned?: number }
}>()
</script>
