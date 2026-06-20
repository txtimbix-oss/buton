export type CabinetNavBadgeContext = {
  bonusBalance?: number | null
  wishlistCount?: number | null
  activeOrdersCount?: number | null
}

type CabinetNavBadgeResolver = (context: CabinetNavBadgeContext) => string | number | null

type CabinetNavIconPath = {
  d: string
}

type CabinetNavIconShape =
  | {
      type: 'path'
      attrs?: Record<string, string>
      paths: CabinetNavIconPath[]
    }
  | {
      type: 'circle'
      attrs: Record<string, string>
      paths: CabinetNavIconPath[]
    }

export type CabinetNavIcon = {
  viewBox: string
  fill: string
  stroke: string
  strokeWidth: string
  strokeLinecap?: string
  strokeLinejoin?: string
  shapes: CabinetNavIconShape[]
}

type CabinetNavItem = {
  key: string
  to: string
  desktopLabel: string
  mobileLabel: string
  icon: CabinetNavIcon
  sidebarBadge?: CabinetNavBadgeResolver
  bottomBadge?: CabinetNavBadgeResolver
}

export type CabinetResolvedNavItem = CabinetNavItem & {
  sidebarBadgeValue: string | number | null
  bottomBadgeValue: string | number | null
}

const CABINET_BOTTOM_NAV_KEYS = new Set(['dashboard', 'orders', 'bonus', 'wishlist', 'profile'])

const bonusBadge = ({ bonusBalance }: CabinetNavBadgeContext) =>
  bonusBalance ? `${bonusBalance} ₽` : null

const wishlistBadge = ({ wishlistCount }: CabinetNavBadgeContext) =>
  wishlistCount ? wishlistCount : null

const activeOrdersBadge = ({ activeOrdersCount }: CabinetNavBadgeContext) =>
  activeOrdersCount ? activeOrdersCount : null

export const cabinetNavigationConfig: CabinetNavItem[] = [
  {
    key: 'dashboard',
    to: '/dashboard',
    desktopLabel: 'Обзор',
    mobileLabel: 'Главная',
    icon: {
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: '1.7',
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      shapes: [
        {
          type: 'path',
          paths: [
            { d: 'M4 11l8-7 8 7' },
            { d: 'M6 10v9h12v-9' },
          ],
        },
      ],
    },
  },
  {
    key: 'orders',
    to: '/orders',
    desktopLabel: 'Мои заказы',
    mobileLabel: 'Заказы',
    icon: {
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: '1.7',
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      shapes: [
        {
          type: 'path',
          paths: [
            { d: 'M3 7l9-4 9 4v10l-9 4-9-4V7z' },
            { d: 'M3 7l9 4 9-4M12 11v10' },
          ],
        },
      ],
    },
    bottomBadge: activeOrdersBadge,
  },
  {
    key: 'bonus',
    to: '/bonus',
    desktopLabel: 'Бонусы',
    mobileLabel: 'Бонусы',
    icon: {
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: '1.7',
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      shapes: [
        {
          type: 'path',
          paths: [
            { d: 'M20 12v9H4v-9M2 7h20v5H2zM12 21V7M12 7S11 3 8.5 3 6 6 12 7M12 7s1-4 3.5-4S18 6 12 7' },
          ],
        },
      ],
    },
    sidebarBadge: bonusBadge,
  },
  {
    key: 'wishlist',
    to: '/wishlist',
    desktopLabel: 'Избранное',
    mobileLabel: 'Избранное',
    icon: {
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: '1.7',
      strokeLinejoin: 'round',
      shapes: [
        {
          type: 'path',
          paths: [
            { d: 'M12 20.3l-1.45-1.32C5.4 14.24 2 11.16 2 7.5 2 4.42 4.42 2 7.5 2c1.74 0 3.41.81 4.5 2.09C13.09 2.81 14.76 2 16.5 2 19.58 2 22 4.42 22 7.5c0 3.66-3.4 6.74-8.55 11.49L12 20.3z' },
          ],
        },
      ],
    },
    sidebarBadge: wishlistBadge,
    bottomBadge: wishlistBadge,
  },
  {
    key: 'profile',
    to: '/profile',
    desktopLabel: 'Профиль',
    mobileLabel: 'Профиль',
    icon: {
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: '1.7',
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      shapes: [
        {
          type: 'circle',
          attrs: { cx: '12', cy: '8', r: '4' },
          paths: [{ d: 'M4 20c0-3.5 3.6-6 8-6s8 2.5 8 6' }],
        },
      ],
    },
  },
  {
    key: 'addresses',
    to: '/addresses',
    desktopLabel: 'Адреса',
    mobileLabel: 'Адреса',
    icon: {
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: '1.7',
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      shapes: [
        {
          type: 'circle',
          attrs: { cx: '12', cy: '10', r: '2.5' },
          paths: [{ d: 'M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z' }],
        },
      ],
    },
  },
  {
    key: 'reviews',
    to: '/reviews',
    desktopLabel: 'Мои отзывы',
    mobileLabel: 'Мои отзывы',
    icon: {
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: '1.7',
      strokeLinejoin: 'round',
      shapes: [
        {
          type: 'path',
          paths: [{ d: 'M12 3l2.6 5.6 6.1.8-4.5 4.2 1.2 6L12 17.8 6.6 19.6l1.2-6L3.3 9.4l6.1-.8L12 3z' }],
        },
      ],
    },
  },
  {
    key: 'security',
    to: '/security',
    desktopLabel: 'Безопасность',
    mobileLabel: 'Безопасность',
    icon: {
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: '1.7',
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      shapes: [
        {
          type: 'path',
          paths: [
            { d: 'M4 10h16v11H4z' },
            { d: 'M8 10V7a4 4 0 0 1 8 0v3' },
          ],
        },
      ],
    },
  },
]

function resolveBadgeValues(item: CabinetNavItem, context: CabinetNavBadgeContext) {
  return {
    sidebarBadgeValue: item.sidebarBadge ? item.sidebarBadge(context) : null,
    bottomBadgeValue: item.bottomBadge ? item.bottomBadge(context) : null,
  }
}

export function resolveCabinetNavigation(context: CabinetNavBadgeContext = {}): CabinetResolvedNavItem[] {
  return cabinetNavigationConfig.map((item) => ({
    ...item,
    ...resolveBadgeValues(item, context),
  }))
}

export function resolveCabinetSidebarNavigation(context: CabinetNavBadgeContext = {}) {
  return resolveCabinetNavigation(context)
}

export function resolveCabinetBottomNavigation(context: CabinetNavBadgeContext = {}) {
  return resolveCabinetNavigation(context).filter((item) => CABINET_BOTTOM_NAV_KEYS.has(item.key))
}
