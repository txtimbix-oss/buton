import { describe, expect, it, vi } from 'vitest'

import { useOrderTrackPageState } from '~/composables/useOrderTrackPageState'
import type { TrackOrder } from '~/lib/orders/track'

function makeTrackedOrder(): TrackOrder {
  return {
    orderNumber: 'SPB-01001',
    status: 'confirmed',
    total: 7800,
    items: [
      {
        slug: 'peony-spring',
        name: 'Пионовый сезон',
        bloom: 'peony',
        sizeLabel: 'L',
        price: 7800,
        qty: 1,
      },
    ],
    delivery: {
      type: 'scheduled',
      address: 'Невский, 10',
      date: '2026-06-09',
      time: '12:00',
    },
    recipient: {
      name: 'Ольга',
      phone: '+7 921 000 00 00',
    },
    createdAt: '2026-06-08T10:00:00.000Z',
  }
}

describe('useOrderTrackPageState', () => {
  it('blocks search when required fields are empty', async () => {
    const fetchOrder = vi.fn(async () => makeTrackedOrder())
    const state = useOrderTrackPageState({}, { fetchOrder })

    await state.search()

    expect(fetchOrder).not.toHaveBeenCalled()
    expect(state.error.value).toBe('Заполните оба поля')
    expect(state.loading.value).toBe(false)
  })

  it('normalizes the order number, fetches order data, and exposes derived labels', async () => {
    const fetchOrder = vi.fn(async () => makeTrackedOrder())
    const state = useOrderTrackPageState({}, { fetchOrder })

    state.updateOrderNumber(' spb-01001 ')
    state.form.phone = '+7 921 000 00 00'

    await state.search()

    expect(fetchOrder).toHaveBeenCalledWith({
      number: 'SPB-01001',
      phone: '+7 921 000 00 00',
    })
    expect(state.order.value?.orderNumber).toBe('SPB-01001')
    expect(state.statusIndex.value).toBe(1)
    expect(state.deliveryTypeLabel.value).toBe('Доставка ко времени')
    expect(state.error.value).toBe('')
    expect(state.loading.value).toBe(false)
  })

  it('stores a stable error when lookup fails', async () => {
    const fetchOrder = vi.fn(async () => {
      throw { data: { error: 'Неверный номер' } }
    })
    const state = useOrderTrackPageState({}, { fetchOrder })
    state.form.number = 'SPB-01001'
    state.form.phone = '+7 921 000 00 00'

    await state.search()

    expect(state.order.value).toBeNull()
    expect(state.error.value).toBe('Неверный номер')
    expect(state.loading.value).toBe(false)
  })

  it('resets the found order state without clearing entered inputs', async () => {
    const fetchOrder = vi.fn(async () => makeTrackedOrder())
    const state = useOrderTrackPageState({}, { fetchOrder })
    state.form.number = 'SPB-01001'
    state.form.phone = '+7 921 000 00 00'

    await state.search()
    state.reset()

    expect(state.order.value).toBeNull()
    expect(state.error.value).toBe('')
    expect(state.form.number).toBe('SPB-01001')
    expect(state.form.phone).toBe('+7 921 000 00 00')
  })
})
