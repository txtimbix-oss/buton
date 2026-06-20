import type { CabinetOrderItem } from '@/types/order'

export const REPEAT_ORDER_STORAGE_KEY = 'repeatOrder'

type RepeatOrderBridgeItemField =
  | 'slug'
  | 'name'
  | 'bloom'
  | 'meta'
  | 'sizeLabel'
  | 'qty'
  | 'price'

export type RepeatOrderBridgeItem = Pick<CabinetOrderItem, RepeatOrderBridgeItemField>
export type RepeatOrderBridgePayload = RepeatOrderBridgeItem[]

export function createRepeatOrderBridgePayload(items: CabinetOrderItem[]): RepeatOrderBridgePayload {
  return items.map((item) => ({
    slug: item.slug,
    name: item.name,
    bloom: item.bloom,
    meta: item.meta,
    sizeLabel: item.sizeLabel,
    qty: item.qty,
    price: item.price,
  }))
}

export function encodeRepeatOrderBridgePayload(payload: RepeatOrderBridgePayload): string {
  return JSON.stringify(payload)
}
