import { describe, expect, it, vi } from 'vitest'

async function loadAppSettingsModule() {
  vi.resetModules()
  vi.stubGlobal('defineEventHandler', (handler: unknown) => handler)

  const module = await import('~/server/api/app-settings.get')

  return {
    handler: module.default as () => Promise<Record<string, string>>,
  }
}

describe('app settings route', () => {
  it('prefers runtime siteUrl over remote settings siteUrl', async () => {
    vi.stubGlobal('useRuntimeConfig', () => ({
      apiBase: 'http://api.test',
      public: { siteUrl: 'https://runtime.test/' },
    }))
    vi.stubGlobal('$fetch', vi.fn(async () => ({ siteUrl: 'https://remote.test/' })))

    const { handler } = await loadAppSettingsModule()
    const data = await handler()

    expect(data.siteUrl).toBe('https://runtime.test/')
  })

  it('falls back to remote payload when runtime siteUrl is empty', async () => {
    vi.stubGlobal('useRuntimeConfig', () => ({
      apiBase: 'http://api.test',
      public: { siteUrl: '' },
    }))
    vi.stubGlobal('$fetch', vi.fn(async () => ({ siteUrl: 'https://remote.test/' })))

    const { handler } = await loadAppSettingsModule()
    const data = await handler()

    expect(data.siteUrl).toBe('https://remote.test/')
  })

  it('falls back to remote payload when app settings API is unavailable', async () => {
    vi.stubGlobal('useRuntimeConfig', () => ({
      apiBase: 'http://api.test',
      public: { siteUrl: '' },
    }))
    vi.stubGlobal('$fetch', vi.fn(async () => {
      throw new Error('api unavailable')
    }))

    const { handler } = await loadAppSettingsModule()
    const data = await handler()

    expect(data).toEqual({ siteUrl: '' })
  })

  it('falls back to safe object when API returns non-object payload', async () => {
    vi.stubGlobal('useRuntimeConfig', () => ({
      apiBase: 'http://api.test',
      public: { siteUrl: 'https://runtime.test/' },
    }))
    vi.stubGlobal('$fetch', vi.fn(async () => null))

    const { handler } = await loadAppSettingsModule()
    const data = await handler()

    expect(data).toEqual({
      siteUrl: 'https://runtime.test/',
    })
  })

  it('keeps remote siteUrl when runtime is empty and fetch returns it', async () => {
    vi.stubGlobal('useRuntimeConfig', () => ({
      apiBase: 'http://api.test',
      public: { siteUrl: '' },
    }))
    vi.stubGlobal('$fetch', vi.fn(async () => ({ siteUrl: 'https://remote2.test/' })))

    const { handler } = await loadAppSettingsModule()
    const data = await handler()

    expect(data.siteUrl).toBe('https://remote2.test/')
  })
})
