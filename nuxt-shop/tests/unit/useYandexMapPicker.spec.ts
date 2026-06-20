import { describe, expect, it, vi } from 'vitest'

import { useYandexMapPicker } from '~/composables/useYandexMapPicker'

function createYmapsStub() {
  const handlers: Record<string, (e: unknown) => void> = {}
  const markerHandlers: Record<string, () => void> = {}

  const mapInstance = {
    events: { add: vi.fn((name: string, cb: (e: unknown) => void) => { handlers[name] = cb }) },
    geoObjects: { add: vi.fn(), remove: vi.fn() },
    setCenter: vi.fn(),
    getZoom: vi.fn(() => 12),
    destroy: vi.fn(),
  }

  const markerInstance = {
    events: { add: vi.fn((name: string, cb: () => void) => { markerHandlers[name] = cb }) },
    geometry: { getCoordinates: vi.fn(() => [59.9, 30.3] as [number, number]) },
  }

  const ymaps = {
    ready: (cb: () => void) => cb(),
    Map: vi.fn(function () { return mapInstance }),
    Placemark: vi.fn(function () { return markerInstance }),
    geocode: vi.fn(async () => ({
      geoObjects: {
        get: () => ({
          properties: { get: () => 'Россия, Санкт-Петербург, Невский проспект, 1' },
        }),
      },
    })),
  }

  return { ymaps, mapInstance, markerInstance, handlers, markerHandlers }
}

function setup(onSelect = vi.fn()) {
  const stub = createYmapsStub()
  const picker = useYandexMapPicker({
    onSelect,
    ensureLoaded: vi.fn(async () => {}),
    getYmaps: () => stub.ymaps,
    nextTick: async () => {},
  })
  picker.mapEl.value = {} as HTMLElement
  return { picker, onSelect, ...stub }
}

describe('useYandexMapPicker', () => {
  it('opens the modal and initializes the map only once', async () => {
    const { picker, ymaps } = setup()

    await picker.toggle()
    expect(picker.isOpen.value).toBe(true)
    expect(ymaps.Map).toHaveBeenCalledTimes(1)

    await picker.toggle() // close
    expect(picker.isOpen.value).toBe(false)

    await picker.toggle() // open again, but the map is already initialized
    expect(ymaps.Map).toHaveBeenCalledTimes(1)
  })

  it('geocodes the clicked coordinates and strips the leading "Россия, "', async () => {
    const { picker, ymaps, handlers, onSelect } = setup()

    await picker.toggle()
    handlers.click!({ get: () => [59.95, 30.31] })
    await Promise.resolve()
    await Promise.resolve()

    expect(ymaps.geocode).toHaveBeenCalledWith([59.95, 30.31])
    expect(picker.pickedAddress.value).toBe('Санкт-Петербург, Невский проспект, 1')
    expect(onSelect).toHaveBeenCalledWith('Санкт-Петербург, Невский проспект, 1')
  })

  it('confirm() emits the picked address and closes the modal', async () => {
    const { picker, onSelect } = setup()
    picker.isOpen.value = true
    picker.pickedAddress.value = 'Санкт-Петербург, Невский проспект, 1'

    picker.confirm()

    expect(onSelect).toHaveBeenCalledWith('Санкт-Петербург, Невский проспект, 1')
    expect(picker.isOpen.value).toBe(false)
  })
})
