export interface IProduct {
  _id: string
  name: string
  slug: string
  meta: string
  price: number
  bloom: string
  images: string[]
  tag?: string
  inStock: boolean
}

export interface ProductQueryParams {
  bloom?: string
  featured?: string
  limit?: number
}
