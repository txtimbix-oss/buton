import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

import { useToast } from '~/composables/useToast'

function createUseStateMock() {
  const store = new Map<string, ReturnType<typeof ref>>()

  return <T>(key: string, init: () => T) => {
    if (!store.has(key)) {
      store.set(key, ref(init()))
    }
    return store.get(key) as ReturnType<typeof ref<T>>
  }
}

describe('useToast', () => {
  it('shows message and hides automatically after timeout', () => {
    vi.useFakeTimers()
    vi.stubGlobal('useState', createUseStateMock())

    const toast = useToast()
    toast.show('Сохранено')

    expect(toast.message.value).toBe('Сохранено')
    expect(toast.visible.value).toBe(true)

    vi.advanceTimersByTime(2799)
    expect(toast.visible.value).toBe(true)

    vi.advanceTimersByTime(1)
    expect(toast.visible.value).toBe(false)

    vi.useRealTimers()
  })

  it('resets previous hide timer when showing a new message', () => {
    vi.useFakeTimers()
    vi.stubGlobal('useState', createUseStateMock())

    const toast = useToast()
    toast.show('Первое')
    vi.advanceTimersByTime(2000)

    toast.show('Второе')
    vi.advanceTimersByTime(2799)
    expect(toast.message.value).toBe('Второе')
    expect(toast.visible.value).toBe(true)

    vi.advanceTimersByTime(1)
    expect(toast.visible.value).toBe(false)

    vi.useRealTimers()
  })
})
