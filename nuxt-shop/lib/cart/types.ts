export interface CartLineIdentityInput {
  slug: string
  sizeLabel: string
  addons?: string[]
  mode?: string
}

export interface CartLineInput extends CartLineIdentityInput {
  name: string
  bloom: string
  image?: string
  meta: string
  price: number
  qty?: number
}

export interface CartLine extends Omit<CartLineInput, 'addons' | 'qty'> {
  lineId: string
  lineKey: string
  qty: number
  addons: string[]
}
