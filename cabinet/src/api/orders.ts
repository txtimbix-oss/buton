import { http, pub, unwrap } from './client'
import { normalizeOrder, normalizeOrders } from './order'
import type {
  ApiCancelOrderResponse,
  ApiOrder,
  AutoApplyPromoParams,
  BirthdayPromoResponse,
  CancelOrderResponse,
  DuplicateOrderResponse,
  IAutoApplyPromo,
} from '@/types/api'

export const orderApi = {
  getOrders: () =>
    unwrap(http.get<ApiOrder[]>('/orders')).then(normalizeOrders),

  duplicateOrder: (id: string) =>
    unwrap(http.post<DuplicateOrderResponse>(`/orders/${id}/duplicate`)),

  getAutoApplyPromo: (params: AutoApplyPromoParams) =>
    unwrap(pub.get<IAutoApplyPromo | null>('/promocodes/auto-apply', { params })),

  cancelOrder: (id: string) =>
    unwrap(http.patch<ApiCancelOrderResponse>(`/orders/${id}/cancel`)).then(
      ({ order, ...response }): CancelOrderResponse => ({
        ...response,
        order: normalizeOrder(order),
      }),
    ),

  checkBirthdayPromo: () =>
    unwrap(http.get<BirthdayPromoResponse>('/birthday-promo')),
}
