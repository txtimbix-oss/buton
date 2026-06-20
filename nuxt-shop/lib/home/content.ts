import type { HomeReviewCard } from '~/lib/home/discovery'

export interface HomeHeroAction {
  label: string
  to: string
  tone: 'ink' | 'ghost' | 'clay'
  showArrow?: boolean
}

export interface HomeHeroStat {
  value: string
  label: string
}

export interface HomeContentSettings {
  stat1Value?: string
  stat1Label?: string
  stat2Value?: string
  stat2Label?: string
  stat3Value?: string
  stat3Label?: string
  heroBtn1?: string
  heroBtn2?: string
}

export function buildHomeHeroStats(settings: HomeContentSettings): HomeHeroStat[] {
  return [
    { value: settings.stat1Value ?? '', label: settings.stat1Label ?? '' },
    { value: settings.stat2Value ?? '', label: settings.stat2Label ?? '' },
    { value: settings.stat3Value ?? '', label: settings.stat3Label ?? '' },
  ]
}

export function buildHomeHeroActions(settings: HomeContentSettings): HomeHeroAction[] {
  return [
    { label: settings.heroBtn1 || 'В каталог', to: '/catalog', tone: 'ink', showArrow: true },
    { label: settings.heroBtn2 || 'Подписка', to: '/subscription', tone: 'ghost' },
    { label: 'Собрать свой букет', to: '/custom', tone: 'clay' },
  ]
}

export function getStaticHomeReviews(): HomeReviewCard[] {
  return [
    { key: 's1', name: 'Анна', text: 'Заказывала «Белые ночи» маме — букет приехал точно ко времени, свежий и пышный. Простоял почти две недели!' },
    { key: 's2', name: 'Дмитрий', text: 'Согласовали состав в телеграме за пять минут. Приятно, когда видишь букет до доставки.' },
    { key: 's3', name: 'Марина', text: 'Лучшая флористика в Питере. Беру по подписке каждые две недели — дом совсем другой.' },
    { key: 's4', name: 'Игорь', text: 'Срочно нужен был букет на свидание — собрали за полтора часа. Спасибо, выручили!' },
    { key: 's5', name: 'Елена', text: 'Тонкий вкус и честные цены. Упаковка — отдельное произведение искусства.' },
    { key: 's6', name: 'Сергей', text: 'Заказывал доставку партнёрам к НГ. Всё чётко, с документами. Рекомендую для бизнеса.' },
  ]
}

export function getHomeInstagramBlooms(): string[] {
  return ['rose', 'peach', 'green', 'lav', 'cream', 'mix']
}

export function getHomeSubscriptionBenefits(): string[] {
  return [
    '1, 2 или 4 букета в месяц',
    'Фото букета перед отправкой',
    'Сборка вручную флористом',
    'Доставка в день заказа или по удобному окну',
    'Пауза и отмена без штрафов',
  ]
}
