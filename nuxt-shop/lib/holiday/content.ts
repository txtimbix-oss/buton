import { parseSettingJSON } from '~/lib/settings/normalize'

export interface HolidayCard {
  title: string
  text: string
  kind: string
  kindLabel: string
  link: string
}

export interface ComboPack {
  title: string
  text: string
}

export interface HolidayFaqItem {
  q: string
  a: string
}

export interface HolidayPageContent {
  holidayCards: HolidayCard[]
  comboPacks: ComboPack[]
  faqItems: HolidayFaqItem[]
}

export interface HolidayFaqSchema {
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

export const holidayCards: HolidayCard[] = [
  {
    title: 'День рождения',
    text: 'Яркие и улыбчивые композиции с акцентом на тёплые краски и лёгкий блеск подарочной подачи.',
    kind: 'rose',
    kindLabel: 'Праздничный тёплый букет',
    link: '/catalog?season=лет|лето',
  },
  {
    title: 'Юбилей',
    text: 'Элегантные букеты для торжественных встреч и памятных дат с длинным сроком свежести.',
    kind: 'green',
    kindLabel: 'Классика и свежесть',
    link: '/catalog?season=весна',
  },
  {
    title: 'Новый год',
    text: 'Сочетание красного и белого, плотная композиция и стильные детали для подарков в торжественный день.',
    kind: 'cream',
    kindLabel: 'Новая глава',
    link: '/catalog?season=зима',
  },
]

export const comboPacks: ComboPack[] = [
  {
    title: 'Букет + открытка',
    text: 'Сделайте подарок с личным посланием — оформите красивое сопровождение в сообщении.',
  },
  {
    title: 'Букет + конфеты',
    text: 'Идеально для «маленького дня»: сладкий акцент и свежие цветы без лишних усилий.',
  },
  {
    title: 'Букет + мягкая игрушка',
    text: 'Добавьте эмоциональный элемент и сделайте подарок более запоминающимся.',
  },
]

interface HolidayPageSettings {
  faqItems?: string
}

function parseHolidayFaqItems(value: string | undefined): HolidayFaqItem[] {
  const parsed = parseSettingJSON<HolidayFaqItem[] | null>(value, [])
  return Array.isArray(parsed) ? parsed.slice(0, 4) : []
}

export function normalizeHolidayPageContent(settings: HolidayPageSettings): HolidayPageContent {
  return {
    holidayCards,
    comboPacks,
    faqItems: parseHolidayFaqItems(settings.faqItems),
  }
}

export function buildHolidayFaqSchema(faqItems: HolidayFaqItem[]): HolidayFaqSchema | null {
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
