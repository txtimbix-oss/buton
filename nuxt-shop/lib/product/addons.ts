import type {
  AddonGroup,
  AddonGroupItem,
  BuildCatalogAddonsOptions,
  BundleOption,
  CatalogAddon,
  GiftBundleSetting,
} from '~/lib/product/types'

type AddonSlot = 'card' | 'ribbon' | 'packaging' | 'extras'

const CARD_ADDON: CatalogAddon = { id: '__gift', name: 'Открытка', price: 100, display: '+100 ₽' }
const RIBBON_ADDON: CatalogAddon = { id: '__ribbon', name: 'Ленточка + бантик', price: 250, display: '+250 ₽' }
const PACKAGING_ADDON: CatalogAddon = { id: '__packaging', name: 'Премиум-упаковка', price: 350, display: '+350 ₽' }

export const DEFAULT_GIFT_BUNDLES: GiftBundleSetting[] = [
  { id: 'bundle-card', title: 'Букет + открытка', description: 'Сюрприз с теплым и понятным сообщением', includes: ['Открытка'] },
  { id: 'bundle-candies', title: 'Букет + конфеты', description: 'Нежный вкус к яркой подаче', includes: ['Конфеты'] },
  { id: 'bundle-toy', title: 'Букет + мягкая игрушка', description: 'Яркий подарок для важных моментов', includes: ['Мягкая игрушка'] },
]

export function normalizeAddonText(value: string): string {
  return value.toLowerCase().trim()
}

function formatAddonPrice(value: number): string {
  return `+${Math.round(value).toLocaleString('ru-RU').replace(/\u00A0/g, ' ')} ₽`
}

function resolveAddonSlot(addon: CatalogAddon): AddonSlot {
  const name = normalizeAddonText(addon.name)

  if (name.includes('открыт')) return 'card'
  if (name.includes('лент')) return 'ribbon'
  if (name.includes('упак') || name.includes('короб')) return 'packaging'
  return 'extras'
}

function ensureUniqueAddons(addons: CatalogAddon[]): CatalogAddon[] {
  const seen = new Set<string>()

  return addons.filter((addon) => {
    const key = `${addon.id}:${normalizeAddonText(addon.name)}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export function buildCatalogAddons({ allAddons, catalogAddonIds }: BuildCatalogAddonsOptions): CatalogAddon[] {
  const picked = catalogAddonIds?.length
    ? allAddons.filter(addon => catalogAddonIds.includes(addon.id))
    : allAddons

  const serviceAddons: Partial<Record<Exclude<AddonSlot, 'extras'>, CatalogAddon>> = {}
  const extras: CatalogAddon[] = []

  for (const addon of picked) {
    const slot = resolveAddonSlot(addon)
    if (slot === 'extras') {
      extras.push(addon)
      continue
    }

    if (!serviceAddons[slot]) {
      serviceAddons[slot] = addon
    }
  }

  const ordered = [
    ...extras,
    serviceAddons.card ?? CARD_ADDON,
    serviceAddons.ribbon ?? RIBBON_ADDON,
    serviceAddons.packaging ?? PACKAGING_ADDON,
  ]

  return ensureUniqueAddons(ordered)
}

function createGroup(title: string, items: AddonGroupItem[]): AddonGroup {
  return { title, items }
}

export function buildAddonGroups(addons: CatalogAddon[]): AddonGroup[] {
  const card: AddonGroupItem[] = []
  const ribbon: AddonGroupItem[] = []
  const packaging: AddonGroupItem[] = []
  const extras: AddonGroupItem[] = []

  addons.forEach((addon, index) => {
    const entry = { addon, index }
    const slot = resolveAddonSlot(addon)

    if (slot === 'card') card.push(entry)
    else if (slot === 'ribbon') ribbon.push(entry)
    else if (slot === 'packaging') packaging.push(entry)
    else extras.push(entry)
  })

  return [
    createGroup('Открытка', card),
    createGroup('Ленточка', ribbon),
    createGroup('Упаковка', packaging),
    createGroup('Дополнительные аксессуары', extras),
  ].filter(group => group.items.length > 0)
}

export function buildDefaultSelectedAddonIndexes(addons: CatalogAddon[]): number[] {
  const postcardIndex = addons.findIndex(addon => resolveAddonSlot(addon) === 'card')
  return postcardIndex >= 0 ? [postcardIndex] : []
}

export function resolveAddonNames(addons: CatalogAddon[], indexes: number[]): string[] {
  const names = indexes
    .map(index => addons[index]?.name)
    .filter((name): name is string => Boolean(name))

  return Array.from(new Set(names))
}

export function mergeAddonIndexes(...groups: number[][]): number[] {
  return Array.from(new Set(groups.flat().filter(index => index >= 0)))
}

export function sumAddonPrices(addons: CatalogAddon[], indexes: number[]): number {
  return indexes.reduce((sum, index) => sum + (addons[index]?.price ?? 0), 0)
}

export function buildBundleOptions(
  bundles: GiftBundleSetting[],
  addons: CatalogAddon[],
): BundleOption[] {
  return bundles
    .map((bundle) => {
      const addonIndexes = bundle.includes.flatMap((label) => {
        const target = normalizeAddonText(label)
        const index = addons.findIndex(addon => normalizeAddonText(addon.name).includes(target))
        return index >= 0 ? [index] : []
      })

      const uniqueIndexes = Array.from(new Set(addonIndexes))
      if (!uniqueIndexes.length) return null

      return {
        id: bundle.id,
        title: bundle.title,
        description: bundle.description,
        addonIndexes: uniqueIndexes,
        priceLabel: formatAddonPrice(sumAddonPrices(addons, uniqueIndexes)),
      }
    })
    .filter((bundle): bundle is BundleOption => Boolean(bundle))
}
