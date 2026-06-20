<template>
  <section class="sec sec--notop container">
    <div class="sec__head">
      <h2>{{ title }}</h2>
      <NuxtLink :to="linkTo" class="sec__link">
        {{ linkText }}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
      </NuxtLink>
    </div>
    <div class="grid-cards">
      <ProductCard v-for="p in products" :key="`${keyPrefix}-${p.slug}`" :p="p" />
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Product } from '~/composables/useShop'

defineProps<{
  title: string
  linkTo: string
  linkText: string
  products: Product[]
  keyPrefix: string
}>()
</script>
