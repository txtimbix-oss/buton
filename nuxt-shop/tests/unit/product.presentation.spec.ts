import { describe, expect, it } from 'vitest'

import { buildProductPresentation } from '~/lib/product/presentation'
import { makeProduct } from '~/tests/fixtures/products'

describe('product presentation helpers', () => {
  it('derives primary card presentation fields from product content and sizes', () => {
    const product = makeProduct({
      tag: 'Популярное',
      reviewCount: 12,
      rating: 4.85,
      meta: 'Премиум композиция',
      description: 'Букет в крафт-упаковке для важного повода',
      careInstructions: 'При хорошем уходе стоит до 7 дней',
      composition: [
        { name: 'Роза', qty: '11 шт' },
        { name: 'Эустома', qty: '5 шт' },
        { name: 'Эвкалипт', qty: '3 ветки' },
        { name: 'Лента', qty: '1 шт' },
      ],
      sizes: [
        { label: 'S', desc: 'высота 45 см · вес 700 г', price: 4900 },
        { label: 'M', desc: 'высота 55 см · вес 1.2 кг', price: 5900 },
      ],
    })

    expect(buildProductPresentation(product)).toMatchObject({
      primarySizeLabel: 'M',
      primarySizePrice: 5900,
      compositionSummary: 'Роза (11 шт), Эустома (5 шт), Эвкалипт (3 ветки)',
      shelfLife: 'до 7 дней',
      sizeHeight: '55 см',
      sizeWeight: '1.2 кг',
      packagingHint: 'премиум-упаковка',
      isTopPick: true,
      isPopular: true,
    })
  })

  it('falls back to first size, default shelf life, and default packaging when signals are absent', () => {
    const product = makeProduct({
      price: 4300,
      tag: 'Коллекция',
      reviewCount: 5,
      rating: 4.7,
      meta: 'Лаконичный букет',
      description: 'Минималистичная композиция',
      careInstructions: 'Меняйте воду ежедневно',
      sizes: [
        { label: 'L', desc: 'диаметр 40 см', price: 7300 },
      ],
      composition: [],
    })

    expect(buildProductPresentation(product)).toMatchObject({
      primarySizeLabel: 'L',
      primarySizePrice: 7300,
      compositionSummary: '',
      shelfLife: 'до 7 дней (стандартно)',
      sizeHeight: '40 см',
      sizeWeight: '—',
      packagingHint: 'крафт + лента',
      isTopPick: false,
      isPopular: false,
    })
  })

  it('uses product price and empty labels when sizes are missing', () => {
    const product = makeProduct({
      price: 5100,
      sizes: [],
      tag: 'Новинка',
      reviewCount: 0,
    })

    expect(buildProductPresentation(product)).toMatchObject({
      primarySizeLabel: '—',
      primarySizePrice: 5100,
      sizeHeight: '—',
      sizeWeight: '—',
      isPopular: true,
    })
  })
})
