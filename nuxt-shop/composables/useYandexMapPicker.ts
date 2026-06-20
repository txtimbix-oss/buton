import { nextTick as vueNextTick, ref } from 'vue'

import { ensureYmapsLoaded, type YandexMapsWindow } from '~/lib/maps/yandexLoader'

// ymaps 2.x: координаты всегда [широта, долгота]
const SPB_CENTER: [number, number] = [59.9386, 30.3141]

export interface UseYandexMapPickerDeps {
  onSelect?: (address: string) => void
  ensureLoaded?: (doc?: Document, win?: YandexMapsWindow) => Promise<void>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getYmaps?: () => any
  nextTick?: () => Promise<void>
  onError?: (error: unknown) => void
}

export function useYandexMapPicker(deps: UseYandexMapPickerDeps = {}) {
  const ensureLoaded = deps.ensureLoaded ?? ensureYmapsLoaded
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getYmaps = deps.getYmaps ?? (() => (window as unknown as YandexMapsWindow).ymaps as any)
  const tick = deps.nextTick ?? vueNextTick
  const onError = deps.onError ?? ((error: unknown) => console.error(error))
  const onSelect = deps.onSelect

  const isOpen = ref(false)
  const mapEl = ref<HTMLElement | null>(null)
  const mapLoading = ref(false)
  const geocoding = ref(false)
  const pickedAddress = ref('')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mapInstance: any = null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let markerInstance: any = null

  async function initMap() {
    if (!mapEl.value || mapInstance) return
    mapLoading.value = true
    try {
      await ensureLoaded()
      const ymaps = getYmaps()

      mapInstance = new ymaps.Map(mapEl.value, {
        center: SPB_CENTER,
        zoom: 12,
        controls: ['zoomControl', 'geolocationControl'],
      })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mapInstance.events.add('click', (e: any) => {
        const coords: [number, number] = e.get('coords')
        placeMarker(coords)
        doGeocode(coords)
      })
    } catch (error) {
      onError(error)
    } finally {
      mapLoading.value = false
    }
  }

  function placeMarker(coords: [number, number]) {
    const ymaps = getYmaps()
    if (!ymaps || !mapInstance) return

    if (markerInstance) {
      mapInstance.geoObjects.remove(markerInstance)
      markerInstance = null
    }

    markerInstance = new ymaps.Placemark(
      coords,
      {},
      { preset: 'islands#dotIcon', iconColor: '#2E4736', draggable: true },
    )

    markerInstance.events.add('dragend', () => {
      const newCoords: [number, number] = markerInstance.geometry.getCoordinates()
      doGeocode(newCoords)
    })

    mapInstance.geoObjects.add(markerInstance)
    // мягко приближаем до zoom 16
    mapInstance.setCenter(coords, Math.max(mapInstance.getZoom(), 16), { checkZoomRange: true })
  }

  async function doGeocode(coords: [number, number]) {
    geocoding.value = true
    pickedAddress.value = ''
    try {
      const ymaps = getYmaps()
      const result = await ymaps.geocode(coords)
      const obj = result.geoObjects.get(0)
      if (obj) {
        const text: string = obj.properties.get('text') ?? ''
        if (text) {
          const addr = text.replace(/^Россия,\s*/, '')
          pickedAddress.value = addr
          onSelect?.(addr)
        }
      }
    } catch (error) {
      onError(error)
    } finally {
      geocoding.value = false
    }
  }

  async function toggle() {
    isOpen.value = !isOpen.value
    if (isOpen.value) {
      await tick()
      await initMap()
    }
  }

  function confirm() {
    if (pickedAddress.value) onSelect?.(pickedAddress.value)
    isOpen.value = false
  }

  function destroy() {
    try { mapInstance?.destroy() } catch { /* ignore */ }
    mapInstance = null
    markerInstance = null
  }

  return {
    isOpen,
    mapEl,
    mapLoading,
    geocoding,
    pickedAddress,
    toggle,
    initMap,
    placeMarker,
    doGeocode,
    confirm,
    destroy,
  }
}
