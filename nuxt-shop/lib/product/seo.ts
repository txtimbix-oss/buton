import type { Product } from '~/composables/useShop'
import type {
  BuildProductSchemaOptions,
  BuildProductSeoTextOptions,
  ProductDerivedMetadata,
} from '~/lib/product/types'

type ProductSeoMetaSource = Product & {
  metaTitle?: string
  metaDescription?: string
  ogImage?: string
}

function normalizeText(value = ''): string {
  return value.toLowerCase().trim()
}

export function formatProductPrice(value: number): string {
  return `${Math.round(value).toLocaleString('ru-RU').replace(/\u00A0/g, ' ')} ₽`
}

function derivePackagingHint(product: Product): string {
  const source = `${product.description ?? ''} ${product.meta ?? ''} ${product.careInstructions ?? ''}`.toLowerCase()
  if (source.includes('премиум')) return 'премиум-упаковка'
  if (source.includes('крафт')) return 'крафт + лента'
  if (source.includes('стекл') || source.includes('короб') || source.includes('бокс')) return 'стекло/коробка'
  return 'крафт + лента'
}

function deriveAudience(product: Product): string[] {
  const source = `${product.name ?? ''} ${product.meta ?? ''} ${product.description ?? ''}`.toLowerCase()
  const audiences: string[] = []
  const pushUnique = (value: string) => {
    if (!audiences.includes(value)) audiences.push(value)
  }

  if (source.includes('свадьб')) pushUnique('Для невесты')
  if (source.includes('день рождения') || source.includes('юбилей')) pushUnique('Для праздника')
  if (source.includes('праздник') || source.includes('юбилей')) pushUnique('Для родителей')
  if (source.includes('романтик') || source.includes('свидан') || source.includes('любимой')) pushUnique('Для любимого человека')
  if (source.includes('офис') || source.includes('на работу')) pushUnique('Для коллег')
  if (source.includes('дом') || source.includes('уют')) pushUnique('Для дома')

  return audiences.length ? audiences : ['Для особого случая']
}

function deriveSeoOccasions(product: Product): string {
  const source = `${product.name ?? ''} ${product.meta ?? ''} ${product.description ?? ''}`.toLowerCase()
  const occasions: string[] = []

  if (source.includes('свадьб')) occasions.push('свадьбы и выездные встречи')
  if (source.includes('день рождения') || source.includes('юбилей')) occasions.push('день рождения и юбилей')
  if (source.includes('свидан') || source.includes('романтик')) occasions.push('романтического вечера')
  if (source.includes('праздник') || source.includes('новогод')) occasions.push('праздничных мероприятий')
  if (source.includes('дом')) occasions.push('украшения дома и офиса')

  return occasions.length ? occasions.join(', ') : 'свидания и подарки в важных моментах'
}

export function deriveProductMetadata(
  product: Product,
  activeSizeIndex: number,
): ProductDerivedMetadata {
  const activeSize = product.sizes?.[activeSizeIndex] ?? product.sizes?.[0]
  const activeSizeLabel = activeSize?.label ?? ''
  const activeSizeDesc = (activeSize?.desc ?? '').split(' · ').map(value => value.trim()).filter(Boolean)
  const sizeStemText = activeSizeDesc.find(item => /стеб|шт|шт\.?/i.test(item)) || '—'
  const sizeHeight = activeSizeDesc.find(item => /\d+\s*(см|мм|cm)/i.test(item) || /высот/i.test(item)) || '—'
  const sizeWeight = activeSizeDesc.find(item => /\d+([\.,]\d+)?\s*(кг|г|kg|гр)/i.test(item) || /вес/i.test(item)) || '—'
  const tag = normalizeText(product.tag ?? '')

  return {
    activeSizeLabel,
    activeSizeDesc,
    sizeStemText,
    sizeHeight,
    sizeWeight,
    packagingHint: derivePackagingHint(product),
    forWho: deriveAudience(product),
    isTopPick: Boolean(product.featured) || product.rating >= 4.85 || tag.includes('премиум') || tag.includes('хит'),
    isPopular: tag.includes('нов') || tag.includes('популяр') || product.reviewCount >= 10,
    discountPct: product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0,
    productFlowerText: (product.composition ?? []).map(item => item.name).filter(Boolean).join(', ') || 'сезонные цветы и зелень',
  }
}

export function buildProductSeoText({
  product,
  activeSizeLabel,
  currentPrice,
  storeCity,
  template,
}: BuildProductSeoTextOptions): string {
  let result = template
  const replacements: Record<string, string> = {
    name: product.name,
    flowers: deriveProductMetadata(product, 0).productFlowerText,
    size: activeSizeLabel || 'M',
    price: formatProductPrice(currentPrice ?? product.price),
    city: storeCity || 'Санкт-Петербурге',
    occasions: deriveSeoOccasions(product),
  }

  Object.entries(replacements).forEach(([key, value]) => {
    result = result.replaceAll(`{${key}}`, value)
  })

  return result
}

export function buildProductSeoMeta(
  product: ProductSeoMetaSource | null | undefined,
  siteUrl: string,
  fallbackStoreName: string,
) {
  if (!product) {
    return { title: fallbackStoreName }
  }

  const ogImgUrl = product.ogImage || product.images?.[0]
  const ogImage = ogImgUrl ? `${siteUrl}${ogImgUrl}` : undefined

  return {
    title: product.metaTitle || `${product.name} — купить в СПб, цена от ${product.price.toLocaleString('ru-RU')} ₽`,
    description: product.metaDescription || `${product.meta}. ${product.careInstructions ? `${product.careInstructions.slice(0, 80)}. ` : ''}Доставка по СПб за 2 часа.`,
    ogTitle: product.metaTitle || product.name,
    ogDescription: product.metaDescription || `${product.meta}. Доставка по Санкт-Петербургу за 2 часа.`,
    ogImage,
    ogType: 'product',
    twitterCard: 'summary_large_image',
  }
}

export function buildProductCompositionText(product: Product | null | undefined): string {
  return (product?.composition ?? [])
    .map(item => `${item.name}${item.qty ? `, ${item.qty}` : ''}`)
    .join('; ')
}

export function buildProductBreadcrumbSchema(product: Product, siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Главная', item: `${siteUrl}/` },
      { '@type': 'ListItem', position: 2, name: 'Каталог', item: `${siteUrl}/catalog` },
      { '@type': 'ListItem', position: 3, name: product.name, item: `${siteUrl}/product/${product.slug}` },
    ],
  }
}

export function buildProductSchema({
  product,
  siteUrl,
  storeName,
  seoText,
  compositionText,
  activeSizeLabel,
  currentSizePrice,
  sizeHeight,
  sizeWeight,
  packagingHint,
  reviews,
}: BuildProductSchemaOptions) {
  const image = product.images?.[0] ? `${siteUrl}${product.images[0]}` : undefined

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: seoText || product.description || product.meta,
    image,
    category: product.meta,
    sku: product.slug,
    mpn: product.slug,
    brand: {
      '@type': 'Organization',
      name: storeName,
    },
    additionalProperty: [
      { '@type': 'PropertyValue', name: 'Состав букета', value: compositionText },
      { '@type': 'PropertyValue', name: 'Размер букета', value: activeSizeLabel || 'M' },
      { '@type': 'PropertyValue', name: 'Цена за набор', value: formatProductPrice(currentSizePrice) },
      { '@type': 'PropertyValue', name: 'Высота', value: sizeHeight },
      { '@type': 'PropertyValue', name: 'Вес', value: sizeWeight },
      { '@type': 'PropertyValue', name: 'Упаковка', value: packagingHint },
    ],
    review: reviews.slice(0, 3).map((review) => ({
      '@type': 'Review',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating,
        bestRating: 5,
      },
      author: {
        name: review.name,
      },
      reviewBody: review.text,
    })),
    offers: {
      '@type': 'Offer',
      url: `${siteUrl}/product/${product.slug}`,
      priceCurrency: 'RUB',
      price: currentSizePrice,
      itemCondition: 'https://schema.org/NewCondition',
      availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
    aggregateRating: product.reviewCount > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
      bestRating: 5,
      worstRating: 1,
    } : undefined,
  }
}
