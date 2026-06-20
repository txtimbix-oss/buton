import { computed, ref } from 'vue'
import { api } from '@/api'
import type { IAutoApplyPromo } from '@/types/order'

export interface BirthdayPromo {
  code: string
  discount: number
  expiresAt?: string
}

export interface ActivePromo {
  code: string
  title: string
  detail: string
}

export function useDashboardPromos() {
  const autoPromo = ref<IAutoApplyPromo | null>(null)
  const birthdayPromo = ref<BirthdayPromo | null>(null)

  const activePromos = computed<ActivePromo[]>(() => {
    const map = new Map<string, ActivePromo>()

    if (birthdayPromo.value) {
      map.set(birthdayPromo.value.code, {
        code: birthdayPromo.value.code,
        title: 'Подарок ко дню рождения',
        detail: `${birthdayPromo.value.discount} ₽`,
      })
    }

    if (autoPromo.value) {
      const promo = autoPromo.value
      let detail = 'скидка'

      if (promo.discountType === 'free_shipping') {
        detail = 'бесплатная доставка'
      } else if (promo.discountType === 'percent' || promo.discountType === 'percent_capped') {
        detail = `${promo.discount}%` + (promo.maxDiscountAmount ? ` (до ${promo.maxDiscountAmount.toLocaleString('ru-RU')} ₽)` : '')
      } else {
        detail = `${promo.discount} ₽`
      }

      map.set(promo.code, {
        code: promo.code,
        title: 'Персональное предложение',
        detail,
      })
    }

    return [...map.values()]
  })

  async function loadPromos(userId?: string) {
    try {
      const res = await api.checkBirthdayPromo()
      birthdayPromo.value = res.promo ?? null
    } catch {
      birthdayPromo.value = null
    }

    try {
      const res = await api.getAutoApplyPromo({ userId })
      autoPromo.value = res ?? null
    } catch {}
  }

  return {
    activePromos,
    birthdayPromo,
    loadPromos,
  }
}
