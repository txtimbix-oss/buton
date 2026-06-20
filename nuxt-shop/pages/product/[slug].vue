<template>
  <main class="page product-page">

    <ProductPageSkeleton v-if="pending" />

    <template v-else-if="product">
      <ProductBreadcrumbs :product-name="product.name" />

      <!-- ОСНОВНОЙ БЛОК -->
      <section class="container product-grid">
        <ProductGallery
          :product="product"
          :thumbs="thumbs"
          :active-thumb="activeThumb"
          :img-error="imgError"
          :discount-pct="discountPct"
          :is-thumb-broken="isThumbBroken"
          @select-image-thumb="selectImageThumb"
          @select-fallback-thumb="selectFallbackThumb"
          @mark-thumb-error="markThumbError"
          @main-image-error="handleMainImageError"
          @open-lightbox="openLightbox"
        />

        <ProductPurchasePanel
          :product="product"
          :is-top-pick="isTopPick"
          :is-popular="isPopular"
          :for-who="forWho"
          :current-total="currentTotal"
          :active-size="activeSize"
          :addon-groups="addonGroups"
          :selected-addons="selectedAddons"
          :bundle-options="bundleOptions"
          :qty="qty"
          :just-added="justAdded"
          :total-price="totalPrice"
          :is-faved="isFaved"
          :quick-delivery-time="quickDeliveryTime"
          :quick-delivery-times="quickDeliveryTimes"
          :quick-order-pending="quickOrderPending"
          :active-size-label="activeSizeLabel"
          :size-stem-text="sizeStemText"
          :current-size-price="currentSizePrice"
          :size-height="sizeHeight"
          :size-weight="sizeWeight"
          :packaging-hint="packagingHint"
          :format-price="formatPrice"
          @toggle-addon="toggleAddon"
          @add-bundle-to-cart="addBundleToCart"
          @add-to-cart="addToCart"
          @place-quick-order="placeQuickOrder"
          @toggle-wishlist="wishlist.toggle(slug)"
          @update-active-size="activeSize = $event"
          @update-qty="qty = $event"
          @update-quick-delivery-time="quickDeliveryTime = $event"
        />
      </section>

      <ProductDetailsGrid :product="product" :for-who="forWho" />

      <ProductRecommendationsSection
        title="Похожие букеты" link-to="/catalog" link-text="Смотреть все"
        key-prefix="sim" :products="relatedProducts"
      />
      <ProductRecommendationsSection
        title="С этим букетом берут" link-to="/catalog" link-text="Смотреть все"
        key-prefix="together" :products="togetherProducts"
      />
      <ProductRecommendationsSection
        title="Другие варианты для праздника" link-to="/wedding" link-text="Смотреть больше"
        key-prefix="holiday" :products="holidayVariants"
      />

      <ProductReviewsSection
        :product="product"
        :reviews="allReviews"
        :new-review="newReview"
        :review-sent="reviewSent"
        :review-error="reviewError"
        @submit="submitReview"
      />

      <ProductSeoSection :html="safeProductSeoText" />

    </template>

    <!-- 404 -->
    <ProductNotFound v-else />

    <!-- Sticky CTA (мобиль) -->
    <Teleport to="body">
      <Transition name="sticky-in">
        <div v-if="product && !pending" class="sticky-cta">
          <div>
            <div class="sticky-product-title">{{ product.name }}</div>
            <div class="sticky-product-price">{{ totalPrice.toLocaleString('ru-RU') }} ₽</div>
          </div>
          <button
            class="btn btn--ink product-sticky-btn"
            :class="{ 'btn--added': justAdded }"
            @click="addToCart"
          >
            <template v-if="justAdded">✓ В корзине</template>
            <template v-else>В корзину</template>
          </button>
        </div>
      </Transition>
    </Teleport>

    <!-- LIGHTBOX -->
    <ProductLightbox
      v-if="product"
      :product="product"
      :open="lightboxOpen"
      :index="lbIndex"
      @close="closeLightbox"
      @step="lbStep"
    />

  </main>
</template>

<script setup lang="ts">
import { useProductPageQueries } from '~/composables/useProductPageQueries'
import { useProductPageState } from '~/composables/useProductPageState'
import { sanitizeHtml } from '~/lib/sanitizeHtml'
import {
  buildProductSeoMeta,
} from '~/lib/product/seo'

const route = useRoute()
const slug  = computed(() => route.params.slug as string)

const settings = useSettings()
const { siteUrl, setCanonical, jsonLd } = useSeo()

const {
  product,
  pending,
  allProducts,
  apiReviews,
  trackProductEvent,
  submitProductReview,
} = useProductPageQueries(slug)

useSeoMeta(() => buildProductSeoMeta(product.value, siteUrl.value, settings.value.storeName))

setCanonical(`/product/${slug.value}`)

const { addLine } = useCart()
const { show }    = useToast()

const {
  thumbs,
  activeThumb,
  imgError,
  selectFallbackThumb,
  selectImageThumb,
  handleMainImageError,
  markThumbError,
  isThumbBroken,
  bundleOptions,
  addonGroups,
  activeSize,
  selectedAddons,
  qty,
  quickDeliveryTime,
  quickDeliveryTimes,
  toggleAddon,
  currentSizePrice,
  totalPrice,
  currentTotal,
  activeSizeLabel,
  sizeStemText,
  sizeHeight,
  sizeWeight,
  packagingHint,
  forWho,
  isTopPick,
  isPopular,
  discountPct,
  justAdded,
  quickOrderPending,
  addToCart,
  addBundleToCart,
  placeQuickOrder,
  productSeoText,
  relatedProducts,
  togetherProducts,
  holidayVariants,
  allReviews,
  lightboxOpen,
  lbIndex,
  openLightbox,
  closeLightbox,
  lbStep,
  newReview,
  reviewError,
  reviewSent,
  submitReview,
  wishlist,
  isFaved,
  formatPrice,
} = useProductPageState({
  product,
  allProducts,
  apiReviews,
  settings,
  slug,
  siteUrl,
  addLine,
  showToast: show,
  navigate: navigateTo,
  track: trackProductEvent,
  jsonLd,
  submitReview: submitProductReview,
})

const safeProductSeoText = computed(() => sanitizeHtml(productSeoText.value))
</script>

