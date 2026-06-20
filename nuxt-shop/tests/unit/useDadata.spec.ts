import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

import { useDadata } from '~/composables/useDadata'

describe('useDadata', () => {
  it('debounces requests, calls the local route, and returns suggestions on success', async () => {
    vi.stubGlobal('ref', ref)
    vi.useFakeTimers()

    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => [
        'Москва, Ленинградская 1',
        'Москва, Невский 2',
      ],
    }))
    vi.stubGlobal('fetch', fetchMock)

    const dadata = useDadata()
    expect(dadata.suggestions.value).toEqual([])
    dadata.suggest('мос')
    dadata.suggest('моск')

    await vi.advanceTimersByTimeAsync(300)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith('/api/dadata/address', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: 'моск' }),
    })

    expect(dadata.suggestions.value).toEqual(['Москва, Ленинградская 1', 'Москва, Невский 2'])
    expect(dadata.loading.value).toBe(false)

    vi.useRealTimers()
  })

  it('does not fetch for short queries and clears suggestions', async () => {
    vi.stubGlobal('ref', ref)
    vi.useFakeTimers()
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const dadata = useDadata()

    await dadata.suggest('мо')
    await vi.runAllTimersAsync()

    expect(fetchMock).not.toHaveBeenCalled()
    expect(dadata.suggestions.value).toEqual([])
    expect(dadata.loading.value).toBe(false)

    vi.useRealTimers()
  })

  it('clears suggestions and cancels pending requests', async () => {
    vi.stubGlobal('ref', ref)
    vi.useFakeTimers()
    const fetchMock = vi.fn(async () => ({ ok: true, json: async () => ['A'] }))
    vi.stubGlobal('fetch', fetchMock)

    const dadata = useDadata()
    dadata.suggest('моск')

    dadata.clear()
    await vi.runAllTimersAsync()

    expect(dadata.suggestions.value).toEqual([])
    expect(fetchMock).not.toHaveBeenCalled()
    vi.useRealTimers()
  })

  it('returns empty list when the local route fails', async () => {
    vi.stubGlobal('ref', ref)
    vi.useFakeTimers()
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('boom') }))

    const dadata = useDadata()
    dadata.suggest('цвет')
    await vi.advanceTimersByTimeAsync(300)

    expect(dadata.suggestions.value).toEqual([])
    expect(dadata.loading.value).toBe(false)
    vi.useRealTimers()
  })
})
