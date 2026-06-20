import type {
  AppSettings,
  BonusSettings,
  CatalogAddonSetting,
  CatalogFilter,
  ChatSettings,
  CookieBannerSettings,
  DeliverySettings,
  FilterOption,
  GiftBundleSetting,
  PageTransitionSettings,
  ProductSettings,
  SearchSettings,
  SeoSettings,
  SettingsDomains,
  UiSettings,
} from '~/lib/settings/types'

export function parseSettingJSON<T>(value: string | undefined, fallback: T): T {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

export function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value == null || value === '') return fallback
  return value === 'true'
}

export function parseNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export function parseCsv(value: string | undefined): string[] {
  return String(value || '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
}

export function parseMultiline(value: string | undefined): string[] {
  return String(value || '')
    .split('\n')
    .map(item => item.trim())
    .filter(Boolean)
}

function normalizeSiteUrl(value: string | undefined): string {
  return String(value || '').replace(/\/$/, '')
}

function normalizeSeo(raw: Record<string, string>, siteUrl: string): SeoSettings {
  return {
    siteUrl,
    metaDescHome: raw.metaDescHome || '',
    metaDescCatalog: raw.metaDescCatalog || '',
    metaDescDelivery: raw.metaDescDelivery || '',
    metaDescAbout: raw.metaDescAbout || '',
    metaDescSub: raw.metaDescSub || '',
  }
}

function normalizeSearch(raw: Record<string, string>): SearchSettings {
  return {
    placeholder: raw.searchPlaceholder || '',
    hints: parseCsv(raw.searchHints),
  }
}

function normalizeCatalog(raw: Record<string, string>) {
  const fallbackComposition: FilterOption[] = []
  const fallbackOccasions: FilterOption[] = []
  const fallbackSeasons: FilterOption[] = []
  const fallbackFilters: CatalogFilter[] = []
  const fallbackSizes = ['S', 'M', 'L']

  return {
    sizes: parseSettingJSON<string[]>(raw.catalogSizes, fallbackSizes),
    filters: parseSettingJSON<CatalogFilter[]>(raw.catalogFilters, fallbackFilters),
    quickFilters: parseSettingJSON<CatalogFilter[]>(raw.catalogFilters, fallbackFilters),
    composition: parseSettingJSON<FilterOption[]>(raw.catalogComposition, fallbackComposition),
    occasions: parseSettingJSON<FilterOption[]>(raw.catalogOccasions, fallbackOccasions),
    seasons: parseSettingJSON<FilterOption[]>(raw.seasonalCollections, fallbackSeasons),
  }
}

function normalizeDelivery(raw: Record<string, string>): DeliverySettings {
  return {
    freeThreshold: parseNumber(raw.deliveryFreeThreshold, 5000),
    cost: parseNumber(raw.deliveryCost, 390),
    courierDesc: raw.deliveryCourierDesc || '',
    scheduledDesc: raw.deliveryScheduledDesc || '',
    timeSlots: parseMultiline(raw.deliveryTimeSlots),
  }
}

function normalizeChat(raw: Record<string, string>): ChatSettings {
  return {
    enabled: parseBoolean(raw.chatEnabled, true),
    url: raw.chatUrl || '',
    text: raw.chatText || '',
    proactive: {
      enabled: parseBoolean(raw.chatProactiveEnabled, false),
      delaySeconds: parseNumber(raw.chatProactiveDelay, 30),
      message: raw.chatProactiveMessage || '',
    },
    autoReply: {
      enabled: parseBoolean(raw.chatAutoReplyEnabled, false),
      delaySeconds: parseNumber(raw.chatAutoReplyDelay, 10),
      text: raw.chatAutoReplyText || '',
    },
  }
}

function normalizePageTransition(raw: Record<string, string>): PageTransitionSettings {
  return {
    effect: raw.pageTransitionEffect || raw.pageTransition || 'rise',
    dir: raw.pageTransitionDir || 'left',
    durationMs: parseNumber(raw.pageTransitionDuration, 220),
    easing: raw.pageTransitionEasing || 'ease',
    mode: raw.pageTransitionMode || 'default',
    advanced: parseBoolean(raw.pageTransitionAdvanced, false),
    activeCss: raw.pageTransitionActiveCss || '',
    leaveCss: raw.pageTransitionLeaveCss || '',
    enterCss: raw.pageTransitionEnterCss || '',
  }
}

function normalizeCookie(raw: Record<string, string>): CookieBannerSettings {
  return {
    enabled: parseBoolean(raw.cookieEnabled, true),
    text: raw.cookieText || '',
    buttonText: raw.cookieBtnText || '',
  }
}

function normalizeUi(raw: Record<string, string>): UiSettings {
  return {
    pageTransition: normalizePageTransition(raw),
    cookie: normalizeCookie(raw),
  }
}

function normalizeProduct(raw: Record<string, string>): ProductSettings {
  return {
    deliveryText: raw.productDeliveryText || '',
    catalogAddons: parseSettingJSON<CatalogAddonSetting[]>(raw.catalogAddons, []),
    giftAddons: parseSettingJSON<GiftBundleSetting[]>(raw.giftAddons, []),
  }
}

function normalizeBonus(raw: Record<string, string>): BonusSettings {
  return {
    spendEnabled: parseBoolean(raw.bonusSpendEnabled, true),
    maxSpendPercent: parseNumber(raw.bonusMaxSpendPercent, 100),
    minSpend: parseNumber(raw.bonusMinSpend, 1),
    spendMinOrder: parseNumber(raw.bonusSpendMinOrder, 0),
    withPromo: parseBoolean(raw.bonusWithPromo, true),
    blockedCategories: parseSettingJSON<string[]>(raw.bonusBlockedCategories, []),
    blockedProducts: parseSettingJSON<string[]>(raw.bonusBlockedProducts, []),
  }
}

export function normalizeSettings(
  raw: Record<string, string>,
  runtimeConfig: { public?: { siteUrl?: string } },
): AppSettings {
  const siteUrl = normalizeSiteUrl(runtimeConfig.public?.siteUrl || raw.siteUrl || '')
  const flat: Record<string, string> = {
    ...raw,
    siteUrl,
  }

  const domains: SettingsDomains = {
    seo: normalizeSeo(flat, siteUrl),
    search: normalizeSearch(flat),
    catalog: normalizeCatalog(flat),
    delivery: normalizeDelivery(flat),
    chat: normalizeChat(flat),
    ui: normalizeUi(flat),
    product: normalizeProduct(flat),
    bonus: normalizeBonus(flat),
  }

  return {
    ...flat,
    ...domains,
  } as AppSettings
}
