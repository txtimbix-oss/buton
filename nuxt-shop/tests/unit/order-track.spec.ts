import { describe, expect, it } from 'vitest'

import {
  createEmptyOrderTrackForm,
  getDeliveryTypeLabel,
  getTrackLookupError,
  getTrackStatusIndex,
  normalizeOrderTrackNumber,
  trackStatusSteps,
  type TrackOrder,
} from '~/lib/orders/track'

function makeOrder(status: TrackOrder['status']): TrackOrder {
  return {
    orderNumber: 'SPB-01001',
    status,
    total: 5400,
    items: [
      {
        slug: 'rose-hit',
        name: 'Розовый хит',
        bloom: 'rose',
        sizeLabel: 'M',
        price: 5400,
        qty: 1,
      },
    ],
    delivery: {
      type: 'courier',
      address: 'Невский, 1',
      date: '2026-06-08',
      time: '18:00',
    },
    recipient: {
      name: 'Анна',
      phone: '+7 900 000 00 00',
    },
    createdAt: '2026-06-08T10:00:00.000Z',
  }
}

describe('order track helpers', () => {
  it('creates an empty tracking form', () => {
    expect(createEmptyOrderTrackForm()).toEqual({
      number: '',
      phone: '',
    })
  })

  it('normalizes order numbers for lookup payloads', () => {
    expect(normalizeOrderTrackNumber(' spb-01001 ')).toBe('SPB-01001')
    expect(normalizeOrderTrackNumber('spb-ab12')).toBe('SPB-AB12')
  })

  it('maps tracked order statuses to the visible progress index', () => {
    expect(trackStatusSteps.map(step => step.key)).toEqual([
      'pending',
      'confirmed',
      'delivering',
      'delivered',
    ])
    expect(getTrackStatusIndex(null)).toBe(-1)
    expect(getTrackStatusIndex(makeOrder('pending'))).toBe(0)
    expect(getTrackStatusIndex(makeOrder('delivering'))).toBe(2)
    expect(getTrackStatusIndex(makeOrder('delivered'))).toBe(3)
    expect(getTrackStatusIndex(makeOrder('cancelled'))).toBe(0)
  })

  it('maps delivery types to stable labels', () => {
    expect(getDeliveryTypeLabel('pickup')).toBe('Самовывоз')
    expect(getDeliveryTypeLabel('scheduled')).toBe('Доставка ко времени')
    expect(getDeliveryTypeLabel('courier')).toBe('Курьерская доставка')
    expect(getDeliveryTypeLabel(undefined)).toBe('Курьерская доставка')
  })

  it('extracts a user-facing lookup error from api failures', () => {
    expect(getTrackLookupError({ data: { error: 'Точный текст API' } })).toBe('Точный текст API')
    expect(getTrackLookupError(new Error('down'))).toBe('Заказ не найден. Проверьте номер и телефон.')
  })
})
