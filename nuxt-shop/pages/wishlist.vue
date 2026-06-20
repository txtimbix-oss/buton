<template>
  <main class="page">

    <div class="container">
      <nav class="breadcrumb">
        <NuxtLink to="/">Главная</NuxtLink><span class="sep">·</span><span>Избранное</span>
      </nav>
      <div class="sec__head">
        <div>
          <h1 class="h-page">Избранное</h1>
          <p class="text-muted wishlist__count">{{ wishlistProducts.length }} {{ bouquetWord }}</p>
        </div>
        <button v-if="wishlistProducts.length" class="btn btn--ghost" @click="clearAll">Очистить список</button>
      </div>
    </div>

    <!-- Загрузка -->
    <section v-if="pending" class="sec">
      <div class="container">
        <div class="grid-cards">
          <div v-for="n in 4" :key="n" class="skeleton wishlist__skeleton" />
        </div>
      </div>
    </section>

    <!-- Пусто -->
    <section v-else-if="wishlistProducts.length === 0" class="sec">
      <div class="container wishlist__empty">
          <div class="wishlist__empty-icon">🌸</div>
          <h2 class="h-section wishlist__empty-title">Список пуст</h2>
          <p class="wishlist__empty-text">
          Нажмите ♥ на карточке букета, чтобы сохранить его.
        </p>
        <NuxtLink to="/catalog" class="btn btn--ink">Перейти в каталог →</NuxtLink>
      </div>
    </section>

    <!-- Список -->
    <section v-else class="sec">
      <div class="container">
        <div class="grid-cards">
          <ProductCard v-for="p in wishlistProducts" :key="p.slug" :p="p" />
        </div>
        <div class="wishlist__note">
          <AppIcon name="heart" />
            <p class="wishlist__note-text">
              Букеты хранятся на этом устройстве. Чтобы поделиться — скопируйте адрес страницы.
            </p>
          </div>
      </div>
    </section>

    <!-- Может понравится -->
    <section v-if="suggestions.length" class="sec sec--notop">
      <div class="container">
        <div class="sec__head">
          <div>
            <span class="eyebrow">Рекомендуем</span>
            <h2>Может понравиться</h2>
          </div>
          <NuxtLink to="/catalog" class="sec__link">
            В каталог
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </NuxtLink>
        </div>
        <div class="grid-cards">
          <ProductCard v-for="p in suggestions" :key="p.slug" :p="p" />
        </div>
      </div>
    </section>

  </main>
</template>

<script setup lang="ts">
import { useStorefrontProductsQuery } from '~/composables/useStorefrontProductsQuery'
import { useWishlistPageState } from '~/composables/useWishlistPageState'

const settings = useSettings()
const { setCanonical } = useSeo()
useSeoMeta(() => ({ title: `Избранное — ${settings.value.storeName}`, robots: 'noindex,follow' }))
setCanonical('/wishlist')

const { products: allProducts, pending } = useStorefrontProductsQuery()
const { wishlistProducts, suggestions, bouquetWord, clearAll } = useWishlistPageState({
  allProducts,
})
</script>

<style scoped>
.wishlist__count {
  margin-top: 8px;
}

.wishlist__skeleton {
  aspect-ratio: 4 / 5;
}

.wishlist__empty {
  text-align: center;
  padding-block: 60px;
}

.wishlist__empty-icon {
  font-size: 60px;
  margin-bottom: 20px;
}

.wishlist__empty-title {
  margin-bottom: 14px;
}

.wishlist__empty-text {
  color: var(--muted);
  max-width: 400px;
  margin: 0 auto 28px;
  font-size: clamp(15px, 2vw, 17px);
}

.wishlist__note {
  margin-top: 48px;
  padding: 24px;
  background: var(--paper-2);
  border-radius: var(--r-md);
  display: flex;
  gap: 16px;
  align-items: center;
}

.wishlist__note-text {
  font-size: 14px;
  color: var(--muted);
  margin: 0;
}
</style>
