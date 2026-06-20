import type { CheckoutVolumeRule } from '~/lib/checkout/types'

export interface CartProductSnapshot {
  slug: string
  images?: string[]
  volumeRules?: CheckoutVolumeRule[]
}

export interface CartImageLike {
  slug: string
  image?: string
}

export function buildCartProductImageMap(products: CartProductSnapshot[]) {
  const imageMap: Record<string, string> = {}

  for (const product of products) {
    if (product.images?.[0]) {
      imageMap[product.slug] = product.images[0]
    }
  }

  return imageMap
}

export function buildCartProductVolumeMap(products: CartProductSnapshot[]) {
  const volumeMap: Record<string, CheckoutVolumeRule[]> = {}

  for (const product of products) {
    if (product.volumeRules?.length) {
      volumeMap[product.slug] = product.volumeRules
    }
  }

  return volumeMap
}

export function resolveCartItemImage(item: CartImageLike, imageMap: Record<string, string>) {
  return item.image || imageMap[item.slug]
}

export function getCartItemWord(count: number) {
  if (count % 10 === 1 && count % 100 !== 11) return 'букет'
  if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return 'букета'
  return 'букетов'
}
