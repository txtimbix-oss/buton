<template>
  <section class="collection-hero">
    <div class="collection-hero__content">
      <div class="collection-meta">
        <span class="eyebrow">Коллекция</span>
        <h1 class="coll-h1">{{ name }}</h1>
        <p v-if="intro" class="coll-desc">{{ intro }}</p>
        <p class="coll-sub">{{ productCount }} {{ bouquetWord }} · доставка 2 часа</p>
      </div>

      <p class="collection-text">
        {{ copy }}
      </p>

      <div class="collection-tags">
        <span class="tag tag--green">{{ bouquetWord }} в подборке</span>
        <span v-if="priceMax" class="tag tag--clay">до {{ priceMax.toLocaleString('ru-RU') }} ₽</span>
        <span class="tag tag--clay">{{ tag || 'Универсально' }}</span>
      </div>

      <div class="collection-hero__actions">
        <NuxtLink :to="giftNowLink" class="btn btn--ink">Подарить сейчас</NuxtLink>
        <NuxtLink to="/custom" class="btn btn--ghost">Собрать подарок</NuxtLink>
        <NuxtLink to="/catalog" class="btn btn--sm btn--light coll-back">← Весь каталог</NuxtLink>
      </div>
    </div>

    <div class="collection-hero__media">
      <div class="collection-hero__main">
        <ShopImg
          v-if="heroImage"
          class="collection-hero__img"
          :src="heroImage"
          :alt="name"
          eager
        />
        <BloomImg
          v-else
          class="collection-hero__fallback"
          kind="rose"
          :label="name"
        />
      </div>

      <div v-if="heroThumbs.length" class="collection-hero__thumbs">
        <NuxtLink
          v-for="thumb in heroThumbs"
          :key="`${thumb.slug}-${thumb.src}`"
          :to="`/product/${thumb.slug}`"
          class="collection-thumb"
          :title="thumb.name"
        >
          <ShopImg :src="thumb.src" :alt="thumb.name" class="collection-thumb__img" />
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface HeroThumb { slug: string; src: string; name: string }

defineProps<{
  name: string
  intro: string
  copy: string
  productCount: number
  bouquetWord: string
  priceMax?: number
  tag?: string
  heroImage: string
  heroThumbs: HeroThumb[]
  giftNowLink: string
}>()
</script>

<style scoped>
.coll-h1   { font-size: clamp(28px, 5vw, 46px); margin-top: 6px; }
.coll-desc { color: var(--muted); font-size: 15px; line-height: 1.65; margin-top: 10px; max-width: 600px; }
.coll-sub  { color: var(--muted); font-size: 14px; margin-top: 6px; }
.coll-back { align-self: flex-start; flex-shrink: 0; }

.collection-hero {
  display: grid;
  grid-template-columns: 1.1fr minmax(280px, 0.9fr);
  gap: 24px 26px;
  align-items: stretch;
  padding-top: 24px;
}

.collection-hero__content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.collection-text {
  color: var(--muted);
  font-size: 14px;
  line-height: 1.7;
  max-width: 62ch;
}

.collection-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.collection-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.collection-hero__actions .btn {
  flex: none;
}

.collection-hero__media {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.collection-hero__main {
  border-radius: var(--r-md);
  overflow: hidden;
  border: 1px solid var(--line);
  background: var(--white);
}

.collection-hero__img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  display: block;
}

.collection-hero__fallback {
  width: 100%;
  aspect-ratio: 4 / 3;
}

.collection-hero__thumbs {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.collection-thumb {
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--line);
}

.collection-thumb:hover {
  border-color: var(--green);
}

.collection-thumb__img {
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  display: block;
}

@media (max-width: 980px) {
  .collection-hero {
    grid-template-columns: 1fr;
  }
  .collection-hero__thumbs {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 600px) {
  .coll-back {
    display: none;
  }
}
</style>
