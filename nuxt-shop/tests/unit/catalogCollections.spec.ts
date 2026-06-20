import { describe, expect, it } from 'vitest'

import {
  findCollectionByLegacyQuery,
  productMatchesCollection,
  type CatalogCollectionSummary,
} from '~/constants/catalogCollections'
import { makeProduct } from '~/tests/fixtures/products'

function makeCollection(overrides: Partial<CatalogCollectionSummary> = {}): CatalogCollectionSummary {
  return {
    name: overrides.name ?? 'Коллекция',
    slug: overrides.slug ?? 'kollekciya',
    tag: overrides.tag ?? '',
    priceMax: overrides.priceMax ?? null,
    autoRules: overrides.autoRules ?? [],
    isActive: overrides.isActive ?? true,
  }
}

describe('catalogCollections', () => {
  it('matches legacy tag collections only for in-stock products', () => {
    const collection = makeCollection({ tag: 'Премиум' })

    expect(productMatchesCollection(makeProduct({ tag: 'Премиум', inStock: true }), collection)).toBe(true)
    expect(productMatchesCollection(makeProduct({ tag: 'Премиум', inStock: false }), collection)).toBe(false)
    expect(productMatchesCollection(makeProduct({ tag: 'Новинка', inStock: true }), collection)).toBe(false)
  })

  it('matches price-capped collections only for in-stock products within the limit', () => {
    const collection = makeCollection({ priceMax: 6000 })

    expect(productMatchesCollection(makeProduct({ price: 5900, inStock: true }), collection)).toBe(true)
    expect(productMatchesCollection(makeProduct({ price: 6100, inStock: true }), collection)).toBe(false)
    expect(productMatchesCollection(makeProduct({ price: 5500, inStock: false }), collection)).toBe(false)
  })

  it('enforces in-stock products for auto-rule collections unless explicitly overridden', () => {
    const collection = makeCollection({
      autoRules: [{ field: 'bloom', operator: 'eq', value: 'rose' }],
    })

    expect(productMatchesCollection(makeProduct({ bloom: 'rose', inStock: true }), collection)).toBe(true)
    expect(productMatchesCollection(makeProduct({ bloom: 'rose', inStock: false }), collection)).toBe(false)
  })

  it('allows out-of-stock products for auto-rule collections when inStock=false is explicit', () => {
    const collection = makeCollection({
      autoRules: [
        { field: 'bloom', operator: 'eq', value: 'rose' },
        { field: 'inStock', operator: 'eq', value: 'false' },
      ],
    })

    expect(productMatchesCollection(makeProduct({ bloom: 'rose', inStock: false }), collection)).toBe(true)
    expect(productMatchesCollection(makeProduct({ bloom: 'rose', inStock: true }), collection)).toBe(false)
  })

  it('matches legacy collection queries by slug, title, and hyphenated title', () => {
    const collections = [
      makeCollection({ name: 'Премиум букеты', slug: 'premium-bouquets' }),
      makeCollection({ name: 'Весенние истории', slug: 'spring-stories' }),
    ]

    expect(findCollectionByLegacyQuery(collections, 'premium-bouquets')?.name).toBe('Премиум букеты')
    expect(findCollectionByLegacyQuery(collections, 'Весенние истории')?.slug).toBe('spring-stories')
    expect(findCollectionByLegacyQuery(collections, 'vesennie-istorii')).toBeNull()
    expect(findCollectionByLegacyQuery(collections, 'Премиум-букеты')?.slug).toBe('premium-bouquets')
  })
})
