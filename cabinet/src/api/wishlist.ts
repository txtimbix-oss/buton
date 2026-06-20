import { http, unwrap } from './client'
import type { WishlistMutationResponse, WishlistResponse } from '@/types/api'

export const wishlistApi = {
  getWishlist: () =>
    unwrap(http.get<WishlistResponse>('/wishlist')),

  addToWishlist: (slug: string) =>
    unwrap(http.post<WishlistMutationResponse>(`/wishlist/${slug}`)),

  removeFromWishlist: (slug: string) =>
    unwrap(http.delete<WishlistMutationResponse>(`/wishlist/${slug}`)),
}
