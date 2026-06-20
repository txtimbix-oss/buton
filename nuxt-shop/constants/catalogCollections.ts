import type { Product } from '~/composables/useShop'

export type CollectionRuleField = 'bloom' | 'tag' | 'price' | 'inStock' | 'featured'
export type CollectionRuleOperator = 'eq' | 'neq' | 'lte' | 'gte' | 'in'

export interface CollectionRule {
  field: CollectionRuleField
  operator: CollectionRuleOperator
  value: string
}

export interface CatalogCollectionSummary {
  name: string
  slug: string
  tag: string
  priceMax?: number | null
  autoRules?: CollectionRule[]
  isActive: boolean
}

function normalizeToken(value: string) {
  return value.trim().toLowerCase()
}

function resolveRuleOperand(product: Product, field: CollectionRuleField): string | number | boolean {
  switch (field) {
    case 'bloom':
      return product.bloom.toLowerCase()
    case 'tag':
      return (product.tag ?? '').toLowerCase()
    case 'price':
      return product.price
    case 'inStock':
      return product.inStock
    case 'featured':
      return product.featured
  }
}

function matchCollectionRule(product: Product, rule: CollectionRule) {
  const operand = resolveRuleOperand(product, rule.field)
  const rawValue = rule.value ?? ''

  switch (rule.operator) {
    case 'eq':
      return typeof operand === 'string'
        ? operand === normalizeToken(rawValue)
        : operand === (typeof operand === 'number' ? Number(rawValue) : rawValue === 'true')
    case 'neq':
      return typeof operand === 'string'
        ? operand !== normalizeToken(rawValue)
        : operand !== (typeof operand === 'number' ? Number(rawValue) : rawValue === 'true')
    case 'lte':
      return typeof operand === 'number' && operand <= Number(rawValue)
    case 'gte':
      return typeof operand === 'number' && operand >= Number(rawValue)
    case 'in': {
      const allowedValues = rawValue.split(',').map(normalizeToken).filter(Boolean)
      if (!allowedValues.length) return false
      return allowedValues.includes(String(operand).toLowerCase())
    }
  }
}

export function productMatchesCollection(product: Product, collection: CatalogCollectionSummary): boolean {
  if (collection.autoRules?.length) {
    const hasInStockRule = collection.autoRules.some(rule => rule.field === 'inStock')
    if (!hasInStockRule && !product.inStock) {
      return false
    }
    return collection.autoRules.every(rule => matchCollectionRule(product, rule))
  }

  if (collection.priceMax != null) {
    return product.inStock && product.price <= collection.priceMax
  }

  if (collection.tag) {
    return product.inStock && product.tag === collection.tag
  }

  return product.inStock
}

export function findCollectionByLegacyQuery(
  collections: CatalogCollectionSummary[],
  rawValue?: string,
): CatalogCollectionSummary | null {
  const normalized = normalizeToken(rawValue ?? '')
  if (!normalized) return null

  return collections.find((collection) => {
    const normalizedName = collection.name.toLowerCase()
    return collection.slug.toLowerCase() === normalized
      || normalizedName === normalized
      || normalized.replace(/-/g, ' ') === normalizedName
      || normalizedName.replace(/\s/g, '-') === normalized
  }) ?? null
}
