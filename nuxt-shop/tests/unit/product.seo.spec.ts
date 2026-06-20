import { describe, expect, it } from 'vitest'

import {
  buildProductCompositionText,
  buildProductBreadcrumbSchema,
  buildProductSeoMeta,
  buildProductSchema,
  buildProductSeoText,
  deriveProductMetadata,
  formatProductPrice,
} from '~/lib/product/seo'
import { makeProduct } from '~/tests/fixtures/products'

describe('product seo helpers', () => {
  it('derives stable product metadata from size, text, and tag signals', () => {
    const product = makeProduct({
      name: 'Романтический букет',
      meta: 'Премиум композиция для дома',
      description: 'Идеален для романтического свидания и уюта дома',
      oldPrice: 8000,
      price: 6400,
      tag: 'Премиум',
      sizes: [
        { label: 'M', desc: '19 стеблей · высота 55 см · вес 1.2 кг', price: 6400 },
      ],
      composition: [{ name: 'Роза', qty: '19 шт' }, { name: 'Эвкалипт', qty: '4 ветки' }],
      reviewCount: 14,
      rating: 4.9,
    })

    const metadata = deriveProductMetadata(product, 0)

    expect(metadata).toMatchObject({
      activeSizeLabel: 'M',
      sizeStemText: '19 стеблей',
      sizeHeight: 'высота 55 см',
      sizeWeight: 'вес 1.2 кг',
      packagingHint: 'премиум-упаковка',
      forWho: ['Для любимого человека', 'Для дома'],
      isTopPick: true,
      isPopular: true,
      discountPct: 20,
      productFlowerText: 'Роза, Эвкалипт',
    })
  })

  it('fills seo text placeholders with product-specific values and fallbacks', () => {
    const product = makeProduct({
      name: 'Нежный сад',
      price: 5400,
      composition: [{ name: 'Пион', qty: '7 шт' }],
    })

    const text = buildProductSeoText({
      product,
      activeSizeLabel: 'L',
      storeCity: 'Москве',
      template: '<h2>{name}</h2><p>{flowers} · {size} · {price} · {city} · {occasions}</p>',
    })

    expect(text).toBe('<h2>Нежный сад</h2><p>Пион · L · 5 400 ₽ · Москве · свидания и подарки в важных моментах</p>')
    expect(formatProductPrice(5400)).toBe('5 400 ₽')
  })

  it('uses current selected price for seo text when provided', () => {
    const product = makeProduct({
      name: 'Нежный сад',
      price: 5400,
      composition: [{ name: 'Пион', qty: '7 шт' }],
    })

    const text = buildProductSeoText({
      product,
      activeSizeLabel: 'XL',
      currentPrice: 6900,
      template: '<p>{size} · {price}</p>',
    })

    expect(text).toBe('<p>XL · 6 900 ₽</p>')
  })

  it('builds breadcrumb and product schema with reviews and offer data', () => {
    const product = makeProduct({
      slug: 'peony-dream',
      name: 'Peony Dream',
      description: 'Описание букета',
      meta: 'Пионы',
      sizes: [{ label: 'M', desc: '11 стеблей · 50 см · 900 г', price: 7000 }],
      images: ['/img/peony.jpg'],
      reviewCount: 3,
      rating: 4.8,
    })

    const breadcrumb = buildProductBreadcrumbSchema(product, 'https://shop.test')
    const schema = buildProductSchema({
      product,
      siteUrl: 'https://shop.test',
      storeName: 'Buton',
      seoText: '<p>SEO</p>',
      compositionText: 'Пионы, 11 шт',
      activeSizeLabel: 'M',
      currentSizePrice: 7000,
      sizeHeight: '50 см',
      sizeWeight: '900 г',
      packagingHint: 'крафт + лента',
      reviews: [
        { key: 'r1', name: 'Анна', date: '1 мая 2026', rating: 5, text: 'Очень красиво' },
      ],
    })

    expect(breadcrumb?.itemListElement).toHaveLength(3)
    expect(schema).toMatchObject({
      '@type': 'Product',
      name: 'Peony Dream',
      image: 'https://shop.test/img/peony.jpg',
      brand: { name: 'Buton' },
      offers: { price: 7000, availability: 'https://schema.org/InStock' },
      aggregateRating: { ratingValue: 4.8, reviewCount: 3 },
    })
    expect(schema?.review).toEqual([
      expect.objectContaining({
        reviewBody: 'Очень красиво',
        author: { name: 'Анна' },
      }),
    ])
  })

  it('builds product meta tags and composition text for page-level seo wiring', () => {
    const product = makeProduct({
      name: 'Peony Dream',
      price: 7000,
      meta: 'Пионы',
      careInstructions: 'Меняйте воду ежедневно и подрезайте стебли',
      images: ['/img/peony.jpg'],
      composition: [
        { name: 'Пион', qty: '11 шт' },
        { name: 'Эвкалипт', qty: '3 ветки' },
      ],
    }) as ReturnType<typeof makeProduct> & {
      metaTitle?: string
      metaDescription?: string
      ogImage?: string
    }

    product.metaTitle = 'Meta title'
    product.metaDescription = 'Meta description'
    product.ogImage = '/img/og-peony.jpg'

    expect(buildProductSeoMeta(product, 'https://shop.test', 'Buton')).toEqual({
      title: 'Meta title',
      description: 'Meta description',
      ogTitle: 'Meta title',
      ogDescription: 'Meta description',
      ogImage: 'https://shop.test/img/og-peony.jpg',
      ogType: 'product',
      twitterCard: 'summary_large_image',
    })

    expect(buildProductCompositionText(product)).toBe('Пион, 11 шт; Эвкалипт, 3 ветки')
    expect(buildProductSeoMeta(null, 'https://shop.test', 'Buton')).toEqual({ title: 'Buton' })
  })
})
