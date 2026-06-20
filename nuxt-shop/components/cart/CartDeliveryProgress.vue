<template>
  <div class="ship-progress">
    <div class="ship-progress__bar">
      <div class="ship-progress__fill cart-progress__fill" />
    </div>
    <div :class="`ship-progress__txt ${freeDeliveryLeft === 0 ? 'free' : ''}`">
      <span v-if="freeDeliveryLeft > 0">Ещё {{ freeDeliveryLeft.toLocaleString('ru-RU') }} ₽ до бесплатной доставки</span>
      <span v-else>🎉 Доставка бесплатно!</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  freeDeliveryLeft: number
  progressWidth: string
}>()
</script>

<style scoped>
.cart-progress__fill {
  width: v-bind('props.progressWidth');
}
</style>
