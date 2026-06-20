import type { Product } from '~/composables/useShop'
import { buildDefaultSelectedAddonIndexes, mergeAddonIndexes, resolveAddonNames, sumAddonPrices } from '~/lib/product/addons'
import type {
  BuildBundleCartLineInputOptions,
  BuildQuickOrderCartLineInputOptions,
  CatalogAddon,
  ProductCartLineInput,
  ProductOptionSelection,
  ProductOptionState,
  ProductOptionTotals,
  ResolveProductOptionStateOptions,
} from '~/lib/product/types'

function resolveSizeLabel(product: Product, activeSize: number): string {
  return product.sizes?.[activeSize]?.label ?? product.sizes?.[0]?.label ?? ''
}

function resolveBaseCartLineInput(product: Product): Omit<ProductCartLineInput, 'meta' | 'sizeLabel' | 'price' | 'qty' | 'addons'> {
  return {
    slug: product.slug,
    name: product.name,
    bloom: product.bloom,
    image: product.images?.[0],
  }
}

export function getDefaultSizeIndex(sizes?: { label: string }[]): number {
  if (!sizes?.length) return 0
  const mid = sizes.findIndex(size => size.label === 'M')
  return mid >= 0 ? mid : 0
}

export function buildInitialProductOptionSelection(
  product: Pick<Product, 'sizes'>,
  addons: CatalogAddon[],
): ProductOptionSelection {
  return {
    activeSize: getDefaultSizeIndex(product.sizes),
    selectedAddons: buildDefaultSelectedAddonIndexes(addons),
  }
}

export function toggleSelectedAddonIndex(selectedAddons: number[], index: number): number[] {
  return selectedAddons.includes(index)
    ? selectedAddons.filter(selectedIndex => selectedIndex !== index)
    : [...selectedAddons, index]
}

export function resolveProductOptionState({
  product,
  addons,
  activeSize,
  selectedAddons,
  qty = 1,
}: ResolveProductOptionStateOptions): ProductOptionState {
  const sizeLabel = resolveSizeLabel(product, activeSize)
  const addonNames = resolveAddonNames(addons, selectedAddons)
  const currentSizePrice = product.sizes?.[activeSize]?.price ?? product.price ?? 0
  const addonsTotal = sumAddonPrices(addons, selectedAddons)
  const currentTotal = currentSizePrice + addonsTotal

  return {
    activeSize,
    sizeLabel,
    selectedAddons: [...selectedAddons],
    addonNames,
    currentSizePrice,
    addonsTotal,
    currentTotal,
    totalPrice: currentTotal * qty,
    qty,
  }
}

export function buildProductOptionTotals(state: ProductOptionState): ProductOptionTotals {
  return {
    currentSizePrice: state.currentSizePrice,
    addonsTotal: state.addonsTotal,
    currentTotal: state.currentTotal,
    totalPrice: state.totalPrice,
  }
}

export function buildAddToCartLineInput(options: ResolveProductOptionStateOptions): ProductCartLineInput {
  const state = resolveProductOptionState(options)

  return {
    ...resolveBaseCartLineInput(options.product),
    meta: `Размер ${state.sizeLabel}`,
    sizeLabel: state.sizeLabel,
    price: state.currentTotal,
    qty: state.qty,
    addons: state.addonNames.length ? state.addonNames : undefined,
  }
}

export function buildBundleCartLineInput({
  bundle,
  ...options
}: BuildBundleCartLineInputOptions): ProductCartLineInput {
  const addonIndexes = mergeAddonIndexes(options.selectedAddons, bundle.addonIndexes)
  const state = resolveProductOptionState({ ...options, selectedAddons: addonIndexes })
  const sizeLabel = `${state.sizeLabel} · ${bundle.title}`

  return {
    ...resolveBaseCartLineInput(options.product),
    meta: `Размер ${sizeLabel}`,
    sizeLabel,
    price: state.currentTotal,
    qty: state.qty,
    addons: state.addonNames,
  }
}

export function buildQuickOrderCartLineInput({
  quickDeliveryTime,
  ...options
}: BuildQuickOrderCartLineInputOptions): ProductCartLineInput {
  const state = resolveProductOptionState(options)

  return {
    ...resolveBaseCartLineInput(options.product),
    meta: `Размер ${state.sizeLabel} · Фото перед отправкой · ${quickDeliveryTime}`,
    sizeLabel: `${state.sizeLabel} · Сегодня`,
    price: state.currentTotal,
    qty: state.qty,
    addons: [...state.addonNames, 'Фото перед отправкой', 'Доставка сегодня'],
    mode: 'quick-order',
  }
}
