export default defineEventHandler(async event => {
  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  setHeader(event, 'Cache-Control', 'public, max-age=3600')

  const config  = useRuntimeConfig(event)
  const siteUrl = (config.public.siteUrl as string || 'https://butonshop.ru').replace(/\/+$/, '')
  const apiBase = (config.apiBase as string || 'http://localhost:3001')

  // Статические страницы
  const staticPages = [
    { path: '/',             priority: '1.0', changefreq: 'daily'   },
    { path: '/catalog',      priority: '0.9', changefreq: 'daily'   },
    { path: '/delivery',     priority: '0.8', changefreq: 'monthly' },
    { path: '/about',        priority: '0.7', changefreq: 'monthly' },
    { path: '/subscription', priority: '0.8', changefreq: 'weekly'  },
    { path: '/holiday',      priority: '0.8', changefreq: 'weekly'  },
    { path: '/wedding',      priority: '0.8', changefreq: 'weekly'  },
    { path: '/gift-cards',   priority: '0.8', changefreq: 'weekly'  },
    { path: '/care-tips',    priority: '0.7', changefreq: 'monthly' },
    { path: '/custom',       priority: '0.8', changefreq: 'weekly'  },
  ]

  // Динамические страницы товаров
  let products: { slug: string; createdAt?: string }[] = []
  try {
    const rawProducts = await $fetch<Array<{ slug?: unknown; createdAt?: string }>>(`${apiBase}/api/products?all=1`)
    products = rawProducts.filter(item => typeof item.slug === 'string' && item.slug.length > 0)
  } catch { /* API недоступен — sitemap без товаров */ }

  // Страницы активных коллекций
  let collections: { slug: string; createdAt?: string }[] = []
  try {
    const all = await $fetch<Array<{ slug?: unknown; isActive: boolean; createdAt?: string }>>(`${apiBase}/api/collections`)
    collections = all
      .filter(c => c.isActive && typeof c.slug === 'string' && c.slug.length > 0)
  } catch { /* игнорируем */ }

  const today = new Date().toISOString().slice(0, 10)

  const entries = [
    ...staticPages.map(p => urlEntry(siteUrl + p.path, today, p.changefreq, p.priority)),
    ...products.map(p =>
      urlEntry(
        `${siteUrl}/product/${p.slug}`,
        p.createdAt ? new Date(p.createdAt).toISOString().slice(0, 10) : today,
        'weekly',
        '0.8',
      )
    ),
    ...collections.map(c =>
      urlEntry(
        `${siteUrl}/catalog/${c.slug}`,
        c.createdAt ? new Date(c.createdAt).toISOString().slice(0, 10) : today,
        'weekly',
        '0.7',
      )
    ),
  ]

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>`
})

function urlEntry(loc: string, lastmod: string, changefreq: string, priority: string) {
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
}
