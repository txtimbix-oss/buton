<template>
  <div class="container">
    <nav class="breadcrumb">
      <NuxtLink to="/">Главная</NuxtLink><span class="sep">·</span><span>Каталог</span>
    </nav>
    <div class="cat-head">
      <span class="eyebrow">Свежая коллекция</span>
      <h1 class="cat-h1">Каталог букетов</h1>
      <p class="cat-sub">{{ count }} {{ bouquetWord }} · доставка 2 часа</p>
    </div>

    <!-- Мобиль: кнопки Фильтры + Сортировка -->
    <slot name="tools" />

    <!-- Строка 1: Коллекции -->
    <div v-if="activeCollections.length" class="coll-section">
      <span class="coll-label">Коллекции</span>
      <div class="chips chips--coll">
        <NuxtLink
          v-for="c in activeCollections" :key="c.slug"
          :to="`/catalog/${c.slug}`"
          class="chip-link"
        >
          {{ c.name }}
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        </NuxtLink>
      </div>
    </div>

    <!-- Строка 2: Фильтры -->
    <div class="chips">
      <button
        class="chip" :class="{ 'is-on': selectedChip === 'Все' && !activePresetLabel }"
        @click="emit('selectChip', 'Все')"
      >Все</button>

      <button
        v-for="chip in quickFilterChips" :key="chip"
        class="chip" :class="{ 'is-on': selectedChip === chip && !activePresetLabel }"
        @click="emit('selectChip', chip)"
      >{{ chip }}</button>

      <button
        v-if="activePresetLabel"
        class="chip is-on"
        @click="emit('resetAll')"
      >{{ activePresetLabel }} ✕</button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface CatalogCollection { slug: string; name: string }

defineProps<{
  count: number
  bouquetWord: string
  activeCollections: CatalogCollection[]
  quickFilterChips: string[]
  selectedChip: string
  activePresetLabel: string
}>()

const emit = defineEmits<{
  selectChip: [chip: string]
  resetAll: []
}>()
</script>

<style scoped>
.cat-head { padding-block: 24px 8px; }
.cat-h1   { font-size: clamp(30px, 6vw, 50px); margin-top: 4px; }
.cat-sub  { color: var(--muted); font-size: 14px; margin-top: 6px; }

.chip-link {
  flex: none;
  display: inline-flex; align-items: center; gap: 5px;
  padding: 9px 14px; border-radius: var(--r-pill);
  border: 1.5px solid var(--green); color: var(--green);
  background: transparent;
  font-size: 14px; font-weight: 600; white-space: nowrap;
  text-decoration: none;
  transition: background .16s var(--ease), color .16s;
}
.chip-link:hover { background: var(--green); color: var(--blush); }

.coll-section { margin-top: 0; }
.coll-label {
  display: block;
  font-size: 11px; font-weight: 600;
  text-transform: uppercase; letter-spacing: .18em;
  color: var(--muted);
  padding-bottom: 2px;
}
.chips--coll { padding-top: 8px; padding-bottom: 14px; }
</style>
