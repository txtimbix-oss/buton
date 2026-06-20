export const YANDEX_MAPS_KEY = '9d926c01-d55b-4362-99f0-9461dfe2ccae'

export interface YandexMapsWindow extends Window {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ymaps?: {
    ready: (callback: () => void) => void
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Map: new (...args: any[]) => any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Placemark: new (...args: any[]) => any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    geocode: (coords: [number, number]) => Promise<any>
  }
}

export function ensureYmapsLoaded(
  doc: Document = document,
  win: YandexMapsWindow = window as YandexMapsWindow,
): Promise<void> {
  if (win.ymaps) {
    return new Promise((resolve) => win.ymaps!.ready(resolve))
  }

  return new Promise((resolve, reject) => {
    const script = doc.createElement('script')
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${YANDEX_MAPS_KEY}&lang=ru_RU`
    script.async = true
    script.onload = () => win.ymaps?.ready(resolve)
    script.onerror = () => reject(new Error('Failed to load Yandex Maps'))
    doc.head.appendChild(script)
  })
}
