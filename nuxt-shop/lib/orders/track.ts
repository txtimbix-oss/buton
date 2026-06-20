import { normalizeApiError } from '~/lib/api/errors'

export interface OrderTrackItem {
  slug: string
  name: string
  bloom: string
  sizeLabel: string
  price: number
  qty: number
}

export interface OrderTrackDelivery {
  type: string
  address?: string
  date: string
  time: string
}

export interface OrderTrackRecipient {
  name: string
  phone: string
}

export interface TrackOrder {
  orderNumber: string
  status: string
  total: number
  items: OrderTrackItem[]
  delivery: OrderTrackDelivery
  recipient: OrderTrackRecipient
  createdAt: string
}

export interface OrderTrackForm {
  number: string
  phone: string
}

export const trackStatusSteps = [
  { key: 'pending', label: 'Принят' },
  { key: 'confirmed', label: 'Подтверждён' },
  { key: 'delivering', label: 'Доставляется' },
  { key: 'delivered', label: 'Доставлен' },
] as const

const DEFAULT_LOOKUP_ERROR = 'Заказ не найден. Проверьте номер и телефон.'

export function createEmptyOrderTrackForm(): OrderTrackForm {
  return {
    number: '',
    phone: '',
  }
}

export function normalizeOrderTrackNumber(value: string) {
  return value.trim().toUpperCase()
}

export function getTrackStatusIndex(order: TrackOrder | null) {
  if (!order) return -1

  const index = trackStatusSteps.findIndex((step) => step.key === order.status)
  return index === -1 ? 0 : index
}

export function getDeliveryTypeLabel(type?: string) {
  if (type === 'pickup') return 'Самовывоз'
  if (type === 'scheduled') return 'Доставка ко времени'
  return 'Курьерская доставка'
}

export function getTrackLookupError(error: unknown) {
  return normalizeApiError(error, DEFAULT_LOOKUP_ERROR)
}
