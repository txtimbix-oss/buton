import { storeToRefs } from 'pinia'
import { useCabinetOrdersStore } from '@/stores/cabinetOrders'

export function useCabinetOrdersResource() {
  const store = useCabinetOrdersStore()
  const {
    orders,
    loading,
    loaded,
  } = storeToRefs(store)

  return {
    orders,
    loading,
    loaded,
    loadOrders: store.loadOrders,
    invalidateOrders: store.invalidateOrders,
    resetOrders: store.resetOrders,
    replaceOrder: store.replaceOrder,
  }
}
