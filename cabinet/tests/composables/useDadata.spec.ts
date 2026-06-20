import { describe, expect, it, vi } from 'vitest'
import { useDadata } from '@/composables/useDadata'

describe('useDadata', () => {
  it('не делает запрос если query короче 3 символов', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const { suggest, suggestions } = useDadata()
    await suggest('ab')
    expect(fetchMock).not.toHaveBeenCalled()
    expect(suggestions.value).toEqual([])

    vi.unstubAllGlobals()
  })

  it('дебаунсит запрос на suggestions', async () => {
    vi.useFakeTimers()
    const responsePayload = {
      suggestions: [
        { value: 'Тверская улица, 1' },
        { value: 'Ленина улица, 2' },
      ],
    }

    const fetchMock = vi.fn(async () => ({
      json: async () => responsePayload,
    } as Response))

    vi.stubGlobal('fetch', fetchMock)

    const { suggest, suggestions } = useDadata()
    await suggest('Твер')

    expect(fetchMock).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(300)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(suggestions.value).toEqual(responsePayload.suggestions.map(item => item.value))

    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  it('очищает результаты вызовом clear()', async () => {
    vi.useFakeTimers()
    const fetchMock = vi.fn(async () => ({ json: async () => ({ suggestions: [] }) } as Response))
    vi.stubGlobal('fetch', fetchMock)

    const { suggest, clear, suggestions } = useDadata()
    await suggest('тюль')
    await vi.advanceTimersByTimeAsync(300)

    clear()
    expect(suggestions.value).toEqual([])

    vi.unstubAllGlobals()
    vi.useRealTimers()
  })
})
