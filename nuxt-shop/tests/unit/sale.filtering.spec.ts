import { describe, expect, it } from 'vitest'

import {
  defaultSaleFilterChip,
  filterSaleProducts,
  productHasSaleDiscount,
  saleFilterChips,
  sortDiscountedProductsFirst,
} from '~/lib/sale/filtering'
import { makeProduct } from '~/tests/fixtures/products'

const products = [
  makeProduct({
    slug: 'rose-discount',
    price: 3200,
    oldPrice: 3900,
    tag: 'Хит',
  }),
  makeProduct({
    slug: 'field-regular',
    price: 2800,
  }),
  makeProduct({
    slug: 'premium-regular',
    price: 5100,
    tag: 'Премиум',
  }),
  makeProduct({
    slug: 'peony-hit',
    price: 4700,
    tag: 'Хит',
  }),
]

describe('sale filtering', () => {
  it('exposes canonical chips with the default chip first', () => {
    expect(saleFilterChips).toEqual([
      'Все',
      'Со скидкой',
      'Хиты',
      'До 4 000 ₽',
      'Сезонное',
    ])
    expect(defaultSaleFilterChip).toBe('Все')
  })

  it('detects only real markdowns as sale discounts', () => {
    expect(productHasSaleDiscount(products[0]!)).toBe(true)
    expect(productHasSaleDiscount(products[1]!)).toBe(false)
    expect(
      productHasSaleDiscount(
        makeProduct({
          slug: 'same-prices',
          price: 3200,
          oldPrice: 3200,
        }),
      ),
    ).toBe(false)
  })

  it('sorts discounted products first without dropping the rest', () => {
    expect(sortDiscountedProductsFirst(products).map(product => product.slug)).toEqual([
      'rose-discount',
      'field-regular',
      'premium-regular',
      'peony-hit',
    ])
  })

  it('filters products by chip semantics after sale-first sorting', () => {
    expect(filterSaleProducts(products, 'Со скидкой').map(product => product.slug)).toEqual(['rose-discount'])
    expect(filterSaleProducts(products, 'Хиты').map(product => product.slug)).toEqual([
      'rose-discount',
      'peony-hit',
    ])
    expect(filterSaleProducts(products, 'До 4 000 ₽').map(product => product.slug)).toEqual([
      'rose-discount',
      'field-regular',
    ])
    expect(filterSaleProducts(products, 'Сезонное').map(product => product.slug)).toEqual([
      'rose-discount',
      'field-regular',
      'peony-hit',
    ])
  })
})
