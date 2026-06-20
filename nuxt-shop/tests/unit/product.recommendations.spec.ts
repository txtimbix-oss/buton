import { describe, expect, it } from 'vitest'

import { buildProductRecommendations } from '~/lib/product/recommendations'
import { makeProduct } from '~/tests/fixtures/products'

describe('product recommendations helpers', () => {
  it('prioritizes shared composition and same bloom for related products without duplicates', () => {
    const active = makeProduct({
      slug: 'active',
      bloom: 'rose',
      composition: [{ name: 'Роза', qty: '11 шт' }, { name: 'Эвкалипт', qty: '3 ветки' }],
    })

    const relatedByComposition = makeProduct({ slug: 'companion', bloom: 'peony', composition: [{ name: 'Роза', qty: '9 шт' }] })
    const relatedByBloom = makeProduct({ slug: 'same-bloom', bloom: 'rose', composition: [{ name: 'Гортензия', qty: '5 шт' }] })
    const featured = makeProduct({ slug: 'featured', featured: true, reviewCount: 20, tag: 'Премиум' })

    const picks = buildProductRecommendations(active, [
      active,
      relatedByBloom,
      relatedByComposition,
      featured,
    ])

    expect(picks.related.map(product => product.slug)).toEqual([
      'companion',
      'same-bloom',
      'featured',
    ])
  })

  it('excludes already used products from together and holiday lists while keeping fallback fill', () => {
    const active = makeProduct({
      slug: 'active',
      name: 'Свадебный букет',
      meta: 'Для свадьбы',
      description: 'Подойдет на свадьбу и праздник',
    })

    const related = makeProduct({ slug: 'related', composition: [{ name: 'Пион', qty: '7 шт' }] })
    const together = makeProduct({ slug: 'together', reviewCount: 14, tag: 'Новинка' })
    const holiday = makeProduct({ slug: 'holiday', name: 'Свадебная классика', description: 'Свадебная коллекция' })
    const fallback = makeProduct({ slug: 'fallback', reviewCount: 1, featured: false, tag: undefined })

    const picks = buildProductRecommendations(active, [
      active,
      related,
      together,
      holiday,
      fallback,
    ])

    expect(picks.together.map(product => product.slug)).toEqual(['together', 'related', 'holiday', 'fallback'])
    expect(picks.holidayVariants.map(product => product.slug)).toEqual(['holiday', 'fallback'])
    expect(new Set(picks.related.map(product => product.slug)).has('active')).toBe(false)
  })

  it('keeps same-bloom recommendations even when composition is empty', () => {
    const active = makeProduct({
      slug: 'active',
      bloom: 'peach',
      composition: [],
    })

    const sameBloom = makeProduct({ slug: 'same-bloom', bloom: 'peach', composition: [] })
    const fallback = makeProduct({ slug: 'fallback', bloom: 'cream', composition: [] })

    const picks = buildProductRecommendations(active, [active, sameBloom, fallback])

    expect(picks.related.map(product => product.slug)).toContain('same-bloom')
  })
})
