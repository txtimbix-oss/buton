import { describe, expect, it, vi } from 'vitest'

async function loadSitemapModule() {
  const setHeader = vi.fn()

  vi.stubGlobal('defineEventHandler', (handler: unknown) => handler)
  vi.stubGlobal('setHeader', setHeader)

  const module = await import('~/server/routes/sitemap.xml')

  return {
    handler: module.default as (event: object) => Promise<string>,
    setHeader,
  }
}

describe('sitemap route', () => {
  it('renders static, product, and active collection urls into xml', async () => {
    vi.stubGlobal('useRuntimeConfig', () => ({
      public: { siteUrl: 'https://shop.test/' },
      apiBase: 'http://api.test',
    }))
    vi.stubGlobal('$fetch', vi.fn((url: string) => {
      if (url.endsWith('/api/products?all=1')) {
        return [
          { slug: 'belye-nochi', createdAt: '2026-06-01T10:00:00.000Z' },
          { slug: 'nevskiy-buket' },
        ]
      }
      if (url.endsWith('/api/collections')) {
        return [
          { slug: 'premium-bukety', isActive: true, createdAt: '2026-06-02T10:00:00.000Z' },
          { slug: 'hidden-set', isActive: false, createdAt: '2026-06-03T10:00:00.000Z' },
        ]
      }
      throw new Error(`Unexpected fetch url: ${url}`)
    }))

    const { handler, setHeader } = await loadSitemapModule()
    const xml = await handler({})

    expect(setHeader).toHaveBeenCalledWith({}, 'Content-Type', 'application/xml; charset=utf-8')
    expect(setHeader).toHaveBeenCalledWith({}, 'Cache-Control', 'public, max-age=3600')
    expect(xml).toContain('<loc>https://shop.test/catalog</loc>')
    expect(xml).toContain('<loc>https://shop.test/product/belye-nochi</loc>')
    expect(xml).toContain('<loc>https://shop.test/catalog/premium-bukety</loc>')
    expect(xml).not.toContain('hidden-set')
  })

  it('normalizes trailing slashes and skips product entries without slug', async () => {
    vi.stubGlobal('useRuntimeConfig', () => ({
      public: { siteUrl: 'https://shop.test//' },
      apiBase: 'http://api.test',
    }))
    vi.stubGlobal('$fetch', vi.fn((url: string) => {
      if (url.endsWith('/api/products?all=1')) {
        return [
          { slug: 'good-product', createdAt: '2026-06-01T10:00:00.000Z' },
          { createdAt: '2026-06-01T10:00:00.000Z' },
          { slug: '' },
          { slug: 'another-product' },
        ]
      }

      if (url.endsWith('/api/collections')) {
        return []
      }

      throw new Error(`Unexpected fetch url: ${url}`)
    }))

    const { handler } = await loadSitemapModule()
    const xml = await handler({})

    expect(xml).toContain('<loc>https://shop.test/product/good-product</loc>')
    expect(xml).toContain('<loc>https://shop.test/product/another-product</loc>')
    expect(xml).not.toContain('<loc>https://shop.test/product/</loc>')
    expect(xml).not.toContain('<loc>https://shop.test/product/undefined</loc>')
  })

  it('falls back to static pages when API fetches fail', async () => {
    vi.stubGlobal('useRuntimeConfig', () => ({
      public: { siteUrl: 'https://shop.test/' },
      apiBase: 'http://api.test',
    }))
    vi.stubGlobal('$fetch', vi.fn(async () => {
      throw new Error('API unavailable')
    }))

    const { handler } = await loadSitemapModule()
    const xml = await handler({})

    expect(xml).toContain('<loc>https://shop.test/</loc>')
    expect(xml).toContain('<loc>https://shop.test/catalog</loc>')
    expect(xml).not.toContain('/product/')
    expect(xml).not.toContain('/catalog/')
  })
})
