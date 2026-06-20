import { computed, ref, toValue, watch, type MaybeRefOrGetter } from 'vue'

import type { Product } from '~/composables/useShop'
import { buildProductGalleryThumbKinds } from '~/lib/product/gallery'

export interface UseProductGalleryStateOptions {
  product: MaybeRefOrGetter<Product | null | undefined>
  slug: MaybeRefOrGetter<string | null | undefined>
}

export function useProductGalleryState(options: UseProductGalleryStateOptions) {
  const product = computed(() => toValue(options.product))
  const slug = computed(() => toValue(options.slug) ?? '')

  const activeThumb = ref(0)
  const imgError = ref(false)
  const brokenThumbs = ref<number[]>([])

  const thumbs = computed(() => buildProductGalleryThumbKinds(product.value?.bloom))

  watch(() => product.value?.slug, () => {
    imgError.value = false
    brokenThumbs.value = []
    activeThumb.value = 0
  })

  watch(slug, () => {
    brokenThumbs.value = []
    activeThumb.value = 0
  })

  function selectFallbackThumb(index: number) {
    activeThumb.value = index
  }

  function selectImageThumb(index: number) {
    activeThumb.value = index
    imgError.value = false
  }

  function handleMainImageError() {
    imgError.value = true
  }

  function markThumbError(index: number) {
    if (brokenThumbs.value.includes(index)) return
    brokenThumbs.value = [...brokenThumbs.value, index]
  }

  function isThumbBroken(index: number) {
    return brokenThumbs.value.includes(index)
  }

  return {
    thumbs,
    activeThumb,
    imgError,
    selectFallbackThumb,
    selectImageThumb,
    handleMainImageError,
    markThumbError,
    isThumbBroken,
  }
}
