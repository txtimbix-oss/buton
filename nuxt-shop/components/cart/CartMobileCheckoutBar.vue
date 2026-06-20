<template>
  <div class="mob-checkout">
    <div>
      <div class="mob-checkout__label">К оплате</div>
      <div class="mob-checkout__price">{{ totalWithBonus.toLocaleString('ru-RU') }} ₽</div>
    </div>
    <button class="btn btn--ink cart-mob-submit" :disabled="submitting" @click="emit('submitOrder')">
      <template v-if="submitting">Отправляем…</template>
      <template v-else>Оформить <span class="arr">→</span></template>
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  totalWithBonus: number
  submitting: boolean
}>()

const emit = defineEmits<{
  submitOrder: []
}>()
</script>
