import type { AppSettings } from '~/lib/settings/types'

export function selectSeoSettings(settings: AppSettings) {
  return settings.seo
}

export function selectCatalogSettings(settings: AppSettings) {
  return settings.catalog
}

export function selectDeliverySettings(settings: AppSettings) {
  return settings.delivery
}

export function selectChatSettings(settings: AppSettings) {
  return settings.chat
}

export function selectUiSettings(settings: AppSettings) {
  return settings.ui
}

export function selectProductSettings(settings: AppSettings) {
  return settings.product
}

export function selectBonusSettings(settings: AppSettings) {
  return settings.bonus
}
