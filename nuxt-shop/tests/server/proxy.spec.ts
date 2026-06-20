import { describe, expect, it, vi } from 'vitest'

async function loadProxyModule() {
  const proxyRequest = vi.fn()

  vi.doMock('h3', () => ({
    proxyRequest,
  }))
  vi.stubGlobal('defineEventHandler', (handler: unknown) => handler)

  const module = await import('~/server/middleware/proxy')

  return {
    handler: module.default as (event: { path: string }) => Promise<unknown> | unknown,
    proxyRequest,
  }
}

describe('proxy middleware', () => {
  it('ignores paths outside api and uploads', async () => {
    vi.stubGlobal('useRuntimeConfig', () => ({ apiBase: 'http://api.test' }))
    vi.stubGlobal('getRequestHeader', vi.fn())

    const { handler, proxyRequest } = await loadProxyModule()
    const result = await handler({ path: '/favicon.ico' })

    expect(result).toBeUndefined()
    expect(proxyRequest).not.toHaveBeenCalled()
  })

  it('proxies api requests and forwards cookies', async () => {
    vi.stubGlobal('useRuntimeConfig', () => ({ apiBase: 'http://api.test' }))
    vi.stubGlobal('getRequestHeader', vi.fn(() => 'session=abc'))

    const { handler, proxyRequest } = await loadProxyModule()
    const event = { path: '/api/orders' }

    await handler(event)

    expect(proxyRequest).toHaveBeenCalledWith(event, 'http://api.test/api/orders', {
      headers: { cookie: 'session=abc' },
    })
  })

  it('proxies upload requests without adding empty cookie headers', async () => {
    vi.stubGlobal('useRuntimeConfig', () => ({ apiBase: 'http://api.test' }))
    vi.stubGlobal('getRequestHeader', vi.fn(() => undefined))

    const { handler, proxyRequest } = await loadProxyModule()
    const event = { path: '/uploads/bouquet.jpg' }

    await handler(event)

    expect(proxyRequest).toHaveBeenCalledWith(event, 'http://api.test/uploads/bouquet.jpg', {
      headers: undefined,
    })
  })

  it('proxies upload requests with empty cookie value as no header', async () => {
    vi.stubGlobal('useRuntimeConfig', () => ({ apiBase: 'http://api.test' }))
    vi.stubGlobal('getRequestHeader', vi.fn(() => ''))

    const { handler, proxyRequest } = await loadProxyModule()
    const event = { path: '/uploads/bouquet.jpg' }

    await handler(event)

    expect(proxyRequest).toHaveBeenCalledWith(event, 'http://api.test/uploads/bouquet.jpg', {
      headers: undefined,
    })
  })
})
