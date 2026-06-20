import {
  CABINET_ORDER_STATUSES,
  type ApiOrder,
  type ApiOrderDelivery,
  type ApiOrderItem,
  type ApiOrderRecipient,
  type ApiOrderStatusHistoryEntry,
  type CabinetOrder,
  type CabinetOrderDelivery,
  type CabinetOrderItem,
  type CabinetOrderRecipient,
  type CabinetOrderStatusHistoryEntry,
  type OrderStatus,
} from '@/types/order'

const CABINET_ORDER_STATUS_SET = new Set<OrderStatus>(CABINET_ORDER_STATUSES)

function toNumberValue(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }

  return 0
}

function toStringValue(value: unknown): string {
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return ''
}

function toOptionalString(value: unknown): string | undefined {
  const normalized = toStringValue(value)
  return normalized.trim() ? normalized : undefined
}

function normalizeOrderStatus(value: unknown): OrderStatus {
  return typeof value === 'string' && CABINET_ORDER_STATUS_SET.has(value as OrderStatus)
    ? value as OrderStatus
    : 'pending'
}

function normalizeOrderItem(item: ApiOrderItem): CabinetOrderItem {
  return {
    slug: toStringValue(item.slug ?? item.productSlug),
    name: toStringValue(item.name ?? item.title),
    sizeLabel: toStringValue(item.sizeLabel ?? item.size),
    qty: toNumberValue(item.qty ?? item.quantity),
    price: toNumberValue(item.price),
    bloom: toStringValue(item.bloom),
    meta: toStringValue(item.meta),
  }
}

function normalizeOrderDelivery(delivery: ApiOrderDelivery | null | undefined): CabinetOrderDelivery {
  return {
    type: toStringValue(delivery?.type),
    address: toOptionalString(delivery?.address),
    date: toStringValue(delivery?.date),
    time: toStringValue(delivery?.time),
  }
}

function normalizeOrderRecipient(recipient: ApiOrderRecipient | null | undefined): CabinetOrderRecipient {
  return {
    name: toStringValue(recipient?.name),
    phone: toStringValue(recipient?.phone),
    email: toOptionalString(recipient?.email),
    cardText: toOptionalString(recipient?.cardText),
  }
}

function normalizeOrderStatusHistoryEntry(
  entry: ApiOrderStatusHistoryEntry,
): CabinetOrderStatusHistoryEntry | null {
  const changedAt = toStringValue(entry.changedAt ?? entry.createdAt)

  if (!changedAt) return null

  return {
    status: normalizeOrderStatus(entry.status),
    changedAt,
  }
}

function normalizeOrderStatusHistory(
  statusHistory: ApiOrder['statusHistory'],
): CabinetOrderStatusHistoryEntry[] | undefined {
  if (!Array.isArray(statusHistory)) return undefined

  const entries = statusHistory
    .map(normalizeOrderStatusHistoryEntry)
    .filter((entry): entry is CabinetOrderStatusHistoryEntry => entry !== null)

  return entries.length ? entries : undefined
}

export function normalizeOrder(order: ApiOrder): CabinetOrder {
  return {
    _id: toStringValue(order._id ?? order.id),
    orderNumber: toStringValue(order.orderNumber),
    items: Array.isArray(order.items) ? order.items.map(normalizeOrderItem) : [],
    delivery: normalizeOrderDelivery(order.delivery),
    recipient: normalizeOrderRecipient(order.recipient),
    subtotal: toNumberValue(order.subtotal),
    deliveryCost: toNumberValue(order.deliveryCost),
    discount: toNumberValue(order.discount),
    total: toNumberValue(order.total),
    bonusEarned: toNumberValue(order.bonusEarned),
    promoCode: toOptionalString(order.promoCode),
    status: normalizeOrderStatus(order.status),
    statusHistory: normalizeOrderStatusHistory(order.statusHistory),
    createdAt: toStringValue(order.createdAt),
  }
}

export function normalizeOrders(orders: ApiOrder[] | null | undefined): CabinetOrder[] {
  return Array.isArray(orders) ? orders.map(normalizeOrder) : []
}
