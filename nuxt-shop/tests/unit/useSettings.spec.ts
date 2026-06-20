import { computed, ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'

import { defaultSettings, parseSettingJSON, useSettings } from '~/composables/useSettings'

describe('useSettings', () => {
  it('parses valid JSON values', () => {
    expect(parseSettingJSON('["S","M"]', [])).toEqual(['S', 'M'])
  })

  it('returns fallback for missing or malformed JSON', () => {
    expect(parseSettingJSON(undefined, ['fallback'])).toEqual(['fallback'])
    expect(parseSettingJSON('{broken', ['fallback'])).toEqual(['fallback'])
  })

  it('merges fetched settings over defaults', () => {
    vi.stubGlobal('computed', computed)
    vi.stubGlobal('useRuntimeConfig', () => ({ public: { siteUrl: 'https://runtime.test/' } }))
    vi.stubGlobal('useAsyncData', vi.fn(() => ({
      data: ref({
        storeName: 'custom-shop',
        heroBtn1: 'Open catalog',
        searchHints: 'Розы,Пионы',
      }),
    })))

    const settings = useSettings()

    expect(settings.value.storeName).toBe('custom-shop')
    expect(settings.value.heroBtn1).toBe('Open catalog')
    expect(settings.value.storeTagline).toBe(defaultSettings.storeTagline)
    expect(settings.value.seo.siteUrl).toBe('https://runtime.test')
    expect(settings.value.search.hints).toEqual(['Розы', 'Пионы'])
  })
})
