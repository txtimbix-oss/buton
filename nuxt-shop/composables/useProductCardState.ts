import { computed, ref, toValue, type MaybeRefOrGetter } from 'vue'

import type { Product } from '~/composables/useShop'
import { createCartLine } from '~/lib/cart/createCartLine'
import { buildProductPresentation } from '~/lib/product/presentation'

type CardSettingsLike = Record<string, unknown> | null | undefined

export interface UseProductCardStateDeps {
  addLine: (line: ReturnType<typeof createCartLine>) => void
  showToast: (message: string) => void
  settings: MaybeRefOrGetter<CardSettingsLike>
  setTimeoutFn?: (callback: () => void, ms: number) => unknown
}

const SERVICE_BADGE_FALLBACK = [
  'Фото перед отправкой',
  'Доставка в день заказа',
  'Сборка за 2 часа',
  'Гарантия 7 дней',
  'Реальные отзывы',
]

export function useProductCardState(
  product: MaybeRefOrGetter<Product>,
  deps: UseProductCardStateDeps,
) {
  const p = () => toValue(product)
  const settings = () => (toValue(deps.settings) ?? {}) as Record<string, unknown>
  const setTimer = deps.setTimeoutFn ?? ((callback: () => void, ms: number) => setTimeout(callback, ms))

  const imgError = ref(false)
  const justAdded = ref(false)
  const qvOpen = ref(false)

  const presentation = computed(() => buildProductPresentation(p()))
  const qvSize = ref(buildProductPresentation(p()).primarySize?.label ?? 'M')

  const qvPrice = computed(() => {
    const sz = p().sizes?.find(s => s.label === qvSize.value)
    return sz?.price ?? p().price
  })

  const isTopPick = computed(() => presentation.value.isTopPick)
  const isPopular = computed(() => presentation.value.isPopular)
  const primarySizeLabel = computed(() => presentation.value.primarySizeLabel)
  const primarySizePrice = computed(() => presentation.value.primarySizePrice)
  const compositionSummary = computed(() => presentation.value.compositionSummary)
  const shelfLife = computed(() => presentation.value.shelfLife)
  const sizeHeight = computed(() => presentation.value.sizeHeight)
  const sizeWeight = computed(() => presentation.value.sizeWeight)
  const packagingHint = computed(() => presentation.value.packagingHint)

  const serviceBadges = computed(() => {
    const badges = [...SERVICE_BADGE_FALLBACK]
    const seen = new Set(badges)
    const fromSettings = [
      settings().usp1Title,
      settings().usp2Title,
      settings().usp3Title,
      settings().usp4Title,
    ].filter((value): value is string => Boolean(value))
    for (const text of fromSettings) {
      if (!seen.has(text)) {
        badges.push(text)
        seen.add(text)
      }
    }
    return badges
  })

  const tagClass = computed(() => {
    if (p().tag === 'Премиум') return 'tag--green'
    if (p().tag === 'Новинка') return 'tag--blush'
    return 'tag--clay'
  })

  function formatRub(value: number) {
    return new Intl.NumberFormat('ru-RU').format(Math.round(value)) + ' ₽'
  }

  function add() {
    const sz = presentation.value.primarySize
    deps.addLine(createCartLine({
      slug:      p().slug,
      name:      p().name,
      bloom:     p().bloom,
      image:     p().images?.[0],
      meta:      sz ? `Размер ${sz.label}` : 'Размер M',
      sizeLabel: sz?.label ?? 'M',
      price:     sz?.price ?? p().price,
    }))
    deps.showToast(`${p().name} · Размер ${sz?.label ?? 'M'}`)
    justAdded.value = true
    setTimer(() => { justAdded.value = false }, 1800)
  }

  function addFromQv() {
    const sz = p().sizes?.find(s => s.label === qvSize.value) ?? p().sizes?.[0]
    deps.addLine(createCartLine({
      slug:      p().slug,
      name:      p().name,
      bloom:     p().bloom,
      image:     p().images?.[0],
      meta:      `Размер ${sz?.label ?? qvSize.value}`,
      sizeLabel: sz?.label ?? qvSize.value,
      price:     qvPrice.value,
    }))
    deps.showToast(`${p().name} · Размер ${sz?.label ?? qvSize.value}`)
    qvOpen.value = false
  }

  return {
    imgError,
    justAdded,
    qvOpen,
    qvSize,
    qvPrice,
    presentation,
    isTopPick,
    isPopular,
    primarySizeLabel,
    primarySizePrice,
    compositionSummary,
    shelfLife,
    sizeHeight,
    sizeWeight,
    packagingHint,
    serviceBadges,
    tagClass,
    formatRub,
    add,
    addFromQv,
  }
}
