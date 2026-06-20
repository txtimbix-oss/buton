import { describe, expect, it } from 'vitest'

import { normalizeSettings } from '~/lib/settings/normalize'

describe('normalizeSettings', () => {
  it('converts booleans, numbers, CSV values, and JSON payloads into typed nested settings', () => {
    const settings = normalizeSettings({
      chatProactiveEnabled: 'true',
      chatProactiveDelay: '45',
      deliveryFreeThreshold: '5000',
      deliveryTimeSlots: '10:00 - 12:00\n12:00 - 14:00',
      searchHints: 'Розы,Пионы',
      catalogSizes: '["S","M"]',
      catalogFilters: '[{"label":"Сезонные","type":"season","value":"весна"}]',
      siteUrl: 'https://remote.test/',
    }, { public: { siteUrl: 'https://runtime.test/' } })

    expect(settings.chat.proactive.enabled).toBe(true)
    expect(settings.chat.proactive.delaySeconds).toBe(45)
    expect(settings.delivery.freeThreshold).toBe(5000)
    expect(settings.delivery.timeSlots).toEqual(['10:00 - 12:00', '12:00 - 14:00'])
    expect(settings.search.hints).toEqual(['Розы', 'Пионы'])
    expect(settings.catalog.sizes).toEqual(['S', 'M'])
    expect(settings.catalog.quickFilters).toHaveLength(1)
    expect(settings.seo.siteUrl).toBe('https://runtime.test')
    expect(settings.siteUrl).toBe('https://runtime.test')
  })

  it('falls back safely for malformed JSON payloads', () => {
    const settings = normalizeSettings({
      catalogSizes: '{broken',
      catalogFilters: '{broken',
      bonusBlockedProducts: '{broken',
    }, { public: { siteUrl: 'https://runtime.test' } })

    expect(settings.catalog.sizes).toEqual(['S', 'M', 'L'])
    expect(settings.catalog.quickFilters).toEqual([])
    expect(settings.bonus.blockedProducts).toEqual([])
  })
})
