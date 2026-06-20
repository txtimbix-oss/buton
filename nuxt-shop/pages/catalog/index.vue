<template>
  <main class="page">

    <!-- Шапка каталога -->
    <CatalogPageHero
      :count="filteredProducts.length"
      :bouquet-word="bouquetWord"
      :active-collections="activeCollections"
      :quick-filter-chips="quickFilterChips"
      :selected-chip="selectedChip"
      :active-preset-label="activePresetLabel"
      @select-chip="selectChip"
      @reset-all="resetAll"
    >
      <template #tools>
        <CatalogToolbar
          :active-filters-count="activeFiltersCount"
          :sort-by="sortBy"
          :sort-options="sortOptions"
          @open-drawer="filterDrawerOpen = true"
          @update:sort-by="sortBy = $event"
        />
      </template>
    </CatalogPageHero>

    <!-- Тело каталога -->
    <div class="container cat-body">
      <!-- Фильтры (десктоп) -->
      <aside class="cat-aside">
        <FiltersPanel
          :in-drawer="false"
          :active-filters-count="activeFiltersCount"
          :selected-colors="selectedColors"
          :selected-categories="selectedCategories"
          :selected-occasions="selectedOccasions"
          :selected-seasons="selectedSeasons"
          :price-min="priceMin"
          :price-max="priceMax"
          :selected-composition="selectedComposition"
          :selected-sizes="selectedSizes"
          :occasion-options="occasionOptions"
          :season-options="seasonOptions"
          :filtered-count="filteredProducts.length"
          :price-min-const="PRICE_MIN"
          :price-max-const="PRICE_MAX"
          :available-today="showOnlyAvailableToday"
          :delivery-today="deliveryTodayOnly"
          :categories="categoriesData ?? []"
          :composition-options="compositionOptions"
          :size-options="sizeOptions"
          @toggle-color="toggleColor"
          @toggle-category="toggleCategory"
          @toggle-occasion="toggleOccasion"
          @toggle-season="toggleSeason"
          @update-price-min="priceMin = $event"
          @update-price-max="priceMax = $event"
          @toggle-composition="toggleComposition"
          @toggle-size="toggleSize"
          @toggle-available-today="showOnlyAvailableToday = $event"
          @toggle-delivery-today="deliveryTodayOnly = $event"
          @reset="resetFilters"
        />
      </aside>

      <!-- Сетка товаров -->
      <CatalogProductGrid
        :pending="pending"
        :products="pagedProducts"
        :count="filteredProducts.length"
        :bouquet-word="bouquetWord"
        :sort-by="sortBy"
        :sort-options="sortOptions"
        :search-query="searchQuery"
        :total-pages="totalPages"
        :current-page="currentPage"
        :visible-pages="visiblePages"
        @update:sort-by="sortBy = $event"
        @update:current-page="currentPage = $event"
        @clear-search="searchQuery = ''"
        @reset-all="resetAll"
      />
    </div>

    <!-- МОБИЛЬНЫЙ DRAWER ФИЛЬТРОВ -->
    <Teleport to="body">
      <Transition name="overlay-fade">
        <div v-if="filterDrawerOpen" class="overlay is-open" @click="filterDrawerOpen = false" />
      </Transition>
      <Transition name="drawer-up">
      <aside v-if="filterDrawerOpen" class="drawer drawer--sheet is-open cat-drawer">
          <div class="sheet-handle" />
          <div class="drawer__head">
            <h3>Фильтры <span v-if="activeFiltersCount > 0" class="cat-drawer-count">({{ activeFiltersCount }})</span></h3>
            <button class="xbtn" @click="filterDrawerOpen = false">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" width="18" height="18"><path d="M6 6l12 12M18 6L6 18"/></svg>
            </button>
          </div>
          <div class="drawer__body">
            <FiltersPanel
          :in-drawer="true"
          :active-filters-count="activeFiltersCount"
          :selected-colors="selectedColors"
          :selected-categories="selectedCategories"
          :selected-occasions="selectedOccasions"
          :selected-seasons="selectedSeasons"
          :price-min="priceMin"
          :price-max="priceMax"
          :selected-composition="selectedComposition"
          :selected-sizes="selectedSizes"
          :occasion-options="occasionOptions"
          :season-options="seasonOptions"
          :filtered-count="filteredProducts.length"
          :price-min-const="PRICE_MIN"
          :price-max-const="PRICE_MAX"
          :available-today="showOnlyAvailableToday"
          :delivery-today="deliveryTodayOnly"
          :categories="categoriesData ?? []"
          :composition-options="compositionOptions"
          :size-options="sizeOptions"
          @toggle-color="toggleColor"
          @toggle-category="toggleCategory"
          @toggle-occasion="toggleOccasion"
          @toggle-season="toggleSeason"
          @update-price-min="priceMin = $event"
          @update-price-max="priceMax = $event"
          @toggle-composition="toggleComposition"
          @toggle-size="toggleSize"
          @toggle-available-today="showOnlyAvailableToday = $event"
          @toggle-delivery-today="deliveryTodayOnly = $event"
          @reset="resetFilters"
          @close="filterDrawerOpen = false"
        />
          </div>
          <div class="drawer__foot">
            <button class="btn btn--ink btn--block btn--lg" @click="filterDrawerOpen = false">
              Показать {{ filteredProducts.length }} {{ bouquetWord }}
            </button>
          </div>
        </aside>
      </Transition>
    </Teleport>

    <!-- SEO-текст -->
    <div v-if="safeCatalogSeoText" class="seo-text container" v-html="safeCatalogSeoText" />

  </main>
</template>

<script setup lang="ts">
import { buildCatalogBreadcrumbSchema, buildCatalogItemListSchema } from '~/lib/catalog/seo'
import { useCatalogPageQueries } from '~/composables/useCatalogPageQueries'
import { sanitizeHtml } from '~/lib/sanitizeHtml'

const settings = useSettings()
const { siteUrl, setCanonical, jsonLd } = useSeo()
const safeCatalogSeoText = computed(() => sanitizeHtml(settings.value.catalogSeoText))

useSeoMeta(() => ({
  title:       `Каталог букетов — ${settings.value.storeName}`,
  description: settings.value.metaDescCatalog,
  ogTitle:     `Каталог авторских букетов — ${settings.value.storeName}`,
  ogDescription: settings.value.metaDescCatalog,
  ogType:      'website',
}))

// canonical всегда /catalog — без query-фильтров
setCanonical('/catalog')

const route = useRoute()
const { allProducts, pending, categoriesData, collectionsData } = useCatalogPageQueries()

const {
  PRICE_MIN,
  PRICE_MAX,
  sortOptions,
  activeCollections,
  quickFilterChips,
  compositionOptions,
  occasionOptions,
  seasonOptions,
  sizeOptions,
  selectedColors,
  selectedCategories,
  selectedOccasions,
  selectedSeasons,
  priceMin,
  priceMax,
  selectedChip,
  selectedComposition,
  selectedSizes,
  showOnlyAvailableToday,
  deliveryTodayOnly,
  sortBy,
  filterDrawerOpen,
  searchQuery,
  activePresetLabel,
  currentPage,
  filteredProducts,
  totalPages,
  pagedProducts,
  visiblePages,
  bouquetWord,
  activeFiltersCount,
  selectChip,
  toggleColor,
  toggleCategory,
  toggleOccasion,
  toggleSeason,
  toggleComposition,
  toggleSize,
  resetFilters,
  resetAll,
} = useCatalogPageState({
  settings,
  allProducts,
  categories: categoriesData,
  collections: collectionsData,
  route,
})

const catalogBreadcrumbSchema = computed(() => buildCatalogBreadcrumbSchema(siteUrl.value))
const catalogItemListSchema = computed(() => buildCatalogItemListSchema(siteUrl.value, filteredProducts.value))

watchEffect(() => {
  jsonLd([catalogBreadcrumbSchema.value, catalogItemListSchema.value])
})

// Expose to FiltersPanel via defineExpose not needed — using props/emits
</script>

<style scoped>
/* ─── Тело каталога ──────────────────────────────────────── */
.cat-body { display: grid; gap: 40px; padding-block: 24px 64px; align-items: start; }
.cat-aside { display: none; }

/* ─── Drawer-переходы ────────────────────────────────────── */
.overlay-fade-enter-active, .overlay-fade-leave-active { transition: opacity .28s; }
.overlay-fade-enter-from,   .overlay-fade-leave-to     { opacity: 0; }
.drawer-up-enter-active { transition: transform .34s cubic-bezier(.22,1,.36,1); }
.drawer-up-leave-active { transition: transform .26s ease-in; }
.drawer-up-enter-from, .drawer-up-leave-to { transform: translateY(101%); }

/* ─── SEO-текст ──────────────────────────────────────────── */
.seo-text { padding: 48px 0 32px; color: var(--muted); font-size: 14px; line-height: 1.8; border-top: 1px solid var(--line); }
.seo-text :deep(h2) { font-size: 18px; font-weight: 600; color: var(--ink); margin-bottom: 12px; }
.seo-text :deep(p)  { margin-bottom: 10px; }

/* ─── Десктоп ────────────────────────────────────────────── */
@media (min-width: 1101px) {
  .cat-body    { grid-template-columns: 256px 1fr; }
  .cat-aside   { display: block; position: sticky; top: calc(var(--header-h) + 16px); }
}

.cat-drawer {
  max-height: 90vh;
}

.cat-drawer-count {
  font-size: 14px;
  font-weight: 400;
  color: var(--muted);
}
</style>
