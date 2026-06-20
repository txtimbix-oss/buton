import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

import { useReviews } from '~/composables/useReviews'

function createLocalStorageMock(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial))

  return {
    getItem: vi.fn((key: string) => (data.has(key) ? data.get(key) : null)),
    setItem: vi.fn((key: string, value: string) => {
      data.set(key, value)
    }),
    removeItem: vi.fn((key: string) => {
      data.delete(key)
    }),
    clear: vi.fn(() => {
      data.clear()
    }),
    _data: data,
  }
}

function createUseStateMock() {
  const store = new Map<string, ReturnType<typeof ref>>()

  return <T>(key: string, init: () => T) => {
    if (!store.has(key)) {
      store.set(key, ref(init()))
    }
    return store.get(key) as ReturnType<typeof ref<T>>
  }
}

describe('useReviews', () => {
  it('hydrates reviews from localStorage', () => {
    const storage = createLocalStorageMock({
      spb_reviews_ruby: JSON.stringify([{ id: 7, name: 'Вася', date: '2026-06-01', rating: 5, text: 'Прекрасно', photo: null, isUser: true }]),
    })
    vi.stubGlobal('localStorage', storage)
    vi.stubGlobal('useState', createUseStateMock())

    const { userReviews } = useReviews('ruby')

    expect(userReviews.value).toHaveLength(1)
    expect(userReviews.value[0].name).toEqual('Вася')
  })

  it('ignores invalid localStorage JSON', () => {
    const storage = createLocalStorageMock({ spb_reviews_lime: '{broken' })
    vi.stubGlobal('localStorage', storage)
    vi.stubGlobal('useState', createUseStateMock())

    const { userReviews } = useReviews('lime')

    expect(userReviews.value).toEqual([])
  })

  it('prepends user review and persists updated list to localStorage', async () => {
    const storage = createLocalStorageMock({
      spb_reviews_rose: JSON.stringify([{ id: 1, name: 'Старый', date: '2026-01-01', rating: 4, text: 'ok', photo: null, isUser: true }]),
    })
    vi.stubGlobal('localStorage', storage)
    vi.stubGlobal('useState', createUseStateMock())
    vi.spyOn(Date, 'now').mockReturnValue(1700000000000)

    const { userReviews, addReview } = useReviews('rose')
    const added = addReview({ name: 'Новый', rating: 5, text: 'Супер' })
    await Promise.resolve()
    await Promise.resolve()

    expect(userReviews.value[0]).toMatchObject({
      id: 1700000000000,
      name: 'Новый',
      rating: 5,
      text: 'Супер',
      isUser: true,
      photo: null,
    })
    expect(storage.setItem).toHaveBeenCalledWith(
      'spb_reviews_rose',
      JSON.stringify(userReviews.value),
    )
    expect(added).toEqual(userReviews.value[0])
    expect(userReviews.value).toHaveLength(2)
  })
})
