export const CABINET_ORDER_STATUSES = [
  'pending',
  'confirmed',
  'delivering',
  'delivered',
  'cancelled',
  'refunded',
] as const

export type OrderStatus = (typeof CABINET_ORDER_STATUSES)[number]

export interface CabinetOrderItem {
  slug: string
  name: string
  sizeLabel: string
  qty: number
  price: number
  bloom: string
  meta: string
}

export interface CabinetOrderStatusHistoryEntry {
  status: OrderStatus
  changedAt: string
}

export interface CabinetOrderDelivery {
  type: string
  address?: string
  date: string
  time: string
}

export interface CabinetOrderRecipient {
  name: string
  phone: string
  email?: string
  cardText?: string
}

export interface CabinetOrder {
  _id: string
  orderNumber: string
  items: CabinetOrderItem[]
  delivery: CabinetOrderDelivery
  recipient: CabinetOrderRecipient
  subtotal: number
  deliveryCost: number
  discount: number
  total: number
  bonusEarned: number
  promoCode?: string
  status: OrderStatus
  statusHistory?: CabinetOrderStatusHistoryEntry[]
  createdAt: string
}

export type ApiOrderStatus = OrderStatus | (string & {})

export interface ApiOrderItem {
  slug?: string | null
  productSlug?: string | null
  name?: string | null
  title?: string | null
  sizeLabel?: string | null
  size?: string | null
  qty?: number | string | null
  quantity?: number | string | null
  price?: number | string | null
  bloom?: string | null
  meta?: string | null
}

export interface ApiOrderStatusHistoryEntry {
  status?: ApiOrderStatus | null
  changedAt?: string | null
  createdAt?: string | null
}

export interface ApiOrderDelivery {
  type?: string | null
  address?: string | null
  date?: string | null
  time?: string | null
}

export interface ApiOrderRecipient {
  name?: string | null
  phone?: string | null
  email?: string | null
  cardText?: string | null
}

export interface ApiOrderPayment {
  [key: string]: unknown
}

export interface ApiOrderRefund {
  [key: string]: unknown
}

export interface ApiOrder {
  _id?: string | null
  id?: string | null
  orderNumber?: string | number | null
  items?: ApiOrderItem[] | null
  delivery?: ApiOrderDelivery | null
  recipient?: ApiOrderRecipient | null
  subtotal?: number | string | null
  deliveryCost?: number | string | null
  discount?: number | string | null
  total?: number | string | null
  bonusEarned?: number | string | null
  promoCode?: string | null
  status?: ApiOrderStatus | null
  statusHistory?: ApiOrderStatusHistoryEntry[] | null
  createdAt?: string | null
  payment?: ApiOrderPayment | null
  refund?: ApiOrderRefund | null
}

export interface DuplicateOrderResponse {
  ok: boolean
  _id: string
  orderNumber: string
}

export interface ApiCancelOrderResponse {
  ok: boolean
  order: ApiOrder
}

export interface CancelOrderResponse {
  ok: boolean
  order: CabinetOrder
}

export interface AutoApplyPromoParams {
  userId?: string
  orderAmount?: number
  deliveryType?: string
}

export interface IAutoApplyPromo {
  code: string
  discount: number
  discountType: 'percent' | 'fixed' | 'free_shipping' | 'percent_capped'
  stackable?: boolean
  blockBonuses?: boolean
  maxDiscountAmount?: number
  freeShipping?: boolean
  applicableCategories?: string[]
  applicableProducts?: string[]
}

export interface BirthdayPromo {
  code: string
  discount: number
  expiresAt?: string
}

export interface BirthdayPromoResponse {
  ok: boolean
  promo: BirthdayPromo | null
}
