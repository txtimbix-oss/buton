<template>
  <div class="wgrid">
    <div v-for="product in products" :key="product.slug" class="wcard">
      <a :href="`${SHOP_URL}/product/${product.slug}`" class="wcard__media">
        <ShopImg
          v-if="product.images?.[0]"
          :src="assetUrl(product.images[0])"
          :alt="product.name"
          sizes="(max-width: 600px) 47vw, 220px"
          class="wcard__img"
        />
        <div v-else class="wcard__placeholder">🌸</div>
      </a>

      <button
        class="wcard__fav"
        :disabled="removingSlug === product.slug"
        aria-label="Удалить из избранного"
        title="Удалить из избранного"
        @click.prevent="emit('remove', product.slug)"
      >
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 20.3l-1.45-1.32C5.4 14.24 2 11.16 2 7.5 2 4.42 4.42 2 7.5 2c1.74 0 3.41.81 4.5 2.09C13.09 2.81 14.76 2 16.5 2 19.58 2 22 4.42 22 7.5c0 3.66-3.4 6.74-8.55 11.49L12 20.3z"/></svg>
      </button>

      <a :href="`${SHOP_URL}/product/${product.slug}`">
        <div class="wcard__name">{{ product.name }}</div>
      </a>

      <div class="wcard__price">от {{ formatPrice(product.price) }}</div>

      <a :href="`${SHOP_URL}/product/${product.slug}`" class="btn btn--ink btn--block btn--sm">
        В корзину →
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { SHOP_URL, assetUrl } from '@/api'
import ShopImg from '@/components/ShopImg.vue'
import type { WishlistProduct } from '@/types/wishlist'
import { formatPrice } from '@/utils/formatters'

defineProps<{
  products: WishlistProduct[]
  removingSlug: string | null
}>()

const emit = defineEmits<{
  remove: [slug: WishlistProduct['slug']]
}>()
</script>

<style scoped>
.wcard { position: relative; }

.wcard__fav {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: rgba(255,255,255,.9);
  backdrop-filter: blur(4px);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--clay, #B6543A);
  box-shadow: 0 2px 8px rgba(0,0,0,.12);
  transition: transform .15s, background .15s;
  z-index: 2;
}

.wcard__fav:hover { transform: scale(1.1); background: #fff; }
.wcard__fav:disabled { opacity: .5; cursor: default; }
.wcard__fav svg { width: 16px; height: 16px; }
</style>
