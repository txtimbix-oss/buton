import type { Product } from '~/composables/useShop'
import type { CatalogCollectionHeroThumb } from '~/lib/catalog/types'

export function selectCollectionHeroImage(products: Product[]) {
  return products.find(product => product.images?.[0])?.images?.[0]
}

export function buildCollectionHeroThumbs(products: Product[]): CatalogCollectionHeroThumb[] {
  return products
    .filter(product => product.images?.[0])
    .slice(0, 4)
    .map(product => ({
      slug: product.slug,
      name: product.name,
      src: product.images[0] as string,
    }))
}
