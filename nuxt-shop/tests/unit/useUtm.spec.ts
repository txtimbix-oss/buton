import { describe, expect, it, vi } from 'vitest'
import { computed } from 'vue'

import { useUtm } from '~/composables/useUtm'

function createCookieMock(initial: { source?: string; medium?: string; campaign?: string; term?: string; content?: string } | null = null) {
  return { value: initial }
}

describe('useUtm', () => {
  it('captures and normalizes only when source exists', () => {
    const cookie = createCookieMock()
    vi.stubGlobal('computed', computed)
    vi.stubGlobal('useCookie', vi.fn(() => cookie))

    const { capture, utm } = useUtm()

    capture({
      utm_source: '  google ',
      utm_medium: 'cpc',
      utm_campaign: ['summer'],
      utm_term: 'flowers',
      utm_content: '  ad_1 ',
    })

    expect(cookie.value).toEqual({
      source: 'google',
      medium: 'cpc',
      campaign: 'summer',
      term: 'flowers',
      content: 'ad_1',
    })
    expect(utm.value).toEqual(cookie.value)
  })

  it('does not overwrite existing cookie when source is absent', () => {
    const cookie = createCookieMock({
      source: 'yandex',
      medium: 'cpc',
      campaign: 'winter',
      term: 'flowers',
      content: 'banner',
    })
    vi.stubGlobal('computed', computed)
    vi.stubGlobal('useCookie', vi.fn(() => cookie))

    const { capture, utm } = useUtm()
    capture({
      utm_medium: 'search',
      utm_campaign: 'x',
    })

    expect(cookie.value).toEqual({
      source: 'yandex',
      medium: 'cpc',
      campaign: 'winter',
      term: 'flowers',
      content: 'banner',
    })
    expect(utm.value).toEqual(cookie.value)
  })
})
