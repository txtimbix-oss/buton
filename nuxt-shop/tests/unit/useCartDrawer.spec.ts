import { describe, expect, it, vi } from 'vitest'

import { useCartDrawer } from '~/composables/useCartDrawer'

function createUseStateMock() {
  const store = new Map<string, { value: unknown }>()

  return <T>(key: string, init: () => T) => {
    if (!store.has(key)) {
      store.set(key, { value: init() })
    }
    return store.get(key) as { value: T }
  }
}

describe('useCartDrawer', () => {
  it('opens and closes the cart drawer using a shared state flag', () => {
    vi.stubGlobal('useState', createUseStateMock())

    const drawer = useCartDrawer()
    drawer.open()

    expect(drawer.isOpen.value).toBe(true)

    drawer.close()
    expect(drawer.isOpen.value).toBe(false)
  })
})
