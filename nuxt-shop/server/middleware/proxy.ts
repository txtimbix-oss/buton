import { proxyRequest } from 'h3'

function optionalHeader(event: Parameters<typeof getRequestHeader>[0], name: string): string | undefined {
  const value = getRequestHeader(event, name)
  return value && value.trim() ? value : undefined
}

/* Локальные Nitro-роуты (server/api/**) — их проксировать нельзя,
   иначе запрос улетает на бэк, где таких путей нет (404),
   и, например, настройки магазина падают в дефолты («spbshop»). */
const LOCAL_API_PREFIXES = ['/api/app-settings', '/api/dadata/']

export default defineEventHandler(async (event) => {
  const path = event.path
  if (!path.startsWith('/api/') && !path.startsWith('/uploads/')) return
  if (LOCAL_API_PREFIXES.some(prefix => path.startsWith(prefix))) return

  const config = useRuntimeConfig(event)
  const apiBase = config.apiBase
  const headers: Record<string, string> = {}

  const cookie = optionalHeader(event, 'cookie')
  let origin = optionalHeader(event, 'origin')
  let referer = optionalHeader(event, 'referer')

  // В dev бэк-авторизация отдаёт 500 на незнакомый Origin (http://localhost:*).
  // Подменяем localhost-origin на доверенный прод-origin, который бэк знает (CORS-whitelist).
  // Хардкод, а не siteUrl: в dev .env siteUrl сам по себе localhost.
  if (origin && /^https?:\/\/(localhost|127\.0\.0\.1)/i.test(origin)) {
    origin = 'https://butonshop.ru'
    referer = 'https://butonshop.ru/'
  }

  if (cookie) headers.cookie = cookie
  if (origin) headers.origin = origin
  if (referer) headers.referer = referer

  return proxyRequest(event, `${apiBase}${path}`, {
    headers: Object.keys(headers).length ? headers : undefined,
  })
})
