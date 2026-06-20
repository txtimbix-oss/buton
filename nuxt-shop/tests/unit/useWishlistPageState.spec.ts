import { ref } from 'vue'
import { describe, expect, it } from 'vitest'

import { useWishlistPageState } from '~/composables/useWishlistPageState'
import { makeProduct } from '~/tests/fixtures/products'

describe('useWishlistPageState', () => {
  it('clears all wishlist slugs in place and recomputes derived state', () => {
    const slugs = ref(['rose', 'peony'])
    const originalList = slugs.value
    const allProducts = ref([
      makeProduct({ slug: 'rose' }),
      makeProduct({ slug: 'peony' }),
      makeProduct({ slug: 'tulip' }),
    ])

    const state = useWishlistPageState({
      allProducts,
    }, {
      wishlist: { slugs },
    })

    expect(state.wishlistProducts.value.map(product => product.slug)).toEqual(['rose', 'peony'])

    state.clearAll()

    expect(slugs.value).toBe(originalList)
    expect(slugs.value).toEqual([])
    expect(state.wishlistProducts.value).toEqual([])
    expect(state.suggestions.value.map(product => product.slug)).toEqual(['rose', 'peony', 'tulip'])
    expect(state.bouquetWord.value).toBe('букетов')
  })
})
