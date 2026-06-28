<template>
  <div class="auth-wrap">
    <div class="auth-col">
      <a :href="shopUrl" class="auth-logo">Бутон<b>.</b></a>

      <slot />

      <div v-if="$slots.below" class="auth-below">
        <slot name="below" />
      </div>
    </div>

    <div class="auth-side">
      <img class="auth-side__img" :src="image" alt="" />
      <div class="auth-side__scrim"></div>
      <div class="auth-side__quote">
        <div class="auth-side__q">{{ quote }}</div>
        <div v-if="caption" class="auth-side__cap">{{ caption }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// «Бутон.» в логотипе ведёт на главную магазина (а не внутрь кабинета)
const shopUrl = import.meta.env.VITE_SHOP_URL || 'https://butonshop.ru'

withDefaults(
  defineProps<{
    quote: string
    caption?: string
    image?: string
    // оставлено для обратной совместимости со старыми вызовами (Login/Forgot/Reset)
    bloomClass?: string
  }>(),
  {
    caption: 'Бутон · доставка за 60 минут',
    image: '/auth-flowers.jpg',
  },
)
</script>
