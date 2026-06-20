<template>
  <div class="page-wrap">

    <!-- Герой с таймером -->
    <section class="sale-hero">
      <div class="eyebrow sale-hero__eyebrow">Спецпредложения</div>
      <h1 class="sale-hero__title">Неделя весенних скидок</h1>
      <p class="sale-hero__lead">
        Любимые букеты до −20%. Успейте, пока сезонные цветы в наличии.
      </p>
      <div class="sale-timer">
        <div v-for="seg in timer" :key="seg.label" class="sale-timer__seg">
          <div class="sale-timer__n">{{ seg.value }}</div>
          <div class="sale-timer__l">{{ seg.label }}</div>
        </div>
      </div>
    </section>

    <!-- Фильтр-чипсы + сетка -->
    <section class="section-pad sale-section">
      <div class="sale-filters">
        <button
          v-for="chip in chips" :key="chip"
          class="tag chip-btn"
          :class="['tag chip-btn sale-chip', activeChip === chip ? 'tag--green sale-chip--active' : 'sale-chip--inactive']"
          @click="selectChip(chip)"
        >{{ chip }}</button>
      </div>

      <div v-if="pending" class="grid-4">
        <div v-for="n in 8" :key="n" class="skeleton sale-skeleton" />
      </div>
      <div v-else-if="saleProducts.length" class="grid-4">
        <ProductCard v-for="p in saleProducts" :key="p.slug" :p="p" />
      </div>
      <div v-else class="empty-state">
        <div class="sale-empty__icon">🌿</div>
        <h3 class="sale-empty__title">Нет товаров по фильтру</h3>
        <button class="btn btn--ink" @click="resetFilters">Сбросить</button>
      </div>
    </section>

  </div>
</template>

<script setup lang="ts">
import { useSalePageState } from '~/composables/useSalePageState'
import { useStorefrontProductsQuery } from '~/composables/useStorefrontProductsQuery'

const settings = useSettings()
const { setCanonical } = useSeo()

useSeoMeta(() => ({
  title:       `Акции и скидки — ${settings.value.storeName}`,
  description: `Букеты со скидкой до 20% в ${settings.value.storeName}. Сезонные предложения на свежие цветы с доставкой по СПб.`,
  robots:      'index,follow',
}))
setCanonical('/sale')

const { products: allProducts, pending } = useStorefrontProductsQuery()

const {
  chips,
  activeChip,
  saleProducts,
  timer,
  selectChip,
  resetFilters,
} = useSalePageState({
  allProducts,
})
</script>

<style scoped>
.sale-hero {
  background: var(--green); color: #EFE7D2;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  text-align: center; padding: 80px 60px;
}
.sale-hero__eyebrow { color: var(--blush); }
.sale-hero__title { font-size: 60px; color: #FBF7EE; margin: 16px 0 14px; }
.sale-hero__lead { font-size: 17px; opacity: .85; max-width: 520px; margin-bottom: 28px; }

.sale-section { padding-bottom: 64px; }
.sale-filters {
  display: flex;
  gap: 10px;
  margin-bottom: 28px;
  flex-wrap: wrap;
}
.sale-timer {
  display: flex; gap: 14px;
}
.sale-timer__seg {
  background: rgba(255,255,255,.08); border-radius: 4px;
  padding: 14px 20px; min-width: 78px; text-align: center;
}
.sale-timer__n { font-family: var(--serif); font-size: 34px; color: #FBF7EE; }
.sale-timer__l { font-size: 12px; letter-spacing: .1em; text-transform: uppercase; opacity: .7; margin-top: 4px; }

.chip-btn { transition: background .15s, color .15s; }
.sale-chip { font-size: 14px; padding: 9px 18px; border: none; cursor: pointer; }
.sale-chip--active {}
.sale-chip--inactive { background: var(--card); }
.sale-skeleton { aspect-ratio: 4 / 5; border-radius: 3px; }
.empty-state { text-align: center; padding: 80px 0; }
.skeleton { background: linear-gradient(90deg,var(--paper-2) 25%,var(--sand) 50%,var(--paper-2) 75%); background-size:200% 100%; animation:shimmer 1.4s infinite; }
.sale-empty__icon { font-size: 48px; margin-bottom: 16px; }
.sale-empty__title { font-size: 26px; margin-bottom: 10px; }
@keyframes shimmer { to { background-position:-200% 0 } }

@media (max-width: 1100px) {
  .sale-hero { padding: 56px 32px; }
  .sale-hero h1 { font-size: 42px !important; }
}
@media (max-width: 768px) {
  .sale-hero { padding: 40px 20px; }
  .sale-hero h1 { font-size: 32px !important; }
  .sale-timer { gap: 8px; }
  .sale-timer__seg { padding: 10px 12px; min-width: 58px; }
  .sale-timer__n { font-size: 26px; }
  .grid-4 { grid-template-columns: repeat(2, 1fr); }
}
</style>
