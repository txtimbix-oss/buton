<template>
  <TransitionGroup name="cart-item" tag="div">
    <div v-for="(item, i) in items" :key="item.lineId" class="cline">
      <NuxtLink :to="`/product/${item.slug}`" class="cline__img">
        <ShopImg
          v-if="cartItemImage(item) && !imgErrors[item.lineId]"
          :src="cartItemImage(item)!"
          :alt="item.name"
          class="cart-item-image"
          sizes="96px"
          @error="emit('imageError', item.lineId)"
        />
        <BloomImg v-else :kind="item.bloom" />
      </NuxtLink>
      <div>
        <div class="cline__top cart-item-top">
          <div>
            <NuxtLink :to="`/product/${item.slug}`" class="cline__name">{{ item.name }}</NuxtLink>
            <div class="cline__meta">{{ item.meta }}</div>
            <div v-if="item.addons?.length" class="cline__addons">
              <span v-for="a in item.addons" :key="a" class="cline__addon-chip">+ {{ a }}</span>
            </div>
          </div>
          <button class="linkbtn" @click="emit('removeLine', item.lineId)" aria-label="Удалить">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" width="16" height="16"><path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13"/></svg>
          </button>
        </div>
        <div class="cline__bottom">
          <div class="qty">
            <button @click="emit('setLineQty', item.lineId, item.qty - 1)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="16" height="16"><path d="M5 12h14"/></svg>
            </button>
            <span>{{ item.qty }}</span>
            <button @click="emit('setLineQty', item.lineId, item.qty + 1)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="16" height="16"><path d="M12 5v14M5 12h14"/></svg>
            </button>
          </div>
          <div class="cline__price" :class="{ 'cline__price--discount': getVolumeDiscountPct(i) > 0 }">
            <span v-if="getVolumeDiscountPct(i) > 0" class="cline__price-old">
              {{ (item.price * item.qty).toLocaleString('ru-RU') }} ₽
            </span>
            <span class="cline__price-val">
              {{ (item.price * item.qty - volumeDiscountItems[i]).toLocaleString('ru-RU') }} ₽
            </span>
            <span v-if="getVolumeDiscountPct(i) > 0" class="vol-badge">
              −{{ getVolumeDiscountPct(i) }}%
            </span>
          </div>
        </div>
      </div>
    </div>
  </TransitionGroup>
</template>

<script setup lang="ts">
import type { CartLine } from '~/lib/cart/types'

defineProps<{
  items: CartLine[]
  imgErrors: Record<string, boolean>
  cartItemImage: (item: CartLine) => string | undefined
  volumeDiscountItems: number[]
  getVolumeDiscountPct: (index: number) => number
}>()

const emit = defineEmits<{
  removeLine: [lineId: string]
  setLineQty: [lineId: string, qty: number]
  imageError: [lineId: string]
}>()
</script>
