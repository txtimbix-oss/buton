import { describe, expect, it } from 'vitest'

import {
  getNextSaleDeadline,
  getSaleCountdownSegments,
} from '~/lib/sale/timer'

describe('sale timer helpers', () => {
  it('builds countdown segments until the next monday boundary', () => {
    expect(getSaleCountdownSegments(new Date(2026, 5, 3, 9, 21, 55))).toEqual([
      { value: '04', label: 'дня' },
      { value: '14', label: 'часа' },
      { value: '38', label: 'мин' },
      { value: '05', label: 'сек' },
    ])
  })

  it('rolls over from monday to the following monday', () => {
    const deadline = getNextSaleDeadline(new Date(2026, 5, 8, 0, 0, 0))

    expect(deadline.getFullYear()).toBe(2026)
    expect(deadline.getMonth()).toBe(5)
    expect(deadline.getDate()).toBe(15)
    expect(deadline.getHours()).toBe(0)
    expect(deadline.getMinutes()).toBe(0)
    expect(deadline.getSeconds()).toBe(0)

    expect(getSaleCountdownSegments(new Date(2026, 5, 8, 0, 0, 0))).toEqual([
      { value: '07', label: 'дня' },
      { value: '00', label: 'часа' },
      { value: '00', label: 'мин' },
      { value: '00', label: 'сек' },
    ])
  })
})
