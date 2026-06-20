import type { CabinetOrder } from '@/types/order'
import { formatLongDate, formatPrice } from '@/utils/formatters'

export interface OrderPreviewMeta {
  createdAtLabel: string
  businessSummary: string
  totalLabel: string
}

export function getOrderPreviewMeta(order: CabinetOrder): OrderPreviewMeta {
  return {
    createdAtLabel: formatLongDate(order.createdAt),
    businessSummary: order.items.map(item => item.name).join(', '),
    totalLabel: formatPrice(order.total),
  }
}
