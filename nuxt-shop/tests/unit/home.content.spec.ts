import { describe, expect, it } from 'vitest'

import {
  buildHomeHeroActions,
  buildHomeHeroStats,
  getHomeInstagramBlooms,
  getHomeSubscriptionBenefits,
  getStaticHomeReviews,
} from '~/lib/home/content'

describe('home content helpers', () => {
  it('builds hero stats from storefront settings fields in stable order', () => {
    expect(buildHomeHeroStats({
      stat1Value: '2 часа',
      stat1Label: 'Доставка',
      stat2Value: '7 дней',
      stat2Label: 'Гарантия свежести',
      stat3Value: '4.9',
      stat3Label: 'Рейтинг',
    })).toEqual([
      { value: '2 часа', label: 'Доставка' },
      { value: '7 дней', label: 'Гарантия свежести' },
      { value: '4.9', label: 'Рейтинг' },
    ])
  })

  it('builds hero actions with storefront labels and stable destinations', () => {
    expect(buildHomeHeroActions({
      heroBtn1: 'Все букеты',
      heroBtn2: 'Подписаться',
    })).toEqual([
      { label: 'Все букеты', to: '/catalog', tone: 'ink', showArrow: true },
      { label: 'Подписаться', to: '/subscription', tone: 'ghost' },
      { label: 'Собрать свой букет', to: '/custom', tone: 'clay' },
    ])
  })

  it('falls back to default labels when storefront settings are empty', () => {
    expect(buildHomeHeroActions({})).toEqual([
      { label: 'В каталог', to: '/catalog', tone: 'ink', showArrow: true },
      { label: 'Подписка', to: '/subscription', tone: 'ghost' },
      { label: 'Собрать свой букет', to: '/custom', tone: 'clay' },
    ])
  })

  it('returns the static review fallback cards in marquee order', () => {
    expect(getStaticHomeReviews()).toEqual([
      { key: 's1', name: 'Анна', text: 'Заказывала «Белые ночи» маме — букет приехал точно ко времени, свежий и пышный. Простоял почти две недели!' },
      { key: 's2', name: 'Дмитрий', text: 'Согласовали состав в телеграме за пять минут. Приятно, когда видишь букет до доставки.' },
      { key: 's3', name: 'Марина', text: 'Лучшая флористика в Питере. Беру по подписке каждые две недели — дом совсем другой.' },
      { key: 's4', name: 'Игорь', text: 'Срочно нужен был букет на свидание — собрали за полтора часа. Спасибо, выручили!' },
      { key: 's5', name: 'Елена', text: 'Тонкий вкус и честные цены. Упаковка — отдельное произведение искусства.' },
      { key: 's6', name: 'Сергей', text: 'Заказывал доставку партнёрам к НГ. Всё чётко, с документами. Рекомендую для бизнеса.' },
    ])
  })

  it('returns the instagram bloom sequence used by the home grid', () => {
    expect(getHomeInstagramBlooms()).toEqual(['rose', 'peach', 'green', 'lav', 'cream', 'mix'])
  })

  it('returns the subscription benefits in display order', () => {
    expect(getHomeSubscriptionBenefits()).toEqual([
      '1, 2 или 4 букета в месяц',
      'Фото букета перед отправкой',
      'Сборка вручную флористом',
      'Доставка в день заказа или по удобному окну',
      'Пауза и отмена без штрафов',
    ])
  })
})
