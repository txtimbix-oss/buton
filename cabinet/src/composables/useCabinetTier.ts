import { computed, unref, type ComputedRef, type Ref } from 'vue'
import { DEFAULT_LOYALTY_LEVELS, type LoyaltyTier } from '@/constants/loyalty'

type MaybeValue<T> = T | Ref<T> | ComputedRef<T>

export function useCabinetTier(
  totalSpent: MaybeValue<number | null | undefined>,
  levels?: MaybeValue<LoyaltyTier[]>,
) {
  const sortedLevels = computed(() => {
    const source = levels ? unref(levels) : DEFAULT_LOYALTY_LEVELS
    const resolved = source.length ? source : DEFAULT_LOYALTY_LEVELS
    return [...resolved].sort((a, b) => a.min - b.min)
  })

  const spent = computed(() => unref(totalSpent) ?? 0)

  const currentLevel = computed(() => {
    const matched = [...sortedLevels.value].reverse().find(level => spent.value >= level.min)
    return matched ?? sortedLevels.value[0]
  })

  const nextLevel = computed(() => {
    const index = sortedLevels.value.findIndex(level => level.key === currentLevel.value.key)
    return index < sortedLevels.value.length - 1 ? sortedLevels.value[index + 1] : null
  })

  const tierName = computed(() => currentLevel.value.name)
  const tierCashback = computed(() => currentLevel.value.cashback)
  const isMaxLevel = computed(() => nextLevel.value === null)
  const nextThreshold = computed(() => nextLevel.value?.min ?? currentLevel.value.min)
  const nextTierName = computed(() => nextLevel.value?.name ?? currentLevel.value.name)
  const remainingToNext = computed(() => Math.max(nextThreshold.value - spent.value, 0))

  const progressPct = computed(() => {
    if (!nextLevel.value) return 100
    const range = nextLevel.value.min - currentLevel.value.min
    if (range <= 0) return 100
    const progress = ((spent.value - currentLevel.value.min) / range) * 100
    return Math.min(100, Math.max(0, Math.floor(progress)))
  })

  function levelRange(level: LoyaltyTier): string {
    const index = sortedLevels.value.findIndex(item => item.key === level.key)
    const next = sortedLevels.value[index + 1]
    if (!next) return `${level.min.toLocaleString('ru-RU')} ₽`
    return `${level.min.toLocaleString('ru-RU')} – ${(next.min - 1).toLocaleString('ru-RU')} ₽`
  }

  return {
    currentLevel,
    nextLevel,
    tierName,
    tierCashback,
    isMaxLevel,
    nextThreshold,
    nextTierName,
    remainingToNext,
    progressPct,
    levelRange,
  }
}
