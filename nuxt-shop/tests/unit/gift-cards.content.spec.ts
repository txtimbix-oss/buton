import { describe, expect, it } from 'vitest'

import {
  buildGiftCardInquiryPayload,
  createEmptyGiftCardForm,
  giftCardDesigns,
  giftCardNominals,
  getGiftCardAmount,
} from '~/lib/gift-cards/content'

describe('gift cards content', () => {
  it('keeps stable nominals, designs, and default form values', () => {
    expect(giftCardNominals).toEqual(['1 000', '2 000', '3 000', '5 000', 'Своя'])
    expect(giftCardDesigns.map(design => design.kind)).toEqual(['rose', 'green', 'peach', 'lav'])
    expect(createEmptyGiftCardForm()).toEqual({
      from: '',
      to: '',
      wish: '',
      email: '',
      format: 'digital',
    })
  })

  it('resolves fixed and custom nominal amounts', () => {
    expect(getGiftCardAmount('5 000', '')).toBe(5000)
    expect(getGiftCardAmount('Своя', '7500')).toBe(7500)
    expect(getGiftCardAmount('Своя', '')).toBe(0)
  })

  it('builds the inquiry payload with preserved gift-card semantics', () => {
    const payload = buildGiftCardInquiryPayload({
      amount: 7500,
      design: 'green',
      form: {
        from: '',
        to: 'Ольга',
        wish: 'С праздником',
        email: 'olga@example.com',
        format: 'print',
      },
    })

    expect(payload).toEqual({
      type: 'custom',
      name: 'Покупатель',
      phone: '—',
      email: 'olga@example.com',
      data: {
        subtype: 'gift-card',
        amount: 7500,
        design: 'green',
        from: '',
        to: 'Ольга',
        wish: 'С праздником',
        email: 'olga@example.com',
        format: 'print',
      },
    })
  })

  it('keeps payload order deterministic and trims free-form fields', () => {
    const payload = buildGiftCardInquiryPayload({
      amount: 7500,
      design: 'rose',
      form: {
        from: '  Анна  ',
        to: '  Ольга  ',
        wish: '  Без пыли  ',
        email: '  olga@example.com  ',
        format: '  print  ',
      },
    })

    expect(Object.keys(payload)).toEqual(['type', 'name', 'phone', 'email', 'data'])
    expect(Object.keys(payload.data)).toEqual(['subtype', 'amount', 'design', 'from', 'to', 'wish', 'email', 'format'])
    expect(payload).toEqual({
      type: 'custom',
      name: 'Анна',
      phone: '—',
      email: 'olga@example.com',
      data: {
        subtype: 'gift-card',
        amount: 7500,
        design: 'rose',
        from: 'Анна',
        to: 'Ольга',
        wish: 'Без пыли',
        email: 'olga@example.com',
        format: 'print',
      },
    })
  })
})
