<template>
  <section class="container">
    <div class="pdp-3col">
      <div>
        <h2 class="product-subtitle">Состав букета</h2>
        <div v-for="item in product.composition" :key="item.name" class="compose-row">
          <span>{{ item.name }}</span>
          <span class="product-muted">{{ item.qty }}</span>
        </div>
      </div>
      <div>
        <h2 class="product-subtitle">Как ухаживать</h2>
        <p class="lead product-care-text">{{ product.careInstructions }}</p>
      </div>
      <div>
        <h2 class="product-subtitle">Для кого подходит</h2>
        <div class="product-forwho">
          <span v-for="audience in forWho" :key="audience" class="tag tag--clay">{{ audience }}</span>
          <span v-if="forWho.length === 0" class="tag tag--clay">Для особых случаев</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Product } from '~/composables/useShop'

defineProps<{
  product: Product
  forWho: string[]
}>()
</script>
