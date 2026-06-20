import { describe, expect, it } from 'vitest'

import { createCartLine } from '~/lib/cart/createCartLine'
import { buildCartLineKey } from '~/lib/cart/lineKey'

describe('createCartLine', () => {
  const baseInput = {
    slug: 'rose',
    name: 'Rose Bouquet',
    bloom: 'rose',
    meta: 'Размер M',
    sizeLabel: 'M',
    price: 6400,
  }

  it('creates different keys for same product with different addons', () => {
    const base = createCartLine({ ...baseInput, addons: [] })
    const withAddon = createCartLine({ ...baseInput, addons: ['Открытка'] })

    expect(buildCartLineKey(base)).not.toBe(buildCartLineKey(withAddon))
  })

  it('normalizes addon order into the same stable key', () => {
    const first = createCartLine({ ...baseInput, addons: ['Ваза', 'Открытка'] })
    const second = createCartLine({ ...baseInput, addons: ['Открытка', 'Ваза'] })

    expect(first.lineKey).toBe(second.lineKey)
    expect(first.addons).toEqual(second.addons)
  })

  it('creates unique line ids for otherwise identical inputs', () => {
    const first = createCartLine(baseInput)
    const second = createCartLine(baseInput)

    expect(first.lineKey).toBe(second.lineKey)
    expect(first.lineId).not.toBe(second.lineId)
  })
})
