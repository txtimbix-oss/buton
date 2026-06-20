<template>
  <div class="gallery">
    <div class="gallery__thumbs">
      <!-- Реальные фото -->
      <template v-if="product.images?.length">
        <template v-for="(url, i) in product.images.slice(0, 4)" :key="url">
          <ShopImg
            v-if="!isThumbBroken(i)"
            :src="url" :alt="`${product.name} — фото ${i + 1}`"
            class="gallery-thumb-img"
            :class="{ active: i === activeThumb }"
            sizes="84px"
            @click="emit('selectImageThumb', i)"
            @error="emit('markThumbError', i)"
          />
        </template>
      </template>
      <!-- Fallback-градиенты -->
      <template v-else>
        <BloomImg
          v-for="(b, i) in thumbs" :key="b" :kind="b"
          :class="['gallery-fallback-thumb', { 'is-active': i === activeThumb }]"
          @click="emit('selectFallbackThumb', i)"
        />
      </template>
    </div>
    <div class="gallery__main">
      <!-- Реальное фото -->
      <ShopImg
        v-if="product.images?.length && !imgError"
        :src="product.images[activeThumb] ?? product.images[0]"
        :alt="`${product.name} — фото ${activeThumb + 1}`"
        class="gallery-main-img gallery-main-img--clickable"
        sizes="(max-width: 768px) 100vw, 50vw"
        eager
        @error="emit('mainImageError')"
        @click="emit('openLightbox', activeThumb)"
      />
      <!-- Fallback-градиент -->
      <BloomImg v-else :kind="thumbs[activeThumb]" class="gallery-main-fallback" :cap="`${product.name}`" />
      <span
        v-if="product.tag"
        :class="`tag ${product.tag === 'Премиум' ? 'tag--green' : product.tag === 'Новинка' ? 'tag--blush' : 'tag--clay'} gallery-tag gallery-tag--left`"
      >
        {{ product.tag }}
      </span>
      <span v-if="product.oldPrice" class="tag tag--blush gallery-tag gallery-tag--right">−{{ discountPct }}%</span>
      <button v-if="product.images?.length && !imgError" class="gallery-zoom-hint" @click="emit('openLightbox', activeThumb)" aria-label="Открыть галерею">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/composables/useShop'

defineProps<{
  product: Product
  thumbs: string[]
  activeThumb: number
  imgError: boolean
  discountPct: number
  isThumbBroken: (index: number) => boolean
}>()

const emit = defineEmits<{
  selectImageThumb: [index: number]
  selectFallbackThumb: [index: number]
  markThumbError: [index: number]
  mainImageError: []
  openLightbox: [index: number]
}>()
</script>
