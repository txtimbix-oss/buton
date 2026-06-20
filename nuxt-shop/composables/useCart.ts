import type { CartLine } from '~/lib/cart/types'

export type CartItem = CartLine

function findLineIndex(lines: CartLine[], lineId: string) {
  return lines.findIndex(line => line.lineId === lineId)
}

export function useCart() {
  const items = useState<CartLine[]>('cart', () => [])

  const cartCount = computed(() => items.value.reduce((s, i) => s + i.qty, 0))

  const subtotal = computed(() => items.value.reduce((s, i) => s + i.price * i.qty, 0))

  function addLine(line: CartLine) {
    const existingIndex = items.value.findIndex(item => item.lineKey === line.lineKey)

    if (existingIndex < 0) {
      items.value.push({ ...line, addons: [...line.addons] })
      return
    }

    const existingLine = items.value[existingIndex]
    existingLine.qty += line.qty
    if (line.image) existingLine.image = line.image
  }

  function removeLine(lineId: string) {
    const index = findLineIndex(items.value, lineId)
    if (index >= 0) items.value.splice(index, 1)
  }

  function setLineQty(lineId: string, qty: number) {
    const index = findLineIndex(items.value, lineId)
    if (index < 0) return

    if (qty <= 0) {
      items.value.splice(index, 1)
      return
    }

    items.value[index].qty = qty
  }

  function clearCart() {
    items.value.splice(0)
  }

  return {
    items,
    cartCount,
    subtotal,
    addLine,
    removeLine,
    setLineQty,
    clearCart,
  }
}
