import { effectScope, nextTick, ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'

import { useHeaderUiState } from '~/composables/useHeaderUiState'

function setup(overrides: Partial<Parameters<typeof useHeaderUiState>[0]> = {}) {
  const cartCount = ref(0)
  const navigate = vi.fn()
  const scope = effectScope()
  const state = scope.run(() => useHeaderUiState({
    cartCount,
    navigate,
    ...overrides,
  }))!
  return { cartCount, navigate, state, scope }
}

describe('useHeaderUiState', () => {
  it('bumps the cart icon when the cart count changes and resets after the timer', async () => {
    const timers: Array<() => void> = []
    const { cartCount, state } = setup({
      setTimeoutFn: (cb: () => void) => { timers.push(cb); return 0 },
    })

    expect(state.cartBump.value).toBe(false)
    cartCount.value = 2
    await nextTick()

    expect(state.cartBump.value).toBe(true)
    timers.forEach(run => run())
    expect(state.cartBump.value).toBe(false)
  })

  it('marks the header stuck once scrolled past 8px', () => {
    let scrollY = 0
    const { state } = setup({ getScrollY: () => scrollY })

    state.handleScroll()
    expect(state.isStuck.value).toBe(false)

    scrollY = 20
    state.handleScroll()
    expect(state.isStuck.value).toBe(true)
  })

  it('opens the search overlay and focuses the input', async () => {
    const focusSearch = vi.fn()
    const { state } = setup({ focusSearch })

    state.openSearch()
    expect(state.showSearch.value).toBe(true)
    await nextTick()
    expect(focusSearch).toHaveBeenCalledTimes(1)
  })

  it('closes the search overlay and clears the query', () => {
    const { state } = setup()
    state.showSearch.value = true
    state.searchQ.value = 'розы'

    state.closeSearch()

    expect(state.showSearch.value).toBe(false)
    expect(state.searchQ.value).toBe('')
  })

  it('does not navigate for queries shorter than 2 characters', () => {
    const { state, navigate } = setup()
    state.searchQ.value = 'р'

    state.goSearch()

    expect(navigate).not.toHaveBeenCalled()
    expect(state.showSearch.value).toBe(false)
  })

  it('navigates to the encoded catalog query and closes on search', () => {
    const { state, navigate } = setup()
    state.showSearch.value = true
    state.searchQ.value = '  пионы  '

    state.goSearch()

    expect(navigate).toHaveBeenCalledWith('/catalog?q=%D0%BF%D0%B8%D0%BE%D0%BD%D1%8B')
    expect(state.showSearch.value).toBe(false)
    expect(state.searchQ.value).toBe('')
  })
})
