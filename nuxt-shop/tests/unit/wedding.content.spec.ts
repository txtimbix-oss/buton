import { describe, expect, it } from 'vitest'

import {
  buildWeddingInquiryPayload,
  createEmptyWeddingInquiryForm,
  validateWeddingContact,
  weddingGallery,
  weddingPackages,
  weddingPageContent,
} from '~/lib/wedding/content'

describe('wedding content', () => {
  it('keeps stable gallery, packages, and copy content', () => {
    expect(weddingGallery).toEqual([
      { kind: 'cream', h: 320 },
      { kind: 'rose', h: 240 },
      { kind: 'green', h: 260 },
      { kind: 'peach', h: 300 },
      { kind: 'lav', h: 250 },
      { kind: 'mix', h: 290 },
    ])

    expect(weddingPackages).toEqual([
      {
        title: 'Камерная',
        price: 'от 35 000',
        desc: 'Букет невесты, бутоньерка, 2 композиции на столы.',
        popular: false,
      },
      {
        title: 'Классическая',
        price: 'от 90 000',
        desc: 'Арка, президиум, букет, бутоньерки, оформление зала.',
        popular: true,
      },
      {
        title: 'Полная',
        price: 'от 180 000',
        desc: 'Полное оформление под ключ: церемония, банкет, фотозона.',
        popular: false,
      },
    ])

    expect(weddingPageContent.heroEyebrow).toBe('Свадебная флористика')
    expect(weddingPageContent.heroTitleLines).toEqual([
      'Цветы для самого',
      'важного дня',
    ])
    expect(weddingPageContent.submitPendingLabel).toBe('Отправляем…')
  })

  it('provides a blank form and validates required contact fields', () => {
    expect(createEmptyWeddingInquiryForm()).toEqual({
      name: '',
      phone: '',
      date: '',
      format: '',
      budget: '',
    })

    expect(validateWeddingContact({ name: ' ', phone: '' })).toEqual({
      name: true,
      phone: true,
    })

    expect(validateWeddingContact({ name: 'Анна', phone: '+7 921 000 00 00' })).toEqual({
      name: false,
      phone: false,
    })
  })

  it('builds the inquiry payload with preserved wedding semantics', () => {
    expect(buildWeddingInquiryPayload({
      name: 'Анна',
      phone: '+7 921 000 00 00',
      date: '2026-07-01',
      format: 'Выездная церемония',
      budget: '90 000 — 150 000 ₽',
    })).toEqual({
      type: 'wedding',
      name: 'Анна',
      phone: '+7 921 000 00 00',
      data: {
        name: 'Анна',
        phone: '+7 921 000 00 00',
        date: '2026-07-01',
        format: 'Выездная церемония',
        budget: '90 000 — 150 000 ₽',
      },
    })
  })

  it('preserves stable object order and trims raw wedding fields', () => {
    const payload = buildWeddingInquiryPayload({
      name: ' Анна ',
      phone: ' +7 921 000 00 00 ',
      date: ' 2026-07-01 ',
      format: '  Выездная церемония  ',
      budget: '  90 000 — 150 000 ₽ ',
    })

    expect(Object.keys(payload)).toEqual(['type', 'name', 'phone', 'data'])
    expect(Object.keys(payload.data)).toEqual(['name', 'phone', 'date', 'format', 'budget'])
    expect(payload).toEqual({
      type: 'wedding',
      name: 'Анна',
      phone: '+7 921 000 00 00',
      data: {
        name: 'Анна',
        phone: '+7 921 000 00 00',
        date: '2026-07-01',
        format: 'Выездная церемония',
        budget: '90 000 — 150 000 ₽',
      },
    })
  })
})
