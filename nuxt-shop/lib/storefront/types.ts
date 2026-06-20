import type { Category, Product } from '~/composables/useShop'
import type { CatalogCollectionSummary } from '~/constants/catalogCollections'

type RawRecord = Record<string, unknown> | null | undefined

export interface StorefrontProductSnapshot {
  slug: string
  images: string[]
  volumeRules?: { minQty: number; discountPct: number }[]
}

export interface StorefrontDeliveryZone {
  _id: string
  name: string
  keywords: string[]
  cost: number
}

export interface StorefrontLoyaltyLevel {
  key: string
  name: string
  icon: string
  min: number
  cashback: number
}

export interface CatalogPageQueries {
  allProducts: Product[]
  categoriesData: Category[]
  collectionsData: CatalogCollectionSummary[]
}

export function toStorefrontSlug(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

export function toStorefrontStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim())
      .filter(Boolean)
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }

  return []
}

export function toStorefrontNumber(value: unknown): number {
  const numericValue = Number(value)
  return Number.isFinite(numericValue) ? numericValue : 0
}

export function normalizeStorefrontProductSnapshot(snapshot: unknown): StorefrontProductSnapshot | null {
  if (!snapshot || typeof snapshot !== 'object') return null

  const raw = snapshot as RawRecord
  const slug = toStorefrontSlug(raw?.slug)
  if (!slug) return null

  const rawVolumeRules = Array.isArray(raw?.volumeRules) ? raw.volumeRules : []
  const volumeRules = rawVolumeRules
    .map((rule): StorefrontProductSnapshot['volumeRules'][number] | null => {
      if (!rule || typeof rule !== 'object') return null
      const normalizedRule = rule as RawRecord
      const minQty = toStorefrontNumber(normalizedRule?.minQty)
      const discountPct = toStorefrontNumber(normalizedRule?.discountPct)

      if (!minQty || !discountPct) return null

      return {
        minQty,
        discountPct,
      }
    })
    .filter((rule): rule is StorefrontProductSnapshot['volumeRules'][number] => rule !== null)

  return {
    slug,
    images: toStorefrontStringArray(raw?.images),
    ...(volumeRules.length ? { volumeRules } : {}),
  }
}

export function normalizeStorefrontDeliveryZone(zone: unknown): StorefrontDeliveryZone | null {
  if (!zone || typeof zone !== 'object') return null

  const raw = zone as RawRecord
  const _id = toStorefrontSlug(raw?._id)
  const name = toStorefrontSlug(raw?.name)
  if (!_id || !name) return null

  return {
    _id,
    name,
    keywords: toStorefrontStringArray(raw?.keywords),
    cost: toStorefrontNumber(raw?.cost),
  }
}

export function normalizeStorefrontDeliveryZones(zones: unknown): StorefrontDeliveryZone[] | null {
  if (!Array.isArray(zones)) return null

  return zones
    .map(normalizeStorefrontDeliveryZone)
    .filter((zone): zone is StorefrontDeliveryZone => zone !== null)
}

export function normalizeStorefrontLoyaltyLevel(level: unknown): StorefrontLoyaltyLevel | null {
  if (!level || typeof level !== 'object') return null

  const raw = level as RawRecord
  const key = toStorefrontSlug(raw.key)
  const name = toStorefrontSlug(raw.name)
  const icon = toStorefrontSlug(raw.icon)
  if (!key || !name) return null

  return {
    key,
    name,
    icon: icon || key,
    min: toStorefrontNumber(raw.min),
    cashback: toStorefrontNumber(raw.cashback ?? raw.cashbackPercent),
  }
}

export function normalizeStorefrontLoyaltyLevels(levels: unknown): StorefrontLoyaltyLevel[] | null {
  if (!Array.isArray(levels)) return null

  return levels
    .map(normalizeStorefrontLoyaltyLevel)
    .filter((level): level is StorefrontLoyaltyLevel => level !== null)
}
