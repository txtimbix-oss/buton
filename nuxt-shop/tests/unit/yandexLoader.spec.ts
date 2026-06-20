import { describe, expect, it, vi } from 'vitest'

import { YANDEX_MAPS_KEY, ensureYmapsLoaded, type YandexMapsWindow } from '~/lib/maps/yandexLoader'

describe('ensureYmapsLoaded', () => {
  it('resolves through ymaps.ready when the API is already present', async () => {
    const ready = vi.fn((cb: () => void) => cb())
    const win = { ymaps: { ready } } as unknown as YandexMapsWindow
    const doc = { createElement: vi.fn(), head: { appendChild: vi.fn() } } as unknown as Document

    await ensureYmapsLoaded(doc, win)

    expect(ready).toHaveBeenCalledTimes(1)
    expect(doc.createElement).not.toHaveBeenCalled()
  })

  it('injects the api script with the correct src and resolves on load', async () => {
    const script: Record<string, unknown> = {}
    const appendChild = vi.fn()
    const doc = {
      createElement: vi.fn(() => script),
      head: { appendChild },
    } as unknown as Document
    const ready = vi.fn((cb: () => void) => cb())
    const win = {} as YandexMapsWindow

    const promise = ensureYmapsLoaded(doc, win)

    expect(appendChild).toHaveBeenCalledWith(script)
    expect(script.src).toBe(`https://api-maps.yandex.ru/2.1/?apikey=${YANDEX_MAPS_KEY}&lang=ru_RU`)
    expect(script.async).toBe(true)

    // ymaps becomes available, then the script onload fires
    win.ymaps = { ready } as unknown as YandexMapsWindow['ymaps']
    ;(script.onload as () => void)()

    await expect(promise).resolves.toBeUndefined()
    expect(ready).toHaveBeenCalledTimes(1)
  })

  it('rejects when the script fails to load', async () => {
    const script: Record<string, unknown> = {}
    const doc = {
      createElement: vi.fn(() => script),
      head: { appendChild: vi.fn() },
    } as unknown as Document

    const promise = ensureYmapsLoaded(doc, {} as YandexMapsWindow)
    ;(script.onerror as () => void)()

    await expect(promise).rejects.toThrow('Failed to load Yandex Maps')
  })
})
