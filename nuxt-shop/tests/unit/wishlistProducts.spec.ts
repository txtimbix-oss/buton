import { describe, expect, it } from 'vitest'

import { getWishlistBouquetWord } from '~/lib/wishlist/pluralization'
import { buildWishlistSuggestions, selectWishlistProducts } from '~/lib/wishlist/products'
import { makeProduct } from '~/tests/fixtures/products'

describe('wishlist product helpers', () => {
  it('selects wishlist products by slug membership and ignores unknown slugs', () => {
    const products = [
      makeProduct({ slug: 'rose' }),
      makeProduct({ slug: 'peony' }),
      makeProduct({ slug: 'tulip' }),
    ]

    const wishlistProducts = selectWishlistProducts(products, ['tulip', 'missing', 'rose'])

    expect(wishlistProducts.map(product => product.slug)).toEqual(['rose', 'tulip'])
  })

  it('builds suggestions that exclude wishlist products and are capped at four items', () => {
    const products = [
      makeProduct({ slug: 'rose' }),
      makeProduct({ slug: 'peony' }),
      makeProduct({ slug: 'tulip' }),
      makeProduct({ slug: 'orchid' }),
      makeProduct({ slug: 'lily' }),
      makeProduct({ slug: 'iris' }),
      makeProduct({ slug: 'mimosa' }),
    ]

    const suggestions = buildWishlistSuggestions(products, ['rose', 'orchid'], 4)

    expect(suggestions.map(product => product.slug)).toEqual(['peony', 'tulip', 'lily', 'iris'])
  })
})

describe('getWishlistBouquetWord', () => {
  it.each([
    [1, 'букет'],
    [2, 'букета'],
    [5, 'букетов'],
    [11, 'букетов'],
    [21, 'букет'],
    [22, 'букета'],
    [24, 'букета'],
    [25, 'букетов'],
    [111, 'букетов'],
    [112, 'букетов'],
    [114, 'букетов'],
  ])('returns the correct form for %i', (count, expected) => {
    expect(getWishlistBouquetWord(count)).toBe(expected)
  })
})
