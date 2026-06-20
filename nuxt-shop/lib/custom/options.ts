import type {
  CustomAccessoryOption,
  CustomFlowerTypeOption,
  CustomPackagingOption,
  CustomPaletteOption,
  CustomSizeOption,
  CustomStyleOption,
} from './types'

export const CUSTOM_OCCASIONS = [
  'День рождения',
  'Романтика',
  'Свадьба',
  'Именной праздник',
  'Для дома',
  'Корпоратив',
] as const

export const CUSTOM_FLOWER_COUNT_OPTIONS = [12, 16, 18, 21, 24, 28, 32] as const

export const CUSTOM_SIZE_OPTIONS: CustomSizeOption[] = [
  { id: 's', label: 'S', price: 4800, stems: '12–15', height: 'до 30 см', weight: '0.9 кг', baseFlowers: 12, note: 'Нежная мини-композиция' },
  { id: 'm', label: 'M', price: 6900, stems: '16–20', height: 'до 40 см', weight: '1.2 кг', baseFlowers: 16, note: 'Универсальный размер на подарок' },
  { id: 'l', label: 'L', price: 9400, stems: '21–26', height: 'до 50 см', weight: '1.6 кг', baseFlowers: 21, note: 'Яркий акцент для главной роли' },
  { id: 'xl', label: 'XL', price: 12500, stems: '27+', height: 'до 60 см', weight: '2.2 кг', baseFlowers: 27, note: 'Торжественный премиум-букет' },
]

export const CUSTOM_FLOWER_TYPES: CustomFlowerTypeOption[] = [
  { id: 'roses', name: 'Розы', price: 0, note: 'Классика и нежность' },
  { id: 'peonies', name: 'Пионы', price: 450, note: 'Сезонная мягкость' },
  { id: 'mix', name: 'Микс', price: 250, note: 'Разнообразная палитра' },
  { id: 'hydrangea', name: 'Гортензия', price: 350, note: 'Яркий объемный акцент' },
]

export const CUSTOM_PALETTE_OPTIONS: CustomPaletteOption[] = [
  { id: 'rose', kind: 'rose', name: 'Розовый', color: '#f7b6c9' },
  { id: 'peach', kind: 'peach', name: 'Персиковый', color: '#f5ba82' },
  { id: 'cream', kind: 'cream', name: 'Кремовый', color: '#f3e5ce' },
  { id: 'green', kind: 'green', name: 'Ботанический', color: '#8ead84' },
  { id: 'lav', kind: 'lav', name: 'Лавандовый', color: '#c4b0df' },
  { id: 'red', kind: 'red', name: 'Бордовый', color: '#a23f4f' },
]

export const CUSTOM_STYLE_OPTIONS: CustomStyleOption[] = [
  { id: 'airy', name: 'Воздушный', price: 250 },
  { id: 'vintage', name: 'Винтажный', price: 350 },
  { id: 'minimal', name: 'Минималистичный', price: 0 },
  { id: 'lush', name: 'Пышный', price: 520 },
]

export const CUSTOM_PACKAGING_OPTIONS: CustomPackagingOption[] = [
  { id: 'craft', name: 'Крафт + лента', price: 0 },
  { id: 'premium', name: 'Премиум-упаковка', price: 550 },
  { id: 'clear', name: 'Прозрачный стеклянный акцент', price: 700 },
  { id: 'card-box', name: 'Подарочная корзинка', price: 900 },
]

export const CUSTOM_ACCESSORY_OPTIONS: CustomAccessoryOption[] = [
  { id: 'card', name: 'Открытка с текстом', price: 200 },
  { id: 'ribbon', name: 'Ленточка из атласа', price: 250 },
  { id: 'sweets', name: 'Мини-конфеты 150 ₽', price: 350 },
  { id: 'toy', name: 'Мягкая игрушка', price: 700 },
  { id: 'photo', name: 'Фото перед отправкой', price: 0, mandatory: true },
]

export const CUSTOM_DELIVERY_TIMES = [
  '12:00–14:00',
  '14:00–16:00',
  '16:00–18:00',
  '18:00–20:00',
  '20:00–22:00',
] as const
