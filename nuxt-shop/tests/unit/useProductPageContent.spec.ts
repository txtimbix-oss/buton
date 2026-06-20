import { effectScope, nextTick, ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'

import { useProductPageContent } from '~/composables/useProductPageContent'
import { buildProductRecommendations } from '~/lib/product/recommendations'
import {
  buildProductBreadcrumbSchema,
  buildProductCompositionText,
  buildProductSchema,
  buildProductSeoText,
} from '~/lib/product/seo'
import { buildProductReviews } from '~/lib/product/reviews'
import { makeProduct } from '~/tests/fixtures/products'

describe('useProductPageContent', () => {
  it('wires reviews, recommendations, and seo content from reactive page inputs', () => {
    const product = ref(makeProduct({
      slug: 'peony-dream',
      name: 'Пионовый сон',
      price: 6200,
      meta: 'Пионы и садовые цветы',
      description: 'Праздничный букет для дня рождения и важных моментов',
      composition: [
        { name: 'Пион', qty: '11 шт' },
        { name: 'Эвкалипт', qty: '3 ветки' },
      ],
      sizes: [{ label: 'L', desc: '21 стебель · 60 см · 1.5 кг', price: 6200 }],
      reviewCount: 4,
      rating: 4.9,
    }))
    const allProducts = ref([
      product.value,
      makeProduct({ slug: 'holiday', name: 'Праздничный сад', description: 'Идеален на праздник и день рождения', tag: 'Новинка' }),
      makeProduct({ slug: 'same-bloom', bloom: product.value.bloom, composition: [] }),
      makeProduct({ slug: 'shared-flower', bloom: 'peony', composition: [{ name: 'Пион', qty: '7 шт' }] }),
      makeProduct({ slug: 'featured', featured: true, reviewCount: 18, tag: 'Премиум' }),
    ])
    const apiReviews = ref([])
    const activeSizeLabel = ref('L')
    const currentSizePrice = ref(7600)
    const sizeHeight = ref('60 см')
    const sizeWeight = ref('1.5 кг')
    const packagingHint = ref('крафт + лента')
    const siteUrl = ref('https://shop.test')
    const storeName = ref('Buton')
    const storeCity = ref('')

    const content = useProductPageContent({
      product,
      allProducts,
      apiReviews,
      activeSizeLabel,
      currentSizePrice,
      sizeHeight,
      sizeWeight,
      packagingHint,
      siteUrl,
      storeName,
      storeCity,
    })

    expect(content.allReviews.value).toEqual(buildProductReviews([], content.staticDisplayReviews))

    const expectedRecommendations = buildProductRecommendations(product.value, allProducts.value)
    expect(content.productRecommendations.value).toEqual(expectedRecommendations)
    expect(content.relatedProducts.value).toEqual(expectedRecommendations.related)
    expect(content.togetherProducts.value).toEqual(expectedRecommendations.together)
    expect(content.holidayVariants.value).toEqual(expectedRecommendations.holidayVariants)

    const expectedSeoText = buildProductSeoText({
      product: product.value,
      activeSizeLabel: activeSizeLabel.value,
      currentPrice: currentSizePrice.value,
      storeCity: 'Санкт-Петербурге',
      template: content.productSeoTemplate.value,
    })
    expect(content.productSeoText.value).toBe(expectedSeoText)
    expect(content.productCompositionText.value).toBe(buildProductCompositionText(product.value))
    expect(content.productSeoBreadcrumbSchema.value).toEqual(buildProductBreadcrumbSchema(product.value, siteUrl.value))
    expect(content.productSeoSchema.value).toEqual(buildProductSchema({
      product: product.value,
      siteUrl: siteUrl.value,
      storeName: storeName.value,
      seoText: expectedSeoText,
      compositionText: buildProductCompositionText(product.value),
      activeSizeLabel: activeSizeLabel.value,
      currentSizePrice: currentSizePrice.value,
      sizeHeight: sizeHeight.value,
      sizeWeight: sizeWeight.value,
      packagingHint: packagingHint.value,
      reviews: content.allReviews.value,
    }))
  })

  it('orchestrates jsonLd updates when seo dependencies change', async () => {
    const scope = effectScope()
    const jsonLd = vi.fn()

    const product = ref(makeProduct({
      slug: 'garden-story',
      name: 'Garden Story',
      composition: [{ name: 'Роза', qty: '15 шт' }],
      sizes: [{ label: 'M', desc: '15 стеблей · 50 см · 1 кг', price: 5800 }],
    }))
    const allProducts = ref([product.value, makeProduct({ slug: 'companion' })])
    const apiReviews = ref([
      {
        _id: 'review-1',
        productSlug: product.value.slug,
        name: 'Мария',
        rating: 5,
        text: 'Очень красиво',
        status: 'approved' as const,
        createdAt: '2026-06-01T10:00:00.000Z',
      },
    ])
    const activeSizeLabel = ref('M')
    const currentSizePrice = ref(5800)
    const sizeHeight = ref('50 см')
    const sizeWeight = ref('1 кг')
    const packagingHint = ref('премиум-упаковка')
    const siteUrl = ref('https://shop.test')
    const storeName = ref('Buton')
    const storeCity = ref('Москве')

    let content: ReturnType<typeof useProductPageContent>
    scope.run(() => {
      content = useProductPageContent({
        product,
        allProducts,
        apiReviews,
        activeSizeLabel,
        currentSizePrice,
        sizeHeight,
        sizeWeight,
        packagingHint,
        siteUrl,
        storeName,
        storeCity,
      }, {
        jsonLd,
      })
    })

    await nextTick()

    expect(jsonLd).toHaveBeenCalledTimes(1)
    expect(jsonLd).toHaveBeenLastCalledWith([
      content!.productSeoSchema.value,
      content!.productSeoBreadcrumbSchema.value,
    ])

    currentSizePrice.value = 6400
    await nextTick()

    expect(jsonLd).toHaveBeenCalledTimes(2)
    expect((content!.productSeoSchema.value as { offers?: { price?: number } }).offers?.price).toBe(6400)
    expect(jsonLd).toHaveBeenLastCalledWith([
      content!.productSeoSchema.value,
      content!.productSeoBreadcrumbSchema.value,
    ])

    scope.stop()
  })
})
