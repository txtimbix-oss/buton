<template>
  <section :class="sectionClass">
    <div class="container">
      <div class="sec__head">
        <div>
          <span class="eyebrow">{{ eyebrow }}</span>
          <h2>{{ title }}</h2>
        </div>
        <NuxtLink :to="linkTo" class="sec__link">
          {{ linkText }}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        </NuxtLink>
      </div>

      <div v-if="pending" :class="gridClass">
        <div v-for="n in skeletonCount" :key="`${title}-${n}`" class="skeleton index-skeleton-card" />
      </div>
      <div v-else :class="gridClass">
        <ProductCard v-for="product in products" :key="`${title}-${product.slug}`" :p="product" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Product } from '~/composables/useShop'

const props = withDefaults(defineProps<{
  eyebrow: string
  title: string
  linkText: string
  linkTo: string
  products: Product[]
  pending: boolean
  sectionClass?: string
  layout?: 'featured' | 'grid'
  skeletonCount?: number
}>(), {
  sectionClass: 'sec sec--notop',
  layout: 'grid',
  skeletonCount: 4,
})

const gridClass = computed(() =>
  props.layout === 'featured' ? 'home-feature-grid' : 'grid-cards cols-3'
)
</script>
