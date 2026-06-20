import type { Product } from '~/composables/useShop'

export const saleFilterChips = [
  'Все',
  'Со скидкой',
  'Хиты',
  'До 4 000 ₽',
  'Сезонное',
] as const

export type SaleFilterChip = (typeof saleFilterChips)[number]

export const defaultSaleFilterChip: SaleFilterChip = 'Все'

export function productHasSaleDiscount(product: Product): boolean {
  return typeof product.oldPrice === 'number' && product.oldPrice > product.price
}

export function sortDiscountedProductsFirst(products: Product[]): Product[] {
  return [...products].sort((left, right) => {
    return Number(productHasSaleDiscount(right)) - Number(productHasSaleDiscount(left))
  })
}

export function filterSaleProducts(products: Product[], activeChip: SaleFilterChip): Product[] {
  const sortedProducts = sortDiscountedProductsFirst(products)

  if (activeChip === 'Со скидкой') {
    return sortedProducts.filter(productHasSaleDiscount)
  }

  if (activeChip === 'Хиты') {
    return sortedProducts.filter(product => product.tag === 'Хит')
  }

  if (activeChip === 'До 4 000 ₽') {
    return sortedProducts.filter(product => product.price <= 4000)
  }

  if (activeChip === 'Сезонное') {
    return sortedProducts.filter(product => product.tag !== 'Премиум')
  }

  return sortedProducts
}
