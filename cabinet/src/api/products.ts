import { pub, unwrap } from './client'
import type { IProduct, ProductQueryParams } from '@/types/api'

export const publicApi = {
  getProducts: (params: ProductQueryParams) =>
    unwrap(pub.get<IProduct[]>('/products', { params })),
}
