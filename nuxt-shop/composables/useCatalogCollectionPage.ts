import { computed, toValue, watchEffect, type MaybeRefOrGetter, type Ref } from 'vue'

import type { Product } from '~/composables/useShop'
import {
  buildCollectionCopy,
  buildCollectionIntro,
  buildCollectionReasons,
  getBouquetWord,
} from '~/lib/catalog/collectionPageContent'
import { buildCollectionGiftNowLink, buildCollectionCanonicalPath } from '~/lib/catalog/collectionPageLinks'
import { buildCollectionHeroThumbs, selectCollectionHeroImage } from '~/lib/catalog/collectionPageMedia'
import {
  buildCollectionBreadcrumbSchema,
  buildCollectionPageSchema,
  buildCollectionSeoMeta,
} from '~/lib/catalog/collectionSeo'
import type {
  CatalogCollectionHeroThumb,
  CatalogCollectionPageCollection,
  CatalogCollectionReason,
} from '~/lib/catalog/types'

interface CatalogCollectionPageData {
  collection: CatalogCollectionPageCollection
  products: Product[]
}

interface CatalogCollectionSettings {
  storeName?: string | null
  storeCity?: string | null
  usp1Title?: string | null
  usp1Sub?: string | null
  usp2Title?: string | null
  usp2Sub?: string | null
  usp3Title?: string | null
  usp3Sub?: string | null
  usp4Title?: string | null
  usp4Sub?: string | null
}

interface UseCatalogCollectionPageOptions {
  collectionSlug: MaybeRefOrGetter<string>
  settings: MaybeRefOrGetter<CatalogCollectionSettings | null | undefined>
  siteUrl: MaybeRefOrGetter<string>
  setCanonical?: (path: string) => void
  jsonLd?: (schema: object | object[]) => void
}

export function useCatalogCollectionPage(options: UseCatalogCollectionPageOptions) {
  const collectionSlug = computed(() => toValue(options.collectionSlug))
  const settings = computed(() => toValue(options.settings))
  const siteUrl = computed(() => toValue(options.siteUrl))

  const { data, pending } = useFetch<CatalogCollectionPageData>(
    `/api/collections/slug/${collectionSlug.value}`
  )

  const state = computed<'pending' | 'missing' | 'ready'>(() => {
    if (pending.value) return 'pending'
    return data.value ? 'ready' : 'missing'
  })

  const productCount = computed(() => data.value?.products.length ?? 0)
  const bouquetWord = computed(() => getBouquetWord(productCount.value))
  const heroImage = computed(() => selectCollectionHeroImage(data.value?.products ?? []))
  const heroThumbs = computed<CatalogCollectionHeroThumb[]>(() => buildCollectionHeroThumbs(data.value?.products ?? []))
  const collectionIntro = computed(() => buildCollectionIntro({
    description: data.value?.collection.description,
  }))
  const collectionCopy = computed(() => buildCollectionCopy({
    productCount: productCount.value,
    bouquetWord: bouquetWord.value,
    storeCity: settings.value?.storeCity,
    tag: data.value?.collection.tag,
  }))
  const collectionReasons = computed<CatalogCollectionReason[]>(() => buildCollectionReasons({
    collectionName: data.value?.collection.name ?? '',
    productCount: productCount.value,
  }))
  const giftNowLink = computed(() => buildCollectionGiftNowLink(collectionSlug.value))
  const customLink = computed(() => '/custom')

  const seoMeta = computed(() => buildCollectionSeoMeta({
    collection: data.value?.collection ?? { name: 'Коллекция' },
    storeName: settings.value?.storeName ?? '',
    defaultDescriptionCity: settings.value?.storeCity ?? 'Санкт-Петербургу',
  }))
  const pageTitle = computed(() => seoMeta.value.title)
  const pageDesc = computed(() => seoMeta.value.description)

  const collectionBreadcrumbSchema = computed(() => buildCollectionBreadcrumbSchema({
    siteUrl: siteUrl.value,
    collectionName: data.value?.collection.name ?? 'Коллекция',
    collectionSlug: collectionSlug.value,
  }))
  const collectionPageSchema = computed(() => buildCollectionPageSchema({
    siteUrl: siteUrl.value,
    collection: data.value?.collection ?? { name: 'Коллекция', slug: collectionSlug.value },
    pageDescription: pageDesc.value,
    products: data.value?.products ?? [],
  }))

  const collectionTrust = computed(() => [
    {
      title: settings.value?.usp1Title || 'Фото букета перед отправкой',
      text: settings.value?.usp1Sub || 'Согласуем фото в мессенджере до отправки.',
    },
    {
      title: settings.value?.usp2Title || 'Гарантия свежести 7 дней',
      text: settings.value?.usp2Sub || 'При нарушении срока меняем композицию.',
    },
    {
      title: settings.value?.usp3Title || 'Доставка в день заказа',
      text: settings.value?.usp3Sub || 'Точный интервал и координация с курьером.',
    },
    {
      title: settings.value?.usp4Title || 'Реальные отзывы',
      text: settings.value?.usp4Sub || 'Подтвержденные заказы и фото с доставки.',
    },
  ])

  if (options.setCanonical) {
    watchEffect(() => {
      options.setCanonical?.(buildCollectionCanonicalPath(collectionSlug.value))
    })
  }

  if (options.jsonLd) {
    watchEffect(() => {
      if (state.value !== 'ready' || !data.value) return

      options.jsonLd?.([
        collectionBreadcrumbSchema.value,
        collectionPageSchema.value,
      ])
    })
  }

  return {
    data: data as Ref<CatalogCollectionPageData | null>,
    pending,
    state,
    heroImage,
    heroThumbs,
    collectionIntro,
    collectionCopy,
    collectionReasons,
    collectionTrust,
    giftNowLink,
    customLink,
    bouquetWord,
    pageTitle,
    pageDesc,
    collectionBreadcrumbSchema,
    collectionPageSchema,
  }
}
