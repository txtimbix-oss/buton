<template>
  <Teleport to="body">
    <Transition name="lb">
      <div v-if="open" class="lb-overlay" @click.self="emit('close')">
        <button class="lb-close" @click="emit('close')" aria-label="Закрыть">✕</button>
        <button v-if="product.images.length > 1" class="lb-nav lb-nav--prev" @click="emit('step', -1)" aria-label="Предыдущее фото">‹</button>
        <div class="lb-img-wrap">
          <ShopImg
            :src="product.images[index]"
            :alt="`${product.name} — фото ${index + 1}`"
            class="lb-img"
            sizes="100vw"
            eager
          />
          <div v-if="product.images.length > 1" class="lb-counter">{{ index + 1 }} / {{ product.images.length }}</div>
        </div>
        <button v-if="product.images.length > 1" class="lb-nav lb-nav--next" @click="emit('step', 1)" aria-label="Следующее фото">›</button>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { Product } from '~/composables/useShop'

defineProps<{
  product: Product
  open: boolean
  index: number
}>()

const emit = defineEmits<{
  close: []
  step: [direction: number]
}>()
</script>
