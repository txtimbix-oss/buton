<template>
  <Teleport to="body">
    <div v-if="open" class="qv-overlay is-open" @click.self="emit('close')">
      <div class="qv">
        <button class="xbtn qv__x" @click="emit('close')" aria-label="Закрыть">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
        <!-- Медиа -->
        <div class="qv__media">
          <BloomImg :kind="p.bloom" :label="p.name" />
          <ShopImg
            v-if="p.images?.[0] && !imgError"
            :src="p.images[0]" :alt="p.name"
            class="qv__media-img"
            sizes="390px"
          />
          <span v-if="p.tag" :class="`card__tag tag ${tagClass}`">{{ p.tag }}</span>
        </div>
        <!-- Инфо -->
        <div class="qv__info">
          <h3>{{ p.name }}</h3>
          <div class="qv__rate">
            <span class="stars">
              <svg v-for="n in 5" :key="n" class="qv__star" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3l2.6 5.6 6.1.8-4.5 4.2 1.2 6L12 17.8 6.6 19.6l1.2-6L3.3 9.4l6.1-.8L12 3z"/></svg>
            </span>
            <span class="qv__rating">{{ p.rating }} · {{ p.reviewCount }} отзыва</span>
          </div>
          <p class="qv__desc">{{ p.description || p.meta }}</p>
          <div class="qv__features">
            <span v-for="badge in serviceBadges" :key="`qv-${badge}`" class="tag tag--clay card__feature-tag">{{ badge }}</span>
          </div>
          <!-- рисуем только то, что реально есть в данных -->
          <div v-if="primarySizeLabel || shelfLife || sizeHeight || sizeWeight" class="qv__features qv__features--specs">
            <span v-if="primarySizeLabel" class="tag tag--clay card__feature-tag">Размер {{ primarySizeLabel }}</span>
            <span v-if="primarySizeLabel" class="tag tag--clay card__feature-tag">Цена за набор {{ formatRub(primarySizePrice) }}</span>
            <span v-if="shelfLife" class="tag tag--clay card__feature-tag">Срок {{ shelfLife }}</span>
            <span v-if="sizeHeight" class="tag tag--clay card__feature-tag">Высота {{ sizeHeight }}</span>
            <span v-if="sizeWeight" class="tag tag--clay card__feature-tag">Вес {{ sizeWeight }}</span>
          </div>
          <div class="qv__sizes">
            <button
              v-for="sz in p.sizes" :key="sz.label"
              class="pill" :class="{ 'is-on': qvSize === sz.label }"
              @click="emit('update:qvSize', sz.label)"
            >{{ sz.label }}</button>
          </div>
          <div class="qv__price">{{ formatRub(qvPrice) }}</div>
          <button class="btn btn--ink btn--block btn--lg" @click="emit('add')">
            В корзину · {{ formatRub(qvPrice) }}
            <svg class="qv__action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </button>
          <NuxtLink :to="`/product/${p.slug}`" class="btn btn--ghost btn--block" @click="emit('close')">
            Перейти к товару
            <svg class="qv__action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </NuxtLink>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { Product } from '~/composables/useShop'

defineProps<{
  p: Product
  open: boolean
  tagClass: string
  imgError: boolean
  serviceBadges: string[]
  primarySizeLabel: string
  primarySizePrice: number
  shelfLife: string
  sizeHeight: string
  sizeWeight: string
  qvSize: string
  qvPrice: number
  formatRub: (value: number) => string
}>()

const emit = defineEmits<{
  close: []
  add: []
  'update:qvSize': [label: string]
}>()
</script>

<style scoped>
.qv__media-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.qv__star { width: 15px; height: 15px; }
.qv__rating { color: var(--muted); }
.qv__desc { font-size: 14px; color: var(--muted); }
.qv__action-icon { width: 18px; height: 18px; }

.qv__features {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 9px;
}
.card__feature-tag {
  font-size: 10px;
  padding: 4px 10px;
  letter-spacing: .01em;
}
</style>
