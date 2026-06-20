import { describe, expect, it, vi } from 'vitest'

interface MockSubscription {
  endpoint: string
  toJSON: () => { endpoint: string; keys?: { p256dh: string; auth: string } }
  unsubscribe: () => Promise<void>
}

function stubComputed(isSupported: boolean) {
  vi.stubGlobal('computed', (getter: () => unknown) => {
    const source = getter.toString()
    if (source.includes('serviceWorker') && source.includes('PushManager')) {
      return { value: isSupported }
    }
    return { value: getter() ?? false }
  })
}

function setImportMetaClient(value: boolean) {
  const descriptor = Object.getOwnPropertyDescriptor(import.meta, 'client')
  const previous = descriptor?.value
  Object.defineProperty(import.meta, 'client', { value, configurable: true })
  return () => {
    Object.defineProperty(import.meta, 'client', { value: previous, configurable: true })
  }
}

function withGlobalProperty<T>(obj: any, key: string, value: T) {
  const hadDescriptor = Object.getOwnPropertyDescriptor(obj, key)
  const hadValue = obj[key]

  Object.defineProperty(obj, key, { value, configurable: true, writable: true })

  return () => {
    if (hadDescriptor) {
      Object.defineProperty(obj, key, hadDescriptor)
    } else {
      if (hadValue === undefined) {
        Object.defineProperty(obj, key, { value: undefined, configurable: true })
      } else {
        Object.defineProperty(obj, key, { value: hadValue, configurable: true, writable: true })
      }
    }
  }
}

function createPushBrowserEnv(supported = true) {
  const subscription: MockSubscription = {
    endpoint: 'https://example.test/push/abc',
    toJSON: () => ({
      endpoint: 'https://example.test/push/abc',
      keys: { p256dh: 'key-part', auth: 'secret' },
    }),
    unsubscribe: vi.fn(async () => {}),
  }

  const pushManager = {
    getSubscription: vi.fn(async () => subscription),
    subscribe: vi.fn(async () => subscription),
  }
  const registration = { pushManager }

  const navigatorMock = supported
    ? {
        serviceWorker: {
          register: vi.fn(async () => registration),
          ready: Promise.resolve(registration),
        },
      }
    : {}

  const notificationMock = supported
    ? {
        permission: 'default' as NotificationPermission,
        requestPermission: vi.fn(async () => 'granted'),
      }
    : undefined

  const windowMock = supported
    ? {
        Notification: notificationMock,
        PushManager: function PushManager() {},
      }
    : {}

  const restoreNavigator = withGlobalProperty(globalThis, 'navigator', navigatorMock)
  const restoreWindow = withGlobalProperty(globalThis, 'window', windowMock)
  const restoreNotification = supported && notificationMock
    ? withGlobalProperty(globalThis, 'Notification', notificationMock)
    : () => {}

  return {
    navigatorMock,
    windowMock,
    registration,
    subscription,
    pushManager,
    notification: notificationMock,
    restore: () => {
      restoreNavigator()
      restoreWindow()
      restoreNotification()
    },
  }
}

async function loadPushModule(client = true) {
  vi.resetModules()
  const restoreMeta = setImportMetaClient(client)
  const module = await import('~/composables/usePush')
  return { usePush: module.usePush, restoreMeta }
}

describe('usePush', () => {
  it('reports unsupported state and skips actions without browser APIs', async () => {
    const { restore } = createPushBrowserEnv(false)
    stubComputed(false)
    const { usePush, restoreMeta } = await loadPushModule(false)

    const push = usePush()

    expect(push.isSupported.value).toBe(false)
    expect(push.permission.value).toBe('default')
    expect(await push.subscribe()).toBe(false)
    await push.unsubscribe()

    restore()
    restoreMeta()
  })

  it('registers service worker when supported', async () => {
    const { restore, navigatorMock } = createPushBrowserEnv(true)
    stubComputed(true)
    const { usePush, restoreMeta } = await loadPushModule(true)

    const push = usePush()
    await push.register()

    expect(navigatorMock.serviceWorker.register).toHaveBeenCalledWith('/sw.js', { scope: '/' })
    expect(push.permission.value).toBe('default')

    restore()
    restoreMeta()
  })

  it('subscribes user and sends subscription when permission granted', async () => {
    const { restore, pushManager, subscription } = createPushBrowserEnv(true)
    stubComputed(true)
    const { usePush, restoreMeta } = await loadPushModule(true)

    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({ publicKey: 'BQsdfW' }),
    }))
    const subscribeApiMock = vi.fn(async () => ({}))
    vi.stubGlobal('fetch', async (url: string, options?: { method?: string }) => {
      if (url === '/api/push/vapid-public-key') return fetchMock()
      if (url === '/api/push/subscribe' && options?.method === 'POST') return subscribeApiMock(url, options)
      throw new Error(`unexpected fetch url ${url}`)
    })

    const push = usePush()
    const ok = await push.subscribe()

    expect(ok).toBe(true)
    expect(pushManager.subscribe).toHaveBeenCalledTimes(1)
    expect(pushManager.subscribe).toHaveBeenCalledWith(expect.objectContaining({
      userVisibleOnly: true,
      applicationServerKey: expect.any(Uint8Array),
    }))
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(subscribeApiMock).toHaveBeenCalledTimes(1)
    const subscribeCall = subscribeApiMock.mock.calls[0]?.[1] as { body?: string } | undefined
    expect(subscribeCall?.body).toEqual(JSON.stringify(subscription.toJSON()))

    expect(await push.isSubscribed()).toBe(true)

    restore()
    restoreMeta()
  })

  it('returns false when permission is denied', async () => {
    const { restore, notification } = createPushBrowserEnv(true)
    if (notification) {
      notification.requestPermission = vi.fn(async () => 'denied')
    }
    stubComputed(true)
    const { usePush, restoreMeta } = await loadPushModule(true)

    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const push = usePush()
    const ok = await push.subscribe()

    expect(ok).toBe(false)
    expect(fetchMock).not.toHaveBeenCalled()
    expect(notification!.requestPermission).toHaveBeenCalledWith()

    restore()
    restoreMeta()
  })

  it('unsubscribes existing push subscription and notifies backend', async () => {
    const { restore, pushManager, subscription } = createPushBrowserEnv(true)
    stubComputed(true)
    const { usePush, restoreMeta } = await loadPushModule(true)

    const unsubscribeApiMock = vi.fn(async () => ({ ok: true, json: async () => ({}) }))
    vi.stubGlobal('fetch', async (url: string, options?: { method?: string }) => {
      if (url === '/api/push/unsubscribe' && options?.method === 'POST') return unsubscribeApiMock(url, options)
      throw new Error(`unexpected fetch url ${url}`)
    })

    const push = usePush()
    await push.unsubscribe()

    expect(pushManager.getSubscription).toHaveBeenCalledTimes(1)
    expect(unsubscribeApiMock).toHaveBeenCalledTimes(1)
    const unsubCall = unsubscribeApiMock.mock.calls[0]?.[1] as { body?: string } | undefined
    expect(JSON.parse(unsubCall?.body ?? '{}')).toEqual({ endpoint: subscription.endpoint })
    expect(subscription.unsubscribe).toHaveBeenCalledTimes(1)

    restore()
    restoreMeta()
  })
})
