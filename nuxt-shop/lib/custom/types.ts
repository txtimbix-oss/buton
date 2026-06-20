import type { CartLineInput } from '~/lib/cart/types'

export interface CustomSizeOption {
  id: string
  label: string
  price: number
  stems: string
  height: string
  weight: string
  baseFlowers: number
  note: string
}

export interface CustomFlowerTypeOption {
  id: string
  name: string
  price: number
  note: string
}

export interface CustomPaletteOption {
  id: string
  kind: string
  name: string
  color: string
}

export interface CustomStyleOption {
  id: string
  name: string
  price: number
}

export interface CustomPackagingOption {
  id: string
  name: string
  price: number
}

export interface CustomAccessoryOption {
  id: string
  name: string
  price: number
  mandatory?: boolean
}

export interface CalculateExtraStemPriceInput {
  flowerCount: number
  baseFlowers: number
  extraStemPrice: number
}

export interface CalculateCustomBouquetTotalInput extends CalculateExtraStemPriceInput {
  sizePrice: number
  flowerTypeExtra: number
  styleExtra: number
  packagingPrice: number
  addonPrices: number[]
}

export interface CustomCartLineBuilderInput {
  occasion: string
  sizeId: string
  sizeLabel: string
  flowerTypeId: string
  flowerTypeName: string
  paletteId: string
  styleId: string
  styleName: string
  packagingId: string
  packagingName?: string
  flowerCount?: number
  estimatedTotal: number
  addonIds: string[]
}

export interface CustomQuickOrderCartLineBuilderInput
  extends Omit<CustomCartLineBuilderInput, 'flowerTypeName' | 'styleName' | 'packagingName' | 'flowerCount'> {
  quickDeliveryTime: string
}

export type CustomCartLineInput = CartLineInput

export interface BuildCustomQuotePayloadInput {
  name: string
  phone: string
  message: string
  occasion: string
  sizeLabel: string
  flowerCount: number
  flowerTypeName: string
  paletteName: string
  styleName: string
  packagingName: string
  addonIds: string[]
  deliveryDate: string
  deliveryTime: string
  estimatedTotal: number
}

export interface CustomInquiryPayload {
  type: 'custom'
  name: string
  phone: string
  data: {
    type: 'manual-builder'
    occasion: string
    size: string
    flowers: number
    flowerType: string
    palette: string
    style: string
    packaging: string
    addons: string[]
    deliveryDate: string
    deliveryTime: string
    estimate: number
    message: string
  }
}

export interface CustomContactInput {
  name: string
  phone: string
}

export interface CustomContactErrors {
  name: boolean
  phone: boolean
}
