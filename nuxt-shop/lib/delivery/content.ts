import { parseSettingJSON } from '~/lib/settings/normalize'

export interface DeliveryOption {
  icon: string
  title: string
  price: string
  desc: string
}

export interface DeliveryZone {
  name: string
  price: string
  areas: string
}

export interface DeliveryTimingItem {
  title: string
  desc: string
}

export interface PaymentMethod {
  title: string
  desc: string
}

export interface FaqItem {
  q: string
  a: string
}

export interface DeliveryPageContent {
  deliveryOptions: DeliveryOption[]
  deliveryZones: DeliveryZone[]
  deliveryTiming: DeliveryTimingItem[]
  paymentMethods: PaymentMethod[]
  faqItems: FaqItem[]
}

export interface DeliveryFaqSchema {
  '@context': 'https://schema.org'
  '@type': 'FAQPage'
  mainEntity: Array<{
    '@type': 'Question'
    name: string
    acceptedAnswer: {
      '@type': 'Answer'
      text: string
    }
  }>
}

type DeliveryPageSettings = Partial<Record<keyof DeliveryPageContent, string | undefined>>

function parseArraySetting<T>(value: string | undefined): T[] {
  const parsed = parseSettingJSON<T[] | null>(value, [])
  return Array.isArray(parsed) ? parsed : []
}

export function normalizeDeliveryPageContent(settings: DeliveryPageSettings): DeliveryPageContent {
  return {
    deliveryOptions: parseArraySetting<DeliveryOption>(settings.deliveryOptions),
    deliveryZones: parseArraySetting<DeliveryZone>(settings.deliveryZones),
    deliveryTiming: parseArraySetting<DeliveryTimingItem>(settings.deliveryTiming),
    paymentMethods: parseArraySetting<PaymentMethod>(settings.paymentMethods),
    faqItems: parseArraySetting<FaqItem>(settings.faqItems),
  }
}

export function buildDeliveryFaqSchema(faqItems: FaqItem[]): DeliveryFaqSchema | null {
  if (!faqItems.length) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map(item => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  }
}
