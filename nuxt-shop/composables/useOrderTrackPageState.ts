import { computed, reactive, ref } from 'vue'

import {
  createEmptyOrderTrackForm,
  getDeliveryTypeLabel,
  getTrackLookupError,
  getTrackStatusIndex,
  normalizeOrderTrackNumber,
  trackStatusSteps,
  type TrackOrder,
} from '~/lib/orders/track'

export interface UseOrderTrackPageStateDeps {
  fetchOrder: (query: { number: string; phone: string }) => Promise<TrackOrder>
}

export function useOrderTrackPageState(
  _options: Record<string, never>,
  deps: UseOrderTrackPageStateDeps,
) {
  const form = reactive(createEmptyOrderTrackForm())
  const order = ref<TrackOrder | null>(null)
  const loading = ref(false)
  const error = ref('')

  const statusIndex = computed(() => getTrackStatusIndex(order.value))
  const deliveryTypeLabel = computed(() => getDeliveryTypeLabel(order.value?.delivery.type))

  function updateOrderNumber(value: string) {
    form.number = normalizeOrderTrackNumber(value)
  }

  async function search() {
    error.value = ''

    const number = normalizeOrderTrackNumber(form.number)
    if (!number || !form.phone) {
      error.value = 'Заполните оба поля'
      return
    }

    loading.value = true

    try {
      form.number = number
      order.value = await deps.fetchOrder({
        number,
        phone: form.phone,
      })
    } catch (lookupError) {
      order.value = null
      error.value = getTrackLookupError(lookupError)
    } finally {
      loading.value = false
    }
  }

  function reset() {
    order.value = null
    error.value = ''
  }

  return {
    form,
    order,
    loading,
    error,
    statusSteps: trackStatusSteps,
    statusIndex,
    deliveryTypeLabel,
    updateOrderNumber,
    search,
    reset,
  }
}
