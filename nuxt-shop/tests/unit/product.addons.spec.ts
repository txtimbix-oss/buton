import { describe, expect, it } from 'vitest'

import {
  buildAddonGroups,
  buildBundleOptions,
  buildCatalogAddons,
  buildDefaultSelectedAddonIndexes,
} from '~/lib/product/addons'

describe('product addons helpers', () => {
  it('merges configured addons with fallback service options without duplicates', () => {
    const addons = buildCatalogAddons({
      allAddons: [
        { id: 'card', name: 'Открытка', price: 120, display: '+120 ₽' },
        { id: 'candy', name: 'Конфеты', price: 490, display: '+490 ₽' },
      ],
      catalogAddonIds: ['candy'],
    })

    expect(addons.map(addon => addon.name)).toEqual([
      'Конфеты',
      'Открытка',
      'Ленточка + бантик',
      'Премиум-упаковка',
    ])
  })

  it('builds addon groups and preselects the postcard addon by default', () => {
    const addons = buildCatalogAddons({
      allAddons: [
        { id: 'ribbon', name: 'Лента атласная', price: 250, display: '+250 ₽' },
        { id: 'toy', name: 'Мягкая игрушка', price: 1200, display: '+1 200 ₽' },
      ],
    })

    const groups = buildAddonGroups(addons)

    expect(groups.map(group => group.title)).toEqual([
      'Открытка',
      'Ленточка',
      'Упаковка',
      'Дополнительные аксессуары',
    ])
    expect(groups[0]?.items[0]?.addon.name).toBe('Открытка')
    expect(groups[3]?.items.map(item => item.addon.name)).toEqual(['Мягкая игрушка'])
    expect(buildDefaultSelectedAddonIndexes(addons)).toEqual([1])
  })

  it('creates bundle options from matching addon labels and sums stable bundle prices', () => {
    const addons = buildCatalogAddons({
      allAddons: [
        { id: 'toy', name: 'Мягкая игрушка', price: 1200, display: '+1 200 ₽' },
        { id: 'candy', name: 'Конфеты ручной работы', price: 650, display: '+650 ₽' },
      ],
    })

    const bundles = buildBundleOptions(
      [
        { id: 'bundle-card', title: 'Букет + открытка', description: 'Открытка с пожеланием', includes: ['Открытка'] },
        { id: 'bundle-sweet', title: 'Букет + сладости', description: 'Конфеты к букету', includes: ['Конфеты'] },
        { id: 'bundle-miss', title: 'Пропустить', description: 'Нет совпадения', includes: ['Воздушный шар'] },
      ],
      addons,
    )

    expect(bundles).toEqual([
      {
        id: 'bundle-card',
        title: 'Букет + открытка',
        description: 'Открытка с пожеланием',
        addonIndexes: [2],
        priceLabel: '+100 ₽',
      },
      {
        id: 'bundle-sweet',
        title: 'Букет + сладости',
        description: 'Конфеты к букету',
        addonIndexes: [1],
        priceLabel: '+650 ₽',
      },
    ])
  })

  it('keeps extras out of packaging heuristics and formats bundle prices with plain spaces', () => {
    const addons = buildCatalogAddons({
      allAddons: [
        { id: 'gift-card', name: 'Подарочный сертификат', price: 1200, display: '+1 200 ₽' },
        { id: 'toy', name: 'Мягкая игрушка', price: 1500, display: '+1 500 ₽' },
      ],
    })

    const groups = buildAddonGroups(addons)
    const bundles = buildBundleOptions(
      [
        { id: 'bundle-gift', title: 'Подарок', description: 'Сертификат и игрушка', includes: ['Подарочный сертификат', 'Мягкая игрушка'] },
      ],
      addons,
    )

    expect(groups[3]?.items.map(item => item.addon.name)).toContain('Подарочный сертификат')
    expect(bundles[0]?.priceLabel).toBe('+2 700 ₽')
  })
})
