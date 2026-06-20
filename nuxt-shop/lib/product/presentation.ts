import type { Product } from '~/composables/useShop'

interface ProductPresentation {
  primarySize: Product['sizes'][number] | undefined
  primarySizeLabel: string
  primarySizePrice: number
  compositionSummary: string
  shelfLife: string
  sizeHeight: string
  sizeWeight: string
  packagingHint: string
  isTopPick: boolean
  isPopular: boolean
}

function parseSizeMeta(sizeDesc = '') {
  const line = sizeDesc.toLowerCase()
  const height = line.match(/(\d+\s*(?:см|cm))/i)?.[0] ?? '—'
  const weight = line.match(/(\d+(?:[.,]\d+)?\s*(?:кг|kg|г|гр|gram|grams))/i)?.[0] ?? '—'
  return { height, weight }
}

function derivePrimarySize(product: Product) {
  return product.sizes?.find(size => size.label.toLowerCase() === 'm') ?? product.sizes?.[0]
}

function deriveCompositionSummary(product: Product): string {
  if (!product.composition?.length) return ''

  return product.composition
    .slice(0, 3)
    .map(item => `${item.name} ${item.qty ? `(${item.qty})` : ''}`.trim())
    .join(', ')
}

function deriveShelfLife(product: Product): string {
  const text = `${product.careInstructions ?? ''} ${product.description ?? ''}`.toLowerCase()
  if (text.includes('7 дней') || text.includes('до 7') || text.includes('недель')) return 'до 7 дней'
  return 'до 7 дней (стандартно)'
}

function derivePackagingHint(product: Product): string {
  const source = `${product.description ?? ''} ${product.meta ?? ''} ${product.careInstructions ?? ''}`.toLowerCase()
  if (source.includes('премиум')) return 'премиум-упаковка'
  if (source.includes('крафт')) return 'крафт + лента'
  if (source.includes('стекл') || source.includes('короб')) return 'стекло/коробка'
  return 'крафт + лента'
}

export function buildProductPresentation(product: Product): ProductPresentation {
  const primarySize = derivePrimarySize(product)
  const sizeMeta = parseSizeMeta(primarySize?.desc)
  const tag = (product.tag ?? '').toLowerCase()

  return {
    primarySize,
    primarySizeLabel: primarySize?.label ?? '—',
    primarySizePrice: primarySize?.price ?? product.price,
    compositionSummary: deriveCompositionSummary(product),
    shelfLife: deriveShelfLife(product),
    sizeHeight: sizeMeta.height,
    sizeWeight: sizeMeta.weight,
    packagingHint: derivePackagingHint(product),
    isTopPick: Boolean(product.featured) || product.rating >= 4.85,
    isPopular: tag.includes('популяр') || tag.includes('новинка') || product.reviewCount >= 12,
  }
}
