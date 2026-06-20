import { describe, expect, it, vi } from 'vitest'

async function loadDadataModule() {
  vi.resetModules()
  vi.stubGlobal('defineEventHandler', (handler: unknown) => handler)

  const module = await import('~/server/api/dadata/address.post')

  return {
    handler: module.default as (event: object) => Promise<string[]>,
  }
}

describe('dadata route', () => {
  it('returns mapped suggestions and forwards the private token upstream', async () => {
    vi.stubGlobal('readBody', vi.fn(async () => ({ query: 'Невский' })))
    vi.stubGlobal('useRuntimeConfig', () => ({ dadataToken: 'secret-token' }))
    const fetchMock = vi.fn(async () => ({
      suggestions: [{ value: 'Санкт-Петербург, Невский проспект' }],
    }))
    vi.stubGlobal('$fetch', fetchMock)

    const { handler } = await loadDadataModule()
    const result = await handler({})

    expect(fetchMock).toHaveBeenCalledWith(
      'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address',
      {
        method: 'POST',
        headers: {
          Authorization: 'Token secret-token',
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: { query: 'Невский', count: 6 },
      },
    )
    expect(result).toEqual(['Санкт-Петербург, Невский проспект'])
  })

  it('returns an empty list for short queries without calling DaData', async () => {
    vi.stubGlobal('readBody', vi.fn(async () => ({ query: 'Не' })))
    vi.stubGlobal('useRuntimeConfig', () => ({ dadataToken: 'secret-token' }))
    const fetchMock = vi.fn()
    vi.stubGlobal('$fetch', fetchMock)

    const { handler } = await loadDadataModule()
    const result = await handler({})

    expect(result).toEqual([])
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('falls back to runtime env token when runtime config token is empty', async () => {
    const prevNuxtToken = process.env.NUXT_DADATA_TOKEN
    const prevDadataToken = process.env.DADATA_TOKEN

    process.env.NUXT_DADATA_TOKEN = 'nuxt-token'
    process.env.DADATA_TOKEN = ''
    vi.stubGlobal('readBody', vi.fn(async () => ({ query: 'Невский проспект' })))
    vi.stubGlobal('useRuntimeConfig', () => ({ dadataToken: '' }))

    const fetchMock = vi.fn(async () => ({
      suggestions: [{ value: 'Санкт-Петербург, Невский проспект' }],
    }))
    vi.stubGlobal('$fetch', fetchMock)

    const { handler } = await loadDadataModule()
    const result = await handler({})

    expect(fetchMock).toHaveBeenCalledWith(
      'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Token nuxt-token',
        }),
      }),
    )
    expect(result).toEqual(['Санкт-Петербург, Невский проспект'])

    if (prevNuxtToken == null) {
      delete process.env.NUXT_DADATA_TOKEN
    } else {
      process.env.NUXT_DADATA_TOKEN = prevNuxtToken
    }

    if (prevDadataToken == null) {
      delete process.env.DADATA_TOKEN
    } else {
      process.env.DADATA_TOKEN = prevDadataToken
    }
  })

  it('returns [] for malformed dadata payload', async () => {
    vi.stubGlobal('readBody', vi.fn(async () => ({ query: 'Невский' })))
    vi.stubGlobal('useRuntimeConfig', () => ({ dadataToken: 'secret-token' }))
    vi.stubGlobal('$fetch', vi.fn(async () => ({ suggestions: [{ value: null }, { value: 12 }, {}] })))

    const { handler } = await loadDadataModule()
    const result = await handler({})

    expect(result).toEqual([])
  })
})
