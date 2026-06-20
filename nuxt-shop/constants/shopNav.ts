export type ShopNavItem = {
  to: string
  label: string
}

type ShopNavConfig = {
  key: string
  to: string
  menuLabel: string
  desktopLabel?: string
  showInDesktop: boolean
}

const shopNavConfig = [
  { key: 'catalog', to: '/catalog', menuLabel: 'Каталог букетов', desktopLabel: 'Каталог', showInDesktop: true },
  { key: 'delivery', to: '/delivery', menuLabel: 'Доставка', showInDesktop: true },
  { key: 'gift-cards', to: '/gift-cards', menuLabel: 'Подарочные решения', desktopLabel: 'Подарки', showInDesktop: true },
  { key: 'care-tips', to: '/care-tips', menuLabel: 'Уход за цветами', showInDesktop: false },
  { key: 'subscription', to: '/subscription', menuLabel: 'Подписка', showInDesktop: true },
  { key: 'about', to: '/about', menuLabel: 'О нас', showInDesktop: false },
  { key: 'holiday', to: '/holiday', menuLabel: 'Праздники', showInDesktop: true },
  { key: 'custom', to: '/custom', menuLabel: 'Собрать свой букет', showInDesktop: false },
  { key: 'wedding', to: '/wedding', menuLabel: 'Свадебные букеты', desktopLabel: 'Свадьбы', showInDesktop: true },
] as const satisfies readonly ShopNavConfig[]

function toMainNavItem(item: ShopNavConfig): ShopNavItem {
  return {
    to: item.to,
    label: item.menuLabel,
  }
}

function toDesktopNavItem(item: ShopNavConfig): ShopNavItem {
  return {
    to: item.to,
    label: item.desktopLabel ?? item.menuLabel,
  }
}

function requireNavItem(key: string): ShopNavConfig {
  const item = shopNavConfig.find((entry) => entry.key === key)
  if (!item) {
    throw new Error(`Missing shop nav config for "${key}"`)
  }
  return item
}

export const mainNav: readonly ShopNavItem[] = shopNavConfig.map(toMainNavItem)

export const desktopNav: readonly ShopNavItem[] = shopNavConfig
  .filter((item) => item.showInDesktop)
  .map(toDesktopNavItem)

export const catalogNav: ShopNavItem = toDesktopNavItem(requireNavItem('catalog'))
