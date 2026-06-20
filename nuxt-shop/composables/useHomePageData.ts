import { computed, toValue, type MaybeRefOrGetter } from 'vue'

import { buildHomeProductSections } from '~/constants/homeProductSections'
import { buildHomeSeasonalCollections, parseSeasonFilters } from '~/constants/seasonCollections'
import type { Banner, Product, Review } from '~/composables/useShop'
import type { HomeHeroAction, HomeHeroStat } from '~/lib/home/content'
import {
  buildHomeHeroActions,
  buildHomeHeroStats,
  getHomeInstagramBlooms,
  getHomeSubscriptionBenefits,
  getStaticHomeReviews,
} from '~/lib/home/content'
import type { HomeBannerBuckets, HomeReviewCard } from '~/lib/home/discovery'
import {
  buildHomeMarqueeReviews,
  partitionHomeBanners,
  pickHomeFeaturedProducts,
  pickHomeHeroProduct,
} from '~/lib/home/discovery'

export interface HomePageDataSettings {
  seasonalCollections?: string
  stat1Value?: string
  stat1Label?: string
  stat2Value?: string
  stat2Label?: string
  stat3Value?: string
  stat3Label?: string
  heroBtn1?: string
  heroBtn2?: string
}

export interface UseHomePageDataOptions {
  settings: MaybeRefOrGetter<HomePageDataSettings | null | undefined>
  products: MaybeRefOrGetter<Product[] | null | undefined>
  apiReviews: MaybeRefOrGetter<Review[] | null | undefined>
  bannersData: MaybeRefOrGetter<Banner[] | null | undefined>
}

export function useHomePageData(options: UseHomePageDataOptions) {
  const settings = computed(() => toValue(options.settings) ?? {})
  const products = computed(() => toValue(options.products) ?? [])
  const apiReviews = computed(() => toValue(options.apiReviews) ?? [])
  const bannersData = computed(() => toValue(options.bannersData) ?? [])

  const heroProduct = computed(() => pickHomeHeroProduct(products.value))
  const heroStats = computed<HomeHeroStat[]>(() => buildHomeHeroStats(settings.value))
  const heroActions = computed<HomeHeroAction[]>(() => buildHomeHeroActions(settings.value))
  const featuredProducts = computed(() => pickHomeFeaturedProducts(products.value))

  const seasonFilters = computed(() => parseSeasonFilters(settings.value.seasonalCollections))
  const seasonalCollections = computed(() =>
    buildHomeSeasonalCollections(products.value, seasonFilters.value),
  )
  const homeProductSections = computed(() =>
    buildHomeProductSections(
      products.value,
      featuredProducts.value.map(product => product.slug),
      seasonFilters.value,
    ),
  )

  const seasonalFlowers = computed(() => homeProductSections.value.seasonalFlowers)
  const artisanCompositions = computed(() => homeProductSections.value.artisanCompositions)
  const giftWithBouquet = computed(() => homeProductSections.value.giftWithBouquet)

  const homeBanners = computed<HomeBannerBuckets>(() => partitionHomeBanners(bannersData.value))
  const heroBanners = computed(() => homeBanners.value.hero)
  const promoBanners = computed(() => homeBanners.value.promo)
  const editorialBanners = computed(() => homeBanners.value.editorial)
  const popupBanner = computed(() => homeBanners.value.popup)

  const staticReviews: HomeReviewCard[] = getStaticHomeReviews()
  const marqueeReviews = computed(() =>
    buildHomeMarqueeReviews(apiReviews.value, staticReviews),
  )

  const igBlooms = getHomeInstagramBlooms()
  const subscriptionBenefits = getHomeSubscriptionBenefits()

  return {
    heroProduct,
    heroStats,
    heroActions,
    featuredProducts,
    seasonFilters,
    seasonalCollections,
    homeProductSections,
    seasonalFlowers,
    artisanCompositions,
    giftWithBouquet,
    homeBanners,
    heroBanners,
    promoBanners,
    editorialBanners,
    popupBanner,
    staticReviews,
    marqueeReviews,
    igBlooms,
    subscriptionBenefits,
  }
}
