<template>
  <article class="card" :data-slug="p.slug">
    <div class="card__media">
      <NuxtLink :to="`/product/${p.slug}`" class="card__media-link" :aria-label="p.name">
        <BloomImg :kind="p.bloom" />
        <ShopImg
          v-if="p.images?.[0] && !imgError"
          :src="p.images[0]"
          :alt="p.name"
          class="card__real-img"
          sizes="(max-width: 768px) 47vw, (max-width: 1100px) 30vw, 260px"
          @error="imgError = true"
        />
      </NuxtLink>
      <!-- тег -->
      <span v-if="p.tag" :class="`card__tag tag ${tagClass}`">{{ p.tag }}</span>
      <!-- избранное -->
      <button
        class="card__fav" :class="{ 'is-on': isFaved }"
        :title="isFaved ? 'Убрать из избранного' : 'В избранное'"
        @click.prevent="wishlist.toggle(p.slug)"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M12 20.3l-1.45-1.32C5.4 14.24 2 11.16 2 7.5 2 4.42 4.42 2 7.5 2c1.74 0 3.41.81 4.5 2.09C13.09 2.81 14.76 2 16.5 2 19.58 2 22 4.42 22 7.5c0 3.66-3.4 6.74-8.55 11.49L12 20.3z"/></svg>
      </button>
      <!-- быстрый просмотр (десктоп hover) -->
      <div class="card__quick">
        <button class="btn btn--light btn--sm" @click.prevent="qvOpen = true">Быстрый просмотр</button>
      </div>
    </div>

    <div class="card__body">
      <NuxtLink :to="`/product/${p.slug}`">
        <h3 class="card__name">{{ p.name }}</h3>
      </NuxtLink>
      <div class="card__meta">{{ p.meta }}</div>
      <div class="card__flags" v-if="isTopPick || isPopular">
        <span v-if="isTopPick" class="tag tag--green">Лучший выбор</span>
        <span v-if="isPopular" class="tag tag--blush">Популярно</span>
      </div>
      <div v-if="compositionSummary" class="card__composition">
        <span>Состав: {{ compositionSummary }}</span>
      </div>
      <div class="card__specs">
        <div><strong>Размер</strong> {{ primarySizeLabel }}</div>
        <div><strong>Цена за набор</strong> {{ formatRub(primarySizePrice) }}</div>
        <div><strong>Срок стояния</strong> {{ shelfLife }}</div>
        <div><strong>Высота</strong> {{ sizeHeight }}</div>
        <div><strong>Вес</strong> {{ sizeWeight }}</div>
        <div><strong>Упаковка</strong> {{ packagingHint }}</div>
      </div>
      <div class="card__features">
        <span v-for="badge in serviceBadges" :key="badge" class="tag tag--clay card__feature-tag">{{ badge }}</span>
      </div>
      <div class="card__row">
        <div class="card__price">
          <b>от {{ formatRub(primarySizePrice) }}</b>
          <span v-if="p.oldPrice" class="old">{{ formatRub(p.oldPrice) }}</span>
        </div>
        <button
          class="card__add" :class="{ 'is-done': justAdded }"
          aria-label="В корзину"
          @click.prevent="add"
        >
          <svg v-if="!justAdded" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7"/></svg>
          <span class="card__add-label">{{ justAdded ? 'Добавлено' : 'В корзину' }}</span>
        </button>
      </div>
    </div>

    <!-- QuickView модал — локальный, без глобального состояния -->
    <ProductQuickView
      :p="p"
      :open="qvOpen"
      :tag-class="tagClass"
      :img-error="imgError"
      :service-badges="serviceBadges"
      :primary-size-label="primarySizeLabel"
      :primary-size-price="primarySizePrice"
      :shelf-life="shelfLife"
      :size-height="sizeHeight"
      :size-weight="sizeWeight"
      :qv-size="qvSize"
      :qv-price="qvPrice"
      :format-rub="formatRub"
      @close="qvOpen = false"
      @add="addFromQv"
      @update:qv-size="qvSize = $event"
    />
  </article>
</template>

<script setup lang="ts">
import type { Product } from '~/composables/useShop'

const props = defineProps<{ p: Product }>()
const settings = useSettings()

const { addLine } = useCart()
const { show }    = useToast()
const wishlist    = useWishlist()
const isFaved     = computed(() => wishlist.has(props.p.slug).value)

const {
  imgError,
  justAdded,
  qvOpen,
  qvSize,
  qvPrice,
  isTopPick,
  isPopular,
  primarySizeLabel,
  primarySizePrice,
  compositionSummary,
  shelfLife,
  sizeHeight,
  sizeWeight,
  packagingHint,
  serviceBadges,
  tagClass,
  formatRub,
  add,
  addFromQv,
} = useProductCardState(() => props.p, {
  addLine,
  showToast: show,
  settings,
})
</script>

<style scoped>
:deep(.card__real-img) {
  position: absolute; inset: 0; width: 100%; height: 100%;
  object-fit: cover; border-radius: inherit;
}

.card__flags,
.card__features {
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
.card__composition {
  margin-top: 8px;
  color: var(--muted);
  font-size: 12px;
}
.card__specs {
  display: grid;
  grid-template-columns: 1fr;
  gap: 6px;
  margin-top: 10px;
  font-size: 12px;
  color: var(--muted);
}
.card__specs strong {
  font-weight: 600;
  color: var(--ink);
}
</style>
