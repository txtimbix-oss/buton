import { describe, expect, it } from 'vitest'

import { buildHomeProductSections } from '~/constants/homeProductSections'
import { makeProduct } from '~/tests/fixtures/products'

const seasonFilters = [
  { name: 'Весна', keyword: 'весна|тюльпан' },
  { name: 'Осень', keyword: 'осень|террак' },
]

describe('homeProductSections', () => {
  it('builds meaning-based sections without duplicating featured products', () => {
    const products = [
      makeProduct({ slug: 'featured', name: 'Hero Product', tag: 'Премиум' }),
      makeProduct({ slug: 'season-1', name: 'Тюльпановый день', meta: 'Весна' }),
      makeProduct({ slug: 'season-2', name: 'Осенний букет', meta: 'Терракота' }),
      makeProduct({ slug: 'artisan', name: 'Авторская орхидея', meta: 'Дизайнерская композиция' }),
      makeProduct({ slug: 'gift', oldPrice: 8000, price: 6000 }),
      makeProduct({ slug: 'gift-s', sizes: [{ label: 'S', desc: 'Small', price: 2900 }] }),
    ]

    const sections = buildHomeProductSections(products, ['featured'], seasonFilters)

    expect(sections.seasonalFlowers.map(product => product.slug)).toEqual(['season-1', 'season-2'])
    expect(sections.artisanCompositions.map(product => product.slug)).toEqual(['artisan'])
    expect(sections.giftWithBouquet.map(product => product.slug)).toEqual(['gift', 'gift-s'])
  })

  it('does not pad underfilled sections with unrelated products', () => {
    const products = [
      makeProduct({ slug: 'season', name: 'Тюльпановый букет', meta: 'Весна' }),
      makeProduct({
        slug: 'plain',
        name: 'Базовый букет',
        meta: 'Нейтральная композиция',
        sizes: [{ label: 'L', desc: 'Large', price: 7000 }],
      }),
      makeProduct({
        slug: 'artisan',
        name: 'Авторская композиция',
        meta: 'Орхидея',
        sizes: [{ label: 'L', desc: 'Large', price: 8200 }],
      }),
    ]

    const sections = buildHomeProductSections(products, [], seasonFilters)

    expect(sections.seasonalFlowers.map(product => product.slug)).toEqual(['season'])
    expect(sections.artisanCompositions.map(product => product.slug)).toEqual(['artisan'])
    expect(sections.giftWithBouquet).toEqual([])
  })
})
