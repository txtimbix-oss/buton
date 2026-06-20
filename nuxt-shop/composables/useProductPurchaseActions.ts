import { getCurrentScope, onScopeDispose, ref, toValue, type MaybeRefOrGetter } from 'vue'

import type { Product } from '~/composables/useShop'
import { createCartLine } from '~/lib/cart/createCartLine'
import type { CartLine } from '~/lib/cart/types'
import {
  buildAddToCartLineInput,
  buildBundleCartLineInput,
  buildQuickOrderCartLineInput,
} from '~/lib/product/options'
import type { BundleOption, CatalogAddon, ProductCartLineInput } from '~/lib/product/types'

type ProductTrackPayload =
  | { event: 'cart' }
  | { event: 'bundle'; bundle: string }

export interface UseProductPurchaseActionsOptions {
  product: MaybeRefOrGetter<Product | null | undefined>
  addons: MaybeRefOrGetter<CatalogAddon[]>
  activeSize: MaybeRefOrGetter<number>
  selectedAddons: MaybeRefOrGetter<number[]>
  qty: MaybeRefOrGetter<number>
  quickDeliveryTime: MaybeRefOrGetter<string>
}

export interface UseProductPurchaseActionsDeps {
  addLine: (line: CartLine) => void
  showToast: (message: string) => void
  navigate: (to: string) => Promise<unknown> | unknown
  track?: (payload: ProductTrackPayload) => Promise<unknown> | unknown
  createCartLine?: (input: ProductCartLineInput) => CartLine
  setTimeout?: typeof globalThis.setTimeout
  clearTimeout?: typeof globalThis.clearTimeout
}

function resolveSelection(options: UseProductPurchaseActionsOptions) {
  const product = toValue(options.product)

  if (!product) return null

  return {
    product,
    addons: toValue(options.addons),
    activeSize: toValue(options.activeSize),
    selectedAddons: toValue(options.selectedAddons),
    qty: toValue(options.qty),
  }
}

export function useProductPurchaseActions(
  options: UseProductPurchaseActionsOptions,
  deps: UseProductPurchaseActionsDeps,
) {
  const justAdded = ref(false)
  const quickOrderPending = ref(false)

  const createLine = deps.createCartLine ?? createCartLine
  const setTimeoutFn = deps.setTimeout ?? globalThis.setTimeout
  const clearTimeoutFn = deps.clearTimeout ?? globalThis.clearTimeout

  let justAddedTimer: ReturnType<typeof globalThis.setTimeout> | undefined

  function clearJustAddedTimer() {
    if (justAddedTimer == null) return
    clearTimeoutFn(justAddedTimer)
    justAddedTimer = undefined
  }

  function markJustAdded() {
    justAdded.value = true
    clearJustAddedTimer()
    justAddedTimer = setTimeoutFn(() => {
      justAdded.value = false
      justAddedTimer = undefined
    }, 2000)
  }

  if (getCurrentScope()) {
    onScopeDispose(() => {
      clearJustAddedTimer()
    })
  }

  function addToCart() {
    const selection = resolveSelection(options)
    if (!selection) return

    const lineInput = buildAddToCartLineInput(selection)
    deps.addLine(createLine(lineInput))
    deps.showToast(`${selection.product.name} · Размер ${lineInput.sizeLabel}`)
    markJustAdded()

    void Promise.resolve(deps.track?.({ event: 'cart' })).catch(() => {})
  }

  function addBundleToCart(bundle: BundleOption) {
    const selection = resolveSelection(options)
    if (!selection) return

    const lineInput = buildBundleCartLineInput({
      ...selection,
      bundle,
    })

    deps.addLine(createLine(lineInput))
    const qtySuffix = selection.qty > 1 ? ` · x${selection.qty}` : ''
    deps.showToast(`${bundle.title}: ${selection.product.name}${qtySuffix}`)
    markJustAdded()

    void Promise.resolve(deps.track?.({ event: 'bundle', bundle: bundle.id })).catch(() => {})
  }

  async function placeQuickOrder() {
    const selection = resolveSelection(options)
    if (!selection || quickOrderPending.value) return

    quickOrderPending.value = true

    try {
      const lineInput = buildQuickOrderCartLineInput({
        ...selection,
        quickDeliveryTime: toValue(options.quickDeliveryTime),
      })

      deps.addLine(createLine(lineInput))
      deps.showToast(`Быстрый заказ: ${selection.product.name}`)
      await deps.navigate('/cart')
    } finally {
      quickOrderPending.value = false
    }
  }

  return {
    justAdded,
    quickOrderPending,
    addToCart,
    addBundleToCart,
    placeQuickOrder,
  }
}
