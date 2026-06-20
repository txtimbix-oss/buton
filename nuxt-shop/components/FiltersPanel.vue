<template>
  <div class="fp">
    <div class="fp__head">
      <span class="fp__title">
        Фильтры
        <span v-if="activeFiltersCount > 0" class="filter-badge">{{ activeFiltersCount }}</span>
      </span>
      <button v-if="activeFiltersCount > 0" class="reset-btn" @click="$emit('reset')">Сбросить</button>
    </div>

    <!-- Категории / тип букета -->
    <div v-if="categories && categories.length" class="filter-block">
      <div class="filter-block__title">Категории</div>
      <label
        v-for="cat in categories" :key="cat.bloom"
        class="filter-check"
        @click.prevent="$emit('toggle-category', cat.bloom)"
      >
        <span class="filter-check__box" :class="{ active: selectedCategories.includes(cat.bloom) }">
          <svg v-if="selectedCategories.includes(cat.bloom)" width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4l3 3 5-6" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
        {{ cat.name }}
      </label>
    </div>

    <!-- Повод -->
    <div class="filter-block">
      <div class="filter-block__title">Повод</div>
      <label
        v-for="opt in occasionOptions"
        :key="opt"
        class="filter-check"
        @click.prevent="$emit('toggle-occasion', opt)"
      >
        <span class="filter-check__box" :class="{ active: selectedOccasions.includes(opt) }">
          <svg v-if="selectedOccasions.includes(opt)" width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4l3 3 5-6" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
        {{ opt }}
      </label>
    </div>

    <!-- Цветовая гамма -->
    <div class="filter-block">
      <div class="filter-block__title">Цветовая гамма</div>
      <div class="filter-panel__swatches">
        <button
          v-for="s in swatches" :key="s"
          :class="`bloom bloom--${s} swatch-btn ${selectedColors.includes(s) ? 'swatch-btn--active' : ''}`"
          :title="swatchLabels[s]"
          @click="$emit('toggle-color', s)"
        />
      </div>
    </div>

    <!-- Цена -->
    <div class="filter-block">
      <div class="filter-block__title">Цена, ₽</div>
      <div class="price-range">
        <div class="price-range__track">
          <div class="price-range__fill" />
        </div>
        <input
          type="range" :value="priceMin" :min="priceMinConst" :max="priceMax - 100" step="100"
          class="price-range__thumb"
          @input="$emit('update-price-min', +($event.target as HTMLInputElement).value)"
        />
        <input
          type="range" :value="priceMax" :min="priceMin + 100" :max="priceMaxConst" step="100"
          class="price-range__thumb"
          @input="$emit('update-price-max', +($event.target as HTMLInputElement).value)"
        />
      </div>
      <div class="filter-panel__range">
        <span>{{ priceMin.toLocaleString('ru-RU') }} ₽</span>
        <span>{{ priceMax.toLocaleString('ru-RU') }} ₽</span>
      </div>
    </div>

    <!-- Тип цветка -->
    <div class="filter-block">
      <div class="filter-block__title">Тип цветка</div>
      <label
        v-for="opt in compositionOptions" :key="opt"
        class="filter-check"
        @click.prevent="$emit('toggle-composition', opt)"
      >
        <span class="filter-check__box" :class="{ active: selectedComposition.includes(opt) }">
          <svg v-if="selectedComposition.includes(opt)" width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4l3 3 5-6" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
        {{ opt }}
      </label>
    </div>

    <!-- Сезонность -->
    <div class="filter-block">
      <div class="filter-block__title">Сезонность</div>
      <label
        v-for="opt in seasonOptions"
        :key="opt"
        class="filter-check"
        @click.prevent="$emit('toggle-season', opt)"
      >
        <span class="filter-check__box" :class="{ active: selectedSeasons.includes(opt) }">
          <svg v-if="selectedSeasons.includes(opt)" width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4l3 3 5-6" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
        {{ opt }}
      </label>
    </div>

    <!-- Размер -->
    <div class="filter-block filter-block--no-border">
      <div class="filter-block__title">Размер</div>
      <div class="filter-panel__sizes">
        <button
          v-for="sz in sizeOptions" :key="sz"
          class="size-btn" :class="{ active: selectedSizes.includes(sz) }"
          @click="$emit('toggle-size', sz)"
        >{{ sz }}</button>
      </div>
    </div>

    <!-- Дополнительно -->
    <div class="filter-block">
      <div class="filter-block__title">Доступность и доставка</div>
      <label class="filter-check" @click.prevent="$emit('toggle-available-today', !availableToday)">
        <span class="filter-check__box" :class="{ active: availableToday }">
          <svg v-if="availableToday" width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4l3 3 5-6" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
        Показать только доступные сегодня
      </label>
      <label class="filter-check" @click.prevent="$emit('toggle-delivery-today', !deliveryToday)">
        <span class="filter-check__box" :class="{ active: deliveryToday }">
          <svg v-if="deliveryToday" width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4l3 3 5-6" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
        Доставка сегодня
      </label>
    </div>

    <button v-if="inDrawer" class="btn btn--ink btn--block fp__drawer-btn" @click="$emit('close')">
      Показать {{ filteredCount }}
    </button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  activeFiltersCount: number
  selectedColors: string[]
  selectedCategories: string[]
  selectedOccasions: string[]
  selectedSeasons: string[]
  priceMin: number
  priceMax: number
  selectedComposition: string[]
  selectedSizes: string[]
  filteredCount: number
  priceMinConst: number
  priceMaxConst: number
  categories?: Array<{ name: string; bloom: string }>
  inDrawer?: boolean
  compositionOptions?: string[]
  sizeOptions?: string[]
  occasionOptions?: string[]
  seasonOptions?: string[]
  availableToday?: boolean
  deliveryToday?: boolean
}>()

defineEmits<{
  'toggle-color': [v: string]
  'toggle-category': [v: string]
  'toggle-occasion': [v: string]
  'toggle-season': [v: string]
  'update-price-min': [v: number]
  'update-price-max': [v: number]
  'toggle-composition': [v: string]
  'toggle-size': [v: string]
  'toggle-available-today': [v: boolean]
  'toggle-delivery-today': [v: boolean]
  reset: []
  close: []
}>()

const swatches = ['rose', 'peach', 'cream', 'green', 'lav', 'red', 'mix']
const swatchLabels: Record<string, string> = {
  rose: 'Розовый', peach: 'Персиковый', cream: 'Кремовый',
  green: 'Зелёный', lav: 'Лавандовый', red: 'Красный', mix: 'Микс',
}
const compositionOptions = computed(() =>
  props.compositionOptions?.length
    ? props.compositionOptions
    : ['Пионы', 'Розы', 'Ранункулюс', 'Гортензия', 'Полевые']
)
const occasionOptions = computed(() =>
  props.occasionOptions?.length
    ? props.occasionOptions
    : ['Свадьба', 'День рождения', 'Поздравление', 'Юбилей', 'Для дома']
)
const seasonOptions = computed(() =>
  props.seasonOptions?.length
    ? props.seasonOptions
    : ['Весна', 'Лето', 'Осень', 'Зима']
)
const sizeOptions = computed(() =>
  props.sizeOptions?.length ? props.sizeOptions : ['S', 'M', 'L']
)

const leftPct  = computed(() => (props.priceMin - props.priceMinConst) / (props.priceMaxConst - props.priceMinConst) * 100)
const widthPct = computed(() => (props.priceMax - props.priceMin) / (props.priceMaxConst - props.priceMinConst) * 100)
const priceRangeLeft = computed(() => `${Math.max(0, Math.min(leftPct.value, 100))}%`)
const priceRangeWidth = computed(() => `${Math.max(0, Math.min(widthPct.value, 100))}%`)
const availableToday = computed(() => props.availableToday ?? false)
const deliveryToday = computed(() => props.deliveryToday ?? false)
</script>

<style scoped>
.fp__head { display:flex;justify-content:space-between;align-items:baseline;margin-bottom:22px; }
.fp__title { font-weight:700; font-size:16px; }
.fp__drawer-btn { margin-top: 24px; }
.filter-panel__swatches { display:flex; gap:10px; flex-wrap:wrap; }
.filter-panel__sizes { display:flex; gap:10px; }
.filter-panel__range {
  display:flex;
  justify-content:space-between;
  font-size:13px;
  color:var(--muted);
  margin-top:10px;
}
.filter-badge { display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:50%;background:var(--clay);color:#fff;font-size:11px;margin-left:6px;font-weight:700; }
.reset-btn { background:none;border:none;font-family:var(--sans);font-size:13px;color:var(--clay);cursor:pointer;padding:0; }
.filter-block { padding-bottom:22px;margin-bottom:22px;border-bottom:1px solid var(--line); }
.filter-block--no-border { border-bottom: none; }
.filter-block__title { font-weight:600;font-size:15px;margin-bottom:16px; }
.filter-check { display:flex;align-items:center;gap:11px;margin-bottom:11px;font-size:14px;cursor:pointer;user-select:none; }
.filter-check:hover { color:var(--green); }
.filter-check__box { width:18px;height:18px;border-radius:4px;border:1.5px solid var(--line);background:var(--white);flex:0 0 auto;display:flex;align-items:center;justify-content:center;transition:background .12s,border-color .12s; }
.filter-check__box.active { background:var(--green);border-color:var(--green); }
.swatch-btn { width:30px;height:30px;border-radius:50%;box-shadow:inset 0 0 0 1px rgba(0,0,0,.12);cursor:pointer;border:2px solid transparent;transition:transform .15s,border-color .15s;padding:0; }
.swatch-btn:hover { transform:scale(1.15); }
.swatch-btn--active { border-color:var(--ink);transform:scale(1.15);box-shadow:inset 0 0 0 1px rgba(0,0,0,.12),0 0 0 2px var(--paper),0 0 0 4px var(--ink); }
.price-range { position:relative;height:20px;display:flex;align-items:center; }
.price-range__track { position:absolute;left:0;right:0;height:6px;background:var(--paper-3);border-radius:6px; }
.price-range__fill {
  position: absolute;
  height: 6px;
  background: var(--clay);
  border-radius: 6px;
  pointer-events: none;
  left: v-bind('priceRangeLeft');
  width: v-bind('priceRangeWidth');
}
.price-range__thumb { position:absolute;left:0;width:100%;height:6px;background:transparent;pointer-events:none;-webkit-appearance:none;appearance:none;outline:none; }
.price-range__thumb::-webkit-slider-thumb { -webkit-appearance:none;pointer-events:all;width:18px;height:18px;border-radius:50%;background:var(--clay);border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.22);cursor:pointer;transition:transform .12s; }
.price-range__thumb::-webkit-slider-thumb:hover { transform:scale(1.15); }
.price-range__thumb::-moz-range-thumb { pointer-events:all;width:14px;height:14px;border-radius:50%;background:var(--clay);border:2px solid #fff;cursor:pointer; }
.size-btn { width:48px;height:40px;border:1.5px solid var(--line);border-radius:3px;background:var(--white);font-family:var(--sans);font-size:14px;font-weight:600;color:var(--ink);cursor:pointer;transition:border-color .15s,background .15s; }
.size-btn:hover { border-color:var(--green-2); }
.size-btn.active { border-color:var(--green);background:#F1EDDF;color:var(--green); }
</style>
