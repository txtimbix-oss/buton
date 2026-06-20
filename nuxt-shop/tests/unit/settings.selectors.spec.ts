import { describe, expect, it } from 'vitest'

import { normalizeSettings } from '~/lib/settings/normalize'
import { selectCatalogSettings, selectSeoSettings, selectUiSettings } from '~/lib/settings/selectors'

describe('settings selectors', () => {
  it('returns typed domain slices without exposing parsing details', () => {
    const settings = normalizeSettings({
      catalogSizes: '["S","M","L"]',
      pageTransitionEffect: 'slide',
      pageTransitionDuration: '280',
    }, { public: { siteUrl: 'https://shop.test/' } })

    expect(selectCatalogSettings(settings).sizes).toEqual(['S', 'M', 'L'])
    expect(selectSeoSettings(settings).siteUrl).toBe('https://shop.test')
    expect(selectUiSettings(settings).pageTransition.durationMs).toBe(280)
  })
})
