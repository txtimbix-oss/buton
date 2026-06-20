import type { Banner, Product, Review } from '~/composables/useShop'

export interface HomeReviewCard {
  key: string
  name: string
  text: string
}

export interface HomeBannerBuckets {
  hero: Banner[]
  promo: Banner[]
  editorial: Banner[]
  popup: Banner | null
}

export function pickHomeHeroProduct(products: Product[]): Product | null {
  return products.find(product => product.featured) ?? products[0] ?? null
}

export function pickHomeFeaturedProducts(products: Product[]): Product[] {
  const weekBouquet =
    products.find(product => product.tag === 'Лучший выбор' || product.tag === 'Премиум')
    ?? products[0]
    ?? null

  if (!weekBouquet) return []

  const takenSlugs = new Set([weekBouquet.slug])
  const newBouquet =
    products.find(product => product.tag === 'Новинка' && !takenSlugs.has(product.slug))
    ?? products.find(product => !takenSlugs.has(product.slug))
    ?? null

  return [weekBouquet, newBouquet].filter((product): product is Product => Boolean(product))
}

export function partitionHomeBanners(banners: Banner[]): HomeBannerBuckets {
  return {
    hero: banners.filter(banner => banner.position === 'hero'),
    promo: banners.filter(banner => banner.position === 'promo'),
    editorial: banners.filter(banner => banner.position === 'editorial'),
    popup: banners.find(banner => banner.position === 'popup') ?? null,
  }
}

export function buildHomeMarqueeReviews(
  apiReviews: Review[],
  fallbackReviews: HomeReviewCard[],
  minTextLength = 40,
): HomeReviewCard[] {
  const longReviews = apiReviews
    .filter(review => (review.text?.trim().length ?? 0) > minTextLength)
    .slice(0, 8)

  if (longReviews.length >= 4) {
    return longReviews.map(review => ({
      key: review._id,
      name: review.name,
      text: review.text,
    }))
  }

  return fallbackReviews
}
