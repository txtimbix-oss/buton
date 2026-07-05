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
  const isLocal = !!origin && /^https?:\/\/(localhost|127\.0\.0\.1)/i.test(origin)
  if (isLocal) {
    origin = 'https://butonshop.ru'
    referer = 'https://butonshop.ru/'
  }

  if (cookie) headers.cookie = cookie
  if (origin) headers.origin = origin
  if (referer) headers.referer = referer

  return proxyRequest(event, `${apiBase}${path}`, {
    headers: Object.keys(headers).length ? headers : undefined,
    // Dev-only: бэк ставит куку user_token на «Domain=.butonshop.ru; Secure; SameSite=None».
    // На http://localhost браузер её отвергнет → вход/регистрация на localhost не сохранялись бы.
    // Снимаем Domain (host-only), Secure и меняем SameSite=None→Lax. В prod НЕ трогаем — там
    // нужен общий домен (.butonshop.ru), чтобы кука шарилась между сайтом и кабинетом.
    // NB: h3-шный cookieDomainRewrite:'' не годится — пустая строка у h3 falsy и рерайт пропускается,
    // поэтому правим Set-Cookie руками в onResponse (он вызывается уже после записи заголовка).
    ...(isLocal ? {
      onResponse(ev: typeof event) {
        const sc = ev.node.res.getHeader('set-cookie')
        if (!sc) return
        const list = (Array.isArray(sc) ? sc : [String(sc)]).map(c =>
          String(c)
            .replace(/;\s*Domain=[^;]+/gi, '')
            .replace(/;\s*Secure/gi, '')
            .replace(/;\s*SameSite=None/gi, '; SameSite=Lax'))
        ev.node.res.setHeader('set-cookie', list)
      },
    } : {}),
  })
})
