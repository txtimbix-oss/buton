<template>
  <div class="cat-results">
    <!-- Десктоп: счётчик + сортировка над сеткой -->
    <div v-if="showToolbar" class="results-top">
      <span class="cat-results-count">{{ count }} {{ bouquetWord }}</span>
      <label class="sort-wrap-label">
        Сортировать:
        <select
          :value="sortBy"
          class="selectbox sort-select cat-sort-select"
          aria-label="Сортировка"
          @change="emit('update:sortBy', ($event.target as HTMLSelectElement).value)"
        >
          <option v-for="opt in sortOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
      </label>
    </div>

    <!-- Строка поиска -->
    <div v-if="searchQuery" class="search-bar-inline">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" width="16" height="16" class="cat-search-icon"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
      <span>«<b>{{ searchQuery }}</b>»</span>
      <button class="linkbtn" @click="emit('clearSearch')">✕ Очистить</button>
    </div>

    <!-- Skeleton -->
    <div v-if="pending" class="grid-cards cols-3">
      <div v-for="n in 9" :key="n" class="skeleton cat-skeleton" />
    </div>
    <template v-else-if="products.length > 0">
      <div class="grid-cards cols-3">
        <ProductCard v-for="p in products" :key="p.slug" :p="p" />
      </div>
    </template>
    <div v-else class="cat-empty">
      <div class="cat-empty__icon">🌿</div>
      <h3>Ничего не найдено</h3>
      <p class="cat-empty__text">Попробуйте изменить или сбросить фильтры</p>
      <button class="btn btn--ink cat-empty__btn" @click="emit('resetAll')">Сбросить все фильтры</button>
    </div>

    <!-- Пагинация -->
    <div v-if="totalPages > 1" class="pager">
      <button :disabled="currentPage === 1" @click="emit('update:currentPage', 1)">«</button>
      <button
        v-for="n in visiblePages" :key="n"
        :class="{ 'is-on': n === currentPage }"
        @click="emit('update:currentPage', n)"
      >{{ n }}</button>
      <button :disabled="currentPage === totalPages" @click="emit('update:currentPage', totalPages)">»</button>
    </div>
    <div v-if="totalPages > 1" class="pager__info">
      Страница {{ currentPage }} из {{ totalPages }} · {{ count }} букетов
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/composables/useShop'

interface SortOption { value: string; label: string }

withDefaults(defineProps<{
  pending: boolean
  products: Product[]
  count: number
  bouquetWord: string
  sortBy: string
  sortOptions: SortOption[]
  searchQuery: string
  totalPages: number
  currentPage: number
  visiblePages: number[]
  showToolbar?: boolean
}>(), {
  showToolbar: true,
})

const emit = defineEmits<{
  'update:sortBy': [value: string]
  'update:currentPage': [page: number]
  clearSearch: []
  resetAll: []
}>()
</script>

<style scoped>
.cat-results { min-width: 0; }

.results-top { display: none; }
.sort-wrap-label { display: flex; align-items: center; gap: 8px; font-size: 14px; color: var(--muted); }
.sort-select { width: auto; min-width: 0; }
.cat-sort-select { width: auto; }
.cat-results-count { color: var(--muted); }

.search-bar-inline {
  display: flex; align-items: center; gap: 10px;
  background: var(--paper-2); border-radius: var(--r-sm); padding: 12px 16px;
  margin-bottom: 18px; font-size: 14px; color: var(--muted);
}
.cat-search-icon { flex: none; }

.cat-skeleton { aspect-ratio: 4 / 5; }

.cat-empty { text-align: center; padding: 80px 0; }
.cat-empty h3 { font-size: 24px; margin: 12px 0 8px; }
.cat-empty__icon { font-size: 46px; opacity: .5; }
.cat-empty__text { color: var(--muted); }
.cat-empty__btn { margin-top: 16px; }

@media (min-width: 1101px) {
  .results-top {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 12px;
  }
}
</style>
