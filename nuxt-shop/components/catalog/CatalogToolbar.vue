<template>
  <div class="cat-tools">
    <button class="btn btn--ghost cat-tools-btn" @click="emit('openDrawer')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" width="17" height="17"><path d="M3 6h18M7 12h10M11 18h2"/></svg>
      Фильтры
      <span v-if="activeFiltersCount > 0" class="count cat-tools-count">&nbsp;({{ activeFiltersCount }})</span>
    </button>
    <select
      :value="sortBy"
      class="selectbox sort-select cat-sort-select--mobile"
      aria-label="Сортировка"
      @change="emit('update:sortBy', ($event.target as HTMLSelectElement).value)"
    >
      <option v-for="opt in sortOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
    </select>
  </div>
</template>

<script setup lang="ts">
interface SortOption { value: string; label: string }

defineProps<{
  activeFiltersCount: number
  sortBy: string
  sortOptions: SortOption[]
}>()

const emit = defineEmits<{
  openDrawer: []
  'update:sortBy': [value: string]
}>()
</script>

<style scoped>
.cat-tools { display: flex; gap: 10px; margin-bottom: 4px; }
.cat-tools .btn { flex: 1; font-size: 14px; padding: 11px 14px; justify-content: center; }
.cat-tools .sort-select { flex: 1; }
.cat-tools-btn { flex: 1; }
.cat-tools-count { color: var(--clay); font-weight: 700; }
.cat-sort-select--mobile { flex: 1; }

@media (min-width: 1101px) {
  .cat-tools { display: none; }
}
</style>
