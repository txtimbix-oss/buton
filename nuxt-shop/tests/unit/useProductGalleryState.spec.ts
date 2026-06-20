import { describe, expect, it } from 'vitest'
import { nextTick, ref } from 'vue'

import { useProductGalleryState } from '~/composables/useProductGalleryState'
import { makeProduct } from '~/tests/fixtures/products'

describe('useProductGalleryState', () => {
  it('builds fallback thumbs from the current product bloom', async () => {
    const product = ref(makeProduct({ bloom: 'green' }))
    const slug = ref(product.value.slug)

    const gallery = useProductGalleryState({ product, slug })

    expect(gallery.thumbs.value).toEqual(['green', 'rose', 'peach', 'cream'])

    product.value = makeProduct({ slug: 'cream-bouquet', bloom: 'cream' })
    await nextTick()

    expect(gallery.thumbs.value).toEqual(['cream', 'rose', 'peach', 'green'])
  })

  it('tracks thumb selection and only clears image errors for real image thumbs', () => {
    const gallery = useProductGalleryState({
      product: ref(makeProduct({ images: ['one.jpg', 'two.jpg'] })),
      slug: ref('test-product'),
    })

    gallery.handleMainImageError()
    expect(gallery.imgError.value).toBe(true)

    gallery.selectFallbackThumb(1)
    expect(gallery.activeThumb.value).toBe(1)
    expect(gallery.imgError.value).toBe(true)

    gallery.selectImageThumb(0)
    expect(gallery.activeThumb.value).toBe(0)
    expect(gallery.imgError.value).toBe(false)
  })

  it('resets the active thumb on route slug changes and fully resets on loaded product changes', async () => {
    const product = ref(makeProduct({
      slug: 'rose-bouquet',
      images: ['one.jpg', 'two.jpg'],
    }))
    const slug = ref('rose-bouquet')
    const gallery = useProductGalleryState({ product, slug })

    gallery.selectImageThumb(1)
    gallery.handleMainImageError()

    slug.value = 'peony-bouquet'
    await nextTick()

    expect(gallery.activeThumb.value).toBe(0)
    expect(gallery.imgError.value).toBe(true)

    product.value = makeProduct({
      slug: 'peony-bouquet',
      images: ['fresh.jpg', 'detail.jpg'],
    })
    await nextTick()

    expect(gallery.activeThumb.value).toBe(0)
    expect(gallery.imgError.value).toBe(false)
  })

  it('marks individual thumbnail load errors and reports broken thumbnails state', () => {
    const gallery = useProductGalleryState({
      product: ref(makeProduct()),
      slug: ref('test-product'),
    })

    expect(gallery.isThumbBroken(0)).toBe(false)

    gallery.markThumbError(0)
    expect(gallery.isThumbBroken(0)).toBe(true)
    expect(gallery.isThumbBroken(1)).toBe(false)

    gallery.selectImageThumb(1)
    gallery.selectFallbackThumb(2)
    expect(gallery.isThumbBroken(0)).toBe(true)
  })
})
