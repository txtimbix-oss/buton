import { ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'

import { createClientStorage } from '~/lib/storage/clientStorage'
import { usePersistentState } from '~/lib/storage/persistentState'

function createUseStateMock() {
  const store = new Map<string, ReturnType<typeof ref>>()

  return <T>(key: string, init: () => T) => {
    if (!store.has(key)) {
      store.set(key, ref(init()))
    }
    return store.get(key) as ReturnType<typeof ref<T>>
  }
}

function createLocalStorageMock(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial))

  return {
    getItem: vi.fn((key: string) => (data.has(key) ? data.get(key)! : null)),
    setItem: vi.fn((key: string, value: string) => {
      data.set(key, value)
    }),
    removeItem: vi.fn((key: string) => {
      data.delete(key)
    }),
  }
}

describe('createClientStorage', () => {
  it('returns fallback when storage is unavailable', () => {
    const storage = createClientStorage(null)

    expect(storage.readJson('wishlist', ['fallback'])).toEqual(['fallback'])
  })

  it('recovers from malformed JSON', () => {
    const storage = createClientStorage({
      getItem: () => '{broken',
      setItem: () => {},
      removeItem: () => {},
    })

    expect(storage.readJson('wishlist', [])).toEqual([])
  })

  it('swallows write failures from client storage', () => {
    const storage = createClientStorage({
      getItem: () => null,
      setItem: () => {
        throw new Error('quota exceeded')
      },
      removeItem: () => {},
    })

    expect(() => storage.writeJson('wishlist', ['rose'])).not.toThrow()
  })
})

describe('usePersistentState', () => {
  it('hydrates state from storage and persists updates', async () => {
    const storage = createLocalStorageMock({
      wishlist: JSON.stringify(['rose']),
    })
    vi.stubGlobal('useState', createUseStateMock())

    const state = usePersistentState('wishlist-state', 'wishlist', () => [], {
      storage: createClientStorage(storage),
    })

    expect(state.value).toEqual(['rose'])

    state.value = [...state.value, 'peony']
    await Promise.resolve()
    await Promise.resolve()

    expect(storage.setItem).toHaveBeenCalledWith(
      'wishlist',
      JSON.stringify(['rose', 'peony']),
    )
  })

  it('falls back cleanly during SSR when storage is missing', () => {
    vi.stubGlobal('useState', createUseStateMock())

    const state = usePersistentState('wishlist-ssr', 'wishlist-ssr', () => ['seed'], {
      storage: createClientStorage(null),
    })

    expect(state.value).toEqual(['seed'])
  })
})
