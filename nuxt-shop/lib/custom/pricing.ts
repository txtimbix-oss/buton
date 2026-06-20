import { CUSTOM_ACCESSORY_OPTIONS } from './options'
import type { CalculateCustomBouquetTotalInput, CalculateExtraStemPriceInput } from './types'

const MANDATORY_ADDON_ID = 'photo'

export function calculateExtraStemPrice(input: CalculateExtraStemPriceInput): number {
  const extraStems = Math.max(0, input.flowerCount - input.baseFlowers)
  return extraStems * input.extraStemPrice
}

export function ensureMandatoryAddonIds(addonIds: string[]): string[] {
  const unique = new Set<string>()

  for (const addonId of addonIds) {
    if (addonId) {
      unique.add(addonId)
    }
  }

  unique.add(MANDATORY_ADDON_ID)

  return CUSTOM_ACCESSORY_OPTIONS
    .map((option) => option.id)
    .filter((optionId) => unique.has(optionId))
}

export function calculateCustomBouquetTotal(input: CalculateCustomBouquetTotalInput): number {
  const total =
    input.sizePrice
    + calculateExtraStemPrice(input)
    + input.flowerTypeExtra
    + input.styleExtra
    + input.packagingPrice
    + input.addonPrices.reduce((sum, price) => sum + price, 0)

  return Math.max(total, input.sizePrice)
}
