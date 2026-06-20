import { describe, expect, it } from 'vitest'

import {
  buildHomeSeasonalCollections,
  parseSeasonFilters,
  productMatchesKeywords,
  resolveSeasonNames,
  splitKeywordTokens,
} from '~/constants/seasonCollections'
import { makeProduct } from '~/tests/fixtures/products'

describe('seasonCollections', () => {
  it('falls back to defaults when seasonal settings JSON is invalid', () => {
    const filters = parseSeasonFilters('{broken json')

    expect(filters).toHaveLength(5)
    expect(filters[0]).toMatchObject({ name: 'Весна', keyword: 'весна' })
  })

  it('splits keyword tokens across supported delimiters', () => {
    expect(splitKeywordTokens('весна, пион; тюльпан|ромашка')).toEqual([
      'весна',
      'пион',
      'тюльпан',
      'ромашка',
    ])
  })

  it('matches product text across name, meta, description, composition and tag', () => {
    const product = makeProduct({
      name: 'Пионовый сад',
      meta: 'Садовые цветы',
      description: 'Весенний букет',
      composition: [{ name: 'Тюльпан', qty: '7 шт' }],
      tag: 'Премиум',
    })

    expect(productMatchesKeywords(product, 'пион')).toBe(true)
    expect(productMatchesKeywords(product, 'тюльпан')).toBe(true)
    expect(productMatchesKeywords(product, 'премиум')).toBe(true)
    expect(productMatchesKeywords(product, 'орхидея')).toBe(false)
  })

  it('resolves season names from query tokens using configured keywords', () => {
    const names = resolveSeasonNames('террак|зима', [
      { name: 'Осеннее тепло', keyword: 'осень|террак' },
      { name: 'Зимняя коллекция', keyword: 'зима|новогод' },
    ])

    expect(names).toEqual(['Осеннее тепло', 'Зимняя коллекция'])
  })

  it('builds seasonal homepage cards from configured filters even when labels are renamed', () => {
    const products = [
      makeProduct({
        slug: 'spring',
        name: 'Тюльпан и пион',
        meta: 'Весенняя коллекция',
        composition: [{ name: 'Тюльпан', qty: '9 шт' }],
      }),
      makeProduct({
        slug: 'winter',
        name: 'Новогодний акцент',
        meta: 'Зимний букет',
      }),
      makeProduct({
        slug: 'autumn',
        name: 'Терракотовый вечер',
        meta: 'Осенний букет',
      }),
    ]

    const filters = [
      { name: 'Тюльпаны и весна', keyword: 'весна|тюльпан' },
      { name: 'Пышные пионы', keyword: 'пион' },
      { name: 'Осеннее тепло', keyword: 'осень|террак' },
      { name: 'Зимний сезон', keyword: 'зима|новогод' },
    ]

    const collections = buildHomeSeasonalCollections(products, filters)
    const spring = collections.find(item => item.key === 'spring-bouquets')
    const winter = collections.find(item => item.key === 'holiday-arrangements')

    expect(spring).toMatchObject({
      query: 'весна|тюльпан',
      productsCount: 1,
      to: { path: '/catalog', query: { season: 'весна|тюльпан' } },
    })
    expect(winter).toMatchObject({
      query: 'зима|новогод',
      productsCount: 1,
    })
  })
})
