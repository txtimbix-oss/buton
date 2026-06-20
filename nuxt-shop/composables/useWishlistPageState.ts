import { computed, toValue, type MaybeRefOrGetter } from 'vue'

import type { Product } from '~/composables/useShop'
import { useWishlist } from '~/composables/useWishlist'
import { getWishlistBouquetWord } from '~/lib/wishlist/pluralization'
import { buildWishlistSuggestions, selectWishlistProducts } from '~/lib/wishlist/products'

interface WishlistStateSource {
  slugs: ReturnType<typeof useWishlist>['slugs']
}

export interface UseWishlistPageStateOptions {
  allProducts: MaybeRefOrGetter<Product[] | null | undefined>
}

interface UseWishlistPageStateDependencies {
  wishlist?: WishlistStateSource
  suggestionLimit?: number
}

export function useWishlistPageState(
  options: UseWishlistPageStateOptions,
  dependencies: UseWishlistPageStateDependencies = {},
) {
  const allProducts = computed(() => toValue(options.allProducts) ?? [])
  const wishlist = dependencies.wishlist ?? useWishlist()
  const suggestionLimit = dependencies.suggestionLimit ?? 4

  const wishlistProducts = computed(() =>
    selectWishlistProducts(allProducts.value, wishlist.slugs.value),
  )

  const suggestions = computed(() =>
    buildWishlistSuggestions(allProducts.value, wishlist.slugs.value, suggestionLimit),
  )

  const bouquetWord = computed(() => getWishlistBouquetWord(wishlistProducts.value.length))

  function clearAll() {
    wishlist.slugs.value.splice(0, wishlist.slugs.value.length)
  }

  return {
    wishlistProducts,
    suggestions,
    bouquetWord,
    clearAll,
  }
}
