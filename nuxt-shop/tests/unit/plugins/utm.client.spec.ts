import { describe, expect, it, vi } from 'vitest'

describe('utm plugin', () => {
  it('captures utm from initial route and later navigation', async () => {
    const capture = vi.fn()
    const routerAfterEach = vi.fn()

    vi.stubGlobal('defineNuxtPlugin', (fn: (ctx: unknown) => unknown) => fn)
    vi.stubGlobal('useRoute', () => ({ query: { utm_source: 'google' } }))
    vi.stubGlobal('useRouter', () => ({ afterEach: (cb: (to: { query: Record<string, string> }) => void) => {
      routerAfterEach(cb)
      cb({ query: { utm_source: 'instagram' } })
    } }))
    vi.stubGlobal('useUtm', () => ({ capture }))

    const plugin = await import('~/plugins/utm.client')
    plugin.default()

    expect(capture).toHaveBeenNthCalledWith(1, { utm_source: 'google' })
    expect(routerAfterEach).toHaveBeenCalledTimes(1)
    expect(capture).toHaveBeenNthCalledWith(2, { utm_source: 'instagram' })
  })
})
