// Регистрируем Service Worker при старте приложения (только на клиенте).
// Само разрешение на уведомления запрашивается позже — через PushPrompt.vue.
export default defineNuxtPlugin(() => {
  const { register } = usePush()
  register()
})
