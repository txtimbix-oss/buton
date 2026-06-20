<template>
  <main class="page">

    <!-- 404 -->
    <template v-if="state === 'missing'">
      <div class="container collection-missing">
        <div class="collection-missing__icon">🌸</div>
        <h1 class="collection-missing__title">Коллекция не найдена</h1>
        <p class="collection-missing__text">Возможно, она была перемещена или удалена</p>
        <NuxtLink to="/catalog" class="btn btn--ink">Перейти в каталог</NuxtLink>
      </div>
    </template>

    <template v-else-if="state === 'ready' && data">
      <div class="container">
        <!-- Хлебные крошки -->
        <nav class="breadcrumb">
          <NuxtLink to="/">Главная</NuxtLink><span class="sep">·</span>
          <NuxtLink to="/catalog">Каталог</NuxtLink><span class="sep">·</span>
          <span>{{ data.collection.name }}</span>
        </nav>

        <!-- Витрина коллекции -->
        <CollectionHero
          :name="data.collection.name"
          :intro="collectionIntro"
          :copy="collectionCopy"
          :product-count="data.products.length"
          :bouquet-word="bouquetWord"
          :price-max="data.collection.priceMax"
          :tag="data.collection.tag"
          :hero-image="heroImage"
          :hero-thumbs="heroThumbs"
          :gift-now-link="giftNowLink"
        />

        <CollectionSeoBlock
          :collection-name="data.collection.name"
          :reasons="collectionReasons"
          :trust="collectionTrust"
          :custom-link="customLink"
        />
      </div>

      <!-- Сетка товаров -->
      <div class="container">
        <div v-if="!data.products.length" class="collection-empty">
          <div class="collection-empty__icon">🌿</div>
          <div class="collection-empty__title">В коллекции пока нет товаров</div>
          <div class="collection-empty__desc">Загляните в основной каталог</div>
          <NuxtLink to="/catalog" class="btn btn--ink">Перейти в каталог</NuxtLink>
        </div>
        <div v-else class="grid-cards cols-3">
          <ProductCard v-for="p in data.products" :key="p.slug" :p="p" />
        </div>
      </div>
    </template>

    <!-- Скелетон -->
    <template v-else>
      <div class="container collection-skeleton">
        <div class="skeleton collection-skeleton__title" />
        <div class="skeleton collection-skeleton__meta" />
        <div class="grid-cards cols-3">
          <div v-for="i in 9" :key="i" class="skeleton collection-skeleton__card" />
        </div>
      </div>
    </template>

  </main>
</template>

<script setup lang="ts">
import CollectionHero from '~/components/catalog/CollectionHero.vue'
import CollectionSeoBlock from '~/components/catalog/CollectionSeoBlock.vue'

const route = useRoute()
const settings = useSettings()
const { siteUrl, setCanonical, jsonLd } = useSeo()

const {
  data,
  pending,
  state,
  heroImage,
  heroThumbs,
  collectionIntro,
  collectionCopy,
  collectionReasons,
  collectionTrust,
  giftNowLink,
  customLink,
  bouquetWord,
  pageTitle,
  pageDesc,
} = useCatalogCollectionPage({
  collectionSlug: () => String(route.params.collectionSlug),
  settings,
  siteUrl,
  setCanonical,
  jsonLd,
})

useSeoMeta(() => ({
  title:         pageTitle.value,
  description:   pageDesc.value,
  ogTitle:       pageTitle.value,
  ogDescription: pageDesc.value,
  ogType:        'website',
}))
</script>

<style scoped>
.collection-missing {
  text-align: center;
  padding-block: 80px;
}

.collection-missing__icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.collection-missing__title {
  font-size: 24px;
  margin-bottom: 8px;
}

.collection-missing__text {
  color: var(--muted);
  margin-bottom: 24px;
}

.collection-empty {
  text-align: center;
  padding: 60px 0;
}

.collection-empty__icon {
  font-size: 40px;
  margin-bottom: 12px;
}

.collection-empty__title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 6px;
}

.collection-empty__desc {
  color: var(--muted);
  margin-bottom: 20px;
}

.collection-skeleton {
  padding-top: 32px;
  padding-bottom: 64px;
}

.collection-skeleton__title {
  height: 36px;
  width: 260px;
  border-radius: 4px;
  margin-bottom: 12px;
}

.collection-skeleton__meta {
  height: 18px;
  width: 180px;
  border-radius: 3px;
  margin-bottom: 32px;
}

.collection-skeleton__card {
  aspect-ratio: 4 / 5;
}
</style>
