import { describe, expect, it, vi } from 'vitest'

describe('push plugin', () => {
  it('registers service worker during plugin init', async () => {
    const register = vi.fn()
    vi.stubGlobal('defineNuxtPlugin', (fn: (ctx: unknown) => unknown) => fn)
    vi.stubGlobal('usePush', () => ({ register }))

    const plugin = await import('~/plugins/push.client')
    plugin.default()

    expect(register).toHaveBeenCalledTimes(1)
  })
})
