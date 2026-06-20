import type { Product } from '~/composables/useShop'

export function selectWishlistProducts(products: Product[], wishlistSlugs: string[]): Product[] {
  if (!products.length || !wishlistSlugs.length) {
    return []
  }

  const wishlistSet = new Set(wishlistSlugs)
  return products.filter(product => wishlistSet.has(product.slug))
}

export function buildWishlistSuggestions(
  products: Product[],
  wishlistSlugs: string[],
  limit = 4,
): Product[] {
  if (!products.length || limit <= 0) {
    return []
  }

  const wishlistSet = new Set(wishlistSlugs)
  return products.filter(product => !wishlistSet.has(product.slug)).slice(0, limit)
}
