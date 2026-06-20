export const giftCardNominals = ['1 000', '2 000', '3 000', '5 000', 'Своя'] as const

export const giftCardDesigns = [
  { kind: 'rose', name: 'Белые ночи' },
  { kind: 'green', name: 'Ботаника' },
  { kind: 'peach', name: 'Тёплый свет' },
  { kind: 'lav', name: 'Лаванда' },
] as const

export type GiftCardNominal = typeof giftCardNominals[number]
export type GiftCardDesignKind = typeof giftCardDesigns[number]['kind']

export interface GiftCardForm {
  from: string
  to: string
  wish: string
  email: string
  format: 'digital' | 'print'
}

export interface BuildGiftCardInquiryPayloadInput {
  amount: number
  design: GiftCardDesignKind
  form: GiftCardForm
}

export function createEmptyGiftCardForm(): GiftCardForm {
  return {
    from: '',
    to: '',
    wish: '',
    email: '',
    format: 'digital',
  }
}

export function getGiftCardAmount(nominal: GiftCardNominal, customAmount: string): number {
  if (nominal === 'Своя') return Number(customAmount) || 0

  return Number(nominal.replace(/\s/g, ''))
}

export function buildGiftCardInquiryPayload(input: BuildGiftCardInquiryPayloadInput) {
  const normalizedForm = {
    from: input.form.from.trim(),
    to: input.form.to.trim(),
    wish: input.form.wish.trim(),
    email: input.form.email.trim(),
    format: input.form.format.trim(),
  }

  return {
    type: 'custom' as const,
    name: normalizedForm.from || 'Покупатель',
    phone: '—',
    email: normalizedForm.email,
    data: {
      subtype: 'gift-card' as const,
      amount: input.amount,
      design: input.design,
      ...normalizedForm,
    },
  }
}
