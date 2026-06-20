import { describe, expect, it, vi } from 'vitest'

import { useAsyncSubmitState } from '~/composables/useAsyncSubmitState'

describe('useAsyncSubmitState', () => {
  it('tracks loading, clears stale errors, and marks success on completion', async () => {
    const state = useAsyncSubmitState({
      errorMessage: 'Ошибка отправки',
    })

    state.apiError.value = 'old'

    const promise = state.run(async () => {
      expect(state.loading.value).toBe(true)
      expect(state.apiError.value).toBe('')
    })

    await promise

    expect(state.loading.value).toBe(false)
    expect(state.sent.value).toBe(true)
    expect(state.apiError.value).toBe('')
  })

  it('stores a stable error when the action fails', async () => {
    const state = useAsyncSubmitState({
      errorMessage: 'Ошибка отправки',
    })

    const result = await state.run(async () => {
      throw new Error('down')
    })
    expect(result).toBe(false)

    expect(state.loading.value).toBe(false)
    expect(state.sent.value).toBe(false)
    expect(state.apiError.value).toBe('Ошибка отправки')
  })

  it('allows setting and clearing a manual validation error without touching success state', () => {
    const state = useAsyncSubmitState({
      errorMessage: 'Ошибка отправки',
    })

    state.sent.value = true
    state.setError('Укажите номинал')
    expect(state.apiError.value).toBe('Укажите номинал')
    expect(state.sent.value).toBe(true)

    state.clearError()
    expect(state.apiError.value).toBe('')
  })

  it('prevents duplicate async runs and keeps a stable success result shape', async () => {
    const state = useAsyncSubmitState({
      errorMessage: 'Ошибка отправки',
    })

    let resolveAction: () => void = () => {}
    const slowAction = vi.fn(() => new Promise<void>((resolve) => {
      resolveAction = resolve
    }))

    const first = state.run(slowAction)
    const second = state.run(slowAction)

    expect(state.loading.value).toBe(true)
    expect(slowAction).toHaveBeenCalledTimes(1)

    const secondResult = await second
    resolveAction()
    const firstResult = await first

    expect(secondResult).toBe(false)
    expect(firstResult).toBe(true)
    expect(state.loading.value).toBe(false)
    expect(state.sent.value).toBe(true)
    expect(state.apiError.value).toBe('')
  })

  it('returns true for a successful action', async () => {
    const state = useAsyncSubmitState({
      errorMessage: 'Ошибка отправки',
    })

    const result = await state.run(async () => {
      return Promise.resolve()
    })

    expect(result).toBe(true)
  })
})
