import type { Product } from '~/composables/useShop'
import type { CartLineInput } from '~/lib/cart/types'

export interface CatalogAddon {
  id: string
  name: string
  price: number
  display: string
}

export interface AddonGroupItem {
  addon: CatalogAddon
  index: number
}

export interface AddonGroup {
  title: string
  items: AddonGroupItem[]
}

export interface GiftBundleSetting {
  id: string
  title: string
  description: string
  includes: string[]
}

export interface BundleOption {
  id: string
  title: string
  description: string
  addonIndexes: number[]
  priceLabel: string
}

export interface ProductDisplayReview {
  key: string
  name: string
  date: string
  rating: number
  text: string
}

export interface ProductReviewDraft {
  name: string
  rating: number
  text: string
}

export interface ProductReviewSubmissionPayload extends ProductReviewDraft {
  productSlug: string
}

export interface ProductDerivedMetadata {
  activeSizeLabel: string
  activeSizeDesc: string[]
  sizeStemText: string
  sizeHeight: string
  sizeWeight: string
  packagingHint: string
  forWho: string[]
  isTopPick: boolean
  isPopular: boolean
  discountPct: number
  productFlowerText: string
}

export interface ProductRecommendationBuckets {
  related: Product[]
  together: Product[]
  holidayVariants: Product[]
}

export interface BuildCatalogAddonsOptions {
  allAddons: CatalogAddon[]
  catalogAddonIds?: string[]
}

export interface BuildProductSeoTextOptions {
  product: Product
  activeSizeLabel: string
  currentPrice?: number
  storeCity?: string
  template: string
}

export interface BuildProductSchemaOptions {
  product: Product
  siteUrl: string
  storeName: string
  seoText: string
  compositionText: string
  activeSizeLabel: string
  currentSizePrice: number
  sizeHeight: string
  sizeWeight: string
  packagingHint: string
  reviews: ProductDisplayReview[]
}

export interface ProductOptionSelection {
  activeSize: number
  selectedAddons: number[]
}

export interface ProductOptionState extends ProductOptionSelection {
  sizeLabel: string
  addonNames: string[]
  currentSizePrice: number
  addonsTotal: number
  currentTotal: number
  totalPrice: number
  qty: number
}

export interface ResolveProductOptionStateOptions {
  product: Product
  addons: CatalogAddon[]
  activeSize: number
  selectedAddons: number[]
  qty?: number
}

export interface BuildBundleCartLineInputOptions extends ResolveProductOptionStateOptions {
  bundle: BundleOption
}

export interface BuildQuickOrderCartLineInputOptions extends ResolveProductOptionStateOptions {
  quickDeliveryTime: string
}

export interface ProductOptionTotals {
  currentSizePrice: number
  addonsTotal: number
  currentTotal: number
  totalPrice: number
}

export interface ProductCartLineInput extends CartLineInput {}
