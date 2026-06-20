import { describe, expect, it } from 'vitest'

import { normalizePhone, validateCustomContact } from '~/lib/custom/validation'

describe('normalizePhone', () => {
  it('collapses repeated whitespace and trims the result', () => {
    expect(normalizePhone('  +7   921   000  00 00  ')).toBe('+7 921 000 00 00')
  })
})

describe('validateCustomContact', () => {
  it('requires both name and phone', () => {
    expect(validateCustomContact({ name: '', phone: '' })).toEqual({
      name: true,
      phone: true,
    })
  })

  it('accepts filled values and uses normalized phone emptiness check', () => {
    expect(
      validateCustomContact({
        name: 'Мария',
        phone: '   +7   921   000  00 00  ',
      }),
    ).toEqual({
      name: false,
      phone: false,
    })
  })
})
