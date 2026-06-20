import { describe, expect, it } from 'vitest'

import {
  buildCustomCartLineInput,
  buildCustomQuickOrderCartLineInput,
  buildCustomQuotePayload,
} from '~/lib/custom/payloads'

describe('buildCustomCartLineInput', () => {
  it('builds a stable slug, meta, and addon list for regular cart lines', () => {
    const line = buildCustomCartLineInput({
      occasion: 'Романтика',
      sizeId: 'm',
      sizeLabel: 'M',
      flowerTypeId: 'roses',
      flowerTypeName: 'Розы',
      paletteId: 'rose',
      styleId: 'airy',
      styleName: 'Воздушный',
      packagingId: 'craft',
      packagingName: 'Крафт + лента',
      flowerCount: 16,
      estimatedTotal: 6900,
      addonIds: ['toy', 'photo', 'card'],
    })

    expect(line.slug).toBe('custom-m-roses-rose-airy-craft')
    expect(line.meta).toBe('Розы · 16 шт. · Воздушный')
    expect(line.sizeLabel).toBe('M · Крафт + лента')
    expect(line.addons).toEqual([
      'Открытка с текстом',
      'Мягкая игрушка',
      'Фото перед отправкой',
    ])
  })
})

describe('buildCustomQuickOrderCartLineInput', () => {
  it('keeps photo exactly once and inserts today delivery marker', () => {
    const line = buildCustomQuickOrderCartLineInput({
      occasion: 'Романтика',
      sizeId: 'm',
      sizeLabel: 'M',
      flowerTypeId: 'roses',
      paletteId: 'rose',
      styleId: 'airy',
      estimatedTotal: 6900,
      packagingId: 'craft',
      quickDeliveryTime: '14:00–16:00',
      addonIds: ['photo', 'card', 'photo'],
    })

    expect(line.slug).toBe('custom-today-m-roses-rose-airy-craft')
    expect(line.meta).toBe('Размер M · Фото перед отправкой · 14:00–16:00')
    expect(line.sizeLabel).toBe('M · Сегодня')
    expect(line.addons).toEqual([
      'Фото перед отправкой',
      'Доставка сегодня',
      'Открытка с текстом',
    ])
  })
})

describe('buildCustomQuotePayload', () => {
  it('preserves manual-builder type inside inquiry data', () => {
    const payload = buildCustomQuotePayload({
      name: 'Мария',
      phone: '+7   921   000  00 00',
      message: 'Без пыльцы',
      occasion: 'Романтика',
      sizeLabel: 'M',
      flowerCount: 16,
      flowerTypeName: 'Розы',
      paletteName: 'Розовый',
      styleName: 'Воздушный',
      packagingName: 'Крафт + лента',
      addonIds: ['card', 'photo'],
      deliveryDate: '2026-06-09',
      deliveryTime: '14:00–16:00',
      estimatedTotal: 6900,
    })

    expect(payload).toEqual({
      type: 'custom',
      name: 'Мария',
      phone: '+7 921 000 00 00',
      data: {
        type: 'manual-builder',
        occasion: 'Романтика',
        size: 'M',
        flowers: 16,
        flowerType: 'Розы',
        palette: 'Розовый',
        style: 'Воздушный',
        packaging: 'Крафт + лента',
        addons: ['Открытка с текстом', 'Фото перед отправкой'],
        deliveryDate: '2026-06-09',
        deliveryTime: '14:00–16:00',
        estimate: 6900,
        message: 'Без пыльцы',
      },
    })
  })

  it('keeps mandatory photo-addon and preserves payload key order', () => {
    const payload = buildCustomQuotePayload({
      name: '  Мария  ',
      phone: '+7   921   000  00 00',
      message: '  Без пыльцы  ',
      occasion: 'Романтика',
      sizeLabel: 'M',
      flowerCount: 16,
      flowerTypeName: 'Розы',
      paletteName: 'Розовый',
      styleName: 'Воздушный',
      packagingName: 'Крафт + лента',
      addonIds: ['card'],
      deliveryDate: '2026-06-09',
      deliveryTime: '14:00–16:00',
      estimatedTotal: 6900,
    })

    expect(Object.keys(payload)).toEqual(['type', 'name', 'phone', 'data'])
    expect(Object.keys(payload.data)).toEqual([
      'type',
      'occasion',
      'size',
      'flowers',
      'flowerType',
      'palette',
      'style',
      'packaging',
      'addons',
      'deliveryDate',
      'deliveryTime',
      'estimate',
      'message',
    ])
    expect(payload).toEqual({
      type: 'custom',
      name: 'Мария',
      phone: '+7 921 000 00 00',
      data: {
        type: 'manual-builder',
        occasion: 'Романтика',
        size: 'M',
        flowers: 16,
        flowerType: 'Розы',
        palette: 'Розовый',
        style: 'Воздушный',
        packaging: 'Крафт + лента',
        addons: ['Открытка с текстом', 'Фото перед отправкой'],
        deliveryDate: '2026-06-09',
        deliveryTime: '14:00–16:00',
        estimate: 6900,
        message: 'Без пыльцы',
      },
    })
  })
})
