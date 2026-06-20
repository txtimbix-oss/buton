<template>
  <section class="sec sec--notop">
    <div class="container">
      <div class="sec__head">
        <div>
          <span class="eyebrow">{{ eyebrow }}</span>
          <h2>{{ title }}</h2>
        </div>
        <NuxtLink :to="linkTo" class="sec__link">
          {{ linkText }}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        </NuxtLink>
      </div>
      <div class="seasonal-grid">
        <NuxtLink
          v-for="entry in collections"
          :key="entry.key"
          class="season-card"
          :to="entry.to"
        >
          <div class="season-card__title">
            <span>{{ entry.title }}</span>
            <span class="tag tag--clay">{{ entry.productsCount }} вариантов</span>
          </div>
          <p>{{ entry.description }}</p>
          <span class="season-card__cta">Посмотреть подборку</span>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { HomeSeasonalCollection } from '~/constants/seasonCollections'

defineProps<{
  eyebrow: string
  title: string
  linkText: string
  linkTo: string
  collections: HomeSeasonalCollection[]
}>()
</script>
