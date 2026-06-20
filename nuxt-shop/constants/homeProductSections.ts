import type { Product } from '~/composables/useShop'
import { productMatchesKeywords, type SeasonFilterOption } from '~/constants/seasonCollections'

interface HomeProductSections {
  seasonalFlowers: Product[]
  artisanCompositions: Product[]
  giftWithBouquet: Product[]
}

const HOME_SECTION_LIMIT = 4
const ARTISAN_KEYWORDS = 'автор|дизайнер|орхидея'
const GIFT_KEYWORDS = 'подар|компакт|нежн|ромашк|коробк'

function fillSection(
  products: Product[],
  takenSlugs: Set<string>,
  matcher: (product: Product) => boolean,
  limit = HOME_SECTION_LIMIT,
) {
  const matches = products
    .filter(product => !takenSlugs.has(product.slug) && matcher(product))
    .slice(0, limit)

  matches.forEach(product => takenSlugs.add(product.slug))
  return matches
}

export function buildHomeProductSections(
  products: Product[],
  featuredSlugs: string[],
  seasonFilters: SeasonFilterOption[],
): HomeProductSections {
  const takenSlugs = new Set(featuredSlugs)
  const seasonalKeywords = seasonFilters.map(filter => filter.keyword).filter(Boolean).join('|')

  const seasonalFlowers = fillSection(
    products,
    takenSlugs,
    product => productMatchesKeywords(product, seasonalKeywords),
  )

  const artisanCompositions = fillSection(
    products,
    takenSlugs,
    product => product.tag === 'Премиум' || productMatchesKeywords(product, ARTISAN_KEYWORDS),
  )

  const giftWithBouquet = fillSection(
    products,
    takenSlugs,
    product =>
      Boolean(product.oldPrice)
      || product.sizes?.some(size => size.label === 'S')
      || productMatchesKeywords(product, GIFT_KEYWORDS),
  )

  return {
    seasonalFlowers,
    artisanCompositions,
    giftWithBouquet,
  }
}
