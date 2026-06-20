import { http, unwrap } from './client'
import type { AddressListResponse, AddressPayload, AddressUpdatePayload } from '@/types/api'

export const addressApi = {
  addAddress: (data: AddressPayload) =>
    unwrap(http.post<AddressListResponse>('/addresses', data)),

  updateAddress: (id: string, data: AddressUpdatePayload) =>
    unwrap(http.put<AddressListResponse>(`/addresses/${id}`, data)),

  deleteAddress: (id: string) =>
    unwrap(http.delete<AddressListResponse>(`/addresses/${id}`)),
}
