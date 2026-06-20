import { computed, ref, toValue, type MaybeRefOrGetter } from 'vue'

import type { Product, Review } from '~/composables/useShop'
import { useProductAddonOptions } from '~/composables/useProductAddonOptions'
import { useProductConfigurator } from '~/composables/useProductConfigurator'
import { useProductGalleryState } from '~/composables/useProductGalleryState'
import { useProductLightbox } from '~/composables/useProductLightbox'
import { useProductPageContent } from '~/composables/useProductPageContent'
import { useProductPurchaseActions } from '~/composables/useProductPurchaseActions'
import { useProductReviewSubmission } from '~/composables/useProductReviewSubmission'
import { useWishlist } from '~/composables/useWishlist'
import { formatProductPrice } from '~/lib/product/seo'
import type { ProductReviewSubmissionPayload } from '~/lib/product/types'

interface ProductPageSettingsSource {
  storeName?: string | null
  storeCity?: string | null
  productSeoTemplate?: string | null
  productDeliveryText?: string | null
  catalogAddons?: string | null
  giftAddons?: string | null
}

export interface UseProductPageStateOptions {
  product: MaybeRefOrGetter<Product | null | undefined>
  allProducts: MaybeRefOrGetter<Product[] | null | undefined>
  apiReviews: MaybeRefOrGetter<Review[] | null | undefined>
  settings: MaybeRefOrGetter<ProductPageSettingsSource | null | undefined>
  slug: MaybeRefOrGetter<string>
  siteUrl: MaybeRefOrGetter<string>
  addLine: Parameters<typeof useProductPurchaseActions>[1]['addLine']
  showToast: Parameters<typeof useProductPurchaseActions>[1]['showToast']
  navigate: Parameters<typeof useProductPurchaseActions>[1]['navigate']
  submitReview: (payload: ProductReviewSubmissionPayload) => Promise<unknown> | unknown
  track?: Parameters<typeof useProductPurchaseActions>[1]['track']
  jsonLd?: Parameters<typeof useProductPageContent>[1]['jsonLd']
  formatPrice?: typeof formatProductPrice
}

export function useProductPageState(options: UseProductPageStateOptions) {
  const product = computed(() => toValue(options.product))
  const allProducts = computed(() => toValue(options.allProducts))
  const apiReviews = computed(() => toValue(options.apiReviews))
  const settings = computed(() => toValue(options.settings))
  const slug = computed(() => toValue(options.slug))
  const siteUrl = computed(() => toValue(options.siteUrl))

  const {
    thumbs,
    activeThumb,
    imgError,
    selectFallbackThumb,
    selectImageThumb,
    handleMainImageError,
    markThumbError,
    isThumbBroken,
  } = useProductGalleryState({
    product,
    slug,
  })

  const {
    catalogAddons,
    bundleOptions,
    addonGroups,
  } = useProductAddonOptions({
    settings,
    product,
  })

  const {
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
  } = useProductConfigurator({
    product,
    addons: catalogAddons,
  })

  const {
    justAdded,
    quickOrderPending,
    addToCart,
    addBundleToCart,
    placeQuickOrder,
  } = useProductPurchaseActions({
    product,
    addons: catalogAddons,
    activeSize,
    selectedAddons,
    qty,
    quickDeliveryTime,
  }, {
    addLine: options.addLine,
    showToast: options.showToast,
    navigate: options.navigate,
    track: options.track,
  })

  const wishlist = useWishlist()
  const isFaved = computed(() => wishlist.has(slug.value).value)

  const {
    productSeoText,
    relatedProducts,
    togetherProducts,
    holidayVariants,
    allReviews: allDisplayReviews,
  } = useProductPageContent({
    product,
    allProducts,
    apiReviews,
    activeSizeLabel,
    currentSizePrice,
    sizeHeight,
    sizeWeight,
    packagingHint,
    siteUrl,
    storeName: () => settings.value?.storeName ?? '',
    storeCity: () => settings.value?.storeCity ?? '',
    productSeoTemplate: () => settings.value?.productSeoTemplate ?? '',
  }, {
    jsonLd: options.jsonLd,
  })

  const {
    isOpen: lightboxOpen,
    index: lbIndex,
    open: openLightbox,
    close: closeLightbox,
    step: lbStep,
  } = useProductLightbox({
    imageCount: computed(() => product.value?.images.length),
  })

  const {
    newReview,
    reviewError,
    reviewSent,
    submitReview,
  } = useProductReviewSubmission({
    slug,
  }, {
    submit: options.submitReview,
  })

  const hoverRating = ref(0)
  const formatPrice = options.formatPrice ?? formatProductPrice

  return {
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
    wishlist,
    isFaved,
    productSeoText,
    relatedProducts,
    togetherProducts,
    holidayVariants,
    allReviews: allDisplayReviews,
    lightboxOpen,
    lbIndex,
    openLightbox,
    closeLightbox,
    lbStep,
    newReview,
    reviewError,
    reviewSent,
    submitReview,
    hoverRating,
    formatPrice,
  }
}
