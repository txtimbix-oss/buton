import type { Product } from '~/composables/useShop'
import type { CartLine, CartLineInput } from '~/lib/cart/types'
import { createCartLine } from '~/lib/cart/createCartLine'
import { getPromoCopyMessage } from '~/lib/home/popup'
import { buildProductPresentation } from '~/lib/product/presentation'

type PrimarySize = Pick<Product['sizes'][number], 'label' | 'price'> | undefined
type BuildCartLine = (input: CartLineInput) => CartLine

export interface UseHomePageActionsOptions {
  addLine?: (line: CartLine) => void
  showToast?: (message: string) => void
  writeText?: (value: string) => Promise<void>
  buildCartLine?: BuildCartLine
  getPrimarySize?: (product: Product) => PrimarySize
  getPromoCopyMessage?: (code: string, copied: boolean) => string
}

function resolvePrimarySize(product: Product): PrimarySize {
  return buildProductPresentation(product).primarySize
}

function writeClipboardText(value: string) {
  return navigator.clipboard.writeText(value)
}

export function useHomePageActions(options: UseHomePageActionsOptions = {}) {
  const cart = options.addLine ? null : useCart()
  const toast = options.showToast ? null : useToast()

  const addLine = options.addLine ?? cart!.addLine
  const showToast = options.showToast ?? toast!.show
  const writeText = options.writeText ?? writeClipboardText
  const buildCartLine = options.buildCartLine ?? createCartLine
  const getPrimarySize = options.getPrimarySize ?? resolvePrimarySize
  const resolvePromoCopyMessage = options.getPromoCopyMessage ?? getPromoCopyMessage

  async function copyPromo(code: string) {
    try {
      await writeText(code)
      showToast(resolvePromoCopyMessage(code, true))
    } catch {
      showToast(resolvePromoCopyMessage(code, false))
    }
  }

  function quickAdd(product: Product) {
    const primarySize = getPrimarySize(product)
    const sizeLabel = primarySize?.label ?? 'M'

    addLine(buildCartLine({
      slug: product.slug,
      name: product.name,
      bloom: product.bloom,
      meta: `Размер ${sizeLabel}`,
      sizeLabel,
      price: primarySize?.price ?? product.price,
    }))

    showToast(`${product.name} · Размер ${sizeLabel}`)
  }

  return {
    copyPromo,
    quickAdd,
  }
}
