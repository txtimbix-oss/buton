import { describe, expect, it } from 'vitest'

import {
  buildCorporateInquiryPayload,
  corporateBenefits,
  corporateFormats,
  validateCorporateContact,
} from '~/lib/corporate/content'

describe('corporate content', () => {
  it('keeps stable benefit and format catalogs for the page shell', () => {
    expect(corporateBenefits).toHaveLength(3)
    expect(corporateBenefits[0]).toMatchObject({ icon: 'gift' })
    expect(corporateFormats).toHaveLength(3)
    expect(corporateFormats[1]).toMatchObject({ title: 'Подарки партнёрам' })
  })

  it('validates only required corporate contact fields and builds the inquiry payload', () => {
    expect(validateCorporateContact({ name: '', phone: '' })).toEqual({
      name: true,
      phone: true,
    })
    expect(validateCorporateContact({ name: 'Ирина', phone: '+7 812 000 00 00' })).toEqual({
      name: false,
      phone: false,
    })

    expect(buildCorporateInquiryPayload({
      company: 'ООО Нева',
      inn: '7801000000',
      volume: 'от 30 000 ₽/мес',
      frequency: 'Еженедельно',
      name: 'Ирина',
      phone: '+7 812 000 00 00',
    })).toEqual({
      type: 'corporate',
      name: 'Ирина',
      phone: '+7 812 000 00 00',
      data: {
        company: 'ООО Нева',
        inn: '7801000000',
        volume: 'от 30 000 ₽/мес',
        frequency: 'Еженедельно',
        name: 'Ирина',
        phone: '+7 812 000 00 00',
      },
    })
  })

  it('keeps stable payload key order and trims optional corporate metadata', () => {
    const payload = buildCorporateInquiryPayload({
      company: 'ООО  Нева ',
      inn: '  7801000000 ',
      volume: ' от 50 000 ₽/мес ',
      frequency: ' Еженедельно ',
      name: ' Ирина ',
      phone: ' +7 812 000 00 00 ',
    })

    expect(Object.keys(payload)).toEqual(['type', 'name', 'phone', 'data'])
    expect(Object.keys(payload.data)).toEqual([
      'company',
      'inn',
      'volume',
      'frequency',
      'name',
      'phone',
    ])
    expect(payload).toEqual({
      type: 'corporate',
      name: 'Ирина',
      phone: '+7 812 000 00 00',
      data: {
        company: 'ООО  Нева',
        inn: '7801000000',
        volume: 'от 50 000 ₽/мес',
        frequency: 'Еженедельно',
        name: 'Ирина',
        phone: '+7 812 000 00 00',
      },
    })
  })
})
