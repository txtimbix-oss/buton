import { ref } from 'vue'
import { describe, expect, it } from 'vitest'

import type { Banner, Review } from '~/composables/useShop'
import { useHomePageData } from '~/composables/useHomePageData'
import { buildHomeProductSections } from '~/constants/homeProductSections'
import { buildHomeSeasonalCollections, parseSeasonFilters } from '~/constants/seasonCollections'
import {
  buildHomeHeroActions,
  buildHomeHeroStats,
  getHomeInstagramBlooms,
  getHomeSubscriptionBenefits,
  getStaticHomeReviews,
} from '~/lib/home/content'
import {
  buildHomeMarqueeReviews,
  partitionHomeBanners,
  pickHomeFeaturedProducts,
  pickHomeHeroProduct,
} from '~/lib/home/discovery'
import { makeProduct } from '~/tests/fixtures/products'

function makeReview(overrides: Partial<Review> = {}): Review {
  return {
    _id: overrides._id ?? 'review-1',
    productSlug: overrides.productSlug ?? 'product-1',
    name: overrides.name ?? 'Анна',
    rating: overrides.rating ?? 5,
    text: overrides.text ?? 'Очень красивый букет и быстрая доставка в удобное время, всё прошло идеально.',
    status: overrides.status ?? 'approved',
    createdAt: overrides.createdAt ?? '2026-06-01T10:00:00.000Z',
  }
}

describe('useHomePageData', () => {
  it('assembles the home page derived data from reactive inputs', () => {
    const settings = ref({
      stat1Value: '4.9',
      stat1Label: '2 400 отзывов',
      stat2Value: '2 ч',
      stat2Label: 'средняя доставка',
      stat3Value: '7 лет',
      stat3Label: 'дарим эмоции',
      heroBtn1: 'Смотреть каталог',
      heroBtn2: 'Подписка',
      seasonalCollections: JSON.stringify([
        { name: 'Весна', keyword: 'весна|тюльпан' },
        { name: 'Осень', keyword: 'осень|террак' },
        { name: 'Пионы сезона', keyword: 'пион' },
        { name: 'Зима', keyword: 'зима|новогод' },
      ]),
    })
    const products = ref([
      makeProduct({
        slug: 'featured-week',
        name: 'Букет недели',
        featured: true,
        tag: 'Премиум',
        meta: 'Пионы и садовые цветы',
      }),
      makeProduct({
        slug: 'new-bouquet',
        name: 'Новинка',
        tag: 'Новинка',
        meta: 'Тюльпаны и весенние цветы',
      }),
      makeProduct({
        slug: 'season-autumn',
        name: 'Осенний',
        meta: 'Осень, терракота и зелень',
      }),
      makeProduct({
        slug: 'artisan',
        name: 'Авторский',
        tag: 'Премиум',
        meta: 'Авторская композиция с орхидеей',
      }),
      makeProduct({
        slug: 'gift-set',
        name: 'Подарочный',
        oldPrice: 7200,
        meta: 'Нежный подарок в коробке',
      }),
    ])
    const apiReviews = ref([
      makeReview({ _id: 'review-1', name: 'Мария', text: 'Очень красивый букет, свежие цветы, аккуратная упаковка и бережная доставка точно ко времени.' }),
      makeReview({ _id: 'review-2', name: 'Олег', text: 'Заказ подтвердили быстро, прислали фото перед отправкой, а сам букет оказался даже лучше ожиданий.' }),
      makeReview({ _id: 'review-3', name: 'Ирина', text: 'Порадовало внимание к деталям, композиция получилась гармоничной, а цветы простояли очень долго.' }),
      makeReview({ _id: 'review-4', name: 'Кирилл', text: 'Доставили точно в окно, получатель был в восторге, сервис спокойный и очень профессиональный.' }),
    ])
    const bannersData = ref<Banner[]>([
      { _id: 'hero-1', position: 'hero', title: 'Hero banner', active: true },
      { _id: 'promo-1', position: 'promo', title: 'Promo banner', active: true },
      { _id: 'editorial-1', position: 'editorial', title: 'Editorial banner', active: true, features: [] },
      { _id: 'popup-1', position: 'popup', title: 'Popup banner', active: true },
    ])

    const pageData = useHomePageData({
      settings,
      products,
      apiReviews,
      bannersData,
    })

    const expectedSeasonFilters = parseSeasonFilters(settings.value.seasonalCollections)
    const expectedFeaturedProducts = pickHomeFeaturedProducts(products.value)

    expect(pageData.heroProduct.value).toEqual(pickHomeHeroProduct(products.value))
    expect(pageData.heroStats.value).toEqual(buildHomeHeroStats(settings.value))
    expect(pageData.heroActions.value).toEqual(buildHomeHeroActions(settings.value))
    expect(pageData.featuredProducts.value).toEqual(expectedFeaturedProducts)
    expect(pageData.seasonFilters.value).toEqual(expectedSeasonFilters)
    expect(pageData.seasonalCollections.value).toEqual(
      buildHomeSeasonalCollections(products.value, expectedSeasonFilters),
    )

    const expectedSections = buildHomeProductSections(
      products.value,
      expectedFeaturedProducts.map(product => product.slug),
      expectedSeasonFilters,
    )

    expect(pageData.homeProductSections.value).toEqual(expectedSections)
    expect(pageData.seasonalFlowers.value).toEqual(expectedSections.seasonalFlowers)
    expect(pageData.artisanCompositions.value).toEqual(expectedSections.artisanCompositions)
    expect(pageData.giftWithBouquet.value).toEqual(expectedSections.giftWithBouquet)

    const expectedBanners = partitionHomeBanners(bannersData.value)
    expect(pageData.homeBanners.value).toEqual(expectedBanners)
    expect(pageData.heroBanners.value).toEqual(expectedBanners.hero)
    expect(pageData.promoBanners.value).toEqual(expectedBanners.promo)
    expect(pageData.editorialBanners.value).toEqual(expectedBanners.editorial)
    expect(pageData.popupBanner.value).toEqual(expectedBanners.popup)

    const expectedStaticReviews = getStaticHomeReviews()
    expect(pageData.staticReviews).toEqual(expectedStaticReviews)
    expect(pageData.marqueeReviews.value).toEqual(
      buildHomeMarqueeReviews(apiReviews.value, expectedStaticReviews),
    )
    expect(pageData.igBlooms).toEqual(getHomeInstagramBlooms())
    expect(pageData.subscriptionBenefits).toEqual(getHomeSubscriptionBenefits())
  })

  it('falls back to static marquee reviews until enough long API reviews are available', () => {
    const apiReviews = ref([
      makeReview({ _id: 'short-1', text: 'Супер букет!' }),
      makeReview({ _id: 'short-2', text: 'Очень понравилось!' }),
    ])
    const pageData = useHomePageData({
      settings: ref({ seasonalCollections: undefined }),
      products: ref([]),
      apiReviews,
      bannersData: ref([]),
    })

    expect(pageData.marqueeReviews.value).toEqual(pageData.staticReviews)

    apiReviews.value = [
      makeReview({ _id: 'long-1', name: 'Алина', text: 'Букет приехал вовремя, цветы были очень свежими, а курьер заранее предупредил о приезде.' }),
      makeReview({ _id: 'long-2', name: 'Никита', text: 'Сервис помог быстро выбрать композицию, согласовал детали и доставил всё точно по адресу.' }),
      makeReview({ _id: 'long-3', name: 'Полина', text: 'Композиция выглядела как на фото, упаковка была аккуратной, а аромат держался несколько дней.' }),
      makeReview({ _id: 'long-4', name: 'Роман', text: 'Понравилось, что перед отправкой прислали фото, и итоговый букет оказался действительно очень красивым.' }),
    ]

    expect(pageData.marqueeReviews.value.map(review => review.key)).toEqual([
      'long-1',
      'long-2',
      'long-3',
      'long-4',
    ])
  })
})
