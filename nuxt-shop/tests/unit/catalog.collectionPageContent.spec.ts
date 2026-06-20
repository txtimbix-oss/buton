import { describe, expect, it } from 'vitest'

import {
  buildCollectionCopy,
  buildCollectionIntro,
  buildCollectionReasons,
  getBouquetWord,
} from '~/lib/catalog/collectionPageContent'

describe('collection page content helpers', () => {
  it('prefers description for intro and falls back to the default intro copy', () => {
    expect(buildCollectionIntro({ description: 'Кураторская подборка пионов.' })).toBe('Кураторская подборка пионов.')
    expect(buildCollectionIntro({})).toBe('В этой подборке собраны авторские букеты из свежих сезонных цветов, собранные с акцентом на аккуратную упаковку и спокойную подачу.')
  })

  it('builds body copy with and without tag context', () => {
    expect(buildCollectionCopy({
      productCount: 5,
      bouquetWord: 'букетов',
      storeCity: 'Москве',
      tag: 'Праздник',
    })).toContain('по тегу «Праздник»')

    expect(buildCollectionCopy({
      productCount: 2,
      bouquetWord: 'букета',
      storeCity: 'Москве',
    })).toBe('Подборка содержит 2 букета, которые удобно дарить в разных ситуациях. Букеты формируются для быстрого согласования и готовы для заказа сразу после выбора.')
  })

  it('builds reasons with occasion heuristics for wedding, holiday, mini, and default cases', () => {
    expect(buildCollectionReasons({ collectionName: 'Свадебные букеты', productCount: 7 })[0].text).toContain('на свадьбу и помолвку')
    expect(buildCollectionReasons({ collectionName: 'Праздничная коллекция', productCount: 7 })[0].text).toContain('на праздники')
    expect(buildCollectionReasons({ collectionName: 'Мини букеты', productCount: 7 })[0].text).toContain('на небольшой компактный подарок')
    expect(buildCollectionReasons({ collectionName: 'Нежная подборка', productCount: 7 })[0].text).toContain('на разные поводы')
  })

  it('pluralizes bouquet word for edge counts', () => {
    expect(getBouquetWord(1)).toBe('букет')
    expect(getBouquetWord(2)).toBe('букета')
    expect(getBouquetWord(5)).toBe('букетов')
    expect(getBouquetWord(11)).toBe('букетов')
    expect(getBouquetWord(22)).toBe('букета')
  })
})
