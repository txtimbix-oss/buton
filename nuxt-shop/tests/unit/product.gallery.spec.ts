import { describe, expect, it } from 'vitest'

import { buildProductGalleryThumbKinds, stepProductGalleryIndex } from '~/lib/product/gallery'

describe('product gallery helpers', () => {
  it('builds active bloom first and keeps stable fallback order without duplicates', () => {
    expect(buildProductGalleryThumbKinds('green')).toEqual(['green', 'rose', 'peach', 'cream'])
    expect(buildProductGalleryThumbKinds()).toEqual(['cream', 'rose', 'peach', 'green'])
  })

  it('wraps gallery index in both directions and guards empty totals', () => {
    expect(stepProductGalleryIndex(0, -1, 4)).toBe(3)
    expect(stepProductGalleryIndex(3, 1, 4)).toBe(0)
    expect(stepProductGalleryIndex(0, 1, 0)).toBe(0)
  })
})
