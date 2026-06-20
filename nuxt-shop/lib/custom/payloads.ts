import { CUSTOM_ACCESSORY_OPTIONS } from './options'
import { ensureMandatoryAddonIds } from './pricing'
import type {
  BuildCustomQuotePayloadInput,
  CustomCartLineInput,
  CustomInquiryPayload,
  CustomCartLineBuilderInput,
  CustomQuickOrderCartLineBuilderInput,
} from './types'
import { normalizePhone } from './validation'

function buildCustomSlug(parts: string[]): string {
  return parts.join('-')
}

function mapAddonIdsToNames(addonIds: string[]): string[] {
  const stableIds = ensureMandatoryAddonIds(addonIds)

  return stableIds
    .map((addonId) => CUSTOM_ACCESSORY_OPTIONS.find((option) => option.id === addonId)?.name)
    .filter((name): name is string => Boolean(name))
}

export function buildCustomCartLineInput(input: CustomCartLineBuilderInput): CustomCartLineInput {
  return {
    slug: buildCustomSlug([
      'custom',
      input.sizeId,
      input.flowerTypeId,
      input.paletteId,
      input.styleId,
      input.packagingId,
    ]),
    name: `Собранный букет · ${input.occasion}`,
    bloom: input.paletteId,
    meta: `${input.flowerTypeName} · ${input.flowerCount ?? 0} шт. · ${input.styleName}`,
    sizeLabel: `${input.sizeLabel} · ${input.packagingName ?? ''}`.trim(),
    price: input.estimatedTotal,
    addons: mapAddonIdsToNames(input.addonIds),
  }
}

export function buildCustomQuickOrderCartLineInput(input: CustomQuickOrderCartLineBuilderInput): CustomCartLineInput {
  const addonNames = mapAddonIdsToNames(input.addonIds).filter((name) => name !== 'Фото перед отправкой')

  return {
    slug: buildCustomSlug([
      'custom',
      'today',
      input.sizeId,
      input.flowerTypeId,
      input.paletteId,
      input.styleId,
      input.packagingId,
    ]),
    name: `Сборка сегодня · ${input.occasion}`,
    bloom: input.paletteId,
    meta: `Размер ${input.sizeLabel} · Фото перед отправкой · ${input.quickDeliveryTime}`,
    sizeLabel: `${input.sizeLabel} · Сегодня`,
    price: input.estimatedTotal,
    addons: ['Фото перед отправкой', 'Доставка сегодня', ...addonNames],
  }
}

export function buildCustomQuotePayload(input: BuildCustomQuotePayloadInput): CustomInquiryPayload {
  return {
    type: 'custom',
    name: input.name.trim(),
    phone: normalizePhone(input.phone),
    data: {
      type: 'manual-builder',
      occasion: input.occasion.trim(),
      size: input.sizeLabel.trim(),
      flowers: input.flowerCount,
      flowerType: input.flowerTypeName.trim(),
      palette: input.paletteName.trim(),
      style: input.styleName.trim(),
      packaging: input.packagingName.trim(),
      addons: mapAddonIdsToNames(input.addonIds),
      deliveryDate: input.deliveryDate.trim(),
      deliveryTime: input.deliveryTime.trim(),
      estimate: input.estimatedTotal,
      message: input.message.trim(),
    },
  }
}

export { buildCustomSlug }
