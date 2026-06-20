import { computed, onMounted, ref } from 'vue'
import { api } from '@/api'
import {
  DEFAULT_BONUS_SETTINGS,
  DEFAULT_LOYALTY_LEVELS,
} from '@/constants/loyalty'
import { useAuthStore } from '@/stores/auth'
import type { BonusSettings, BonusTransaction, LoyaltyLevel } from '@/types/bonus'

export function useBonusViewModel() {
  const auth = useAuthStore()
  const loading = ref(true)
  const transactions = ref<BonusTransaction[]>([])
  const settings = ref<BonusSettings>(DEFAULT_BONUS_SETTINGS)
  const levels = ref<LoyaltyLevel[]>(DEFAULT_LOYALTY_LEVELS)

  const bonusBalance = computed(() => auth.user?.bonusBalance ?? 0)
  const totalSpent = computed(() => auth.user?.totalSpent ?? 0)

  async function loadBonus() {
    try {
      const [data] = await Promise.all([
        api.getBonus(),
        auth.fetchMe().catch(() => {}),
      ])
      transactions.value = data.transactions
      settings.value = data.settings
      if (Array.isArray(data.levels) && data.levels.length) {
        levels.value = data.levels
      }
      if (auth.user) auth.updateUser({ ...auth.user, bonusBalance: data.balance })
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    void loadBonus()
  })

  return {
    bonusBalance,
    levels,
    loadBonus,
    loading,
    settings,
    totalSpent,
    transactions,
  }
}
