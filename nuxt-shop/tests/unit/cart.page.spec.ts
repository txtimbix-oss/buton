import { describe, expect, it } from 'vitest'

import {
  buildCartProductImageMap,
  buildCartProductVolumeMap,
  getCartItemWord,
  resolveCartItemImage,
  type CartProductSnapshot,
} from '~/lib/cart/page'

const snapshots: CartProductSnapshot[] = [
  {
    slug: 'rose',
    images: ['/img/rose.jpg', '/img/rose-2.jpg'],
    volumeRules: [{ minQty: 3, discountPct: 10 }],
  },
  {
    slug: 'peony',
    images: [],
  },
  {
    slug: 'tulip',
    images: ['/img/tulip.jpg'],
    volumeRules: [{ minQty: 5, discountPct: 15 }],
  },
]

describe('cart page helpers', () => {
  it('builds image and volume maps from product snapshots', () => {
    expect(buildCartProductImageMap(snapshots)).toEqual({
      rose: '/img/rose.jpg',
      tulip: '/img/tulip.jpg',
    })

    expect(buildCartProductVolumeMap(snapshots)).toEqual({
      rose: [{ minQty: 3, discountPct: 10 }],
      tulip: [{ minQty: 5, discountPct: 15 }],
    })
  })

  it('prefers the cart line image and falls back to the product image map', () => {
    const imageMap = buildCartProductImageMap(snapshots)

    expect(resolveCartItemImage({ slug: 'rose', image: '/custom/rose.jpg' }, imageMap)).toBe('/custom/rose.jpg')
    expect(resolveCartItemImage({ slug: 'tulip' }, imageMap)).toBe('/img/tulip.jpg')
    expect(resolveCartItemImage({ slug: 'missing' }, imageMap)).toBeUndefined()
  })

  it.each([
    [1, 'букет'],
    [2, 'букета'],
    [5, 'букетов'],
    [11, 'букетов'],
    [21, 'букет'],
    [24, 'букета'],
  ])('returns the correct bouquet word for %i items', (count, expected) => {
    expect(getCartItemWord(count)).toBe(expected)
  })
})
