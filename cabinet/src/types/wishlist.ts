import type { IProduct } from './product'

export type WishlistProduct = Pick<IProduct, 'slug' | 'name' | 'price'> & {
  _id?: IProduct['_id']
  meta?: IProduct['meta']
  bloom?: IProduct['bloom']
  images?: IProduct['images'] | null
  tag?: IProduct['tag']
  inStock?: IProduct['inStock']
}

export interface WishlistResponse {
  ok: boolean
  slugs: string[]
  products: WishlistProduct[]
}

export interface WishlistMutationResponse {
  ok: boolean
  wishlist: string[]
}
