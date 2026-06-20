import { buildCartLineKey, normalizeCartLineAddons } from './lineKey'
import type { CartLine, CartLineInput } from './types'

function createLineId(): string {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID()
  }

  return `cart-line-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export function createCartLine(input: CartLineInput): CartLine {
  const addons = normalizeCartLineAddons(input.addons)

  return {
    lineId: createLineId(),
    lineKey: buildCartLineKey({ ...input, addons }),
    slug: input.slug,
    name: input.name,
    bloom: input.bloom,
    image: input.image,
    meta: input.meta,
    sizeLabel: input.sizeLabel,
    price: input.price,
    qty: input.qty ?? 1,
    addons,
    mode: input.mode,
  }
}
