import { computed, nextTick, ref } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  galleryStateMock,
  addonOptionsMock,
  configuratorMock,
  purchaseActionsMock,
  pageContentMock,
  lightboxMock,
  reviewSubmissionMock,
  wishlistFactoryMock,
} = vi.hoisted(() => ({
  galleryStateMock: vi.fn(),
  addonOptionsMock: vi.fn(),
  configuratorMock: vi.fn(),
  purchaseActionsMock: vi.fn(),
  pageContentMock: vi.fn(),
  lightboxMock: vi.fn(),
  reviewSubmissionMock: vi.fn(),
  wishlistFactoryMock: vi.fn(),
}))

vi.mock('~/composables/useProductGalleryState', () => ({
  useProductGalleryState: galleryStateMock,
}))

vi.mock('~/composables/useProductAddonOptions', () => ({
  useProductAddonOptions: addonOptionsMock,
}))

vi.mock('~/composables/useProductConfigurator', () => ({
  useProductConfigurator: configuratorMock,
}))

vi.mock('~/composables/useProductPurchaseActions', () => ({
  useProductPurchaseActions: purchaseActionsMock,
}))

vi.mock('~/composables/useProductPageContent', () => ({
  useProductPageContent: pageContentMock,
}))

vi.mock('~/composables/useProductLightbox', () => ({
  useProductLightbox: lightboxMock,
}))

vi.mock('~/composables/useProductReviewSubmission', () => ({
  useProductReviewSubmission: reviewSubmissionMock,
}))

vi.mock('~/composables/useWishlist', () => ({
  useWishlist: wishlistFactoryMock,
}))

import { useProductPageState } from '~/composables/useProductPageState'

describe('useProductPageState', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('orchestrates the extracted product page composables and exposes a shell-friendly state object', () => {
    const product = ref({ slug: 'peony-dream', images: ['/1.jpg', '/2.jpg'] })
    const allProducts = ref([{ slug: 'peony-dream' }, { slug: 'garden-mix' }])
    const apiReviews = ref([{ id: 'review-1' }])
    const settings = ref({
      storeName: 'Buton',
      storeCity: 'Санкт-Петербурге',
      productSeoTemplate: '<p>{{name}}</p>',
    })
    const slug = computed(() => product.value.slug)
    const siteUrl = ref('https://buton.test')

    const addLine = vi.fn()
    const showToast = vi.fn()
    const navigate = vi.fn()
    const track = vi.fn()
    const jsonLd = vi.fn()
    const submitReview = vi.fn()
    const formatPrice = vi.fn((value: number) => `${value} ₽`)
    const wishlistToggle = vi.fn()

    const galleryState = {
      thumbs: ref(['rose', 'peony']),
      activeThumb: ref(1),
      imgError: ref(false),
      selectFallbackThumb: vi.fn(),
      selectImageThumb: vi.fn(),
      handleMainImageError: vi.fn(),
    }
    galleryStateMock.mockReturnValue(galleryState)

    const addonOptions = {
      catalogAddons: ref([{ id: 'card' }]),
      bundleOptions: ref([{ id: 'bundle-card' }]),
      addonGroups: ref([{ title: 'Открытки', items: [] }]),
    }
    addonOptionsMock.mockReturnValue(addonOptions)

    const configurator = {
      activeSize: ref(1),
      selectedAddons: ref([0]),
      qty: ref(2),
      quickDeliveryTime: ref('14:00–16:00'),
      quickDeliveryTimes: ['12:00–14:00', '14:00–16:00'],
      toggleAddon: vi.fn(),
      currentSizePrice: ref(6200),
      totalPrice: ref(6500),
      currentTotal: ref(3250),
      activeSizeLabel: ref('M'),
      sizeStemText: ref('19 стеблей'),
      sizeHeight: ref('55 см'),
      sizeWeight: ref('1.2 кг'),
      packagingHint: ref('крафт + лента'),
      forWho: ref(['Для любимой']),
      isTopPick: ref(true),
      isPopular: ref(false),
      discountPct: ref(15),
    }
    configuratorMock.mockReturnValue(configurator)

    const purchaseActions = {
      justAdded: ref(true),
      quickOrderPending: ref(false),
      addToCart: vi.fn(),
      addBundleToCart: vi.fn(),
      placeQuickOrder: vi.fn(),
    }
    purchaseActionsMock.mockReturnValue(purchaseActions)

    const pageContent = {
      productSeoText: ref('<p>SEO</p>'),
      relatedProducts: ref([{ slug: 'related' }]),
      togetherProducts: ref([{ slug: 'together' }]),
      holidayVariants: ref([{ slug: 'holiday' }]),
      allReviews: ref([{ key: 'review-1' }]),
    }
    pageContentMock.mockReturnValue(pageContent)

    const lightboxState = {
      isOpen: ref(false),
      index: ref(0),
      open: vi.fn(),
      close: vi.fn(),
      step: vi.fn(),
    }
    lightboxMock.mockReturnValue(lightboxState)

    const reviewSubmission = {
      newReview: ref({ name: '', rating: 5, text: '' }),
      reviewError: ref(''),
      reviewSent: ref(false),
      submitReview: vi.fn(),
    }
    reviewSubmissionMock.mockReturnValue(reviewSubmission)

    wishlistFactoryMock.mockReturnValue({
      has: vi.fn((wishlistSlug: string) => computed(() => wishlistSlug === 'peony-dream')),
      toggle: wishlistToggle,
    })

    const state = useProductPageState({
      product,
      allProducts,
      apiReviews,
      settings,
      slug,
      siteUrl,
      addLine,
      showToast,
      navigate,
      track,
      jsonLd,
      submitReview,
      formatPrice,
    })

    const galleryOptions = galleryStateMock.mock.calls[0]?.[0]
    expect(galleryOptions).toBeTruthy()
    expect(galleryOptions?.product.value).toEqual(product.value)
    expect(galleryOptions?.slug.value).toBe('peony-dream')

    const addonOptionsArgs = addonOptionsMock.mock.calls[0]?.[0]
    expect(addonOptionsArgs).toBeTruthy()
    expect(addonOptionsArgs?.product.value).toEqual(product.value)
    expect(addonOptionsArgs?.settings.value).toEqual(settings.value)

    const configuratorArgs = configuratorMock.mock.calls[0]?.[0]
    expect(configuratorArgs).toBeTruthy()
    expect(configuratorArgs?.product.value).toEqual(product.value)
    expect(configuratorArgs?.addons).toBe(addonOptions.catalogAddons)

    expect(purchaseActionsMock).toHaveBeenCalledWith({
      product: expect.any(Object),
      addons: addonOptions.catalogAddons,
      activeSize: configurator.activeSize,
      selectedAddons: configurator.selectedAddons,
      qty: configurator.qty,
      quickDeliveryTime: configurator.quickDeliveryTime,
    }, {
      addLine,
      showToast,
      navigate,
      track,
    })
    const purchaseOptions = purchaseActionsMock.mock.calls[0]?.[0]
    expect(purchaseOptions?.product.value).toEqual(product.value)

    const pageContentArgs = pageContentMock.mock.calls[0]?.[0]
    const pageContentDeps = pageContentMock.mock.calls[0]?.[1]
    expect(pageContentArgs?.product.value).toEqual(product.value)
    expect(pageContentArgs?.allProducts.value).toEqual(allProducts.value)
    expect(pageContentArgs?.apiReviews.value).toEqual(apiReviews.value)
    expect(pageContentArgs?.activeSizeLabel).toBe(configurator.activeSizeLabel)
    expect(pageContentArgs?.currentSizePrice).toBe(configurator.currentSizePrice)
    expect(pageContentArgs?.sizeHeight).toBe(configurator.sizeHeight)
    expect(pageContentArgs?.sizeWeight).toBe(configurator.sizeWeight)
    expect(pageContentArgs?.packagingHint).toBe(configurator.packagingHint)
    expect(pageContentArgs?.siteUrl.value).toBe('https://buton.test')
    expect(pageContentArgs?.storeName()).toBe('Buton')
    expect(pageContentArgs?.storeCity()).toBe('Санкт-Петербурге')
    expect(pageContentArgs?.productSeoTemplate()).toBe('<p>{{name}}</p>')
    expect(pageContentDeps).toEqual({ jsonLd })
    expect(lightboxMock).toHaveBeenCalledWith({
      imageCount: expect.any(Object),
    })
    const reviewSubmissionArgs = reviewSubmissionMock.mock.calls[0]?.[0]
    const reviewSubmissionDeps = reviewSubmissionMock.mock.calls[0]?.[1]
    expect(reviewSubmissionArgs?.slug.value).toBe('peony-dream')
    expect(reviewSubmissionDeps).toEqual({ submit: submitReview })

    expect(state.thumbs).toBe(galleryState.thumbs)
    expect(state.bundleOptions).toBe(addonOptions.bundleOptions)
    expect(state.activeSize).toBe(configurator.activeSize)
    expect(state.justAdded).toBe(purchaseActions.justAdded)
    expect(state.productSeoText).toBe(pageContent.productSeoText)
    expect(state.lightboxOpen).toBe(lightboxState.isOpen)
    expect(state.lbIndex).toBe(lightboxState.index)
    expect(state.newReview).toBe(reviewSubmission.newReview)
    expect(state.hoverRating.value).toBe(0)
    expect(state.wishlist.toggle).toBe(wishlistToggle)
    expect(state.isFaved.value).toBe(true)
    expect(state.formatPrice).toBe(formatPrice)
  })

  it('updates derived child inputs when route slug changes without recreating shell state', async () => {
    const product = ref({ slug: 'peony-dream', images: ['/1.jpg'] })
    const slug = computed(() => product.value.slug)
    const allProducts = ref([{ slug: 'peony-dream', images: ['/1.jpg'] }, { slug: 'garden-mix', images: ['/2.jpg'] }])
    const apiReviews = ref([])
    const settings = ref({
      storeName: 'Buton',
      storeCity: 'Санкт-Петербург',
      productSeoTemplate: '<p>{{name}}</p>',
    })
    const siteUrl = ref('https://buton.test')

    const addLine = vi.fn()
    const showToast = vi.fn()
    const navigate = vi.fn()
    const track = vi.fn()
    const jsonLd = vi.fn()
    const submitReview = vi.fn()
    const formatPrice = vi.fn((value: number) => `${value} ₽`)

    const galleryState = {
      thumbs: ref(['rose', 'peony']),
      activeThumb: ref(1),
      imgError: ref(false),
      selectFallbackThumb: vi.fn(),
      selectImageThumb: vi.fn(),
      handleMainImageError: vi.fn(),
    }
    galleryStateMock.mockReturnValue(galleryState)

    const addonOptions = {
      catalogAddons: ref([{ id: 'card' }]),
      bundleOptions: ref([{ id: 'bundle-card' }]),
      addonGroups: ref([{ title: 'Открытки', items: [] }]),
    }
    addonOptionsMock.mockReturnValue(addonOptions)

    const configurator = {
      activeSize: ref(1),
      selectedAddons: ref([0]),
      qty: ref(2),
      quickDeliveryTime: ref('14:00–16:00'),
      quickDeliveryTimes: ['12:00–14:00', '14:00–16:00'],
      toggleAddon: vi.fn(),
      currentSizePrice: ref(6200),
      totalPrice: ref(6500),
      currentTotal: ref(3250),
      activeSizeLabel: ref('M'),
      sizeStemText: ref('19 стеблей'),
      sizeHeight: ref('55 см'),
      sizeWeight: ref('1.2 кг'),
      packagingHint: ref('крафт + лента'),
      forWho: ref(['Для любимой']),
      isTopPick: ref(true),
      isPopular: ref(false),
      discountPct: ref(15),
    }
    configuratorMock.mockReturnValue(configurator)

    purchaseActionsMock.mockReturnValue({
      justAdded: ref(true),
      quickOrderPending: ref(false),
      addToCart: vi.fn(),
      addBundleToCart: vi.fn(),
      placeQuickOrder: vi.fn(),
    })

    pageContentMock.mockReturnValue({
      productSeoText: ref('<p>SEO</p>'),
      relatedProducts: ref([{ slug: 'related' }]),
      togetherProducts: ref([{ slug: 'together' }]),
      holidayVariants: ref([{ slug: 'holiday' }]),
      allReviews: ref([{ key: 'review-1' }]),
    })

    lightboxMock.mockReturnValue({
      isOpen: ref(false),
      index: ref(0),
      open: vi.fn(),
      close: vi.fn(),
      step: vi.fn(),
    })

    reviewSubmissionMock.mockReturnValue({
      newReview: ref({ name: '', rating: 5, text: '' }),
      reviewError: ref(''),
      reviewSent: ref(false),
      submitReview: vi.fn(),
    })

    wishlistFactoryMock.mockReturnValue({
      has: vi.fn((wishlistSlug: string) => computed(() => wishlistSlug === 'peony-dream')),
      toggle: vi.fn(),
    })

    const state = useProductPageState({
      product,
      allProducts,
      apiReviews,
      settings,
      slug,
      siteUrl,
      addLine,
      showToast,
      navigate,
      track,
      submitReview,
      jsonLd,
      formatPrice,
    })

    const galleryArgs = galleryStateMock.mock.calls.at(-1)?.[0]
    const pageContentArgs = pageContentMock.mock.calls.at(-1)?.[0]
    const reviewSubmissionArgs = reviewSubmissionMock.mock.calls.at(-1)?.[0]

    expect(galleryArgs?.slug.value).toBe('peony-dream')
    expect(pageContentArgs?.product.value.slug).toBe('peony-dream')
    expect(reviewSubmissionArgs?.slug.value).toBe('peony-dream')

    product.value = {
      _id: 'p-2',
      slug: 'garden-mix',
      images: ['/3.jpg'],
      name: 'Garden Mix',
      meta: '',
      description: '',
      price: 4500,
      bloom: 'mix',
      inStock: true,
      oldPrice: undefined,
      sizes: [],
      composition: [],
      careInstructions: '',
      addons: [],
      rating: 0,
      reviewCount: 0,
      featured: false,
    }

    await nextTick()

    expect(state.hoverRating.value).toBe(0)
    expect(galleryArgs?.slug.value).toBe('garden-mix')
    expect(pageContentArgs?.product.value.slug).toBe('garden-mix')
    expect(reviewSubmissionArgs?.slug.value).toBe('garden-mix')
  })
})
