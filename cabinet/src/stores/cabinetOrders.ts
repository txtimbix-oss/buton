import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/api'
import type { CabinetOrder } from '@/types/order'

interface LoadOrdersOptions {
  force?: boolean
  userId?: string | null
}

export const useCabinetOrdersStore = defineStore('cabinetOrders', () => {
  const orders = ref<CabinetOrder[]>([])
  const loading = ref(false)
  const loaded = ref(false)
  const ownerId = ref<string | null>(null)

  let pendingRequest: Promise<CabinetOrder[]> | null = null
  let requestId = 0

  function resetOrders(nextOwnerId: string | null = null) {
    requestId += 1
    pendingRequest = null
    orders.value = []
    loading.value = false
    loaded.value = false
    ownerId.value = nextOwnerId
  }

  function invalidateOrders() {
    loaded.value = false
  }

  async function loadOrders(options: LoadOrdersOptions = {}) {
    const nextOwnerId = options.userId

    if (nextOwnerId !== undefined && nextOwnerId !== ownerId.value) {
      resetOrders(nextOwnerId)
    }

    if (pendingRequest) return pendingRequest
    if (loaded.value && !options.force) return orders.value

    loading.value = true
    const currentRequestId = ++requestId
    const currentOwnerId = ownerId.value

    pendingRequest = api.getOrders()
      .then((nextOrders) => {
        if (currentRequestId !== requestId || currentOwnerId !== ownerId.value) {
          return orders.value
        }

        orders.value = nextOrders
        loaded.value = true
        return nextOrders
      })
      .finally(() => {
        if (currentRequestId === requestId) {
          loading.value = false
          pendingRequest = null
        }
      })

    return pendingRequest
  }

  function replaceOrder(nextOrder: CabinetOrder) {
    loaded.value = true

    const index = orders.value.findIndex((order) => order._id === nextOrder._id)

    if (index === -1) {
      orders.value = [nextOrder, ...orders.value]
      return
    }

    orders.value = [
      ...orders.value.slice(0, index),
      nextOrder,
      ...orders.value.slice(index + 1),
    ]
  }

  return {
    orders,
    loading,
    loaded,
    loadOrders,
    invalidateOrders,
    resetOrders,
    replaceOrder,
  }
})
