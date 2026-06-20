<template>
  <section v-if="products.length" class="cab-section dashboard-recommendations">
    <CabSectionHeader title="Вам может понравиться" />
    <div class="dashboard-recommendations__list">
      <article
        v-for="product in products"
        :key="product.slug"
        class="dashboard-recommendation-card"
      >
        <a :href="`${shopUrl}/product/${product.slug}`" class="dashboard-recommendation-card__media">🌸</a>
        <div class="dashboard-recommendation-card__body">
          <b class="dashboard-recommendation-card__title">{{ product.name }}</b>
          <a :href="`${shopUrl}/product/${product.slug}`" class="dashboard-recommendation-card__link">от {{ formatPrice(product.price) }} →</a>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import CabSectionHeader from '@/components/CabSectionHeader.vue'
import type { IProduct } from '@/types/product'
import { formatPrice } from '@/utils/formatters'

defineProps<{
  products: IProduct[]
  shopUrl: string
}>()
</script>
