import { SHOP_URL } from '@/api'
import { useToastStore } from '@/stores/toast'
import type { CabinetOrder } from '@/types/order'
import {
  REPEAT_ORDER_STORAGE_KEY,
  createRepeatOrderBridgePayload,
  encodeRepeatOrderBridgePayload,
} from './repeatOrderBridge'

type RepeatOrderTarget = 'shop' | 'cart'
type RepeatOrderToastType = 'success' | 'info' | 'error'

interface RepeatOrderOptions {
  target?: RepeatOrderTarget
  message?: string
  toastType?: RepeatOrderToastType
}

type RepeatableOrder = Pick<CabinetOrder, 'items'>

export function useRepeatOrder() {
  const toast = useToastStore()

  function repeatOrder(order: RepeatableOrder, options: RepeatOrderOptions = {}) {
    const target = options.target === 'cart' ? '/cart' : ''
    const payload = createRepeatOrderBridgePayload(order.items)
    const storage = (typeof window !== 'undefined' && window.localStorage) || (globalThis as { localStorage?: Storage | undefined }).localStorage

    if (!storage) return
    localStorage.setItem(REPEAT_ORDER_STORAGE_KEY, encodeRepeatOrderBridgePayload(payload))
    window.open(`${SHOP_URL}${target}`, '_blank')
    toast.show(options.message ?? 'Состав заказа скопирован — откройте магазин', options.toastType ?? 'info')
  }

  return { repeatOrder }
}
