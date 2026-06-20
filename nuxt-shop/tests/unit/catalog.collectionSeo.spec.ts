import { describe, expect, it } from 'vitest'

import {
  buildCollectionCanonicalPath,
  buildCollectionGiftNowLink,
} from '~/lib/catalog/collectionPageLinks'
import {
  buildCollectionBreadcrumbSchema,
  buildCollectionPageSchema,
  buildCollectionSeoMeta,
} from '~/lib/catalog/collectionSeo'
import { makeProduct } from '~/tests/fixtures/products'

describe('collection page seo helpers', () => {
  it('uses meta title and meta description first, then falls back to collection copy', () => {
    expect(buildCollectionSeoMeta({
      collection: {
        name: 'Пионы',
        metaTitle: 'Meta title',
        metaDescription: 'Meta description',
        description: 'Описание коллекции',
      },
      storeName: 'Buton',
      defaultDescriptionCity: 'Санкт-Петербургу',
    })).toEqual({
      title: 'Meta title',
      description: 'Meta description',
      ogTitle: 'Meta title',
      ogDescription: 'Meta description',
      ogType: 'website',
    })

    expect(buildCollectionSeoMeta({
      collection: {
        name: 'Пионы',
        description: 'Описание коллекции',
      },
      storeName: 'Buton',
      defaultDescriptionCity: 'Санкт-Петербургу',
    })).toMatchObject({
      title: 'Пионы — Buton',
      description: 'Описание коллекции',
    })
  })

  it('builds breadcrumb urls, collection schema urls, and caps itemList at 24 items', () => {
    const products = Array.from({ length: 30 }, (_, index) =>
      makeProduct({
        slug: `product-${index + 1}`,
        name: `Product ${index + 1}`,
        price: 3000 + index,
        images: index % 2 === 0 ? [`/img/${index + 1}.jpg`] : [],
        inStock: index % 3 !== 0,
      })
    )

    const breadcrumb = buildCollectionBreadcrumbSchema({
      siteUrl: 'https://shop.test',
      collectionName: 'Пионы',
      collectionSlug: 'peonies',
    })
    const schema = buildCollectionPageSchema({
      siteUrl: 'https://shop.test',
      collection: {
        name: 'Пионы',
        slug: 'peonies',
      },
      pageDescription: 'Описание коллекции',
      products,
    })

    expect(breadcrumb.itemListElement).toEqual([
      { '@type': 'ListItem', position: 1, name: 'Главная', item: 'https://shop.test/' },
      { '@type': 'ListItem', position: 2, name: 'Каталог', item: 'https://shop.test/catalog' },
      { '@type': 'ListItem', position: 3, name: 'Пионы', item: 'https://shop.test/catalog/peonies' },
    ])
    expect(schema.url).toBe('https://shop.test/catalog/peonies')
    expect(schema.mainEntity.itemListElement).toHaveLength(24)
    expect(schema.mainEntity.itemListElement[0]).toMatchObject({
      '@type': 'ListItem',
      position: 1,
      item: {
        '@type': 'Product',
        name: 'Product 1',
        image: 'https://shop.test/img/1.jpg',
        offers: {
          priceCurrency: 'RUB',
          price: 3000,
          url: 'https://shop.test/product/product-1',
        },
      },
    })
  })

  it('builds stable catalog links from collection slug', () => {
    expect(buildCollectionGiftNowLink('wedding-bouquets')).toBe('/catalog?cat=wedding-bouquets')
    expect(buildCollectionCanonicalPath('wedding-bouquets')).toBe('/catalog/wedding-bouquets')
  })
})
