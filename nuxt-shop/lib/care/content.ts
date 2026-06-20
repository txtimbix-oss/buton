import { parseSettingJSON } from '~/lib/settings/normalize'

export interface CareTipStep {
  day: string
  title: string
  text: string
}

export interface CareFlowerType {
  name: string
  use: string
  care: string
}

export interface CareFaqItem {
  q: string
  a: string
}

export const CARE_TIPS_DEFAULT_STEPS: CareTipStep[] = [
  { day: '1', title: 'Сразу после получения', text: 'Снимите старую упаковку, добавьте в чистую вазу прохладную воду с таблеткой-освежителем и отрежьте стебли под углом.' },
  { day: '2–3', title: 'Первый корректный уход', text: 'Поменяйте воду, повторно укоротите стебли. Уберите завязи, которые начинают вянуть, и обновите декоративные элементы.' },
  { day: '4–5', title: 'Поддержание свежести', text: 'Сохраняйте в прохладном месте без сквозняков, без прямого солнца и рядом с фруктами или едой.' },
  { day: '6–7', title: 'Наблюдение', text: 'Убирайте полностью иссохшие стебли вовремя и при появлении слабого запаха меняйте воду чаще.' },
]

export const CARE_TIPS_DEFAULT_FLOWER_TYPES: CareFlowerType[] = [
  { name: 'Розы', use: 'универсальный акцент', care: 'Поддерживайте прохладную температуру и регулярную замену воды.' },
  { name: 'Пионы', use: 'романтичные и тёплые букеты', care: 'Без перегрева и резкого света — до 7 дней без потери формы.' },
  { name: 'Ландыш', use: 'лёгкая сезонная текстура', care: 'Сохраняйте влажность и избегайте резких перепадов температуры.' },
  { name: 'Гортензия', use: 'праздничные и деловые композиции', care: 'В прохладном месте в красивой подставке без солнца.' },
]

export const CARE_TIPS_DEFAULT_FAQ: CareFaqItem[] = [
  { q: 'Как долго стоят букеты?', a: 'Мы отправляем свежие цветы и даём гарантию свежести 7 дней. Срок может зависеть от ухода у вас дома.' },
  { q: 'Когда лучше поменять воду?', a: 'Идеально — каждый день. В первые 2–3 дня заменяем воду чаще, затем при необходимости.' },
  { q: 'Какая температура для хранения подойдет?', a: 'Лучше прохладное место без прямого солнца и сквозняков. Не ставьте цветы рядом с фруктами.' },
]

function parseArraySetting<T>(rawValue: string | undefined, fallback: T[]) {
  const parsed = parseSettingJSON<T[] | null>(rawValue, fallback)
  return Array.isArray(parsed) ? parsed : fallback
}

export function parseCareSteps(rawValue: string | undefined) {
  return parseArraySetting<CareTipStep>(rawValue, CARE_TIPS_DEFAULT_STEPS)
}

export function parseCareFlowerTypes(rawValue: string | undefined) {
  return parseArraySetting<CareFlowerType>(rawValue, CARE_TIPS_DEFAULT_FLOWER_TYPES)
}

export function parseCareFaqItems(rawValue: string | undefined) {
  const faqItems = parseArraySetting<CareFaqItem>(rawValue, [])
  const filteredFaqItems = faqItems.filter((item) => item.q.toLowerCase().includes('цвет'))

  return filteredFaqItems.length ? filteredFaqItems : CARE_TIPS_DEFAULT_FAQ
}

export function buildCareFaqSchema(faqItems: CareFaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  }
}
