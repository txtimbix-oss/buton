import { computed, reactive, ref } from 'vue'
import { useAsyncSubmitState } from '~/composables/useAsyncSubmitState'

import { createCartLine } from '~/lib/cart/createCartLine'
import type { CartLine } from '~/lib/cart/types'
import {
  CUSTOM_ACCESSORY_OPTIONS,
  CUSTOM_DELIVERY_TIMES,
  CUSTOM_FLOWER_COUNT_OPTIONS,
  CUSTOM_FLOWER_TYPES,
  CUSTOM_OCCASIONS,
  CUSTOM_PACKAGING_OPTIONS,
  CUSTOM_PALETTE_OPTIONS,
  CUSTOM_SIZE_OPTIONS,
  CUSTOM_STYLE_OPTIONS,
} from '~/lib/custom/options'
import {
  buildCustomCartLineInput,
  buildCustomQuickOrderCartLineInput,
  buildCustomQuotePayload,
} from '~/lib/custom/payloads'
import { calculateCustomBouquetTotal, calculateExtraStemPrice, ensureMandatoryAddonIds } from '~/lib/custom/pricing'
import type { CustomCartLineInput, CustomInquiryPayload } from '~/lib/custom/types'
import { validateCustomContact } from '~/lib/custom/validation'

export interface UseCustomPageStateDeps {
  addLine: (line: CartLine) => void
  showToast: (message: string) => void
  navigate: (to: string) => Promise<unknown> | unknown
  submitInquiry: (payload: CustomInquiryPayload) => Promise<unknown>
  createCartLine?: (input: CustomCartLineInput) => CartLine
  getToday?: () => string
}

export function getLocalDateInputValue(date = new Date()): string {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function useCustomPageState(
  _options: Record<string, never>,
  deps: UseCustomPageStateDeps,
) {
  const createLine = deps.createCartLine ?? createCartLine

  const today = computed(() => (deps.getToday ?? getLocalDateInputValue)())

  const selectedOccasion = ref(CUSTOM_OCCASIONS[1])
  const selectedSize = ref(CUSTOM_SIZE_OPTIONS[1]!)
  const flowerCount = ref(16)
  const selectedFlowerType = ref(CUSTOM_FLOWER_TYPES[0]!)
  const selectedPalette = ref(CUSTOM_PALETTE_OPTIONS[0]!)
  const selectedStyle = ref(CUSTOM_STYLE_OPTIONS[0]!)
  const selectedPackagingId = ref(CUSTOM_PACKAGING_OPTIONS[0]!.id)
  const selectedAddons = ref<string[]>(ensureMandatoryAddonIds(['photo']))
  const form = reactive({ name: '', phone: '', message: '' })
  const deliveryDate = ref('')
  const deliveryTime = ref(CUSTOM_DELIVERY_TIMES[1]!)
  const quickDeliveryTime = ref(CUSTOM_DELIVERY_TIMES[1]!)
  const quickOrderPending = ref(false)
  const errors = reactive({ name: false, phone: false })
  const addingToCart = ref(false)
  const quoteSubmitState = useAsyncSubmitState({
    errorMessage: 'Не удалось отправить заявку. Проверьте телефон или попробуйте позже.',
  })

  const selectedPackaging = computed(() => {
    return CUSTOM_PACKAGING_OPTIONS.find((item) => item.id === selectedPackagingId.value) ?? CUSTOM_PACKAGING_OPTIONS[0]!
  })

  const selectedAddonList = computed(() => {
    const addonIds = ensureMandatoryAddonIds(selectedAddons.value)
    return CUSTOM_ACCESSORY_OPTIONS.filter((item) => addonIds.includes(item.id))
  })

  const flowerPriceExtra = computed(() => {
    return calculateExtraStemPrice({
      flowerCount: flowerCount.value,
      baseFlowers: selectedSize.value.baseFlowers,
      extraStemPrice: 180,
    })
  })

  const estimatedTotal = computed(() => {
    return calculateCustomBouquetTotal({
      sizePrice: selectedSize.value.price,
      flowerCount: flowerCount.value,
      baseFlowers: selectedSize.value.baseFlowers,
      extraStemPrice: 180,
      flowerTypeExtra: selectedFlowerType.value.price,
      styleExtra: selectedStyle.value.price,
      packagingPrice: selectedPackaging.value.price,
      addonPrices: selectedAddonList.value.map((item) => item.price),
    })
  })

  function toggleAddon() {
    selectedAddons.value = ensureMandatoryAddonIds(selectedAddons.value)
  }

  function syncContactErrors() {
    Object.assign(errors, validateCustomContact({
      name: form.name,
      phone: form.phone,
    }))
  }

  function addCustomToCart() {
    if (addingToCart.value) return

    addingToCart.value = true

    try {
      deps.addLine(createLine(buildCustomCartLineInput({
        occasion: selectedOccasion.value,
        sizeId: selectedSize.value.id,
        sizeLabel: selectedSize.value.label,
        flowerTypeId: selectedFlowerType.value.id,
        flowerTypeName: selectedFlowerType.value.name,
        paletteId: selectedPalette.value.id,
        styleId: selectedStyle.value.id,
        styleName: selectedStyle.value.name,
        packagingId: selectedPackaging.value.id,
        packagingName: selectedPackaging.value.name,
        flowerCount: flowerCount.value,
        estimatedTotal: estimatedTotal.value,
        addonIds: selectedAddons.value,
      })))

      deps.showToast('Собранный букет добавлен в корзину')
    } finally {
      addingToCart.value = false
    }
  }

  async function addCustomQuickOrder() {
    syncContactErrors()
    if (errors.name || errors.phone || quickOrderPending.value) return

    quickOrderPending.value = true

    try {
      deps.addLine(createLine(buildCustomQuickOrderCartLineInput({
        occasion: selectedOccasion.value,
        sizeId: selectedSize.value.id,
        sizeLabel: selectedSize.value.label,
        flowerTypeId: selectedFlowerType.value.id,
        paletteId: selectedPalette.value.id,
        styleId: selectedStyle.value.id,
        packagingId: selectedPackaging.value.id,
        quickDeliveryTime: quickDeliveryTime.value,
        estimatedTotal: estimatedTotal.value,
        addonIds: selectedAddons.value,
      })))

      deps.showToast(`Быстрый заказ оформлен: ${selectedOccasion.value}`)
      await deps.navigate('/cart')
    } finally {
      quickOrderPending.value = false
    }
  }

  async function submitQuote() {
    syncContactErrors()
    if (errors.name || errors.phone) return

    await quoteSubmitState.run(async () => {
      await deps.submitInquiry(buildCustomQuotePayload({
        name: form.name,
        phone: form.phone,
        message: form.message,
        occasion: selectedOccasion.value,
        sizeLabel: selectedSize.value.label,
        flowerCount: flowerCount.value,
        flowerTypeName: selectedFlowerType.value.name,
        paletteName: selectedPalette.value.name,
        styleName: selectedStyle.value.name,
        packagingName: selectedPackaging.value.name,
        addonIds: selectedAddons.value,
        deliveryDate: deliveryDate.value,
        deliveryTime: deliveryTime.value,
        estimatedTotal: estimatedTotal.value,
      }))

      deps.showToast('Заявка на сборку отправлена')
    })
  }

  return {
    today,
    occasions: CUSTOM_OCCASIONS,
    flowerCountOptions: CUSTOM_FLOWER_COUNT_OPTIONS,
    sizeOptions: CUSTOM_SIZE_OPTIONS,
    flowerTypes: CUSTOM_FLOWER_TYPES,
    paletteOptions: CUSTOM_PALETTE_OPTIONS,
    styleOptions: CUSTOM_STYLE_OPTIONS,
    packagingOptions: CUSTOM_PACKAGING_OPTIONS,
    accessoryOptions: CUSTOM_ACCESSORY_OPTIONS,
    deliveryTimes: CUSTOM_DELIVERY_TIMES,
    selectedOccasion,
    selectedSize,
    flowerCount,
    selectedFlowerType,
    selectedPalette,
    selectedStyle,
    selectedPackagingId,
    selectedAddons,
    form,
    deliveryDate,
    deliveryTime,
    quickDeliveryTime,
    quickOrderPending,
    errors,
    quoteLoading: quoteSubmitState.loading,
    addingToCart,
    quoteSent: quoteSubmitState.sent,
    apiError: quoteSubmitState.apiError,
    selectedPackaging,
    selectedAddonList,
    flowerPriceExtra,
    estimatedTotal,
    toggleAddon,
    addCustomToCart,
    addCustomQuickOrder,
    submitQuote,
  }
}
