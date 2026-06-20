import type { Product } from '~/composables/useShop'
import type { ProductRecommendationBuckets } from '~/lib/product/types'

function normalizeText(value = ''): string {
  return value.toLowerCase().trim()
}

function uniqueProducts(products: Product[], limit = 4): Product[] {
  const seen = new Set<string>()

  return products.filter((product) => {
    if (seen.has(product.slug)) return false
    seen.add(product.slug)
    return true
  }).slice(0, limit)
}

function buildOccasionKeywords(product: Product): string[] {
  const text = `${product.name} ${product.meta} ${product.description}`.toLowerCase()
  const keywords: string[] = []

  if (text.includes('свадьб')) keywords.push('свад')
  if (text.includes('день рождения') || text.includes('с днем рождения')) keywords.push('день рождения')
  if (text.includes('новогод') || text.includes('новый год')) keywords.push('нов')
  if (text.includes('юбилей') || text.includes('8 марта') || text.includes('9 мая') || text.includes('празд')) {
    keywords.push('празд')
  }

  return keywords
}

export function buildProductRecommendations(
  activeProduct: Product | null | undefined,
  allProducts: Product[],
): ProductRecommendationBuckets {
  const source = allProducts.filter(product => product.slug !== activeProduct?.slug)

  if (!activeProduct) {
    const fallback = uniqueProducts(source)
    return {
      related: fallback,
      together: fallback,
      holidayVariants: fallback.slice(0, 2),
    }
  }

  const activeComposition = (activeProduct.composition ?? []).map(item => normalizeText(item.name))
  const activeBloom = normalizeText(activeProduct.bloom ?? '')

  const relatedByComposition = activeComposition.length
    ? source.filter(product => (product.composition ?? []).some(item => activeComposition.includes(normalizeText(item.name))))
    : []
  const relatedByBloom = activeBloom
    ? source.filter(product => normalizeText(product.bloom) === activeBloom)
    : []
  const related = uniqueProducts([...relatedByComposition, ...relatedByBloom, ...source])

  const togetherPriority = source.filter((product) => {
    const tag = normalizeText(product.tag ?? '')
    return product.featured || tag.includes('нов') || tag.includes('премиум') || product.reviewCount >= 12
  })
  const together = uniqueProducts([...togetherPriority, ...source])

  const occasionKeywords = buildOccasionKeywords(activeProduct)
  const holidayMatches = source.filter((product) => {
    const text = `${product.name} ${product.meta} ${product.description}`.toLowerCase()

    if (text.includes('свад') && occasionKeywords.includes('свад')) return true
    if (text.includes('день рождения') && occasionKeywords.includes('день рождения')) return true
    if (text.includes('новогод') && occasionKeywords.includes('нов')) return true
    if (text.includes('празд') && occasionKeywords.includes('празд')) return true
    return false
  })

  const holidayFallback = source.filter((product) =>
    !holidayMatches.some(match => match.slug === product.slug),
  )
  const holidayVariants = uniqueProducts([
    ...holidayMatches,
    ...holidayFallback.slice(-1),
  ])

  return {
    related,
    together,
    holidayVariants,
  }
}
