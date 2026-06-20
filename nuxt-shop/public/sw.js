// Service Worker для Web Push уведомлений spbshop
// Файл должен лежать в public/ — браузер ожидает его по адресу /sw.js

self.addEventListener('push', (event) => {
  let data = {}
  try { data = event.data?.json() ?? {} } catch { data = { title: 'spbshop', body: event.data?.text() ?? '' } }

  const title   = data.title   || 'spbshop'
  const options = {
    body:  data.body   || '',
    icon:  data.icon   || '/favicon.ico',
    badge: '/favicon.ico',
    data:  { url: data.url || '/' },
    requireInteraction: false,
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      const match = list.find((c) => c.url === url)
      if (match) return match.focus()
      return clients.openWindow(url)
    })
  )
})
