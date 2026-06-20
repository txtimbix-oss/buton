import { describe, expect, it } from 'vitest'
import { computed, ref } from 'vue'
import { useCabinetTier } from '@/composables/useCabinetTier'

const tierMock = [
  { key: 'bronze', name: 'Бронза', min: 0, cashback: 2 },
  { key: 'silver', name: 'Серебро', min: 1000, cashback: 4 },
  { key: 'gold', name: 'Золото', min: 5000, cashback: 7 },
]

describe('useCabinetTier', () => {
  it('вычисляет текущий и следующий уровни', () => {
    const totalSpent = ref(3500)
    const { currentLevel, nextLevel, tierCashback, remainingToNext, progressPct } = useCabinetTier(totalSpent, tierMock)

    expect(currentLevel.value.key).toBe('silver')
    expect(nextLevel.value?.key).toBe('gold')
    expect(tierCashback.value).toBe(4)
    expect(remainingToNext.value).toBe(1500)
    expect(progressPct.value).toBe(62)
  })

  it('возвращает max level для самых лояльных пользователей', () => {
    const totalSpent = ref(7000)
    const { currentLevel, isMaxLevel, nextLevel, progressPct } = useCabinetTier(totalSpent, tierMock)

    expect(currentLevel.value.key).toBe('gold')
    expect(isMaxLevel.value).toBe(true)
    expect(nextLevel.value).toBeNull()
    expect(progressPct.value).toBe(100)
  })

  it('сортирует уровни даже если переданы неотсортированными', () => {
    const totalSpent = ref(150)
    const levels = computed(() => [...tierMock].reverse())
    const { currentLevel, progressPct } = useCabinetTier(totalSpent, levels)

    expect(currentLevel.value.key).toBe('bronze')
    expect(progressPct.value).toBe(15)
  })

  it('формирует корректный диапазон уровня', () => {
    const totalSpent = ref(0)
    const { levelRange } = useCabinetTier(totalSpent, tierMock)
    const expectedMaxLevel = `${(5000).toLocaleString('ru-RU')} ₽`

    expect(levelRange({ key: 'bronze', name: 'Бронза', min: 0, cashback: 2 })).toBe('0 – 999 ₽')
    expect(levelRange({ key: 'gold', name: 'Золото', min: 5000, cashback: 7 })).toBe(expectedMaxLevel)
  })
})
