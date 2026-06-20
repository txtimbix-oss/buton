<template>
  <div class="product-info">
    <!-- Рейтинг-строка -->
    <div class="product-rating-row">
      <div class="stars-row">
        <span v-for="n in 5" :key="n" class="star" :class="n <= Math.round(product.rating) ? 'star--fill' : ''">★</span>
        <span class="product-rating-value">{{ product.rating }}</span>
      </div>
      <span class="product-review-count">{{ product.reviewCount }} отзывов</span>
      <span v-if="isTopPick" class="tag tag--green product-tag-small">Лучший выбор</span>
      <span v-if="isPopular" class="tag tag--blush product-tag-small">Популярно</span>
    </div>

    <TrustStrip class="product-trust-strip" />
    <h1 class="product-title">{{ product.name }}</h1>
    <p class="lead product-description">{{ product.description }}</p>
    <div v-if="forWho.length" class="product-targets">
      <span class="product-targets-label">Кому подойдет:</span>
      <span v-for="audience in forWho" :key="audience" class="tag tag--clay product-tag-small">{{ audience }}</span>
    </div>

    <!-- Цена -->
    <Transition name="price-swap" mode="out-in">
      <div class="product-price-row">
        <span class="product-price-current">{{ currentTotal.toLocaleString('ru-RU') }} ₽</span>
        <span v-if="product.oldPrice" class="pcard__old product-price-old">{{ product.oldPrice.toLocaleString('ru-RU') }} ₽</span>
      </div>
    </Transition>

    <!-- Размеры -->
    <div class="product-section-title">Размер букета</div>
    <select
      :value="activeSize"
      class="selectbox product-size-select"
      @change="emit('updateActiveSize', Number(($event.target as HTMLSelectElement).value))"
    >
      <option v-for="(sz, i) in product.sizes" :key="sz.label" :value="i">
        {{ sz.label }} · {{ sz.price.toLocaleString('ru-RU') }} ₽ — {{ sz.desc }}
      </option>
    </select>

    <!-- Дополнения -->
    <template v-if="addonGroups.length">
      <div class="product-section-title">Опции к букету</div>
      <div class="pdp-addons">
        <div v-for="group in addonGroups" :key="group.title" class="pdp-addons__group">
          <div class="pdp-addons__title">{{ group.title }}</div>
          <div class="pdp-addons__items">
            <label
              v-for="entry in group.items" :key="entry.addon.id"
              class="addon-row" :class="{ selected: selectedAddons.includes(entry.index) }"
              @click.prevent="emit('toggleAddon', entry.index)"
            >
              <span class="product-addon-row">
                <span class="addon-check" :class="{ active: selectedAddons.includes(entry.index) }">
                  <svg v-if="selectedAddons.includes(entry.index)" width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4l3 3 5-6" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
                {{ entry.addon.name }}
              </span>
              <span class="product-addon-muted">{{ entry.addon.display }}</span>
            </label>
          </div>
        </div>
      </div>
    </template>

    <!-- Комплектные покупки -->
    <div v-if="bundleOptions.length" class="bundle-block">
      <h3 class="product-section-title">Комплектные покупки</h3>
      <div class="bundle-grid">
        <div v-for="bundle in bundleOptions" :key="bundle.id" class="bundle-card">
          <div class="bundle-card__title">
            <span>{{ bundle.title }}</span>
            <span>{{ bundle.priceLabel }}</span>
          </div>
          <p>{{ bundle.description }}</p>
          <button class="btn btn--ghost product-bundle-btn" type="button" @click="emit('addBundleToCart', bundle)">
            Добавить комплект за {{ bundle.priceLabel }}
          </button>
        </div>
      </div>
    </div>

    <!-- Кол-во + В корзину -->
    <div class="product-qty-row">
      <div class="qty">
        <button @click="qty > 1 && emit('updateQty', qty - 1)">−</button>
        <span>{{ qty }}</span>
        <button @click="emit('updateQty', qty + 1)">+</button>
      </div>
      <button
        class="btn btn--ink product-add-btn"
        :class="{ 'btn--added': justAdded }"
        @click="emit('addToCart')"
      >
        <template v-if="justAdded">✓ Добавлено в корзину</template>
        <template v-else>В корзину · {{ totalPrice.toLocaleString('ru-RU') }} ₽</template>
      </button>
      <button
        class="pcard__fav product-fav-btn" :class="{ 'pcard__fav--active': isFaved }"
        :title="isFaved ? 'Убрать из избранного' : 'В избранное'"
        @click="emit('toggleWishlist')"
      >
        <AppIcon name="heart" />
      </button>
    </div>

    <div class="quick-order-block">
      <h3 class="product-section-title">Быстрый заказ</h3>
      <div class="quick-order-grid">
        <div>
          <label class="product-quick-label">
            Доставка сегодня
          </label>
          <select
            :value="quickDeliveryTime"
            class="selectbox"
            @change="emit('updateQuickDeliveryTime', ($event.target as HTMLSelectElement).value)"
          >
            <option v-for="slot in quickDeliveryTimes" :key="slot" :value="slot">{{ slot }}</option>
          </select>
        </div>
        <label class="quick-mandatory">
          <input type="checkbox" checked disabled />
          <span>Фото букета перед отправкой</span>
        </label>
      </div>
      <button
        class="btn btn--clay product-quick-btn"
        :disabled="quickOrderPending"
        @click="emit('placeQuickOrder')"
      >
        <template v-if="quickOrderPending">Оформляем быстро…</template>
        <template v-else>Заказать сегодня {{ quickDeliveryTime }}</template>
      </button>
    </div>

    <div class="product-delivery-note">
      <AppIcon name="truck" /> {{ settings.productDeliveryText }}
    </div>
    <!-- Быстрые характеристики -->
    <div v-if="product.sizes?.length" class="quick-specs">
      <div class="quick-spec">
        <span class="quick-spec__key">Размер букета</span>
        <span class="quick-spec__val">{{ activeSizeLabel }}</span>
      </div>
      <div class="quick-spec">
        <span class="quick-spec__key">Стеблей</span>
        <span class="quick-spec__val">{{ sizeStemText }}</span>
      </div>
      <div class="quick-spec">
        <span class="quick-spec__key">Свежесть</span>
        <span class="quick-spec__val">Гарантия 7 дней</span>
      </div>
      <div class="quick-spec">
        <span class="quick-spec__key">Цена за набор</span>
        <span class="quick-spec__val">{{ formatPrice(currentSizePrice) }}</span>
      </div>
      <div class="quick-spec">
        <span class="quick-spec__key">Высота</span>
        <span class="quick-spec__val">{{ sizeHeight }}</span>
      </div>
      <div class="quick-spec">
        <span class="quick-spec__key">Упаковка</span>
        <span class="quick-spec__val">{{ packagingHint }}</span>
      </div>
      <div class="quick-spec">
        <span class="quick-spec__key">Вес</span>
        <span class="quick-spec__val">{{ sizeWeight }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/composables/useShop'
import type { AddonGroup, BundleOption } from '~/lib/product/types'

defineProps<{
  product: Product
  isTopPick: boolean
  isPopular: boolean
  forWho: string[]
  currentTotal: number
  activeSize: number
  addonGroups: AddonGroup[]
  selectedAddons: number[]
  bundleOptions: BundleOption[]
  qty: number
  justAdded: boolean
  totalPrice: number
  isFaved: boolean
  quickDeliveryTime: string
  quickDeliveryTimes: string[]
  quickOrderPending: boolean
  activeSizeLabel: string
  sizeStemText: string
  currentSizePrice: number
  sizeHeight: string
  sizeWeight: string
  packagingHint: string
  formatPrice: (value: number) => string
}>()

const emit = defineEmits<{
  toggleAddon: [index: number]
  addBundleToCart: [bundle: BundleOption]
  addToCart: []
  placeQuickOrder: []
  toggleWishlist: []
  updateActiveSize: [index: number]
  updateQty: [qty: number]
  updateQuickDeliveryTime: [value: string]
}>()

const settings = useSettings()
</script>
