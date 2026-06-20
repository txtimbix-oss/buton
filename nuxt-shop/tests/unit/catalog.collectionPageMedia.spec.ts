import { describe, expect, it } from 'vitest'

import {
  buildCollectionHeroThumbs,
  selectCollectionHeroImage,
} from '~/lib/catalog/collectionPageMedia'
import { makeProduct } from '~/tests/fixtures/products'

describe('collection page media helpers', () => {
  it('selects the first available hero image from products', () => {
    const heroImage = selectCollectionHeroImage([
      makeProduct({ slug: 'no-image', images: [] }),
      makeProduct({ slug: 'with-image', images: ['/img/hero.jpg'] }),
      makeProduct({ slug: 'later-image', images: ['/img/later.jpg'] }),
    ])

    expect(heroImage).toBe('/img/hero.jpg')
  })

  it('builds up to four hero thumbs and skips products without images', () => {
    const thumbs = buildCollectionHeroThumbs([
      makeProduct({ slug: 'a', name: 'A', images: ['/img/a.jpg'] }),
      makeProduct({ slug: 'b', name: 'B', images: [] }),
      makeProduct({ slug: 'c', name: 'C', images: ['/img/c.jpg'] }),
      makeProduct({ slug: 'd', name: 'D', images: ['/img/d.jpg'] }),
      makeProduct({ slug: 'e', name: 'E', images: ['/img/e.jpg'] }),
      makeProduct({ slug: 'f', name: 'F', images: ['/img/f.jpg'] }),
    ])

    expect(thumbs).toEqual([
      { slug: 'a', name: 'A', src: '/img/a.jpg' },
      { slug: 'c', name: 'C', src: '/img/c.jpg' },
      { slug: 'd', name: 'D', src: '/img/d.jpg' },
      { slug: 'e', name: 'E', src: '/img/e.jpg' },
    ])
  })
})
