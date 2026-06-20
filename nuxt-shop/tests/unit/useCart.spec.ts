import { computed, ref } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { createCartLine } from '~/lib/cart/createCartLine'
import { useCart } from '~/composables/useCart'

function createUseStateMock() {
  const store = new Map<string, ReturnType<typeof ref>>()

  return <T>(key: string, init: () => T) => {
    if (!store.has(key)) {
      store.set(key, ref(init()))
    }
    return store.get(key) as ReturnType<typeof ref<T>>
  }
}

function setupCart() {
  vi.stubGlobal('computed', computed)
  vi.stubGlobal('useState', createUseStateMock())

  return useCart()
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('useCart', () => {
  it('starts empty instead of seeding demo items', () => {
    const cart = setupCart()

    expect(cart.items.value).toEqual([])
    expect(cart.cartCount.value).toBe(0)
    expect(cart.subtotal.value).toBe(0)
  })

  it('merges additions with the same stable line key and preserves the original line id', () => {
    const cart = setupCart()

    cart.addLine(createCartLine({
      slug: 'belye-nochi',
      name: 'Белые ночи',
      bloom: 'cream',
      meta: 'Размер M',
      sizeLabel: 'M',
      price: 9100,
      image: '/first.jpg',
      addons: ['Ваза стеклянная', 'Открытка'],
    }))

    const originalLineId = cart.items.value[0]?.lineId

    cart.addLine(createCartLine({
      slug: 'belye-nochi',
      name: 'Белые ночи',
      bloom: 'cream',
      meta: 'Размер M',
      sizeLabel: 'M',
      price: 9100,
      image: '/fresh.jpg',
      addons: ['Открытка', 'Ваза стеклянная'],
    }))

    expect(cart.items.value).toHaveLength(1)
    expect(cart.items.value[0]).toMatchObject({
      lineId: originalLineId,
      qty: 2,
      image: '/fresh.jpg',
    })
  })

  it('creates separate lines for the same product when addons differ', () => {
    const cart = setupCart()

    cart.addLine(createCartLine({
      slug: 'belye-nochi',
      name: 'Белые ночи',
      bloom: 'cream',
      meta: 'Размер M',
      sizeLabel: 'M',
      price: 9100,
      addons: ['Открытка'],
    }))

    cart.addLine(createCartLine({
      slug: 'belye-nochi',
      name: 'Белые ночи',
      bloom: 'cream',
      meta: 'Размер M',
      sizeLabel: 'M',
      price: 9100,
      addons: ['Ваза стеклянная'],
    }))

    expect(cart.items.value).toHaveLength(2)
    expect(new Set(cart.items.value.map(item => item.lineKey)).size).toBe(2)
  })

  it('supports id-based mutations and keeps derived totals in sync', () => {
    const cart = setupCart()

    const regular = createCartLine({
      slug: 'belye-nochi',
      name: 'Белые ночи',
      bloom: 'cream',
      meta: 'Размер M',
      sizeLabel: 'M',
      price: 9100,
    })
    const large = createCartLine({
      slug: 'belye-nochi',
      name: 'Белые ночи',
      bloom: 'cream',
      meta: 'Размер L',
      sizeLabel: 'L',
      price: 10900,
    })

    cart.addLine(regular)
    cart.addLine(large)
    cart.setLineQty(regular.lineId, 3)

    expect(cart.items.value.find(item => item.lineId === regular.lineId)?.qty).toBe(3)
    expect(cart.cartCount.value).toBe(4)

    cart.removeLine(large.lineId)

    expect(cart.items.value).toHaveLength(1)
    expect(cart.subtotal.value).toBe(regular.price * 3)

    cart.setLineQty(regular.lineId, 0)

    expect(cart.items.value).toEqual([])
    expect(cart.cartCount.value).toBe(0)
  })

  it('clears every line via clearCart', () => {
    const cart = setupCart()

    cart.addLine(createCartLine({
      slug: 'belye-nochi',
      name: 'Белые ночи',
      bloom: 'cream',
      meta: 'Размер M',
      sizeLabel: 'M',
      price: 9100,
    }))
    cart.addLine(createCartLine({
      slug: 'lavandovoe-pole',
      name: 'Лавандовое поле',
      bloom: 'lav',
      meta: 'Размер S',
      sizeLabel: 'S',
      price: 3900,
    }))

    expect(cart.items.value).toHaveLength(2)

    cart.clearCart()

    expect(cart.items.value).toEqual([])
    expect(cart.cartCount.value).toBe(0)
  })

  it('exposes only the line-based cart mutations', () => {
    const cart = setupCart()

    const line = createCartLine({
      slug: 'lavandovoe-pole',
      name: 'Лавандовое поле',
      bloom: 'lav',
      meta: 'Размер S',
      sizeLabel: 'S',
      price: 3900,
    })

    cart.addLine(line)
    cart.setLineQty(line.lineId, 2)

    expect(cart.items.value[0]).toMatchObject({
      lineId: line.lineId,
      qty: 2,
    })
    expect(cart.cartCount.value).toBe(2)

    cart.removeLine(line.lineId)

    expect(cart.items.value).toEqual([])
    expect(cart).not.toHaveProperty('addItem')
    expect(cart).not.toHaveProperty('removeItem')
    expect(cart).not.toHaveProperty('setQty')
  })
})
