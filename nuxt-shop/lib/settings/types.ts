export interface FilterOption {
  name: string
  keyword: string
}

export interface CatalogFilter {
  label: string
  type: string
  value: string
  value2?: string
}

export interface CatalogAddonSetting {
  id: string
  name: string
  price: number
  display: string
}

export interface GiftBundleSetting {
  id: string
  title: string
  description: string
  includes: string[]
}

export interface PageTransitionSettings {
  effect: string
  dir: string
  durationMs: number
  easing: string
  mode: string
  advanced: boolean
  activeCss: string
  leaveCss: string
  enterCss: string
}

export interface CookieBannerSettings {
  enabled: boolean
  text: string
  buttonText: string
}

export interface SeoSettings {
  siteUrl: string
  metaDescHome: string
  metaDescCatalog: string
  metaDescDelivery: string
  metaDescAbout: string
  metaDescSub: string
}

export interface SearchSettings {
  placeholder: string
  hints: string[]
}

export interface CatalogSettings {
  sizes: string[]
  filters: CatalogFilter[]
  quickFilters: CatalogFilter[]
  composition: FilterOption[]
  occasions: FilterOption[]
  seasons: FilterOption[]
}

export interface DeliverySettings {
  freeThreshold: number
  cost: number
  courierDesc: string
  scheduledDesc: string
  timeSlots: string[]
}

export interface ChatSettings {
  enabled: boolean
  url: string
  text: string
  proactive: {
    enabled: boolean
    delaySeconds: number
    message: string
  }
  autoReply: {
    enabled: boolean
    delaySeconds: number
    text: string
  }
}

export interface UiSettings {
  pageTransition: PageTransitionSettings
  cookie: CookieBannerSettings
}

export interface ProductSettings {
  deliveryText: string
  catalogAddons: CatalogAddonSetting[]
  giftAddons: GiftBundleSetting[]
}

export interface BonusSettings {
  spendEnabled: boolean
  maxSpendPercent: number
  minSpend: number
  spendMinOrder: number
  withPromo: boolean
  blockedCategories: string[]
  blockedProducts: string[]
}

export interface SettingsDomains {
  seo: SeoSettings
  search: SearchSettings
  catalog: CatalogSettings
  delivery: DeliverySettings
  chat: ChatSettings
  ui: UiSettings
  product: ProductSettings
  bonus: BonusSettings
}

export type AppSettings = Record<string, string> & SettingsDomains
