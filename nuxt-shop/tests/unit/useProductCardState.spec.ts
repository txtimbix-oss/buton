import { ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'

import { useProductCardState } from '~/composables/useProductCardState'
import { makeProduct } from '~/tests/fixtures/products'

function setup(productOverrides = {}, settingsValue: Record<string, unknown> = {}) {
  const product = makeProduct({
    tag: 'Премиум',
    sizes: [
      { label: 'S', desc: 'высота 45 см · вес 700 г', price: 4900 },
      { label: 'M', desc: 'высота 55 см · вес 1.2 кг', price: 5900 },
    ],
    ...productOverrides,
  })
  const addLine = vi.fn()
  const showToast = vi.fn()
  const timers: Array<() => void> = []
  const state = useProductCardState(() => product, {
    addLine,
    showToast,
    settings: ref(settingsValue),
    setTimeoutFn: (cb: () => void) => { timers.push(cb); return 0 },
  })
  return { product, addLine, showToast, timers, state }
}

describe('useProductCardState', () => {
  it('adds the primary size to the cart and toggles justAdded with a timer', () => {
    const { addLine, showToast, timers, state } = setup()

    state.add()

    expect(addLine).toHaveBeenCalledTimes(1)
    expect(addLine.mock.calls[0]![0]).toMatchObject({ sizeLabel: 'M', price: 5900, meta: 'Размер M' })
    expect(showToast).toHaveBeenCalledWith(expect.stringContaining('Размер M'))
    expect(state.justAdded.value).toBe(true)

    timers.forEach(run => run())
    expect(state.justAdded.value).toBe(false)
  })

  it('reflects the selected quick-view size in the price and adds it, then closes the modal', () => {
    const { addLine, state } = setup()
    state.qvOpen.value = true
    state.qvSize.value = 'S'

    expect(state.qvPrice.value).toBe(4900)

    state.addFromQv()

    expect(addLine.mock.calls[0]![0]).toMatchObject({ sizeLabel: 'S', price: 4900 })
    expect(state.qvOpen.value).toBe(false)
  })

  it('maps the product tag to a tag class', () => {
    expect(setup({ tag: 'Премиум' }).state.tagClass.value).toBe('tag--green')
    expect(setup({ tag: 'Новинка' }).state.tagClass.value).toBe('tag--blush')
    expect(setup({ tag: 'Хит' }).state.tagClass.value).toBe('tag--clay')
  })

  it('appends unique settings USP titles to the fallback service badges', () => {
    const { state } = setup({}, {
      usp1Title: 'Фото перед отправкой', // duplicate of fallback — should not repeat
      usp2Title: 'Кэшбэк баллами',
      usp3Title: '',
    })

    const badges = state.serviceBadges.value
    expect(badges).toContain('Кэшбэк баллами')
    expect(badges.filter(b => b === 'Фото перед отправкой')).toHaveLength(1)
  })
})
