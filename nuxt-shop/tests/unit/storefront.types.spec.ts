import { describe, expect, it } from 'vitest'

import {
  normalizeStorefrontDeliveryZone,
  normalizeStorefrontDeliveryZones,
  normalizeStorefrontProductSnapshot,
  toStorefrontNumber,
  toStorefrontStringArray,
  toStorefrontSlug,
} from '~/lib/storefront/types'

describe('storefront schema normalization', () => {
  it('normalizes slug and string list fallbacks', () => {
    expect(toStorefrontSlug(' rose ')).toBe('rose')
    expect(toStorefrontStringArray([' rose ', '  ', 12, 'garden', '', 'sunset '])).toEqual(['rose', 'garden', 'sunset'])
    expect(toStorefrontStringArray('rose, sunset ,,  ,dusk')).toEqual(['rose', 'sunset', 'dusk'])
    expect(toStorefrontStringArray(123)).toEqual([])
  })

  it('normalizes numbers with safe fallback', () => {
    expect(toStorefrontNumber('390')).toBe(390)
    expect(toStorefrontNumber('12.5')).toBe(12.5)
    expect(toStorefrontNumber('nope')).toBe(0)
    expect(toStorefrontNumber(undefined)).toBe(0)
  })

  it('normalizes storefront product snapshot from unstable payloads', () => {
    const normalized = normalizeStorefrontProductSnapshot({
      slug: '  rose-dream ',
      images: ' /1.jpg , /2.jpg,,',
      volumeRules: [
        { minQty: '2', discountPct: 15 },
        { minQty: 0, discountPct: '10' },
        { minQty: 'bad', discountPct: 'oops' },
      ],
    })

    expect(normalized).toEqual({
      slug: 'rose-dream',
      images: ['/1.jpg', '/2.jpg'],
      volumeRules: [{ minQty: 2, discountPct: 15 }],
    })

    expect(normalizeStorefrontProductSnapshot({ images: ['/x.jpg'] })).toBeNull()
    expect(normalizeStorefrontProductSnapshot(null)).toBeNull()
  })

  it('normalizes storefront delivery zone from unstable payloads', () => {
    const normalized = normalizeStorefrontDeliveryZone({
      _id: '  zone-1 ',
      name: ' ЦЕНТР ',
      keywords: 'север, нева',
      cost: '450',
    })

    expect(normalized).toEqual({
      _id: 'zone-1',
      name: 'ЦЕНТР',
      keywords: ['север', 'нева'],
      cost: 450,
    })

    expect(normalizeStorefrontDeliveryZone({ _id: 123, name: 'Центр', cost: 400 })).toBeNull()
    expect(normalizeStorefrontDeliveryZone(null)).toBeNull()
  })

  it('normalizes delivery zone arrays and drops unstable entries', () => {
    const normalized = normalizeStorefrontDeliveryZones([
      { _id: 'zone-1', name: 'Центр', keywords: ['центр', 12], cost: 390 },
      { _id: 12, name: 'Неверный', keywords: ['x'], cost: 200 },
      null,
      { _id: 'zone-3', name: 'Восток', keywords: 'восток, склад', cost: '600' },
    ])

    expect(normalized).toEqual([
      {
        _id: 'zone-1',
        name: 'Центр',
        keywords: ['центр'],
        cost: 390,
      },
      {
        _id: 'zone-3',
        name: 'Восток',
        keywords: ['восток', 'склад'],
        cost: 600,
      },
    ])
  })
})
