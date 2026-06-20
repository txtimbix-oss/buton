import { ref } from 'vue'
import { normalizeApiError } from '~/lib/api/errors'

// Конвертация VAPID-ключа из base64url → Uint8Array (требование Web Push API)
function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const b64     = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw     = atob(b64)
  return new Uint8Array([...raw].map(c => c.charCodeAt(0)))
}

export function usePush() {
  const lastError = ref('')
  const isSupported = computed(() =>
    Boolean(import.meta.client) &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  )

  // Регистрируем SW при загрузке — не требует взаимодействия пользователя
  async function register() {
    if (!isSupported.value) return
    try {
      await navigator.serviceWorker.register('/sw.js', { scope: '/' })
    } catch (err) {
      console.warn('[push] SW registration failed:', err)
    }
  }

  // Текущее состояние подписки: 'default' | 'granted' | 'denied'
  const permission = computed<NotificationPermission>(() => {
    if (!import.meta.client || !('Notification' in window)) return 'default'
    return Notification.permission
  })

  async function getSubscription(): Promise<PushSubscription | null> {
    if (!isSupported.value) return null
    const reg = await navigator.serviceWorker.ready
    return reg.pushManager.getSubscription()
  }

  async function isSubscribed(): Promise<boolean> {
    return !!(await getSubscription())
  }

  // Запрашивает разрешение и оформляет подписку → отправляет на API
  async function subscribe(): Promise<boolean> {
    lastError.value = ''
    if (!isSupported.value) return false

    // Запрашиваем разрешение
    const perm = await Notification.requestPermission()
    if (perm !== 'granted') {
      lastError.value = 'Разрешение на уведомления не выдано.'
      return false
    }

    // Получаем VAPID-ключ с API
    let publicKey: string
    try {
      const res = await fetch('/api/push/vapid-public-key')
      if (!res.ok) throw new Error('no key')
      ;({ publicKey } = await res.json())
      if (!publicKey) throw new Error('empty key')
    } catch {
      console.warn('[push] Could not get VAPID public key')
      lastError.value = 'Не удалось подготовить push-уведомления. Попробуйте позже.'
      return false
    }

    // Подписываемся через браузерный PushManager
    const reg = await navigator.serviceWorker.ready
    let sub: PushSubscription
    try {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      })
    } catch (err) {
      console.warn('[push] pushManager.subscribe failed:', err)
      lastError.value = 'Браузер не смог оформить push-подписку.'
      return false
    }

    // Отправляем подписку на бэкенд
    try {
      const res = await fetch('/api/push/subscribe', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(sub.toJSON()),
      })
      if ('ok' in res && !res.ok) {
        const data = await res.json().catch(() => ({}))
        lastError.value = normalizeApiError({ status: res.status, data }, 'Не удалось сохранить push-подписку.')
        return false
      }
    } catch (error) {
      console.warn('[push] Failed to save subscription')
      lastError.value = normalizeApiError(error, 'Не удалось сохранить push-подписку.')
      return false
    }

    return true
  }

  // Отписывается и удаляет подписку на бэкенде
  async function unsubscribe(): Promise<void> {
    if (!isSupported.value) return
    const sub = await getSubscription()
    if (!sub) return

    try {
      await fetch('/api/push/unsubscribe', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ endpoint: sub.endpoint }),
      })
    } catch { /* игнорируем сетевые ошибки */ }

    await sub.unsubscribe()
  }

  return { isSupported, permission, register, subscribe, unsubscribe, isSubscribed, lastError }
}
