export interface IAddress {
  _id: string
  label: string
  address: string
  isDefault: boolean
}

export interface AddressPayload {
  label: string
  address: string
  isDefault?: boolean
}

export type AddressUpdatePayload = Partial<AddressPayload>

export interface AddressListResponse {
  ok: boolean
  addresses: IAddress[]
}
