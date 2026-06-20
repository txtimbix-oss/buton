import { BASE } from './client'
import { authApi } from './auth'
import { profileApi } from './profile'
import { addressApi } from './addresses'
import { wishlistApi } from './wishlist'
import { orderApi } from './orders'
import { reviewApi } from './reviews'
import { bonusApi } from './bonus'
import { publicApi } from './products'

// `@/api` is a runtime facade only. Import domain contracts from `@/types/*`.
export { normalizeOrder } from './order'

export const SHOP_URL = import.meta.env.VITE_SHOP_URL || 'http://localhost:3000'

// Resolves /uploads/... paths to the API server origin in production
export function assetUrl(path: string | null | undefined): string {
  if (!path) return ''
  if (path.startsWith('http') || path.startsWith('blob:')) return path
  return `${BASE}${path}`
}

export const api = {
  ...authApi,
  ...profileApi,
  ...addressApi,
  ...wishlistApi,
  ...orderApi,
  ...reviewApi,
  ...bonusApi,
  ...publicApi,
}
