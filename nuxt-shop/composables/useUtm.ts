export interface UtmData {
  source?:   string
  medium?:   string
  campaign?: string
  term?:     string
  content?:  string
}

export function useUtm() {
  const cookie = useCookie<UtmData | null>('shop_utm', {
    maxAge:   60 * 60 * 24 * 30, // 30 дней
    sameSite: 'lax',
    path:     '/',
  })

  // Захватывает UTM из query-параметров и сохраняет в cookie.
  // Не перезаписывает существующие, если новых нет.
  function capture(query: Record<string, string | string[] | null | undefined>) {
    const source   = asStr(query.utm_source)
    const medium   = asStr(query.utm_medium)
    const campaign = asStr(query.utm_campaign)
    const term     = asStr(query.utm_term)
    const content  = asStr(query.utm_content)
    if (source) {
      cookie.value = { source, medium, campaign, term, content }
    }
  }

  const utm = computed(() => cookie.value ?? null)

  return { utm, capture }
}

function asStr(v: string | string[] | null | undefined): string | undefined {
  const s = Array.isArray(v) ? v[0] : v
  return s?.trim() || undefined
}
