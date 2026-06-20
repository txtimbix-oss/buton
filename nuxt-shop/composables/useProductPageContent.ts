import { computed, toValue, watchEffect, type MaybeRefOrGetter } from 'vue'

import type { Product, Review } from '~/composables/useShop'
import { buildProductRecommendations } from '~/lib/product/recommendations'
import { buildProductReviews } from '~/lib/product/reviews'
import {
  buildProductBreadcrumbSchema,
  buildProductCompositionText,
  buildProductSchema,
  buildProductSeoText,
} from '~/lib/product/seo'
import type { ProductDisplayReview } from '~/lib/product/types'

export const PRODUCT_PAGE_SEO_TEMPLATE_FALLBACK =
  '<h2>Букет «{name}» в Санкт-Петербурге</h2><p>Авторская композиция «{name}» собрана на основе: {flowers}. Размер заказа: {size}.</p><p>Цена от {price}, фото перед отправкой и контроль качества до отгрузки. Гарантия свежести 7 дней.</p>'

export const PRODUCT_PAGE_STATIC_REVIEWS: ProductDisplayReview[] = [
  { key: 's1', name: 'Анна К.', date: '14 мая 2026', rating: 5, text: 'Невероятный букет! Курьер приехал строго по времени, всё было бережно упаковано. Получательница была в восторге — цветы до сих пор стоят, уже 10-й день. Однозначно буду заказывать ещё.' },
  { key: 's2', name: 'Дмитрий В.', date: '8 мая 2026', rating: 5, text: 'Заказал на день рождения супруге. Реальные цветы оказались даже красивее, чем на фото. Очень нежный аромат, свежесть потрясающая. Спасибо команде за профессионализм!' },
  { key: 's3', name: 'Елена Морозова', date: '2 мая 2026', rating: 4, text: 'Отличный букет за свои деньги. Доставили по времени, курьер вежливый. Немного не хватало упаковки — чуть смялась лента, но сами цветы в отличном состоянии. В целом очень доволен.' },
  { key: 's4', name: 'Михаил Р.', date: '28 апреля 2026', rating: 5, text: 'Третий раз заказываю здесь и каждый раз на высшем уровне. Букет превзошёл ожидания — свежайшие цветы, красивая подача. Фото перед отправкой — отличная идея, сразу понимаешь что получит адресат.' },
  { key: 's5', name: 'Ирина Смирнова', date: '20 апреля 2026', rating: 5, text: 'Подарила маме на праздник. Она была так рада! Букет стоял две недели, цветы оставались свежими. Буду рекомендовать всем друзьям.' },
]

export interface UseProductPageContentOptions {
  product: MaybeRefOrGetter<Product | null | undefined>
  allProducts: MaybeRefOrGetter<Product[] | null | undefined>
  apiReviews: MaybeRefOrGetter<Review[] | null | undefined>
  activeSizeLabel: MaybeRefOrGetter<string | null | undefined>
  currentSizePrice: MaybeRefOrGetter<number | null | undefined>
  sizeHeight: MaybeRefOrGetter<string | null | undefined>
  sizeWeight: MaybeRefOrGetter<string | null | undefined>
  packagingHint: MaybeRefOrGetter<string | null | undefined>
  siteUrl: MaybeRefOrGetter<string | null | undefined>
  storeName: MaybeRefOrGetter<string | null | undefined>
  storeCity: MaybeRefOrGetter<string | null | undefined>
  productSeoTemplate?: MaybeRefOrGetter<string | null | undefined>
  fallbackReviews?: ProductDisplayReview[]
}

export interface UseProductPageContentDeps {
  jsonLd?: (schema: object | object[]) => void
  watchEffect?: typeof watchEffect
}

export function useProductPageContent(
  options: UseProductPageContentOptions,
  deps: UseProductPageContentDeps = {},
) {
  const product = computed(() => toValue(options.product))
  const allProducts = computed(() => toValue(options.allProducts) ?? [])
  const apiReviews = computed(() => toValue(options.apiReviews))
  const activeSizeLabel = computed(() => toValue(options.activeSizeLabel) ?? '')
  const currentSizePrice = computed(() => toValue(options.currentSizePrice) ?? 0)
  const sizeHeight = computed(() => toValue(options.sizeHeight) ?? '—')
  const sizeWeight = computed(() => toValue(options.sizeWeight) ?? '—')
  const packagingHint = computed(() => toValue(options.packagingHint) ?? 'крафт + лента')
  const siteUrl = computed(() => toValue(options.siteUrl) ?? '')
  const storeName = computed(() => toValue(options.storeName) ?? '')
  const storeCity = computed(() => toValue(options.storeCity) ?? '')
  const staticDisplayReviews = options.fallbackReviews ?? PRODUCT_PAGE_STATIC_REVIEWS

  const productSeoTemplate = computed(() => {
    const configuredTemplate = toValue(options.productSeoTemplate)
    return configuredTemplate || PRODUCT_PAGE_SEO_TEMPLATE_FALLBACK
  })
  const productSeoText = computed(() => {
    if (!product.value) return ''

    return buildProductSeoText({
      product: product.value,
      activeSizeLabel: activeSizeLabel.value || 'M',
      currentPrice: currentSizePrice.value,
      storeCity: storeCity.value || 'Санкт-Петербурге',
      template: productSeoTemplate.value,
    })
  })

  const productRecommendations = computed(() =>
    buildProductRecommendations(product.value, allProducts.value),
  )
  const relatedProducts = computed(() => productRecommendations.value.related)
  const togetherProducts = computed(() => productRecommendations.value.together)
  const holidayVariants = computed(() => productRecommendations.value.holidayVariants)

  const allReviews = computed(() =>
    buildProductReviews(apiReviews.value, staticDisplayReviews),
  )

  const productCompositionText = computed(() =>
    buildProductCompositionText(product.value),
  )

  const productSeoBreadcrumbSchema = computed(() => {
    if (!product.value) return null
    return buildProductBreadcrumbSchema(product.value, siteUrl.value)
  })

  const productSeoSchema = computed(() => {
    if (!product.value) return null

    return buildProductSchema({
      product: product.value,
      siteUrl: siteUrl.value,
      storeName: storeName.value,
      seoText: productSeoText.value,
      compositionText: productCompositionText.value,
      activeSizeLabel: activeSizeLabel.value || 'M',
      currentSizePrice: currentSizePrice.value,
      sizeHeight: sizeHeight.value,
      sizeWeight: sizeWeight.value,
      packagingHint: packagingHint.value,
      reviews: allReviews.value,
    })
  })

  if (deps.jsonLd) {
    const runWatchEffect = deps.watchEffect ?? watchEffect

    runWatchEffect(() => {
      if (!product.value) return

      const schemas = [productSeoSchema.value, productSeoBreadcrumbSchema.value]
        .filter((schema): schema is object => Boolean(schema))
      deps.jsonLd?.(schemas)
    })
  }

  return {
    staticDisplayReviews,
    productSeoTemplate,
    productSeoText,
    productRecommendations,
    relatedProducts,
    togetherProducts,
    holidayVariants,
    allReviews,
    productCompositionText,
    productSeoBreadcrumbSchema,
    productSeoSchema,
  }
}
