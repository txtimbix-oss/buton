import { describe, expect, it } from 'vitest'

import type { Banner, Review } from '~/composables/useShop'
import {
  buildHomeMarqueeReviews,
  partitionHomeBanners,
  pickHomeFeaturedProducts,
  pickHomeHeroProduct,
} from '~/lib/home/discovery'
import { makeProduct } from '~/tests/fixtures/products'

describe('home discovery helpers', () => {
  it('prefers featured product for hero and falls back to the first product', () => {
    const regular = makeProduct({ slug: 'regular', featured: false })
    const featured = makeProduct({ slug: 'featured', featured: true })

    expect(pickHomeHeroProduct([regular, featured])?.slug).toBe('featured')
    expect(pickHomeHeroProduct([regular])?.slug).toBe('regular')
    expect(pickHomeHeroProduct([])).toBeNull()
  })

  it('builds featured home picks without duplicating the same product', () => {
    const premium = makeProduct({ slug: 'premium', tag: 'Премиум' })
    const newArrival = makeProduct({ slug: 'new', tag: 'Новинка' })
    const fallback = makeProduct({ slug: 'fallback' })

    expect(pickHomeFeaturedProducts([premium, newArrival, fallback]).map(product => product.slug)).toEqual([
      'premium',
      'new',
    ])

    expect(pickHomeFeaturedProducts([premium, fallback]).map(product => product.slug)).toEqual([
      'premium',
      'fallback',
    ])
  })

  it('partitions home banners by storefront position and picks one popup banner', () => {
    const banners: Banner[] = [
      { _id: 'hero-1', position: 'hero', title: 'Hero', active: true },
      { _id: 'promo-1', position: 'promo', title: 'Promo', active: true },
      { _id: 'editorial-1', position: 'editorial', title: 'Editorial', active: true },
      { _id: 'popup-1', position: 'popup', title: 'Popup', active: true },
      { _id: 'popup-2', position: 'popup', title: 'Popup 2', active: true },
    ]

    const buckets = partitionHomeBanners(banners)

    expect(buckets.hero.map(banner => banner._id)).toEqual(['hero-1'])
    expect(buckets.promo.map(banner => banner._id)).toEqual(['promo-1'])
    expect(buckets.editorial.map(banner => banner._id)).toEqual(['editorial-1'])
    expect(buckets.popup?._id).toBe('popup-1')
  })

  it('uses api reviews only when enough long public reviews are available', () => {
    const fallback = [
      { key: 'fallback-1', name: 'Анна', text: 'Fallback review text that is already long enough.' },
    ]
    const shortApi: Review[] = [
      {
        _id: 'r1',
        productSlug: 'rose',
        name: 'Ирина',
        rating: 5,
        text: 'Короткий',
        status: 'approved',
        createdAt: '2026-06-08T00:00:00.000Z',
      },
    ]
    const longApi: Review[] = ['1', '2', '3', '4'].map((index) => ({
      _id: `review-${index}`,
      productSlug: 'rose',
      name: `Покупатель ${index}`,
      rating: 5,
      text: `Очень подробный отзыв номер ${index}, который точно длиннее сорока символов.`,
      status: 'approved' as const,
      createdAt: '2026-06-08T00:00:00.000Z',
    }))

    expect(buildHomeMarqueeReviews(shortApi, fallback)).toEqual(fallback)
    expect(buildHomeMarqueeReviews(longApi, fallback).map(review => review.key)).toEqual([
      'review-1',
      'review-2',
      'review-3',
      'review-4',
    ])
  })
})
