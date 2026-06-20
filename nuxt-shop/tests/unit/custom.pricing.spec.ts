import { describe, expect, it } from 'vitest'

import {
  calculateCustomBouquetTotal,
  calculateExtraStemPrice,
  ensureMandatoryAddonIds,
} from '~/lib/custom/pricing'

describe('calculateExtraStemPrice', () => {
  it('charges only for stems above the size baseline', () => {
    expect(
      calculateExtraStemPrice({
        flowerCount: 12,
        baseFlowers: 16,
        extraStemPrice: 180,
      }),
    ).toBe(0)

    expect(
      calculateExtraStemPrice({
        flowerCount: 21,
        baseFlowers: 16,
        extraStemPrice: 180,
      }),
    ).toBe(900)
  })
})

describe('calculateCustomBouquetTotal', () => {
  it('adds size, extra stems, flower/style extras, packaging, and addons', () => {
    const total = calculateCustomBouquetTotal({
      sizePrice: 6900,
      flowerCount: 21,
      baseFlowers: 16,
      extraStemPrice: 180,
      flowerTypeExtra: 450,
      styleExtra: 250,
      packagingPrice: 550,
      addonPrices: [200, 0],
    })

    expect(total).toBe(9250)
  })

  it('never drops below the selected size price', () => {
    const total = calculateCustomBouquetTotal({
      sizePrice: 6900,
      flowerCount: 12,
      baseFlowers: 16,
      extraStemPrice: -100,
      flowerTypeExtra: -200,
      styleExtra: -300,
      packagingPrice: -400,
      addonPrices: [-500],
    })

    expect(total).toBe(6900)
  })
})

describe('ensureMandatoryAddonIds', () => {
  it('keeps the mandatory photo addon without duplicating it and preserves catalog order', () => {
    expect(ensureMandatoryAddonIds(['card'])).toEqual(['card', 'photo'])
    expect(ensureMandatoryAddonIds(['photo', 'card', 'photo'])).toEqual(['card', 'photo'])
  })
})
